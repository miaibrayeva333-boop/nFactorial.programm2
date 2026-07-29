import { FormEvent, useEffect, useRef, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

type Message = { id: number; role: 'assistant' | 'user'; text: string };
type Props = { onClose: () => void };

const suggestions = ['Plan my day', 'Prioritize my tasks', 'When should I take a break?'];
const system = `You are Smart Life, a concise and friendly personal organization assistant.
Help with planning, prioritizing, schedules, free time, breaks, habits, and unfinished tasks.
Give practical short answers with clear next steps. Never claim to change data you cannot access.`;

export function AiChat({ onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: 'assistant', text: 'Hi! How can I help organize your day?' },
  ]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages, loading]);

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
    <div className="modal-backdrop ai-backdrop" onMouseDown={onClose}>
      <section className="ai-chat" onMouseDown={(event) => event.stopPropagation()}>
        <header className="ai-chat__header">
          <div className="ai-avatar">✦</div>
          <div><h2>Smart Life AI</h2><p><i /> Online assistant</p></div>
          <button onClick={onClose} type="button">×</button>
        </header>
        <div className="ai-messages">
          {messages.map((message) => (
            <div className={`chat-message ${message.role}`} key={message.id}>{message.text}</div>
          ))}
          {loading && <div className="chat-message assistant typing"><i /><i /><i /></div>}
          <div ref={endRef} />
        </div>
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
            placeholder="Ask about your day..."
            value={question}
          />
          <button aria-label="Send message" disabled={!question.trim() || loading} type="submit">➤</button>
        </form>
      </section>
    </div>
  );
}
