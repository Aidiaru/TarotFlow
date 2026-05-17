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
    const reflectionPrompt = `Conversation:\n${conversation}\n\nPerform a 3-step psychological analysis and return ONLY a valid JSON object:\n1. "subtext_summary": The underlying emotional theme of the session (2-3 sentences in English).\n2. "active_schemas": Any relevant psychological patterns you observe. You MAY reference Young's 18 schemas (${schemaList}) as vocabulary if they fit naturally, but DO NOT force observations into these categories. If you see a pattern that doesn't fit any schema, describe it freely. Format: [{"schema": "Pattern Name", "confidence": 0.0-1.0, "evidence": "Brief evidence in English"}] (Only include those with confidence > 0.4).\n3. "psychoanalytic_insight": {"defense_mechanisms": ["list of defenses in English"], "core_belief_hypothesis": "Core belief in English", "avoidance_areas": ["avoidance areas in English"], "deep_insight": "Overall deep insight in English"}`;

    const reflectionSI = "You are an expert clinical psychologist. Be objective, evidence-based, and precise. Your output MUST be valid JSON. The values inside the JSON MUST be in English. Observe what is actually there — do not force patterns into predefined categories.";

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

    let observationsCreated = 0;

    // Save as clinical observations (unified approach)
    // Subtext summary → clinical observation (source='consolidation')
    if (reflection.subtext_summary) {
      console.log("=== REFLECTION: SUBTEXT SUMMARY ===\n", reflection.subtext_summary, "\n===================================");
      const emb = await getEmbedding(reflection.subtext_summary);
      await serviceClient.from("clinical_observations").insert({
        user_id: user.id, session_id,
        content: reflection.subtext_summary, embedding: emb,
        confidence: 0.7, source: "consolidation",
        tags: ["session_summary"],
      });
      observationsCreated++;
    }

    // Active schemas → clinical observations with schema tags
    if (reflection.active_schemas && Array.isArray(reflection.active_schemas)) {
      console.log("=== REFLECTION: SCHEMAS ===");
      for (const s of reflection.active_schemas) {
        console.log(`Schema: ${s.schema} (Confidence: ${s.confidence})`);
        const content = `Schema: ${s.schema} - ${s.evidence || ""}`;
        const emb = await getEmbedding(content);
        await serviceClient.from("clinical_observations").insert({
          user_id: user.id, session_id,
          content, embedding: emb, confidence: s.confidence || 0.5,
          source: "consolidation",
          tags: [s.schema.toLowerCase().replace(/\s+/g, "_"), "schema"],
        });
        observationsCreated++;
      }
      console.log("===========================");
    }

    // Psychoanalytic insight → clinical observation
    if (reflection.psychoanalytic_insight) {
      const pi = reflection.psychoanalytic_insight;
      console.log("=== REFLECTION: DEEP INSIGHT ===\n", JSON.stringify(pi, null, 2), "\n================================");
      const deepContent = [
        pi.core_belief_hypothesis ? `Core Belief: ${pi.core_belief_hypothesis}` : "",
        pi.defense_mechanisms?.length > 0 ? `Defenses: ${pi.defense_mechanisms.join(", ")}` : "",
        pi.deep_insight ? `Insight: ${pi.deep_insight}` : "",
      ].filter(Boolean).join("\n");

      if (deepContent) {
        const tags = ["psychoanalytic"];
        if (pi.defense_mechanisms) tags.push(...pi.defense_mechanisms.map((d: string) => d.toLowerCase().replace(/\s+/g, "_")));
        if (pi.avoidance_areas) tags.push(...pi.avoidance_areas.map((a: string) => a.toLowerCase().replace(/\s+/g, "_")));

        const emb = await getEmbedding(deepContent);
        await serviceClient.from("clinical_observations").insert({
          user_id: user.id, session_id,
          content: deepContent, embedding: emb, confidence: 0.5,
          source: "consolidation", tags,
        });
        observationsCreated++;
      }
    }

    // NOTE: Profile consolidation is NOT done here.
    // It is handled by tarot-reading's signal-based consolidation (≥5 unconsolidated signals).
    // session-reflection only WRITES clinical observations. Profile updates happen separately.

    // Mark session as completed
    await serviceClient.from("sessions").update({
      status: "completed",
      ended_at: new Date().toISOString(),
      message_count: msgs.length,
    }).eq("id", session_id);

    return new Response(JSON.stringify({ success: true, observations_created: observationsCreated }),
      { headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("FATAL:", (error as Error).message);
    return new Response(JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { "Content-Type": "application/json" } });
  }
});
