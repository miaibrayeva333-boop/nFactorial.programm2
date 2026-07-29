import { FormEvent, useMemo, useState } from 'react';

type HealthLog = {
  id: number;
  date: string;
  period: boolean;
  pain: number;
  symptoms: string[];
  notes: string;
};

const symptomOptions = ['Cramps', 'Headache', 'Bloating', 'Fatigue', 'Back pain', 'Mood changes'];

export function HealthView() {
  const [cycleLength, setCycleLength] = useState(
    () => Number(localStorage.getItem('smart-life-cycle-length') ?? 28),
  );
  const [logs, setLogs] = useState<HealthLog[]>(() => {
    const saved = localStorage.getItem('smart-life-health');
    return saved ? JSON.parse(saved) as HealthLog[] : [];
  });
  const [editorOpen, setEditorOpen] = useState(false);

  const latestPeriod = useMemo(() =>
    [...logs].filter((log) => log.period).sort((a, b) => b.date.localeCompare(a.date))[0],
  [logs]);
  const nextPeriod = latestPeriod
    ? new Date(new Date(`${latestPeriod.date}T12:00:00`).getTime() + cycleLength * 86400000)
    : null;

  function save(next: HealthLog[]) {
    setLogs(next);
    localStorage.setItem('smart-life-health', JSON.stringify(next));
  }

  function updateCycle(value: number) {
    const safe = Math.min(45, Math.max(20, value));
    setCycleLength(safe);
    localStorage.setItem('smart-life-cycle-length', String(safe));
  }

  return (
    <div className="dashboard health-view">
      <header className="topbar">
        <div><p className="eyebrow">UNDERSTAND YOUR BODY</p><h1>Health</h1></div>
        <button className="add-button" onClick={() => setEditorOpen(true)} type="button">＋</button>
      </header>

      <section className="health-overview">
        <article className="cycle-card">
          <span className="health-icon">♡</span><p>NEXT PERIOD ESTIMATE</p>
          <h2>{nextPeriod ? nextPeriod.toLocaleDateString('en', { month: 'long', day: 'numeric' }) : 'Add your first period'}</h2>
          <small>Estimate based on a {cycleLength}-day cycle</small>
        </article>
        <article className="cycle-settings">
          <label>Average cycle length<strong>{cycleLength} days</strong></label>
          <input max="45" min="20" onChange={(event) => updateCycle(Number(event.target.value))} type="range" value={cycleLength} />
        </article>
      </section>

      <div className="section-title health-title"><h2>Recent check-ins</h2><button onClick={() => setEditorOpen(true)} type="button">Add check-in</button></div>
      {logs.length ? (
        <section className="health-log-list">
          {[...logs].sort((a, b) => b.date.localeCompare(a.date)).map((log) => (
            <article className="health-log" key={log.id}>
              <div className={log.period ? 'health-date period' : 'health-date'}>
                <strong>{new Date(`${log.date}T12:00:00`).getDate()}</strong>
                <small>{new Date(`${log.date}T12:00:00`).toLocaleDateString('en', { month: 'short' })}</small>
              </div>
              <div><h3>{log.period ? 'Period day' : 'Health check-in'} · Pain {log.pain}/10</h3><p>{log.symptoms.join(' · ') || 'No symptoms'}{log.notes ? ` — ${log.notes}` : ''}</p></div>
              <button aria-label="Delete health entry" onClick={() => save(logs.filter((item) => item.id !== log.id))} type="button">×</button>
            </article>
          ))}
        </section>
      ) : (
        <button className="empty-health" onClick={() => setEditorOpen(true)} type="button"><span>♡</span><strong>Start a private check-in</strong><small>Track period days, pain, and symptoms.</small></button>
      )}
      <p className="health-note">This tracker provides estimates only and is not medical advice. Seek medical care for severe or unusual pain.</p>
      {editorOpen && <HealthEditor onClose={() => setEditorOpen(false)} onSave={(log) => { save([...logs, log]); setEditorOpen(false); }} />}
    </div>
  );
}

function HealthEditor({ onClose, onSave }: { onClose: () => void; onSave: (log: HealthLog) => void }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [period, setPeriod] = useState(false);
  const [pain, setPain] = useState(0);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  function submit(event: FormEvent) {
    event.preventDefault();
    onSave({ id: Date.now(), date, period, pain, symptoms, notes: notes.trim() });
  }
  function toggle(symptom: string) {
    setSymptoms(symptoms.includes(symptom) ? symptoms.filter((item) => item !== symptom) : [...symptoms, symptom]);
  }
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form className="tracker-modal health-editor" onMouseDown={(event) => event.stopPropagation()} onSubmit={submit}>
        <button className="modal-close" onClick={onClose} type="button">×</button>
        <div className="tracker-symbol pink">♡</div><h2>Health check-in</h2><p>Your entry stays private on this device.</p>
        <label>Date<input className="amount-input" onChange={(event) => setDate(event.target.value)} type="date" value={date} /></label>
        <button className={period ? 'period-toggle selected' : 'period-toggle'} onClick={() => setPeriod(!period)} type="button"><span>{period ? '✓' : ''}</span> I’m on my period today</button>
        <label>Pain level: <strong>{pain}/10</strong><input className="pain-range" max="10" min="0" onChange={(event) => setPain(Number(event.target.value))} type="range" value={pain} /></label>
        <fieldset><legend>Symptoms</legend><div className="symptom-grid">{symptomOptions.map((symptom) => <button className={symptoms.includes(symptom) ? 'selected' : ''} key={symptom} onClick={() => toggle(symptom)} type="button">{symptom}</button>)}</div></fieldset>
        <label>Notes<textarea maxLength={300} onChange={(event) => setNotes(event.target.value)} placeholder="Anything else you noticed?" value={notes} /></label>
        <button className="save-profile-button" type="submit">Save check-in</button>
      </form>
    </div>
  );
}
