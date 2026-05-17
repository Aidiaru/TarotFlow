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

async function callGemini(prompt: any, systemInstruction: string, attempt = 1): Promise<string> {
  const MAX_RETRIES = 3;
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  try {
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
      return callGemini(prompt, systemInstruction, attempt + 1);
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
    
    // ============================================================
    // 1. INTENT CLASSIFICATION (Expanded: READING/CHAT/FEEDBACK)
    // ============================================================
    let intent = "READING"; // default
    if (question && question.trim().length > 0) {
      try {
        const intentPrompt = [{ role: "user", parts: [{ text: `Message: "${question}"\n\nClassify this message into EXACTLY ONE of these categories:\n- READING: A new request for a tarot reading on a new topic\n- CHAT: A greeting, small talk, or follow-up question about a previous reading (e.g. "simplify", "explain")\n- FEEDBACK_POSITIVE: The user agrees with or validates the previous reading (e.g. "evet tam olarak bu", "çok doğru", "bunu hissediyorum", "so true")\n- FEEDBACK_NEGATIVE: The user disagrees with or rejects the previous reading (e.g. "hayır pek değil", "saçma", "I don't think so")\n\nAnswer with ONLY ONE WORD: READING, CHAT, FEEDBACK_POSITIVE, or FEEDBACK_NEGATIVE.` }] }];
        const intentResponse = await callGemini(intentPrompt as any, "You are an intent classifier. Answer with ONLY ONE WORD.");
        const cleaned = intentResponse.trim().toUpperCase().replace(/[^A-Z_]/g, "");
        if (["READING", "CHAT", "FEEDBACK_POSITIVE", "FEEDBACK_NEGATIVE"].includes(cleaned)) {
          intent = cleaned;
        }
        console.log("=== INTENT ===", intent);
      } catch (e) { console.log("=== INTENT ERROR, defaulting to READING ===", e); }
    }

    const isConversational = intent === "CHAT" || intent === "FEEDBACK_POSITIVE" || intent === "FEEDBACK_NEGATIVE";
    const cards = isConversational ? [] : drawCards(5);

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
        // Find recent gate observations for this user (last 24h) and adjust confidence
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
    // Get profile card
    const { data: profileCard } = await serviceClient
      .from("user_profile_cards").select("*").eq("user_id", user.id).maybeSingle();
    console.log("=== RAG: PROFILE CARD ===\n", profileCard ? profileCard : "No profile card found", "\n=========================");

    // Build card description (moved up — needed for Card-Driven RAG)
    const cardDesc = cards.length > 0
      ? cards.map((c) => `${c.position}. ${c.name_tr} (${c.name})${c.is_reversed ? " — Ters" : ""}`).join("\n")
      : "";

    // ============================================================
    // 3. CARD-DRIVEN RAG (Two-Stage Pipeline)
    // ============================================================
    let relevantInsights: string[] = [];
    try {
      // STAGE 1: Extract psychological themes from the CARDS (not user question)
      if (cards.length > 0) {
        console.log("=== CARD-DRIVEN RAG: STAGE 1 — THEME EXTRACTION ===");
        const themeResponse = await callGemini(
          [{ role: "user", parts: [{ text: `Tarot cards drawn:\n${cardDesc}\n\nExtract 3-5 psychological themes these cards represent together. Focus on emotional/relational/existential themes, not superficial card meanings.\nReturn ONLY a JSON array of strings, e.g.: ["authority loss", "emotional withdrawal", "fear of abandonment"]` }] }],
          "You are a tarot symbolism expert. Return ONLY a valid JSON array of theme strings in English. Be psychologically precise."
        );

        let cardThemes: string[] = [];
        try {
          cardThemes = JSON.parse(themeResponse.replace(/```json\n?|\n?```/g, "").trim());
          console.log("=== CARD THEMES ===", cardThemes, "\n===================");
        } catch { console.log("=== CARD THEME PARSE ERROR, raw:", themeResponse); }

        // STAGE 2: Search clinical_observations using CARD THEMES (not user question)
        if (cardThemes.length > 0) {
          const themeQuery = cardThemes.join(", ");
          console.log("=== CARD-DRIVEN RAG: STAGE 2 — SEARCHING WITH THEMES ===");
          const themeEmbedding = await getEmbedding(themeQuery);
          const { data: observations } = await serviceClient.rpc("search_clinical_observations", {
            p_user_id: user.id, p_embedding: themeEmbedding, p_match_count: 3, p_match_threshold: 0.5, p_min_confidence: 0.4,
          });
          if (observations && observations.length > 0) {
            relevantInsights = observations.map((o: any) => o.content);
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
    // 5. SYSTEM INSTRUCTION + GENERATION
    // ============================================================
    const systemInstruction = isConversational
      ? `You are an ancient, wise tarot reader who has spent decades studying the Rider-Waite tradition. You have a deep, intuitive understanding of human nature.
CRITICAL RULES:
1. ALWAYS respond in the exact same language that the user used.
2. The user is either greeting you, making small talk, OR asking a follow-up question/giving feedback about their previous reading (e.g. "simplify", "explain", "I don't understand").
3. If they are asking about the previous reading or giving an instruction like "simplify", answer their question or fulfill their request based on the chat history. Maintain your wise tone but make sure you actually do what they asked.
4. If it's just small talk or a greeting, warmly acknowledge it. Keep it concise.
5. NEVER use psychological, clinical, or therapeutic terminology (e.g. "Jungian", "schema", "defense mechanism", "archetype", "projection", "transference", "cognitive", "psychoanalytic"). You are a tarot reader, NOT a therapist. Speak through the language of the cards, symbols, and metaphors — never through clinical jargon.
${hiddenContext ? "\n" + hiddenContext : ""}`
      : `You are an ancient, wise tarot reader who has spent decades studying the Rider-Waite tradition. You have a deep, intuitive understanding of human nature — but you express this ONLY through the language of tarot symbolism, never through clinical or psychological terminology.
CRITICAL RULES:
1. ALWAYS respond in the exact same language that the user used in their last message.
2. NEVER use cheap fortune-teller cliches (e.g., 'honey', 'fate is smiling').
3. ABSOLUTELY NEVER use psychological, clinical, or therapeutic terminology in your response. Words like "Jungian", "archetype", "schema", "defense mechanism", "projection", "cognitive", "anxiety", "core belief", "psychoanalytic", "transference" are FORBIDDEN. You are a tarot reader. Speak through the cards.
4. DO NOT force [BACKGROUND CONTEXT] onto the current cards. First, objectively read the symbolic meaning of the cards on the table. Only weave in past context if the cards naturally align with it.
5. Avoid excessive "new-age" poetic metaphors (e.g., 'holy healing', 'stay in the light'). Keep your tone grounded and sharp. Refer to specific card imagery and symbolism.
6. Be concise and impactful. Do not write overly long paragraphs. Weave the cards into a single cohesive narrative.
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

    const currentTurnText = isConversational 
      ? `Mesaj / Message: ${question}`
      : `Soru / Question: ${question || "Genel bir okuma istiyorum"}\n\nÇekilen Kartlar / Drawn Cards:\n${cardDesc}\n\nPlease interpret this based on your system instructions.`;
    
    promptContents.push({
      role: "user",
      parts: [{ text: currentTurnText }]
    });

    console.log("=== GEMINI API INPUT ===\nSYSTEM:", systemInstruction, "\nCONTENTS:", JSON.stringify(promptContents, null, 2), "\n========================");
    const reading = await callGemini(promptContents as any, systemInstruction);

    // Save
    if (cards.length > 0) {
      await serviceClient.from("card_draws").insert({ session_id, user_id: user.id, cards, question: question || null });
    }
    const { data: savedMessage } = await serviceClient.from("messages")
      .insert({ session_id, user_id: user.id, role: "assistant", content: reading, metadata: { cards } })
      .select().single();

    // ============================================================
    // 6. PSYCHOLOGICAL GATE (replaces old micro-profiling)
    // ============================================================
    try {
      if (intent === "READING" && question && question.trim().length > 0) {
        const gateResponse = await callGemini(
          [{ role: "user", parts: [{ text: `User message: "${question}"\n\nDoes this message contain psychologically meaningful content — emotional disclosure, relationship dynamics, fears, desires, coping patterns, identity struggles, or reactions to life events?\n\nIf YES: Extract the psychological substance in 1-2 sentences in English. Include an "event_context" if a real-world event is mentioned (e.g. "job interview", "breakup").\nReturn JSON: {"signal": "...", "event_context": "..." or null}\n\nIf NO: Return exactly: {"signal": "NO_SIGNAL"}` }] }],
          "You are a clinical observation extractor. Return ONLY valid JSON. Extract psychological substance, not stylistic observations (like 'the user uses demanding language'). Focus on what the message REVEALS about the person's inner world."
        );

        try {
          const gateData = JSON.parse(gateResponse.replace(/```json\n?|\n?```/g, "").trim());
          if (gateData.signal && gateData.signal !== "NO_SIGNAL") {
            console.log("=== PSYCHOLOGICAL GATE: SIGNAL DETECTED ===\n", gateData, "\n=============================================");
            const embedding = await getEmbedding(gateData.signal);
            await serviceClient.from("clinical_observations").insert({
              user_id: user.id, session_id,
              content: gateData.signal, embedding, confidence: 0.5,
              event_context: gateData.event_context || null,
              source: "gate", is_consolidated: false,
            });
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

        // Fetch unconsolidated signals
        const { data: signals } = await serviceClient
          .from("clinical_observations")
          .select("id, content, event_context, confidence")
          .eq("user_id", user.id)
          .eq("source", "gate")
          .eq("is_consolidated", false)
          .order("created_at", { ascending: true });

        // Fetch current profile
        const { data: currentProfile } = await serviceClient
          .from("user_profile_cards")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        const signalList = (signals || []).map((s: any, i: number) => 
          `${i + 1}. ${s.content}${s.event_context ? ` [Context: ${s.event_context}]` : ""} (confidence: ${s.confidence})`
        ).join("\n");

        const currentProfileStr = currentProfile 
          ? `Core Belief: ${currentProfile.core_belief_hypothesis || "None"}\nSchemas: ${JSON.stringify(currentProfile.dominant_schemas || [])}\nDefenses: ${(currentProfile.dominant_defenses || []).join(", ") || "None"}\nNarrative: ${currentProfile.narrative || "None"}`
          : "No existing profile.";

        const consolidationPrompt = `CURRENT USER PROFILE:
${currentProfileStr}

NEW OBSERVATIONS (since last consolidation):
${signalList}

Using the Young Schema Therapy framework (18 schemas) and psychoanalytic concepts as your clinical vocabulary, analyze these new observations against the existing profile.

You MUST return a JSON object with these 3 sections:
1. "confirmed": Existing hypotheses SUPPORTED by new evidence. Increase their confidence.
   Format: [{"hypothesis": "...", "new_confidence": 0.8, "reason": "..."}]
2. "challenged": Existing hypotheses CONTRADICTED by new evidence. Decrease or remove.
   Format: [{"hypothesis": "...", "new_confidence": 0.2, "reason": "..."}]
3. "new_hypotheses": NEW patterns that don't fit existing hypotheses. Add as LOW confidence.
   Format: [{"hypothesis": "...", "confidence": 0.3, "evidence": "..."}]
4. "updated_core_belief": Updated core belief hypothesis (1 sentence, English).
5. "updated_defenses": Updated list of dominant defense mechanisms (English).
6. "updated_narrative": Updated narrative summary (2-3 sentences, English).

Return ONLY valid JSON.`;

        const consolidationResult = await callGemini(
          [{ role: "user", parts: [{ text: consolidationPrompt }] }],
          "You are an expert clinical psychologist. Be evidence-based and precise. Challenge your own hypotheses. Return ONLY valid JSON in English."
        );

        try {
          const consData = JSON.parse(consolidationResult.replace(/```json\n?|\n?```/g, "").trim());
          console.log("=== CONSOLIDATION RESULT ===\n", JSON.stringify(consData, null, 2), "\n============================");

          // Save consolidation insights as clinical observations
          const allHypotheses = [
            ...(consData.confirmed || []).map((h: any) => ({ ...h, type: "confirmed" })),
            ...(consData.challenged || []).map((h: any) => ({ ...h, type: "challenged" })),
            ...(consData.new_hypotheses || []).map((h: any) => ({ ...h, type: "new" })),
          ];

          for (const h of allHypotheses) {
            const content = `[${h.type.toUpperCase()}] ${h.hypothesis} — ${h.reason || h.evidence || ""}`;
            const emb = await getEmbedding(content);
            await serviceClient.from("clinical_observations").insert({
              user_id: user.id, session_id,
              content, embedding: emb,
              confidence: h.new_confidence || h.confidence || 0.5,
              source: "consolidation",
              tags: [h.type, "consolidation"],
            });
          }

          // Update profile card
          const updatedSchemas = [
            ...(consData.confirmed || []).map((h: any) => ({ schema: h.hypothesis, confidence: h.new_confidence })),
            ...(consData.new_hypotheses || []).map((h: any) => ({ schema: h.hypothesis, confidence: h.confidence })),
          ].filter(s => (s.confidence || 0) > 0.3);

          await serviceClient.from("user_profile_cards").upsert({
            user_id: user.id,
            core_belief_hypothesis: consData.updated_core_belief || currentProfile?.core_belief_hypothesis,
            dominant_defenses: consData.updated_defenses || currentProfile?.dominant_defenses || [],
            dominant_schemas: updatedSchemas,
            narrative: consData.updated_narrative || currentProfile?.narrative,
            embedding: await getEmbedding(consData.updated_narrative || ""),
            session_count: (currentProfile?.session_count || 0) + 1,
            last_consolidated: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id" });

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

    return new Response(JSON.stringify({ reading, cards, message_id: savedMessage?.id || null }),
      { headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("FATAL:", (error as Error).message);
    return new Response(JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { "Content-Type": "application/json" } });
  }
});
