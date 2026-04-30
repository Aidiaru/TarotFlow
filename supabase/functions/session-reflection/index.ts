import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const YOUNG_SCHEMAS = [
  "Terk Edilme", "Güvensizlik", "Duygusal Yoksunluk", "Kusurluluk",
  "Sosyal İzolasyon", "Bağımlılık", "Hasara Açıklık", "İç İçe Geçme",
  "Başarısızlık", "Haklılık", "Yetersiz Özdenetim", "Boyun Eğicilik",
  "Kendini Feda", "Onay Arayıcılık", "Karamsarlık", "Duyguları Bastırma",
  "Yüksek Standartlar", "Cezalandırıcılık",
];

async function callGemini(promptContents: any, systemInstruction: string): Promise<string> {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents: promptContents,
        generationConfig: {
          temperature: 0.7, topP: 0.9, maxOutputTokens: 2048,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!response.ok) {
    const errBody = await response.text();
    console.error("Gemini err:", errBody);
    throw new Error(`Gemini ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

async function getEmbedding(text: string): Promise<number[]> {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: { parts: [{ text }] },
        outputDimensionality: 768,
      }),
    }
  );

  if (!response.ok) {
    const errBody = await response.text();
    console.error("Embed err:", errBody);
    throw new Error(`Embed ${response.status}`);
  }

  const data = await response.json();
  return data.embedding?.values ?? [];
}

Deno.serve(async (req: Request) => {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No auth" }), {
        status: 401, headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { "Content-Type": "application/json" },
      });
    }

    const { session_id } = await req.json();

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get all messages from session
    const { data: msgs, error: msgError } = await serviceClient
      .from("messages").select("*").eq("session_id", session_id)
      .order("created_at", { ascending: true });

    if (msgError || !msgs || msgs.length === 0) {
      return new Response(JSON.stringify({ success: false, error: "No messages" }), {
        status: 400, headers: { "Content-Type": "application/json" },
      });
    }

    const conversation = msgs
      .map((m: any) => `${m.role === "user" ? "Danışan" : "Okuyucu"}: ${m.content}`)
      .join("\n\n");
    const schemaList = YOUNG_SCHEMAS.join(", ");

    // Multi-stage analysis prompt
    const reflectionPrompt = `Conversation:\n${conversation}\n\nPerform a 3-step psychological analysis and return ONLY a valid JSON object:\n1. "subtext_summary": The underlying emotional theme of the session (2-3 sentences in Turkish).\n2. "active_schemas": From this list [${schemaList}], select any active schemas. Format: [{"schema": "Schema Name", "confidence": 0.0-1.0, "evidence": "Brief evidence in Turkish"}] (Only include those with confidence > 0.4).\n3. "psychoanalytic_insight": {"defense_mechanisms": ["list of defenses in Turkish"], "core_belief_hypothesis": "Core belief in Turkish", "avoidance_areas": ["avoidance areas in Turkish"], "deep_insight": "Overall deep insight in Turkish"}`;

    const reflectionSI = "You are an expert clinical psychologist and psychoanalyst specializing in Young Schema Therapy. Be objective, evidence-based, and precise. Your output MUST be valid JSON. The values inside the JSON must be in Turkish.";

    const rawResult = await callGemini([{ role: "user", parts: [{ text: reflectionPrompt }] }] as any, reflectionSI);

    // Parse JSON response
    let reflection;
    try {
      reflection = JSON.parse(rawResult);
    } catch {
      const jsonMatch = rawResult.match(/\{[\s\S]*\}/);
      if (jsonMatch) reflection = JSON.parse(jsonMatch[0]);
      else throw new Error("Parse failed");
    }

    let insightsCreated = 0;

    // Save subtext summary
    if (reflection.subtext_summary) {
      console.log("=== REFLECTION: SUBTEXT SUMMARY ===\n", reflection.subtext_summary, "\n===================================");
      const emb = await getEmbedding(reflection.subtext_summary);
      await serviceClient.from("user_insights").insert({
        user_id: user.id, session_id, insight_type: "session_summary",
        content: reflection.subtext_summary, embedding: emb,
        confidence: 0.7, metadata: { stage: "subtext" },
      });
      insightsCreated++;
    }

    // Save active schemas
    if (reflection.active_schemas && Array.isArray(reflection.active_schemas)) {
      console.log("=== REFLECTION: SCHEMAS ===");
      for (const s of reflection.active_schemas) {
        console.log(`Schema: ${s.schema} (Confidence: ${s.confidence})`);
        const content = `Şema: ${s.schema} - ${s.evidence || ""}`;
        const emb = await getEmbedding(content);
        await serviceClient.from("user_insights").insert({
          user_id: user.id, session_id, insight_type: "schema_tag",
          content, embedding: emb, confidence: s.confidence || 0.5,
          schemas_detected: [{ schema: s.schema, confidence: s.confidence || 0.5 }],
          metadata: { stage: "schema" },
        });
        insightsCreated++;
      }
      console.log("===========================");
    }

    // Save psychoanalytic insight
    if (reflection.psychoanalytic_insight) {
      const pi = reflection.psychoanalytic_insight;
      console.log("=== REFLECTION: DEEP INSIGHT ===\n", JSON.stringify(pi, null, 2), "\n================================");
      const deepContent = [
        pi.core_belief_hypothesis ? `Kök: ${pi.core_belief_hypothesis}` : "",
        pi.defense_mechanisms?.length > 0 ? `Savunma: ${pi.defense_mechanisms.join(", ")}` : "",
        pi.deep_insight ? `İçgörü: ${pi.deep_insight}` : "",
      ].filter(Boolean).join("\n");

      if (deepContent) {
        const emb = await getEmbedding(deepContent);
        await serviceClient.from("user_insights").insert({
          user_id: user.id, session_id, insight_type: "core_belief",
          content: deepContent, embedding: emb, confidence: 0.5,
          metadata: {
            stage: "psychoanalytic",
            defense_mechanisms: pi.defense_mechanisms || [],
            avoidance_areas: pi.avoidance_areas || [],
          },
        });
        insightsCreated++;
      }
    }

    // Profile consolidation
    const { data: allInsights } = await serviceClient
      .from("user_insights").select("*").eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (allInsights && allInsights.length >= 2) {
      // Aggregate schemas
      const schemaMap = new Map<string, { total: number; count: number }>();
      for (const ins of allInsights) {
        if (ins.schemas_detected) {
          for (const sd of ins.schemas_detected) {
            const ex = schemaMap.get(sd.schema) || { total: 0, count: 0 };
            schemaMap.set(sd.schema, { total: ex.total + (sd.confidence || 0.5), count: ex.count + 1 });
          }
        }
      }

      const dominantSchemas = Array.from(schemaMap.entries())
        .map(([s, { total, count }]) => ({ schema: s, confidence: total / count, evidence_count: count }))
        .filter((s) => s.confidence > 0.4)
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5);

      // Aggregate defenses
      const allDefenses = allInsights
        .filter((i: any) => i.metadata?.defense_mechanisms)
        .flatMap((i: any) => i.metadata.defense_mechanisms);
      const defenseFreq = new Map<string, number>();
      for (const d of allDefenses) defenseFreq.set(d, (defenseFreq.get(d) || 0) + 1);
      const dominantDefenses = Array.from(defenseFreq.entries())
        .sort((a, b) => b[1] - a[1]).slice(0, 3).map(([d]) => d);

      // Latest core belief
      const latestCoreBelief = allInsights.find((i: any) => i.insight_type === "core_belief");
      const sessionCount = new Set(allInsights.map((i: any) => i.session_id).filter(Boolean)).size;

      const narrative = [
        latestCoreBelief?.content,
        dominantSchemas.length > 0 ? `Şemalar: ${dominantSchemas.map((s) => s.schema).join(", ")}` : "",
        dominantDefenses.length > 0 ? `Savunmalar: ${dominantDefenses.join(", ")}` : "",
      ].filter(Boolean).join("\n");

      const profileEmbedding = narrative ? await getEmbedding(narrative) : null;
      console.log("=== REFLECTION: UPDATED PROFILE NARRATIVE ===\n", narrative, "\n=============================================");

      await serviceClient.from("user_profile_cards").upsert({
        user_id: user.id,
        core_belief_hypothesis: reflection.psychoanalytic_insight?.core_belief_hypothesis || latestCoreBelief?.content,
        dominant_defenses: dominantDefenses,
        dominant_schemas: dominantSchemas,
        narrative,
        embedding: profileEmbedding,
        session_count: sessionCount,
        last_consolidated: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
    }

    // Mark session as completed
    await serviceClient.from("sessions").update({
      status: "completed",
      ended_at: new Date().toISOString(),
      message_count: msgs.length,
    }).eq("id", session_id);

    return new Response(JSON.stringify({ success: true, insights_created: insightsCreated }),
      { headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("FATAL:", (error as Error).message);
    return new Response(JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { "Content-Type": "application/json" } });
  }
});
