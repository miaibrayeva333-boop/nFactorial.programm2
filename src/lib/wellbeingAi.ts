import { supabase } from './supabase';

type CheckInForAi = { mood: string; energy: number; stress: number; note: string };

export async function getWellbeingSupport(checkIn: CheckInForAi, language: string) {
  const prompt = `A young person completed a wellbeing check-in.
Mood: ${checkIn.mood}
Energy: ${checkIn.energy}/5
Stress: ${checkIn.stress}/5
Their note: ${checkIn.note || 'No note provided'}
Respond in ${language}. Help them gently understand possible everyday reasons for this feeling without diagnosing them.`;
  const system = `You are Axie, a calm wellbeing support assistant for teenagers.
Give a warm response under 130 words. Validate the feeling, mention 1-2 possible everyday patterns as possibilities rather than facts, ask one gentle reflective question, and suggest 2 small safe actions.
Never diagnose, shame, or claim certainty. Do not replace a therapist. If the note suggests self-harm, immediate danger, or abuse, encourage contacting a trusted adult and local emergency or crisis support now.`;
  const { data, error } = await supabase.functions.invoke('ai', { body: { prompt, system } });
  if (error) throw error;
  const text = (data as { text?: unknown } | null)?.text;
  if (typeof text !== 'string' || !text.trim()) throw new Error('AI returned no support text');
  return text.trim();
}
