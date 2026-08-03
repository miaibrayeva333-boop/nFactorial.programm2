import { FormEvent, useState } from 'react';
import { awardXp } from '../lib/xp';

type CheckIn = {
  id: number;
  date: string;
  mood: string;
  energy: number;
  stress: number;
  note: string;
};

const moods = [
  ['Calm', '◡'], ['Happy', '☀'], ['Focused', '◎'],
  ['Tired', '☾'], ['Anxious', '≈'], ['Sad', '☂'],
];

export function EmotionalWellbeing() {
  const [entries, setEntries] = useState<CheckIn[]>(() => {
    const saved = localStorage.getItem('smart-axis-wellbeing');
    return saved ? JSON.parse(saved) as CheckIn[] : [];
  });
  const [editorOpen, setEditorOpen] = useState(false);
  const latest = entries[0];

  function save(entry: CheckIn) {
    const next = [entry, ...entries].slice(0, 30);
    setEntries(next);
    localStorage.setItem('smart-axis-wellbeing', JSON.stringify(next));
    void awardXp('health_checkin').catch(() => undefined);
    setEditorOpen(false);
  }

  return (
    <div className="dashboard wellbeing-view">
      <header className="topbar">
        <div><p className="eyebrow">A GENTLE DAILY CHECK-IN</p><h1>Emotional wellbeing</h1></div>
        <button className="add-button" aria-label="Add wellbeing check-in" onClick={() => setEditorOpen(true)} type="button">＋</button>
      </header>
      <section className="wellbeing-hero">
        <div><span>♡</span><p>HOW YOU FEEL MATTERS</p><h2>{latest ? `You last felt ${latest.mood.toLowerCase()}` : 'Take a moment for yourself'}</h2>
          <small>{latest ? formatDate(latest.date) : 'Notice your mood without judging it.'}</small>
        </div>
        <button onClick={() => setEditorOpen(true)} type="button">{latest ? 'Check in again' : 'Start check-in'}</button>
      </section>
      <div className="section-title wellbeing-title"><h2>Recent check-ins</h2></div>
      {entries.length ? (
        <section className="wellbeing-list">
          {entries.map((entry) => (
            <article key={entry.id}>
              <span className="wellbeing-mood">{moods.find(([name]) => name === entry.mood)?.[1] ?? '♡'}</span>
              <div><h3>{entry.mood}</h3><p>Energy {entry.energy}/5 · Stress {entry.stress}/5{entry.note ? ` · ${entry.note}` : ''}</p></div>
              <small>{new Date(`${entry.date}T12:00:00`).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</small>
            </article>
          ))}
        </section>
      ) : <button className="empty-wellbeing" onClick={() => setEditorOpen(true)} type="button">No check-ins yet. Tap to add your first one.</button>}
      <p className="wellbeing-note">This is a reflection tool, not a diagnosis. Talk to a trusted adult or qualified professional when you need support.</p>
      {editorOpen && <WellbeingEditor onClose={() => setEditorOpen(false)} onSave={save} />}
    </div>
  );
}

function WellbeingEditor({ onClose, onSave }: { onClose: () => void; onSave: (entry: CheckIn) => void }) {
  const [mood, setMood] = useState('');
  const [energy, setEnergy] = useState(3);
  const [stress, setStress] = useState(3);
  const [note, setNote] = useState('');

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!mood) return;
    onSave({ id: Date.now(), date: new Date().toISOString().slice(0, 10), mood, energy, stress, note: note.trim() });
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form className="tracker-modal wellbeing-editor" onMouseDown={(event) => event.stopPropagation()} onSubmit={submit}>
        <button className="modal-close" onClick={onClose} type="button">×</button>
        <div className="tracker-symbol pink">♡</div><h2>How are you feeling?</h2><p>Choose what feels closest right now.</p>
        <div className="wellbeing-moods">{moods.map(([name, icon]) => <button className={mood === name ? 'selected' : ''} key={name} onClick={() => setMood(name)} type="button"><span>{icon}</span>{name}</button>)}</div>
        <label>Energy <strong>{energy}/5</strong><input max="5" min="1" onChange={(event) => setEnergy(Number(event.target.value))} type="range" value={energy} /></label>
        <label>Stress <strong>{stress}/5</strong><input max="5" min="1" onChange={(event) => setStress(Number(event.target.value))} type="range" value={stress} /></label>
        <label>Optional note<textarea maxLength={180} onChange={(event) => setNote(event.target.value)} placeholder="What is on your mind?" value={note} /></label>
        <button className="save-profile-button" disabled={!mood} type="submit">Save check-in</button>
      </form>
    </div>
  );
}

function formatDate(date: string) {
  return `Checked in ${new Date(`${date}T12:00:00`).toLocaleDateString('en', { month: 'long', day: 'numeric' })}`;
}
