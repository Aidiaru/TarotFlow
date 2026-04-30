// =============================================
// Database Types
// =============================================

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  preferred_language: string;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  title: string | null;
  status: 'active' | 'completed';
  message_count: number;
  created_at: string;
  ended_at: string | null;
}

export interface Message {
  id: string;
  session_id: string;
  user_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface TarotCard {
  name: string;
  name_tr: string;
  is_reversed: boolean;
  position: number;
}

export interface CardDraw {
  id: string;
  session_id: string;
  user_id: string;
  cards: TarotCard[];
  spread_type: string;
  question: string | null;
  created_at: string;
}

export interface UserInsight {
  id: string;
  user_id: string;
  session_id: string | null;
  insight_type: 'schema_tag' | 'defense_mechanism' | 'core_belief' | 'session_summary' | 'behavioral_pattern';
  content: string;
  confidence: number;
  schemas_detected: SchemaDetection[];
  metadata: Record<string, any>;
  created_at: string;
}

export interface SchemaDetection {
  schema: string;
  confidence: number;
}

export interface UserProfileCard {
  id: string;
  user_id: string;
  core_belief_hypothesis: string | null;
  dominant_defenses: string[];
  dominant_schemas: SchemaDetection[];
  narrative: string | null;
  session_count: number;
  last_consolidated: string;
  created_at: string;
  updated_at: string;
}

// =============================================
// API Types
// =============================================

export interface TarotReadingRequest {
  session_id: string;
  question?: string;
  message_history?: { role: string; content: string }[];
}

export interface TarotReadingResponse {
  reading: string;
  cards: TarotCard[];
  message_id: string;
}

export interface SessionReflectionRequest {
  session_id: string;
}

export interface SessionReflectionResponse {
  success: boolean;
  insights_created: number;
}
