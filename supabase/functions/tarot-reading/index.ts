import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// =============================================
// 78-Card Rider-Waite Tarot Deck
// =============================================
const TAROT_DECK = [
  // Major Arcana
  { name: "The Fool", name_tr: "Budala" },
  { name: "The Magician", name_tr: "Büyücü" },
  { name: "The High Priestess", name_tr: "Başrahibe" },
  { name: "The Empress", name_tr: "İmparatoriçe" },
  { name: "The Emperor", name_tr: "İmparator" },
  { name: "The Hierophant", name_tr: "Başrahip" },
  { name: "The Lovers", name_tr: "Aşıklar" },
  { name: "The Chariot", name_tr: "Savaş Arabası" },
  { name: "Strength", name_tr: "Güç" },
  { name: "The Hermit", name_tr: "Ermiş" },
  { name: "Wheel of Fortune", name_tr: "Kader Çarkı" },
  { name: "Justice", name_tr: "Adalet" },
  { name: "The Hanged Man", name_tr: "Asılan Adam" },
  { name: "Death", name_tr: "Ölüm" },
  { name: "Temperance", name_tr: "Denge" },
  { name: "The Devil", name_tr: "Şeytan" },
  { name: "The Tower", name_tr: "Yıkılan Kule" },
  { name: "The Star", name_tr: "Yıldız" },
  { name: "The Moon", name_tr: "Ay" },
  { name: "The Sun", name_tr: "Güneş" },
  { name: "Judgement", name_tr: "Mahkeme" },
  { name: "The World", name_tr: "Dünya" },
  // Wands
  { name: "Ace of Wands", name_tr: "Değnek Ası" },
  { name: "Two of Wands", name_tr: "Değnek İkilisi" },
  { name: "Three of Wands", name_tr: "Değnek Üçlüsü" },
  { name: "Four of Wands", name_tr: "Değnek Dörtlüsü" },
  { name: "Five of Wands", name_tr: "Değnek Beşlisi" },
  { name: "Six of Wands", name_tr: "Değnek Altılısı" },
  { name: "Seven of Wands", name_tr: "Değnek Yedilisi" },
  { name: "Eight of Wands", name_tr: "Değnek Sekizlisi" },
  { name: "Nine of Wands", name_tr: "Değnek Dokuzlusu" },
  { name: "Ten of Wands", name_tr: "Değnek Onlusu" },
  { name: "Page of Wands", name_tr: "Değnek Prensi" },
  { name: "Knight of Wands", name_tr: "Değnek Şövalyesi" },
  { name: "Queen of Wands", name_tr: "Değnek Kraliçesi" },
  { name: "King of Wands", name_tr: "Değnek Kralı" },
  // Cups
  { name: "Ace of Cups", name_tr: "Kupa Ası" },
  { name: "Two of Cups", name_tr: "Kupa İkilisi" },
  { name: "Three of Cups", name_tr: "Kupa Üçlüsü" },
  { name: "Four of Cups", name_tr: "Kupa Dörtlüsü" },
  { name: "Five of Cups", name_tr: "Kupa Beşlisi" },
  { name: "Six of Cups", name_tr: "Kupa Altılısı" },
  { name: "Seven of Cups", name_tr: "Kupa Yedilisi" },
  { name: "Eight of Cups", name_tr: "Kupa Sekizlisi" },
  { name: "Nine of Cups", name_tr: "Kupa Dokuzlusu" },
  { name: "Ten of Cups", name_tr: "Kupa Onlusu" },
  { name: "Page of Cups", name_tr: "Kupa Prensi" },
  { name: "Knight of Cups", name_tr: "Kupa Şövalyesi" },
  { name: "Queen of Cups", name_tr: "Kupa Kraliçesi" },
  { name: "King of Cups", name_tr: "Kupa Kralı" },
  // Swords
  { name: "Ace of Swords", name_tr: "Kılıç Ası" },
  { name: "Two of Swords", name_tr: "Kılıç İkilisi" },
  { name: "Three of Swords", name_tr: "Kılıç Üçlüsü" },
  { name: "Four of Swords", name_tr: "Kılıç Dörtlüsü" },
  { name: "Five of Swords", name_tr: "Kılıç Beşlisi" },
  { name: "Six of Swords", name_tr: "Kılıç Altılısı" },
  { name: "Seven of Swords", name_tr: "Kılıç Yedilisi" },
  { name: "Eight of Swords", name_tr: "Kılıç Sekizlisi" },
  { name: "Nine of Swords", name_tr: "Kılıç Dokuzlusu" },
  { name: "Ten of Swords", name_tr: "Kılıç Onlusu" },
  { name: "Page of Swords", name_tr: "Kılıç Prensi" },
  { name: "Knight of Swords", name_tr: "Kılıç Şövalyesi" },
  { name: "Queen of Swords", name_tr: "Kılıç Kraliçesi" },
  { name: "King of Swords", name_tr: "Kılıç Kralı" },
  // Pentacles
  { name: "Ace of Pentacles", name_tr: "Tılsım Ası" },
  { name: "Two of Pentacles", name_tr: "Tılsım İkilisi" },
  { name: "Three of Pentacles", name_tr: "Tılsım Üçlüsü" },
  { name: "Four of Pentacles", name_tr: "Tılsım Dörtlüsü" },
  { name: "Five of Pentacles", name_tr: "Tılsım Beşlisi" },
  { name: "Six of Pentacles", name_tr: "Tılsım Altılısı" },
  { name: "Seven of Pentacles", name_tr: "Tılsım Yedilisi" },
  { name: "Eight of Pentacles", name_tr: "Tılsım Sekizlisi" },
  { name: "Nine of Pentacles", name_tr: "Tılsım Dokuzlusu" },
  { name: "Ten of Pentacles", name_tr: "Tılsım Onlusu" },
  { name: "Page of Pentacles", name_tr: "Tılsım Prensi" },
  { name: "Knight of Pentacles", name_tr: "Tılsım Şövalyesi" },
  { name: "Queen of Pentacles", name_tr: "Tılsım Kraliçesi" },
  { name: "King of Pentacles", name_tr: "Tılsım Kralı" },
];

