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

async function callGemini(prompt: any, systemInstruction: string, isJson = false, attempt = 1): Promise<string> {
  const MAX_RETRIES = 3;
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  try {
    const generationConfig: any = { temperature: 0.9, topP: 0.95, maxOutputTokens: 4096 };
    if (isJson) {
      generationConfig.responseMimeType = "application/json";
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents: prompt,
          generationConfig,
        }),
      }
    );

    if (!response.ok) {
      const errBody = await response.text();
      console.error(`Gemini err (Status ${response.status}):`, errBody);
      throw new Error(`Gemini HTTP ${response.status}`);
    }

    const data = await response.json();
    const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    console.log("=== GEMINI API OUTPUT ===\n", textOutput, "\n=========================");
    return textOutput;
  } catch (error: any) {
    const isRetryable = error.message.includes("503") || error.message.includes("429") || error.message.includes("fetch") || error.message.includes("HTTP 50");
    if (attempt <= MAX_RETRIES && isRetryable) {
      const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
      console.log(`[Attempt ${attempt} failed] ${error.message}. Retrying in ${Math.round(delay)}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return callGemini(prompt, systemInstruction, isJson, attempt + 1);
    }
    if (isRetryable) {
      throw new Error("Tarot enerjileri şu an çok yoğun, lütfen birazdan tekrar dene.");
    }
    throw error;
  }
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

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No auth" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { session_id, question, message_history } = await req.json();
    
    // ============================================================
    // 1. SMART ACTION PLANNER (Intent 2.0)
    // ============================================================
    let intent = "READING";
    let plannerReasoning = "";
    if (question && question.trim().length > 0) {
      try {
        const historyText = (message_history || []).slice(-4).map((m: any) => `${m.role.toUpperCase()}: ${m.content}`).join("\n");
        const intentPrompt = [{ role: "user", parts: [{ text: `User Message: "${question}"
Recent Chat History:
${historyText}

Determine the best action for the system to take.
Options:
1. "READING": The user wants a new reading, OR they asked a deep/difficult question (e.g., "what should I do now?", "why is this happening?", "how can I fix this?") that requires pulling NEW tarot cards to answer properly.
2. "CHAT": The user is just making small talk, answering a clarification question you asked (e.g. "I am single", "I'm a student"), or asking a simple factual follow-up that does NOT need new cards.
3. "FEEDBACK_POSITIVE": The user agrees with or validates the previous reading. This includes SUBTLE or TENTATIVE agreement (e.g. "evet tam olarak bu", "çok doğru", "galiba", "sanırım haklısın", "olabilir", "belki de").
4. "FEEDBACK_NEGATIVE": The user disagrees with or rejects the previous reading (e.g. "hayır", "pek değil", "saçma").

Return JSON: { "reasoning": "Why you chose this action", "intent": "READING" | "CHAT" | "FEEDBACK_POSITIVE" | "FEEDBACK_NEGATIVE" }` }] }];
        
        const intentResponse = await callGemini(intentPrompt as any, "You are an Action Planner orchestrating a tarot system. Return ONLY valid JSON.", true);
        const parsedIntent = JSON.parse(intentResponse.replace(/```json\n?|\n?```/g, "").trim());
        plannerReasoning = parsedIntent.reasoning || "";
        console.log(`=== SMART PLANNER ===\nReasoning: ${plannerReasoning}\nIntent: ${parsedIntent.intent}\n=====================`);
        
        if (["READING", "CHAT", "FEEDBACK_POSITIVE", "FEEDBACK_NEGATIVE"].includes(parsedIntent.intent)) {
          intent = parsedIntent.intent;
        }
      } catch (e) { console.log("=== INTENT ERROR, defaulting to READING ===", e); }
    }

    const isConversational = intent === "CHAT" || intent === "FEEDBACK_POSITIVE" || intent === "FEEDBACK_NEGATIVE";
    const cards = isConversational ? [] : drawCards(5);

    const logEntry: any = {
      user_id: user.id,
      session_id,
      function_name: "tarot-reading",
      planner_reasoning: plannerReasoning || null,
      planner_intent: intent || null,
      cards_drawn: cards.length > 0 ? cards : null,
    };

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // ============================================================
    // 2. INDIRECT VALIDATION (only if intent is FEEDBACK)
    // ============================================================
    try {
      if (intent === "FEEDBACK_POSITIVE" || intent === "FEEDBACK_NEGATIVE") {
        const delta = intent === "FEEDBACK_POSITIVE" ? 0.1 : -0.15;
        const { data: recentObs } = await serviceClient
          .from("clinical_observations")
          .select("id, confidence")
          .eq("user_id", user.id)
          .eq("source", "gate")
          .order("created_at", { ascending: false })
          .limit(3);

        if (recentObs && recentObs.length > 0) {
          for (const obs of recentObs) {
            const newConf = Math.max(0, Math.min(1, (obs.confidence || 0.5) + delta));
            await serviceClient.from("clinical_observations")
              .update({ confidence: newConf })
              .eq("id", obs.id);
          }
          console.log(`=== INDIRECT VALIDATION: ${intent} → ${recentObs.length} observations adjusted by ${delta} ===`);
        }
      }
    } catch (e) { console.log("=== INDIRECT VALIDATION ERROR ===", e); }

    // ============================================================
    // 3. PROFILE CARD + RAG
    // ============================================================
    const { data: profileCard } = await serviceClient
      .from("user_profile_cards").select("*").eq("user_id", user.id).maybeSingle();
    console.log("=== RAG: PROFILE CARD ===\n", profileCard ? profileCard : "No profile card found", "\n=========================");

    // Fetch user memory (demographics/facts)
    let userMemoryContext = "";
    try {
      const { data: memories } = await serviceClient
        .from("user_memory")
        .select("key, value, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: true });
      if (memories && memories.length > 0) {
        userMemoryContext = "\n[USER FACTS (Chronological Timeline)]\n" + memories.map((m: any) => `[${new Date(m.updated_at).toISOString().split('T')[0]}] ${m.key}: ${m.value}`).join("\n") + "\n";
        console.log("=== USER MEMORY ===\n", userMemoryContext, "\n====================");
      }
    } catch (e) { console.log("=== USER MEMORY ERROR ===", e); }

    const cardDesc = cards.length > 0
      ? cards.map((c) => `${c.position}. ${c.name_tr} (${c.name})${c.is_reversed ? " — Ters" : ""}`).join("\n")
      : "";

    // ============================================================
    // 3b. CARD-DRIVEN RAG (Two-Stage Pipeline)
    // ============================================================
    let relevantInsights: string[] = [];
    try {
      if (cards.length > 0) {
        console.log("=== CARD-DRIVEN RAG: STAGE 1 — THEME EXTRACTION ===");
        const themeResponse = await callGemini(
          [{ role: "user", parts: [{ text: `Tarot cards drawn:\n${cardDesc}\n\nExtract 3-5 themes these cards represent together. For EACH theme, include BOTH:\n1. The deep psychological archetype (e.g., "fear of abandonment")\n2. Its CONCRETE behavioral manifestation — how this theme shows up in real daily life (e.g., "avoiding phone calls from family", "refusing to commit to plans", "withdrawing emotionally after conflict")\n\nExample output: ["Fear of abandonment manifested as emotional withdrawal from close relationships and reluctance to depend on others", "Career transition anxiety expressed through overthinking, procrastination, or seeking constant external validation"]\n\nReturn ONLY a JSON array of strings.` }] }],
          "You are a master of translating esoteric tarot symbolism into clinical psychology and human experience. Return ONLY a valid JSON array of theme strings in English. Each theme MUST include both the abstract concept AND its concrete real-life behavioral equivalent."
        );

        let cardThemes: string[] = [];
        try {
          cardThemes = JSON.parse(themeResponse.replace(/```json\n?|\n?```/g, "").trim());
          console.log("=== CARD THEMES ===", cardThemes, "\n===================");
        } catch { console.log("=== CARD THEME PARSE ERROR, raw:", themeResponse); }

        if (cardThemes.length > 0) {
          const themeQuery = cardThemes.join(", ");
          console.log("=== CARD-DRIVEN RAG: STAGE 2 — SEARCHING WITH THEMES ===");
          const themeEmbedding = await getEmbedding(themeQuery);
          const { data: observations } = await serviceClient.rpc("search_clinical_observations", {
            p_user_id: user.id, p_embedding: themeEmbedding, p_match_count: 3, p_match_threshold: 0.5, p_min_confidence: 0.4,
          });
          if (observations && observations.length > 0) {
            relevantInsights = observations.map((o: any) => o.content);
            logEntry.rag_results = relevantInsights;
            console.log("=== RAG: FOUND OBSERVATIONS ===\n", relevantInsights.join("\n"), "\n===============================");
          } else {
            console.log("=== RAG: NO RELEVANT OBSERVATIONS FOUND ===");
          }
        }
      }
    } catch (e) { console.log("=== CARD-DRIVEN RAG ERROR ===\n", e); }

    // Fetch active session observations
    let activeObservationsContext = "";
    try {
      const { data: activeObs } = await serviceClient
        .from("clinical_observations")
        .select("content")
        .eq("session_id", session_id)
        .eq("source", "gate");
        
      if (activeObs && activeObs.length > 0) {
        activeObservationsContext = `\n[ACTIVE SESSION OBSERVATIONS]\n${activeObs.map(o => o.content).join("\n")}\n`;
        console.log("=== ACTIVE SESSION OBSERVATIONS ===\n", activeObservationsContext, "\n===================================");
      }
    } catch (e) { console.log("=== ACTIVE OBS ERROR ===\n", e); }

    // ============================================================
    // 4. HIDDEN CONTEXT (Cautious Injection)
    // ============================================================
    let hiddenContext = "";
    if (userMemoryContext) {
      hiddenContext += userMemoryContext;
    }
    if (profileCard) {
      hiddenContext += "\n[HIDDEN PSYCHOLOGICAL PROFILE]\n";
      if (profileCard.core_belief_hypothesis) hiddenContext += `Core Belief: ${profileCard.core_belief_hypothesis}\n`;
      if (profileCard.dominant_defenses?.length > 0) hiddenContext += `Defenses: ${profileCard.dominant_defenses.join(", ")}\n`;
      if (profileCard.narrative) hiddenContext += `Narrative: ${profileCard.narrative}\n`;
    }
    if (relevantInsights.length > 0) {
      hiddenContext += `\n[BACKGROUND CONTEXT - USE WITH CAUTION]\nThe following notes are from past sessions. They may or may not be relevant to today's cards. Use them ONLY if the cards independently point in the same direction. If the cards tell a different story, IGNORE these notes entirely.\n${relevantInsights.join("\n")}\n`;
    }
    if (activeObservationsContext) {
      hiddenContext += activeObservationsContext;
    }

    // ============================================================
    // 5. SYSTEM INSTRUCTION + GENERATION (COGNITIVE ARCHITECTURE)
    // ============================================================
    const systemInstruction = `You are a master tarot reader with deep psychological intuition.

You MUST return a JSON object:
{
  "internal_monologue": "Your PRIVATE analysis. Debate all traditional meanings of each card. Cross-reference with the user's psychological context. Think through which interpretation resonates most deeply. Use clinical terms freely here — the user never sees this.",
  "tarot_angle": "Your chosen strategy in one sentence. E.g. 'User is single, so 3 of Swords = mental rigidity, not heartbreak.' Null if no cards.",
  "clarification_question": "If you NEED vital context (relationship status for love, employment for career) to interpret accurately, write your question. Otherwise null.",
  "final_output": "The ONLY text shown to the user. Must sound like a wise, warm tarot reader. NEVER a therapist."
}

RULES:
1. Respond in the user's language.
2. internal_monologue is your scratchpad. Think deeply here. The user never sees it.
3. final_output must NEVER contain: schema, defense mechanism, archetype, projection, cognitive, psychoanalytic, attachment style. You are a tarot reader.
4. If cards were drawn: weave them into a rich narrative. End with "Kısacası:" (1-2 sentence direct answer) + ONE reflective question that makes the user think.
5. If NO cards were drawn: speak directly, warmly, WITHOUT tarot imagery or card metaphors.
6. If you lack vital context for accurate interpretation, use clarification_question.
7. Respect user corrections unconditionally.
8. QUESTION FORMAT: When you ask follow-up questions, ALWAYS frame them as invitations to explore deeper with the cards. Good: "Bu konunun kökenine kartlarla inmek ister misin?", "Bunu bir de kartlara soralım mı?", "Bu duygunun arkasında ne olduğunu öğrenmek için bir açılım yapmak ister misin?" Bad: "Kendine şefkat göstermeye hazır mısın?", "Bu durumu kabul etsen nasıl hissederdin?" — These are life-coaching, NOT tarot. You are a tarot reader, not a therapist.
${plannerReasoning ? `\n[ACTION PLANNER CONTEXT]\nDecision: ${intent}. Reasoning: "${plannerReasoning}"\n` : ""}${hiddenContext ? "\n" + hiddenContext : ""}`;


    // Conversation context (Proper Gemini multi-turn format)
    let promptContents: any[] = [];
    
    if (message_history && message_history.length > 0) {
      const recent = message_history.slice(-8);
      recent.forEach((m: any) => {
        promptContents.push({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.content }]
        });
      });
    }

    const currentTurnText = isConversational 
      ? `Mesaj / Message: ${question}`
      : `Soru / Question: ${question || "Genel bir okuma istiyorum"}\n\nÇekilen Kartlar / Drawn Cards:\n${cardDesc}\n\nPlease interpret this based on your system instructions.`;
    
    promptContents.push({
      role: "user",
      parts: [{ text: currentTurnText }]
    });

    console.log("=== GEMINI API INPUT ===\nSYSTEM:", systemInstruction.substring(0, 300) + "...", "\n========================");
    const rawReading = await callGemini(promptContents as any, systemInstruction, true);

    let readingText = "";
    try {
      // Gemini JSON output might include markdown code blocks, strip them
      const cleanedJson = rawReading.replace(/^```json\n?/, "").replace(/```$/, "").trim();
      const parsed = JSON.parse(cleanedJson);
      readingText = parsed.final_output || "Anlayamadım, tekrar eder misin?";
      logEntry.internal_monologue = parsed.internal_monologue || null;
      logEntry.tarot_angle = parsed.tarot_angle || null;
      logEntry.clarification_question = parsed.clarification_question || null;
      console.log("=== COGNITIVE ARCHITECTURE LOGS ===");
      console.log("INTERNAL MONOLOGUE:", parsed.internal_monologue);
      console.log("TAROT ANGLE:", parsed.tarot_angle);
      if (parsed.clarification_question) {
        console.log("CLARIFICATION REQUIRED:", parsed.clarification_question);
      }
      console.log("===================================");
    } catch(e) {
      // CRITICAL: NEVER expose raw JSON to user — it contains internal_monologue with psychological analysis
      console.error("=== COGNITIVE PARSE FAILURE ===", e, "Raw output:", rawReading);
      readingText = "Kartların enerjisi şu an çok yoğun, bir nefes alıp tekrar deneyelim mi? ✨";
    }

    // Save
    if (cards.length > 0) {
      await serviceClient.from("card_draws").insert({ session_id, user_id: user.id, cards, question: question || null });
    }
    const { data: savedMessage } = await serviceClient.from("messages")
      .insert({ session_id, user_id: user.id, role: "assistant", content: readingText, metadata: { cards } })
      .select().single();

    // ============================================================
    // 6. PSYCHOLOGICAL GATE (Expanded: runs on ALL intents)
    // ============================================================
    try {
      if (question && question.trim().length > 0) {
        // Get the last assistant message for context (what the user is responding to)
        let lastAssistantMsg = "";
        if (message_history && message_history.length > 0) {
          const assistantMsgs = message_history.filter((m: any) => m.role === "assistant");
          if (assistantMsgs.length > 0) {
            lastAssistantMsg = assistantMsgs[assistantMsgs.length - 1].content;
          }
        }

        // Different gate prompts based on intent
        let gatePromptText = "";
        
        if (intent === "READING") {
          gatePromptText = `User's message: "${question}"

Analyze this message on TWO levels:

SURFACE: What is the user explicitly saying or asking?
SUBTEXT: What does their choice of topic, phrasing, tone, brevity, or eagerness reveal? A terse "aşk falı bak" vs a vulnerable "aşk hayatım hakkında yardıma ihtiyacım var" tells very different stories.

BASELINE BEHAVIORS (NEVER produce a signal for these alone — they are WHY people use tarot apps):
- Asking about the future, wanting predictions, seeking guidance
- Asking what another person thinks or feels about them
- Asking for root causes or explanations ("kök neden ne?")
- Requesting specific or direct answers instead of vague ones
- Showing impatience with long or unclear responses
- Wanting to know consequences of a decision
- Accepting or declining an offer to do another reading
These are the equivalent of asking a doctor "what's wrong with me?" — universal, not personal.

WHEN TO PRODUCE A SIGNAL: Only when the user reveals something about THEMSELVES that goes beyond standard tarot usage. Their LIFE FACTS, EMOTIONAL STATES, RELATIONSHIP PATTERNS, BEHAVIORAL SEQUENCES (e.g., said X then immediately pivoted to Y), or SELF-CONTRADICTIONS are signals. The ACT of asking a tarot question is never a signal.

SIGNAL TYPE — classify your signal:
- "self_disclosure": User shares personal facts, emotional states, or reveals something about their inner world
- "behavioral_sequence": User shows a notable pattern (e.g., acknowledges something then immediately deflects)
- "communication_style": User's tone/phrasing is notably distinctive (NOTE: this is LOW WEIGHT and should rarely drive clinical hypotheses — a blunt tone is a communication preference, not a psychological defense)

If there is psychological substance: Write a 1-2 sentence observation. DESCRIBE behavior without clinical labels.
If there is nothing beyond baseline tarot usage: Return {"signal": "NO_SIGNAL"}

Include "event_context" for real-world events (graduation, breakup, job change).
Include "facts" for demographic data (age, job, relationship status).

Return JSON: {"signal": "..." or "NO_SIGNAL", "signal_type": "self_disclosure" | "behavioral_sequence" | "communication_style", "confidence": "0.1 to 1.0 (how explicit/strong the signal is)", "event_context": "..." or null, "facts": [{"key": "...", "value": "...", "source": "exact user quote"}] or []}`;
        } else if (intent === "FEEDBACK_POSITIVE" || intent === "FEEDBACK_NEGATIVE") {
          gatePromptText = `User's message: "${question}"

The reader's LAST message contained these claims:
"${lastAssistantMsg.substring(0, 600)}"

The user ${intent === "FEEDBACK_POSITIVE" ? "AGREES" : "DISAGREES"}.

YOUR TASK: Record SPECIFICALLY which claim was ${intent === "FEEDBACK_POSITIVE" ? "confirmed" : "rejected"}, and WHAT this reveals.

BAD observation: "The user agreed with the reading" ← USELESS. Tells us nothing.
BAD observation: "The user acknowledged the possibility" ← USELESS. What possibility?
GOOD observation: "User tentatively confirmed ('galiba') that they fear letting someone into their life will disrupt their personal peace" ← SPECIFIC and VALUABLE.

${intent === "FEEDBACK_NEGATIVE" ? `CRITICAL: Take their disagreement at FACE VALUE first. "Hayır yanılıyorsun" might be a genuine correction, NOT a defense mechanism. Only note it as potentially defensive if there is STRONG contradictory evidence from the user's own words elsewhere in this session. If you cannot determine which, describe the disagreement neutrally without labeling it.` : `Even tentative, half-hearted agreement ("galiba", "sanırım", "olabilir") is valuable. These hedged confirmations often reveal MORE than enthusiastic agreement — they suggest the user recognizes truth but finds it uncomfortable.`}

Also note BEHAVIORAL SEQUENCES: If the user acknowledged something uncomfortable and then IMMEDIATELY pivoted to a different topic, note the sequence without labeling it. Example: "After tentatively accepting [X], user immediately pivoted to asking about future romantic prospects. This sequence is noted." Do NOT label this as externalization or avoidance — in a tarot context, asking about the future is baseline behavior. The sequence may or may not be significant; consolidation will determine that with more evidence.

Return JSON: {"signal": "...", "signal_type": "self_disclosure" | "behavioral_sequence" | "feedback_response", "confidence": "0.1 to 1.0 (how explicit/strong the signal is)", "event_context": null, "facts": []}`;
        } else { // CHAT
          gatePromptText = `User's message: "${question}"
${lastAssistantMsg ? `\nThe reader's last message was:\n"${lastAssistantMsg.substring(0, 400)}"\n` : ""}
This is a conversational message. Analyze it for:

1. SELF-DISCLOSURE: Personal facts, life events, emotional states. Even brief factual answers ("bekarım", "öğrenciyim") are valuable data points.
2. SUBTEXT: HOW they say it matters. Brevity, deflection, elaboration, tone shifts. If the reader asked a deep question and the user gave a one-word answer, that brevity itself may be notable.
3. FACTS: age, job, relationship status, life circumstances → extract into facts array.

BASELINE BEHAVIORS (NEVER produce a signal for these alone):
- Asking about the future, wanting predictions
- Asking what another person thinks/feels
- Requesting specific or direct answers
- Showing impatience or asking for clarity
These are normal tarot app usage. Focus on what's UNIQUE to this person.

SIGNAL TYPE — classify your signal:
- "self_disclosure": User shares personal facts, emotional states, inner world
- "behavioral_sequence": User shows a notable pattern (e.g., says X then pivots to Y)
- "communication_style": User's tone is distinctive (LOW WEIGHT — rarely drives clinical hypotheses)

If nothing meaningful: Return {"signal": "NO_SIGNAL"}

Return JSON: {"signal": "..." or "NO_SIGNAL", "signal_type": "self_disclosure" | "behavioral_sequence" | "communication_style", "confidence": "0.1 to 1.0", "event_context": "..." or null, "facts": [{"key": "...", "value": "...", "source": "exact user quote"}] or []}`;
        }

        const gateResponse = await callGemini(
          [{ role: "user", parts: [{ text: gatePromptText }] }],
          `You are a behavioral observer performing clinical-grade observation. Return ONLY valid JSON.

PHILOSOPHY: You DESCRIBE behavior, you do NOT DIAGNOSE. You are a camera with insight, not a judge.

RULES:
1. Analyze ONLY the USER's words and behavior. Never analyze the tarot reader's output.
2. Your observations must be SPECIFIC to THIS user. "The user seeks guidance" is GARBAGE — it applies to everyone. REJECTED.
3. NEVER reference tarot cards or imagery. Write as if you've never seen a tarot card.
4. Read SUBTEXT: HOW someone says something is as valuable as WHAT they say. Brevity, sarcasm, deflection, pivots — these are gold.
5. NEVER use clinical labels prematurely (no "externalization", "avoidance", "defense mechanism"). DESCRIBE the behavior sequence and let pattern analysis handle labeling.
6. Quote the user's exact words as evidence.
7. Extract facts (age, job, relationship status) into the "facts" array.
8. When a user gives feedback (agrees/disagrees), record WHAT SPECIFIC CLAIM they responded to.
9. DYNAMIC CONFIDENCE: Assign a 'confidence' score between 0.1 and 1.0. A tentative "galiba" = 0.3. Explicit self-disclosure = 0.9. Bare fact disclosure ("ayrılık yaşandı") = max 0.85. Score based on STRENGTH of expression.
10. SIGNAL TYPE: Always classify your signal as "self_disclosure", "behavioral_sequence", or "communication_style". If the signal is purely about HOW the user speaks (tone, directness, brevity) rather than WHAT they reveal about themselves, it MUST be "communication_style".`
        );

        try {
          const gateData = JSON.parse(gateResponse.replace(/```json\n?|\n?```/g, "").trim());
          
          // PHASE D: Save facts REGARDLESS of the psychological signal
          if (gateData.facts && Array.isArray(gateData.facts) && gateData.facts.length > 0) {
            for (const fact of gateData.facts) {
              if (fact.key && fact.value) {
                try {
                  await serviceClient.from("user_memory").insert({ // Insert instead of upsert for chronological history
                    user_id: user.id,
                    key: fact.key,
                    value: fact.value,
                    source: fact.source || null,
                    updated_at: new Date().toISOString(),
                  });
                  console.log(`=== USER MEMORY SAVED (Chronological): ${fact.key} = ${fact.value} ===`);
                } catch (e) { console.log("=== USER MEMORY SAVE ERROR ===", e); }
              }
            }
          }

          // PHASE A: Psychological Signal Extraction
          if (gateData.signal && gateData.signal !== "NO_SIGNAL") {
            console.log("=== PSYCHOLOGICAL GATE: SIGNAL DETECTED ===\n", gateData, "\n=============================================");
            const embedding = await getEmbedding(gateData.signal);
            const signalType = gateData.signal_type || "self_disclosure";
            const { error: gateInsertErr } = await serviceClient.from("clinical_observations").insert({
              user_id: user.id, session_id,
              content: gateData.signal, embedding, confidence: gateData.confidence || 0.5,
              event_context: gateData.event_context || null,
              signal_type: signalType,
              source: "gate", is_consolidated: false,
            });
            if (gateInsertErr) console.error("=== GATE INSERT ERROR ===", gateInsertErr.message);
            // Update function log with gate data
            logEntry.gate_signal = gateData.signal;
            logEntry.gate_confidence = gateData.confidence || 0.5;
            console.log(`=== GATE SIGNAL TYPE: ${signalType} ===`);
          } else {
            console.log("=== PSYCHOLOGICAL GATE: NO SIGNAL ===");
          }
        } catch { console.log("=== PSYCHOLOGICAL GATE: PARSE ERROR, raw:", gateResponse); }
      }
    } catch (e) { console.log("=== PSYCHOLOGICAL GATE ERROR ===\n", e); }

    // ============================================================
    // 7. SIGNAL-BASED CONSOLIDATION (triggers when ≥5 unconsolidated signals)
    // ============================================================
    try {
      const { count: unconsolidatedCount } = await serviceClient
        .from("clinical_observations")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("source", "gate")
        .eq("is_consolidated", false);

      if (unconsolidatedCount && unconsolidatedCount >= 5) {
        console.log(`=== CONSOLIDATION TRIGGERED: ${unconsolidatedCount} unconsolidated signals ===`);

        const { data: signals } = await serviceClient
          .from("clinical_observations")
          .select("id, content, event_context, confidence, signal_type, created_at")
          .eq("user_id", user.id)
          .eq("source", "gate")
          .eq("is_consolidated", false)
          .order("created_at", { ascending: true });

        // V6: Fetch historical signals for cross-session pattern recognition
        const { data: historicalSignals } = await serviceClient
          .from("clinical_observations")
          .select("id, content, event_context, confidence, signal_type, created_at")
          .eq("user_id", user.id)
          .eq("source", "gate")
          .eq("is_consolidated", true)
          .order("created_at", { ascending: false })
          .limit(15);
        
        // Reverse so they are in chronological order
        const sortedHistorical = (historicalSignals || []).reverse();

        const { data: currentProfile } = await serviceClient
          .from("user_profile_cards")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        const formatSignal = (s: any, i: number) => 
          `${i + 1}. [${new Date(s.created_at).toISOString().split('T')[0]}] [${(s.signal_type || 'self_disclosure').toUpperCase()}] ${s.content}${s.event_context ? ` [Context: ${s.event_context}]` : ""} (confidence: ${s.confidence})`;

        const historicalList = sortedHistorical.length > 0 
          ? sortedHistorical.map(formatSignal).join("\n") 
          : "No historical observations.";
          
        const signalList = (signals || []).map(formatSignal).join("\n");

        const currentProfileStr = currentProfile 
          ? `Core Belief: ${currentProfile.core_belief_hypothesis || "None"}\nSchemas: ${JSON.stringify(currentProfile.dominant_schemas || [])}\nDefenses: ${(currentProfile.dominant_defenses || []).join(", ") || "None"}\nNarrative: ${currentProfile.narrative || "None"}`
          : "No existing profile.";

        const consolidationPrompt = `CURRENT USER PROFILE:
${currentProfileStr}

HISTORICAL OBSERVATIONS (Past sessions):
${historicalList}

NEW OBSERVATIONS (Since last consolidation):
${signalList}

CRITICAL RULES:
1. These observations are derived from what the USER actually said. Analyze ONLY these user-sourced observations.
2. If any observation says "The reader identifies..." or "The cards show..." — this is contamination from the tarot reader's narrative. IGNORE IT completely.
3. Every hypothesis MUST be supported by what the user themselves expressed. Quote or reference the user's own words.
4. NEVER reference tarot cards, spreads, or card imagery in your analysis.
5. CROSS-SESSION PATTERNS: Look for behavioral sequences that repeat across both historical and new observations.

BASELINE BEHAVIOR FILTER (CRITICAL):
This is a TAROT application. The following behaviors are COMPLETELY NORMAL for tarot users and must NEVER be used as evidence for any psychological hypothesis:
- Asking about the future or seeking predictions
- Asking what another person thinks or feels
- Asking for root causes ("kök neden ne?")
- Wanting specific or direct answers
- Showing impatience with vague responses
- Requesting consequences of decisions
- Asking the tarot to reveal hidden truths about others
If an observation describes ONLY one of these behaviors with no additional self-disclosure, SKIP IT as evidence entirely.

SIGNAL WEIGHT HIERARCHY:
Each observation is tagged with a signal type. Respect these weights:
- [SELF_DISCLOSURE]: PRIMARY evidence — the user revealed something about their inner world. USE THIS.
- [BEHAVIORAL_SEQUENCE]: PRIMARY evidence — the user showed a notable behavioral pattern. USE THIS.
- [FEEDBACK_RESPONSE]: SECONDARY evidence — valuable but requires corroboration from other signals.
- [COMMUNICATION_STYLE]: TERTIARY evidence — describes HOW the user communicates (tone, directness), NOT who they are. A blunt tone is a communication preference, NOT a psychological defense. NEVER build or strengthen a schema primarily from communication_style observations.

SCHEMA DISCIPLINE:
- Your PRIMARY job is to CONFIRM or CHALLENGE existing schemas based on new evidence.
- Extract a new schema ONLY IF there is overwhelming, explicit evidence in the user's words, preferably repeating across sessions.
- A schema should NOT reach confidence > 0.6 unless supported by evidence from at least 2 different sessions.
- If you cannot find strong evidence, "No new schema detected" is a valid and preferred output.
- Do NOT force observations into schema categories. If a pattern doesn't fit a known schema, describe it freely.

Return a JSON object with:
1. "internal_monologue": Your thought pipeline. Discuss cross-session patterns, weigh evidence for/against existing schemas, and debate if a new schema is justified.
2. "confirmed": Existing hypotheses SUPPORTED by new evidence. [{"hypothesis": "...", "new_confidence": 0.x, "reason": "..."}]
3. "challenged": Existing hypotheses CONTRADICTED. [{"hypothesis": "...", "new_confidence": 0.x, "reason": "..."}]
4. "new_hypotheses": Newly detected patterns based ONLY on strong evidence. [{"schema_name": "Short Name (e.g. External Locus of Control)", "hypothesis": "Full explanation...", "confidence": 0.3, "evidence": "user's own words"}]
5. "updated_core_belief": Updated core belief (1 sentence, English). Must be grounded in what the user actually said.
6. "updated_defenses": Updated defense mechanisms list (English).
7. "updated_narrative": Updated narrative (2-3 sentences, English). Must reference the user's actual statements.

Return ONLY valid JSON.`;

        const consolidationResult = await callGemini(
          [{ role: "user", parts: [{ text: consolidationPrompt }] }],
          "You are an expert clinical psychologist. Be conservative and evidence-based. Challenge your own hypotheses. Every claim must be traceable to the user's own words. Return ONLY valid JSON in English."
        );

        try {
          const consData = JSON.parse(consolidationResult.replace(/```json\n?|\n?```/g, "").trim());
          console.log("=== CONSOLIDATION RESULT ===\n", JSON.stringify(consData, null, 2), "\n============================");
          logEntry.consolidation_result = consData;

          const allHypotheses = [
            ...(consData.confirmed || []).map((h: any) => ({ ...h, type: "confirmed" })),
            ...(consData.challenged || []).map((h: any) => ({ ...h, type: "challenged" })),
            ...(consData.new_hypotheses || []).map((h: any) => ({ ...h, type: "new" })),
          ];

          for (const h of allHypotheses) {
            const content = `[${h.type.toUpperCase()}] ${h.hypothesis} — ${h.reason || h.evidence || ""}`;
            const emb = await getEmbedding(content);
            const hypothesisSlug = (h.hypothesis || "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").substring(0, 50);
            const { error: consInsertErr } = await serviceClient.from("clinical_observations").insert({
              user_id: user.id, session_id,
              content, embedding: emb,
              confidence: h.new_confidence || h.confidence || 0.5,
              source: "consolidation",
              tags: [h.type, hypothesisSlug].filter(Boolean),
            });
            if (consInsertErr) console.error("=== CONSOLIDATION INSERT ERROR ===", consInsertErr.message);
          }

          // Update profile card — V5: challenged schemas are REMOVED from profile
          const challengedNames = new Set((consData.challenged || []).map((h: any) => (h.hypothesis || "").toLowerCase()));
          
          // Keep old schemas that weren't challenged
          const survivingOldSchemas = (currentProfile?.dominant_schemas || [])
            .filter((s: any) => !challengedNames.has((s.schema || "").toLowerCase()));
          
          // Build new schema list: surviving old + confirmed (with updated confidence) + new
          const confirmedMap = new Map((consData.confirmed || []).map((h: any) => [h.hypothesis?.toLowerCase(), h.new_confidence]));
          const updatedSchemas = [
            ...survivingOldSchemas.map((s: any) => ({
              schema: s.schema,
              description: s.description || s.schema,
              confidence: confirmedMap.has(s.schema?.toLowerCase()) ? confirmedMap.get(s.schema?.toLowerCase()) : s.confidence,
            })),
            ...(consData.new_hypotheses || []).map((h: any) => ({ 
              schema: h.schema_name || h.hypothesis, 
              description: h.hypothesis, 
              confidence: h.confidence 
            })),
          ].filter(s => (s.confidence || 0) > 0.2);

          const narrativeForEmbed = consData.updated_narrative || currentProfile?.narrative || "";
          const profileEmbed = narrativeForEmbed ? await getEmbedding(narrativeForEmbed) : [];

          await serviceClient.from("user_profile_cards").upsert({
            user_id: user.id,
            core_belief_hypothesis: consData.updated_core_belief || currentProfile?.core_belief_hypothesis,
            dominant_defenses: consData.updated_defenses || currentProfile?.dominant_defenses || [],
            dominant_schemas: updatedSchemas,
            narrative: consData.updated_narrative || currentProfile?.narrative,
            embedding: profileEmbed.length > 0 ? profileEmbed : (currentProfile?.embedding || []),
            session_count: (currentProfile?.session_count || 0) + 1,
            last_consolidated: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id" });

          console.log(`=== PROFILE CARD UPDATED ===\nSchemas: ${updatedSchemas.length} (${challengedNames.size} challenged removed)\nConsolidation #${(currentProfile?.session_count || 0) + 1}\n============================`);

          // Mark signals as consolidated
          const signalIds = (signals || []).map((s: any) => s.id);
          if (signalIds.length > 0) {
            await serviceClient.from("clinical_observations")
              .update({ is_consolidated: true })
              .in("id", signalIds);
          }

          console.log(`=== CONSOLIDATION COMPLETE: ${allHypotheses.length} hypotheses processed, ${signalIds.length} signals consolidated ===`);
        } catch { console.log("=== CONSOLIDATION PARSE ERROR, raw:", consolidationResult); }
      }
    } catch (e) { console.log("=== CONSOLIDATION ERROR ===\n", e); }

    try {
      await serviceClient.from("function_logs").insert(logEntry);
    } catch (e) { console.log("=== FUNCTION LOG SAVE ERROR ===", e); }

    return new Response(JSON.stringify({ reading: readingText, cards, message_id: savedMessage?.id || null }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("FATAL:", (error as Error).message);
    return new Response(JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
