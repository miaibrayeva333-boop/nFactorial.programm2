import { FormEvent, useEffect, useRef, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { useI18n } from '../lib/i18n';
import { sectionCopy } from '../lib/sectionCopy';

type Message = { id: number; role: 'assistant' | 'user'; text: string };
const system = `You are Axis, the concise and friendly Smart Axis personal organization assistant.
Help with planning, prioritizing, schedules, free time, breaks, habits, emotional wellbeing, and unfinished tasks.
For emotional support, listen without judgment, validate feelings without diagnosing, ask one gentle question at a time,
and suggest small grounded coping steps. Do not present yourself as a therapist or replace professional care.
If someone may be in immediate danger, encourage them to contact local emergency services or a trusted person now.
Give practical short answers with clear next steps. Never claim to change data you cannot access.`;

export function AiChat() {
  const { language } = useI18n();
  const copy = sectionCopy(language);
  const name = localStorage.getItem('smart-life-name') ?? 'Alex';
  const firstName = name.trim().split(/\s+/)[0];
  const savedMetrics = localStorage.getItem('smart-life-metrics');
  const mood = savedMetrics
    ? (JSON.parse(savedMetrics) as { mood?: string }).mood ?? 'unsure'
    : 'unsure';
  const suggestions = [
    `${copy.moodPrompt}: ${mood.toLowerCase()}`,
    copy.calmDown, copy.journal, copy.lowStress,
  ];
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: 'assistant', text: copy.aiHello },
  ]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function send(text: string) {
    const prompt = text.trim();
    if (!prompt || loading) return;
    const userMessage: Message = { id: Date.now(), role: 'user', text: prompt };
    const history = [...messages, userMessage];
    setMessages(history);
    setQuestion('');
    setLoading(true);

    if (!isSupabaseConfigured) {
      setMessages([...history, {
        id: Date.now() + 1,
        role: 'assistant',
        text: 'AI needs the Supabase environment variables before it can answer.',
      }]);
      setLoading(false);
      return;
    }

    const conversation = history.slice(-8)
      .map((message) => `${message.role === 'user' ? 'User' : 'Assistant'}: ${message.text}`)
      .join('\n');
    try {
      const { data, error } = await supabase.functions.invoke('ai', {
        body: { prompt: conversation, system: `${system}\nRespond in ${language}.` },
      });
      const serverError = typeof data?.error === 'string' ? data.error : '';
      const answer = error
        ? 'I could not reach the assistant. Please check your connection and try again.'
        : typeof data?.text === 'string'
          ? data.text
          : serverError || 'I did not receive an answer. Please try again.';
      setMessages([...history, { id: Date.now() + 1, role: 'assistant', text: answer }]);
    } catch {
      setMessages([...history, { id: Date.now() + 1, role: 'assistant', text: 'The connection was interrupted. Please try sending your message again.' }]);
    } finally {
      setLoading(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void send(question);
  }

  return (
    <div className="ai-page">
      <section className="ai-chat">
        <header className="ai-chat__header">
          <img className="ai-avatar mascot-avatar" src="/assets/axolotl-ai-mascot.png" alt="Friendly axolotl AI mascot" />
          <div><h2>Axie · Smart Axis AI</h2><p><i /> {copy.aiSubtitle}</p></div>
        </header>
        <div className="ai-messages">
          {messages.length === 1 && (
            <div className="ai-welcome">
              <img className="ai-mascot-large" src="/assets/axolotl-ai-mascot.png" alt="Axie the axolotl" />
              <div className="mascot-bubble">
                <strong>{firstName}! {copy.aiMood} “{mood}.”</strong>
                <span>{copy.aiTalk}</span>
              </div>
              <h1>{copy.whatsOnMind}</h1>
              <p>{copy.aiHelp}</p>
            </div>
          )}
          {messages.map((message) => (
            message.id === 1 && messages.length === 1 ? null : (
              <div className={`chat-line ${message.role}`} key={message.id}>
                {message.role === 'assistant'
                  ? <img className="chat-line__avatar mascot-avatar" src="/assets/axolotl-ai-mascot.png" alt="" />
                  : <div className="chat-line__avatar">{firstName.charAt(0).toUpperCase()}</div>}
                <div className="chat-message">{message.text}</div>
              </div>
            )
          ))}
          {loading && <div className="chat-message assistant typing"><i /><i /><i /></div>}
          <div ref={endRef} />
        </div>
        <footer className="ai-composer">
          {messages.length === 1 && (
            <div className="chat-suggestions">
              {suggestions.map((item) => <button onClick={() => void send(item)} type="button" key={item}>{item}</button>)}
            </div>
          )}
          <form className="chat-input" onSubmit={submit}>
            <input
              autoFocus
              maxLength={1000}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder={copy.message}
              value={question}
            />
            <button aria-label={copy.send} disabled={!question.trim() || loading} type="submit">↑</button>
          </form>
          <small>{copy.aiWarning}</small>
        </footer>
      </section>
    </div>
  );
}