function drawCards(count = 5) {
  const shuffled = [...TAROT_DECK].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((card, index) => ({
    ...card,
    is_reversed: Math.random() > 0.5,
    position: index + 1,
  }));
}

async function callGemini(prompt: string, systemInstruction: string): Promise<string> {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents: prompt,
        generationConfig: { temperature: 0.9, topP: 0.95, maxOutputTokens: 4096 },
      }),
    }
  );

  if (!response.ok) {
    const errBody = await response.text();
    console.error("Gemini err:", errBody);
    throw new Error(`Gemini ${response.status}`);
  }

  const data = await response.json();
  const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  console.log("=== GEMINI API OUTPUT ===\n", textOutput, "\n=========================");
  return textOutput;
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

    const { session_id, question, message_history } = await req.json();
    const cards = drawCards(5);

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get profile card
    const { data: profileCard } = await serviceClient
      .from("user_profile_cards").select("*").eq("user_id", user.id).maybeSingle();
    console.log("=== RAG: PROFILE CARD ===\n", profileCard ? profileCard : "No profile card found", "\n=========================");

    // RAG (optional)
    let relevantInsights: string[] = [];
    try {
      if (question && question.length > 10) {
        console.log("=== RAG: SEARCHING FOR INSIGHTS ===");
        const queryEmbedding = await getEmbedding(question);
        const { data: insights } = await serviceClient.rpc("search_user_insights", {
          p_user_id: user.id, p_embedding: queryEmbedding, p_match_count: 3, p_match_threshold: 0.5,
        });
        if (insights && insights.length > 0) {
          relevantInsights = insights.map((i: any) => i.content);
          console.log("=== RAG: FOUND INSIGHTS ===\n", relevantInsights.join("\n"), "\n===========================");
        } else {
          console.log("=== RAG: NO RELEVANT INSIGHTS FOUND ===");
        }
      }
    } catch (e) { console.log("=== RAG ERROR ===\n", e); }

    // Build card description
    const cardDesc = cards
      .map((c) => `${c.position}. ${c.name_tr} (${c.name})${c.is_reversed ? " — Ters" : ""}`)
      .join("\n");

    // Hidden context
    let hiddenContext = "";
    if (profileCard) {
      hiddenContext += "\n[HIDDEN PSYCHOLOGICAL PROFILE]\n";
      if (profileCard.core_belief_hypothesis) hiddenContext += `Core Belief: ${profileCard.core_belief_hypothesis}\n`;
      if (profileCard.dominant_defenses?.length > 0) hiddenContext += `Defenses: ${profileCard.dominant_defenses.join(", ")}\n`;
      if (profileCard.narrative) hiddenContext += `Narrative: ${profileCard.narrative}\n`;
    }
    if (relevantInsights.length > 0) {
      hiddenContext += `\n[PAST INSIGHTS]\n${relevantInsights.join("\n")}\n`;
    }

    const systemInstruction = `You are an ancient, mystical oracle and deeply intuitive Jungian psychoanalyst using the Rider-Waite tarot tradition.
CRITICAL RULES:
1. ALWAYS respond in the exact same language that the user used in their last message. If they write in Turkish, respond entirely in Turkish.
2. NEVER use cheap fortune-teller cliches (e.g., 'honey', 'fate is smiling at you', 'three days', 'fortune').
3. Do not explain the cards one by one like a robot. Weave them into a single, cohesive narrative.
4. Integrate any [HIDDEN PSYCHOLOGICAL PROFILE] or [PAST INSIGHTS] seamlessly into your reading as if you are reading their soul. Do not explicitly mention psychological terms like "schema", "anxiety", or "core belief". Frame these insights using mystical, poetic, and profound metaphors.
5. Keep your tone wise, timeless, and empathetic. 2-3 paragraphs.
${hiddenContext ? "\n" + hiddenContext : ""}`;

    // Conversation context (Proper Gemini multi-turn format)
    let promptContents: any[] = [];
    
    // Sliding Window: Only take the last 8 messages to prevent exponential token growth
    if (message_history && message_history.length > 0) {
      const recent = message_history.slice(-8);
      recent.forEach((m: any) => {
        promptContents.push({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.content }]
        });
      });
    }

    const currentTurnText = `Soru / Question: ${question || "Genel bir okuma istiyorum"}\n\nÇekilen Kartlar / Drawn Cards:\n${cardDesc}\n\nPlease interpret this based on your system instructions.`;
    
    promptContents.push({
      role: "user",
      parts: [{ text: currentTurnText }]
    });

    console.log("=== GEMINI API INPUT ===\nSYSTEM:", systemInstruction, "\nCONTENTS:", JSON.stringify(promptContents, null, 2), "\n========================");
    const reading = await callGemini(promptContents as any, systemInstruction);

    // Save
    await serviceClient.from("card_draws").insert({ session_id, user_id: user.id, cards, question: question || null });
    const { data: savedMessage } = await serviceClient.from("messages")
      .insert({ session_id, user_id: user.id, role: "assistant", content: reading, metadata: { cards } })
      .select().single();

    // Micro-profiling (optional)
    try {
      if (question && question.length > 20) {
        const microInsight = await callGemini(
          [{ role: "user", parts: [{ text: `Message: "${question}"\nSummarize the linguistic pattern and underlying emotional tone of this message in 1-2 objective sentences in Turkish.` }] }],
          "You are a clinical linguistic analyst. Keep it extremely brief, objective, and in Turkish."
        );
        if (microInsight) {
          console.log("=== MICRO-PROFILING CREATED ===\n", microInsight, "\n===============================");
          const embedding = await getEmbedding(microInsight);
          await serviceClient.from("user_insights").insert({
            user_id: user.id, session_id, insight_type: "behavioral_pattern",
            content: microInsight, embedding, confidence: 0.4,
            metadata: { source: "micro_profiling", trigger: question.substring(0, 100) },
          });
        }
      }
    } catch (e) { console.log("=== MICRO-PROFILING ERROR ===\n", e); }

    return new Response(JSON.stringify({ reading, cards, message_id: savedMessage?.id || null }),
      { headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("FATAL:", (error as Error).message);
    return new Response(JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { "Content-Type": "application/json" } });
  }
});
