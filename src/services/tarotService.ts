import { supabase } from '../lib/supabase';
import type {
  TarotReadingRequest,
  TarotReadingResponse,
  SessionReflectionRequest,
  SessionReflectionResponse,
  Session,
  Message,
} from '../types';

// =============================================
// Session Management
// =============================================

export async function createSession(userId: string): Promise<Session> {
  const { data, error } = await supabase
    .from('sessions')
    .insert({ user_id: userId, title: 'Yeni Oturum' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getSessions(userId: string): Promise<Session[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function endSession(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from('sessions')
    .update({ status: 'completed', ended_at: new Date().toISOString() })
    .eq('id', sessionId);

  if (error) throw error;
}

export async function deleteSession(sessionId: string): Promise<void> {
  // Delete all related data first
  await supabase.from('user_insights').delete().eq('session_id', sessionId);
  await supabase.from('card_draws').delete().eq('session_id', sessionId);
  await supabase.from('messages').delete().eq('session_id', sessionId);
  const { error } = await supabase.from('sessions').delete().eq('id', sessionId);
  if (error) throw error;
}

export async function updateSessionTitle(sessionId: string, title: string): Promise<void> {
  const { error } = await supabase
    .from('sessions')
    .update({ title })
    .eq('id', sessionId);

  if (error) throw error;
}

// =============================================
// Message Management
// =============================================

export async function getMessages(sessionId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function saveMessage(
  sessionId: string,
  userId: string,
  role: 'user' | 'assistant',
  content: string,
  metadata: Record<string, any> = {}
): Promise<Message> {
  const { data, error } = await supabase
    .from('messages')
    .insert({ session_id: sessionId, user_id: userId, role, content, metadata })
    .select()
    .single();

  if (error) throw error;

  return data;
}

// =============================================
// Tarot Reading (Edge Function)
// =============================================

export async function requestTarotReading(
  request: TarotReadingRequest
): Promise<TarotReadingResponse> {
  const { data, error } = await supabase.functions.invoke('tarot-reading', {
    body: request,
  });

  if (error) {
    // Try to extract the actual error message from the response
    const errorMessage = data?.error || error.message || 'Bilinmeyen hata';
    throw new Error(errorMessage);
  }
  return data as TarotReadingResponse;
}

// =============================================
// Session Reflection (Edge Function)
// =============================================

export async function triggerSessionReflection(
  request: SessionReflectionRequest
): Promise<SessionReflectionResponse> {
  const { data, error } = await supabase.functions.invoke('session-reflection', {
    body: request,
  });

  if (error) throw error;
  return data as SessionReflectionResponse;
}
