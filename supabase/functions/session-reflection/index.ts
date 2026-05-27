import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

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

    // Extract ONLY user messages — bot's interpretations are NOT analyzed
    const userMessages = msgs
      .filter((m: any) => m.role === "user")
      .map((m: any) => m.content);

    const fullConversation = msgs
      .map((m: any) => `${m.role === "user" ? "User" : "Reader"}: ${m.content}`)
      .join("\n\n");

    // ============================================================
    // REDUCED SCOPE: Session Summary + User-Word Observations ONLY
    // Schema analysis, core beliefs, and defense mechanisms are
    // handled EXCLUSIVELY by tarot-reading's signal-based consolidation.
    // ============================================================
    const reflectionPrompt = `SESSION CONVERSATION:
${fullConversation}

USER'S OWN WORDS (extracted for your focus):
${userMessages.map((m: string, i: number) => `${i + 1}. "${m}"`).join("\n")}

Perform a focused session summary. Return ONLY a valid JSON object with these fields:

1. "session_summary": A 2-3 sentence summary of the session's emotional arc FROM THE USER'S PERSPECTIVE. What did the user come in wanting? How did they respond? What was revealed? (English, 2-3 sentences)

2. "user_observations": Observations derived STRICTLY from the user's own words and reactions. For each observation:
   - "content": The observation in English
   - "confidence": 0.0-1.0
   - "user_quote": The exact user quote that supports this observation
   
CRITICAL RULES:
- Analyze ONLY what the USER said. The reader's tarot interpretations are NOT evidence.
- If the reader said "you have an ideal love image" but the user never confirmed this, DO NOT record it.
- NEVER reference tarot cards, spreads, or card imagery (e.g. "three spilled cups", "Devil's chains"). Your observations must be card-independent.
- If the user disagreed with the reader ("hayır yanılıyorsun"), record this as a genuine correction, NOT as a defense mechanism — unless you have very strong evidence otherwise.
- Maximum 3 observations. Quality over quantity. Generic observations like "user seeks guidance" are REJECTED.
- Each observation MUST include a direct user quote as evidence.`;

    const reflectionSI = "You are a session analyst. Your job is to summarize what happened and extract observations from the USER's own words. You do NOT do schema analysis or diagnosis — that is handled by a separate system. Be precise, evidence-based, and conservative. Return ONLY valid JSON in English.";

    const rawResult = await callGemini(
      [{ role: "user", parts: [{ text: reflectionPrompt }] }] as any,
      reflectionSI
    );

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

    // Save session summary
    if (reflection.session_summary) {
      console.log("=== SESSION SUMMARY ===\n", reflection.session_summary, "\n=======================");
      const emb = await getEmbedding(reflection.session_summary);
      const { error: insertErr } = await serviceClient.from("clinical_observations").insert({
        user_id: user.id, session_id,
        content: reflection.session_summary, embedding: emb,
        confidence: 0.7, source: "session_reflection",
        tags: ["session_summary"],
      });
      if (insertErr) {
        console.error("=== SESSION SUMMARY INSERT ERROR ===", insertErr.message);
      } else {
        observationsCreated++;
      }
    }

    // Save user-word observations (max 3)
    if (reflection.user_observations && Array.isArray(reflection.user_observations)) {
      console.log("=== USER-WORD OBSERVATIONS ===");
      for (const obs of reflection.user_observations.slice(0, 3)) {
        const content = obs.user_quote
          ? `${obs.content} [User said: "${obs.user_quote}"]`
          : obs.content;
        console.log(`Observation: ${content} (confidence: ${obs.confidence})`);
        const emb = await getEmbedding(content);
        const { error: obsErr } = await serviceClient.from("clinical_observations").insert({
          user_id: user.id, session_id,
          content, embedding: emb,
          confidence: obs.confidence || 0.5,
          source: "session_reflection",
          tags: ["user_observation"],
        });
        if (obsErr) {
          console.error("=== OBSERVATION INSERT ERROR ===", obsErr.message);
        } else {
          observationsCreated++;
        }
      }
      console.log("==============================");
    }

    // NOTE: NO schema analysis, NO psychoanalytic insight, NO core belief extraction.
    // Those are handled exclusively by tarot-reading's signal-based consolidation.

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
