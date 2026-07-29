import { FormEvent, useState } from 'react';

type Urgency = 'Low' | 'Medium' | 'Urgent';
type Goal = {
  id: number;
  title: string;
  reason: string;
  date: string;
  time: string;
  urgency: Urgency;
  progress: number;
};

export function GoalsView() {
  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('smart-life-goals');
    return saved ? JSON.parse(saved) as Goal[] : [];
  });
  const [editorOpen, setEditorOpen] = useState(false);
  const [newGoalId, setNewGoalId] = useState<number | null>(null);

  function save(next: Goal[]) {
    setGoals(next);
    localStorage.setItem('smart-life-goals', JSON.stringify(next));
    window.dispatchEvent(new Event('smart-life-progress'));
  }

  const sortedGoals = [...goals].sort((a, b) => {
    const rank = (goal: Goal) => {
      if (goal.urgency === 'Urgent' && goal.progress === 0) return 0;
      if (goal.urgency === 'Urgent') return 1;
      if (goal.urgency === 'Medium') return 2;
      return 3;
    };
    return rank(a) - rank(b) || a.date.localeCompare(b.date) || a.time.localeCompare(b.time);
  });

  return (
    <div className="dashboard goals-view">
      <header className="topbar">
        <div><p className="eyebrow">TURN PLANS INTO PROGRESS</p><h1>Goals</h1></div>
        <button className="add-button" onClick={() => setEditorOpen(true)} type="button">＋</button>
      </header>

      <section className="goal-summary">
        <div><strong>{goals.length}</strong><span>Active goals</span></div>
        <div><strong>{goals.filter((goal) => goal.progress === 100).length}</strong><span>Completed</span></div>
        <div><strong>{goals.length ? Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length) : 0}%</strong><span>Average progress</span></div>
      </section>

      {goals.length ? (
        <section className="goal-list">
          {sortedGoals.map((goal) => (
            <article className={`goal-card urgency-${goal.urgency.toLowerCase()}${newGoalId === goal.id ? ' just-added' : ''}`} key={goal.id}>
              <div className="goal-card__top">
                <span className="goal-urgency">{goal.urgency}</span>
                <button aria-label={`Delete ${goal.title}`} onClick={() => save(goals.filter((item) => item.id !== goal.id))} type="button">×</button>
              </div>
              <h2>{goal.title}</h2>
              <p>{goal.reason || 'No details added'}</p>
              <div className="goal-deadline"><span>□</span> {formatDeadline(goal.date, goal.time)}</div>
              <div className="goal-progress-label"><span>Progress</span><strong>{goal.progress}%</strong></div>
              <div className="goal-progress"><i style={{ width: `${goal.progress}%` }} /></div>
              <div className="goal-actions">
                <button disabled={goal.progress === 0} onClick={() => save(goals.map((item) => item.id === goal.id ? { ...item, progress: Math.max(0, item.progress - 10) } : item))} type="button">−10%</button>
                <button disabled={goal.progress === 100} onClick={() => save(goals.map((item) => item.id === goal.id ? { ...item, progress: Math.min(100, item.progress + 10) } : item))} type="button">＋10%</button>
                <button className="complete-goal" disabled={goal.progress === 100} onClick={() => save(goals.map((item) => item.id === goal.id ? { ...item, progress: 100 } : item))} type="button">Complete</button>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <button className="empty-goals" onClick={() => setEditorOpen(true)} type="button">
          <span>◎</span><h2>Create your first goal</h2>
          <p>Set a deadline, choose its urgency, and track your progress.</p><strong>＋ Add goal</strong>
        </button>
      )}

      {editorOpen && <GoalEditor onClose={() => setEditorOpen(false)} onSave={(goal) => {
        save([...goals, goal]);
        setNewGoalId(goal.id);
        setEditorOpen(false);
        window.setTimeout(() => setNewGoalId(null), 1200);
      }} />}
    </div>
  );
}

function GoalEditor({ onClose, onSave }: { onClose: () => void; onSave: (goal: Goal) => void }) {
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const [title, setTitle] = useState('');
  const [reason, setReason] = useState('');
  const [date, setDate] = useState(tomorrow);
  const [time, setTime] = useState('18:00');
  const [urgency, setUrgency] = useState<Urgency>('Medium');
  const [progress, setProgress] = useState(0);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (title.trim()) onSave({ id: Date.now(), title: title.trim(), reason: reason.trim(), date, time, urgency, progress });
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form className="tracker-modal goal-editor" onMouseDown={(event) => event.stopPropagation()} onSubmit={submit}>
        <button className="modal-close" onClick={onClose} type="button">×</button>
        <div className="tracker-symbol green">◎</div><h2>Create a goal</h2>
        <p>Answer a few questions to make your goal clear and actionable.</p>
        <label>What do you want to achieve?<input autoFocus className="amount-input" maxLength={80} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Run a 10K" value={title} /></label>
        <label>Why is this important?<textarea maxLength={240} onChange={(event) => setReason(event.target.value)} placeholder="Your motivation or first milestone" value={reason} /></label>
        <div className="goal-form-row">
          <label>Deadline date<input className="amount-input" min={new Date().toISOString().slice(0, 10)} onChange={(event) => setDate(event.target.value)} type="date" value={date} /></label>
          <label>Time<input className="amount-input" onChange={(event) => setTime(event.target.value)} type="time" value={time} /></label>
        </div>
        <fieldset><legend>How urgent is it?</legend><div className="urgency-options">
          {(['Low', 'Medium', 'Urgent'] as const).map((level) => <button className={urgency === level ? `selected ${level.toLowerCase()}` : ''} key={level} onClick={() => setUrgency(level)} type="button">{level}</button>)}
        </div></fieldset>
        <label>Starting progress: {progress}%<input className="progress-range" max="100" min="0" onChange={(event) => setProgress(Number(event.target.value))} step="10" type="range" value={progress} /></label>
        <button className="save-profile-button" disabled={!title.trim() || !date} type="submit">Create goal</button>
      </form>
    </div>
  );
}

function formatDeadline(date: string, time: string) {
  return new Date(`${date}T${time}`).toLocaleString('en', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}
