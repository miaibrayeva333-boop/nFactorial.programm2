import { FormEvent, useMemo, useState } from 'react';
import { HealthOnboarding, type CycleProfile } from './HealthOnboarding';

type HealthLog = {
  id: number;
  date: string;
  period: boolean;
  periodStart?: boolean;
  pain: number;
  symptoms: string[];
  bodyFeelings?: string[];
  emotions?: string[];
  notes: string;
};

const symptomOptions = ['Cramps', 'Headache', 'Bloating', 'Fatigue', 'Back pain', 'Mood changes'];
const bodyOptions = ['Bloated', 'Crampy', 'Heavy', 'Tender', 'Achy', 'Energetic'];
const emotionOptions = ['Calm', 'Sensitive', 'Irritable', 'Anxious', 'Low', 'Emotional', 'Confident'];

export function HealthView() {
  const [profile, setProfile] = useState<CycleProfile | null>(() => {
    const saved = localStorage.getItem('smart-life-health-profile');
    return saved ? JSON.parse(saved) as CycleProfile : null;
  });
  const [logs, setLogs] = useState<HealthLog[]>(() => {
    const saved = localStorage.getItem('smart-life-health');
    return saved ? JSON.parse(saved) as HealthLog[] : [];
  });
  const [editorOpen, setEditorOpen] = useState(false);

  const periodStarts = useMemo(() =>
    [...logs].filter((log) => log.periodStart ?? log.period).sort((a, b) => a.date.localeCompare(b.date)),
  [logs]);
  const cycleLengths = periodStarts.slice(1).map((log, index) =>
    Math.round((new Date(`${log.date}T12:00:00`).getTime() -
      new Date(`${periodStarts[index].date}T12:00:00`).getTime()) / 86400000),
  ).filter((days) => days >= 15 && days <= 60);
  const averageCycle = cycleLengths.length
    ? Math.round(cycleLengths.reduce((sum, days) => sum + days, 0) / cycleLengths.length)
    : profile?.defaultCycle ?? 28;
  const latestPeriod = periodStarts[periodStarts.length - 1];
  const nextPeriod = latestPeriod
    ? new Date(new Date(`${latestPeriod.date}T12:00:00`).getTime() + averageCycle * 86400000)
    : null;
  const variability = cycleLengths.length > 1 ? Math.max(...cycleLengths) - Math.min(...cycleLengths) : 0;
  const cycleDay = latestPeriod
    ? Math.max(1, Math.floor((Date.now() - new Date(`${latestPeriod.date}T00:00:00`).getTime()) / 86400000) + 1)
    : 1;

  function save(next: HealthLog[]) {
    setLogs(next);
    localStorage.setItem('smart-life-health', JSON.stringify(next));
  }

  function completeOnboarding(nextProfile: CycleProfile, starts: string[]) {
    localStorage.setItem('smart-life-health-profile', JSON.stringify(nextProfile));
    const seeded = starts.map((date, index) => ({
      id: Date.now() + index, date, period: true, periodStart: true, pain: 0, symptoms: [], notes: 'Period start',
    }));
    save([...logs, ...seeded]);
    setProfile(nextProfile);
  }

  if (!profile) return <HealthOnboarding onComplete={completeOnboarding} />;

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
          <small>Estimate based on your {averageCycle}-day average</small>
        </article>
        <article className="cycle-settings cycle-day-card">
          <span>CURRENT CYCLE</span><strong>Day {cycleDay}</strong><small>{profile.regularity}</small>
        </article>
      </section>
      <section className="cycle-stats">
        <div><strong>{averageCycle}</strong><span>Avg. cycle</span></div>
        <div><strong>{profile.periodLength}</strong><span>Avg. period</span></div>
        <div><strong>±{variability}</strong><span>Day variation</span></div>
        <div><strong>{periodStarts.length}</strong><span>Cycles logged</span></div>
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
              <div>
                <h3>{log.period ? 'Period day' : 'Health check-in'} · Pain {log.pain}/10</h3>
                <p>{[...(log.bodyFeelings ?? []), ...(log.emotions ?? []), ...log.symptoms].join(' · ') || 'No symptoms'}{log.notes ? ` — ${log.notes}` : ''}</p>
              </div>
              <button aria-label="Delete health entry" onClick={() => save(logs.filter((item) => item.id !== log.id))} type="button">×</button>
            </article>
          ))}
        </section>
      ) : (
        <button className="empty-health" onClick={() => setEditorOpen(true)} type="button"><span>♡</span><strong>Start a private check-in</strong><small>Track period days, pain, and symptoms.</small></button>
      )}
      <p className="health-note">This tracker provides estimates only and is not medical advice. Seek medical care for severe or unusual pain.</p>
      <button className="reset-cycle-profile" onClick={() => { localStorage.removeItem('smart-life-health-profile'); setProfile(null); }} type="button">Edit cycle answers</button>
      {editorOpen && <HealthEditor onClose={() => setEditorOpen(false)} onSave={(log) => { save([...logs, log]); setEditorOpen(false); }} />}
    </div>
  );
}

