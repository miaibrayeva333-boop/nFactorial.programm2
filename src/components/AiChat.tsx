import { FormEvent, useEffect, useRef, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

type Message = { id: number; role: 'assistant' | 'user'; text: string };
const system = `You are Axis, the concise and friendly Smart Axis personal organization assistant.
Help with planning, prioritizing, schedules, free time, breaks, habits, emotional wellbeing, and unfinished tasks.
For emotional support, listen without judgment, validate feelings without diagnosing, ask one gentle question at a time,
and suggest small grounded coping steps. Do not present yourself as a therapist or replace professional care.
If someone may be in immediate danger, encourage them to contact local emergency services or a trusted person now.
Give practical short answers with clear next steps. Never claim to change data you cannot access.`;

export function AiChat() {
  const name = localStorage.getItem('smart-life-name') ?? 'Alex';
  const firstName = name.trim().split(/\s+/)[0];
  const savedMetrics = localStorage.getItem('smart-life-metrics');
  const mood = savedMetrics
    ? (JSON.parse(savedMetrics) as { mood?: string }).mood ?? 'unsure'
    : 'unsure';
  const suggestions = [
    `I feel ${mood.toLowerCase()}—help me check in`,
    'Help me calm down',
    'Ask me a gentle journal question',
    'Plan a low-stress day',
  ];
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: 'assistant', text: 'Hi! How can I help organize your day?' },
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
    const { data, error } = await supabase.functions.invoke('ai', {
      body: { prompt: conversation, system },
    });
    const answer = error
      ? 'I could not reach the assistant. Please try again in a moment.'
      : typeof data?.text === 'string'
        ? data.text
        : data?.error ?? 'I did not receive an answer. Please try again.';
    setMessages([...history, { id: Date.now() + 1, role: 'assistant', text: answer }]);
    setLoading(false);
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
          <div><h2>Axie · Smart Axis AI</h2><p><i /> Planning and emotional support</p></div>
        </header>
        <div className="ai-messages">
          {messages.length === 1 && (
            <div className="ai-welcome">
              <img className="ai-mascot-large" src="/assets/axolotl-ai-mascot.png" alt="Axie the axolotl" />
              <div className="mascot-bubble">
                <strong>Hi {firstName}! I noticed today’s mood is “{mood}.”</strong>
                <span>Would you like to talk about how you’re feeling, or make a gentle plan for your day?</span>
              </div>
              <h1>What’s on your mind?</h1>
              <p>Axie can help you reflect, calm down, plan gently, or find one manageable next step.</p>
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
              placeholder="Message Axis..."
              value={question}
            />
            <button aria-label="Send message" disabled={!question.trim() || loading} type="submit">↑</button>
          </form>
          <small>Axis can make mistakes. Check important information.</small>
        </footer>
      </section>
    </div>
  );
}