function HealthEditor({ onClose, onSave }: { onClose: () => void; onSave: (log: HealthLog) => void }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [period, setPeriod] = useState(false);
  const [pain, setPain] = useState(0);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [bodyFeelings, setBodyFeelings] = useState<string[]>([]);
  const [emotions, setEmotions] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  function submit(event: FormEvent) {
    event.preventDefault();
    onSave({ id: Date.now(), date, period, periodStart: period, pain, symptoms, bodyFeelings, emotions, notes: notes.trim() });
  }
  function toggle(symptom: string) {
    setSymptoms(symptoms.includes(symptom) ? symptoms.filter((item) => item !== symptom) : [...symptoms, symptom]);
  }
  function toggleChoice(value: string, selected: string[], update: (values: string[]) => void) {
    update(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]);
  }
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form className="tracker-modal health-editor" onMouseDown={(event) => event.stopPropagation()} onSubmit={submit}>
        <button className="modal-close" onClick={onClose} type="button">×</button>
        <div className="tracker-symbol pink">♡</div><h2>Health check-in</h2><p>Your entry stays private on this device.</p>
        <label>Date<input className="amount-input" onChange={(event) => setDate(event.target.value)} type="date" value={date} /></label>
        <button className={period ? 'period-toggle selected' : 'period-toggle'} onClick={() => setPeriod(!period)} type="button"><span>{period ? '✓' : ''}</span> My period started today</button>
        <label>Pain level: <strong>{pain}/10</strong><input className="pain-range" max="10" min="0" onChange={(event) => setPain(Number(event.target.value))} type="range" value={pain} /></label>
        <fieldset><legend>How does your body feel today?</legend><div className="health-choice-grid body-choices">
          {bodyOptions.map((feeling) => <button className={bodyFeelings.includes(feeling) ? 'selected' : ''} key={feeling} onClick={() => toggleChoice(feeling, bodyFeelings, setBodyFeelings)} type="button">{feeling}</button>)}
        </div></fieldset>
        <fieldset><legend>How do you feel emotionally?</legend><div className="health-choice-grid emotion-choices">
          {emotionOptions.map((emotion) => <button className={emotions.includes(emotion) ? 'selected' : ''} key={emotion} onClick={() => toggleChoice(emotion, emotions, setEmotions)} type="button">{emotion}</button>)}
        </div></fieldset>
        <fieldset><legend>Symptoms</legend><div className="symptom-grid">{symptomOptions.map((symptom) => <button className={symptoms.includes(symptom) ? 'selected' : ''} key={symptom} onClick={() => toggle(symptom)} type="button">{symptom}</button>)}</div></fieldset>
        <label>Notes<textarea maxLength={300} onChange={(event) => setNotes(event.target.value)} placeholder="Anything else you noticed?" value={notes} /></label>
        <button className="save-profile-button" type="submit">Save check-in</button>
      </form>
    </div>
  );
}
