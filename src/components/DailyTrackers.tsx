import { useEffect, useState } from 'react';
import { BudgetEditor, type BudgetTransaction } from './BudgetEditor';
import { todayKey } from '../lib/tasks';

type Tracker = 'water' | 'habits' | 'budget' | 'mood';
type Metrics = { water: number; habits: boolean[]; budget: number; mood: string; budgetHistory?: BudgetTransaction[] };

const defaults: Metrics = {
  water: 5,
  habits: [true, true, true, true, false, false],
  budget: 1240,
  mood: 'Focused',
};
const habitNames = ['Morning stretch', 'Read', 'Walk', 'Vitamins', 'Meditate', 'No screens late'];
const moods = [
  ['Amazing', '🤩'], ['Happy', '😊'], ['Excited', '🥳'],
  ['Loved', '🥰'], ['Proud', '😌'], ['Focused', '🎯'],
  ['Calm', '🧘'], ['Okay', '🙂'], ['Unsure', '😕'],
  ['Tired', '😴'], ['Bored', '🥱'], ['Low', '😔'],
  ['Lonely', '🥺'], ['Anxious', '😰'], ['Overwhelmed', '😵‍💫'],
  ['Frustrated', '😤'], ['Angry', '😠'], ['Sad', '😢'],
];

export function DailyTrackers({ dateKey }: { dateKey: string }) {
  const [metrics, setMetrics] = useState<Metrics>(() => {
    const saved = localStorage.getItem(`smart-life-metrics-${dateKey}`)
      ?? (dateKey === todayKey() ? localStorage.getItem('smart-life-metrics') : null);
    return saved ? JSON.parse(saved) as Metrics : defaults;
  });
  const [open, setOpen] = useState<Tracker | null>(null);

  useEffect(() => {
    localStorage.setItem(`smart-life-metrics-${dateKey}`, JSON.stringify(metrics));
    if (dateKey === todayKey()) {
      localStorage.setItem('smart-life-metrics', JSON.stringify(metrics));
    }
    window.dispatchEvent(new Event('smart-life-progress'));
  }, [dateKey, metrics]);

  const completed = metrics.habits.filter(Boolean).length;
  return (
    <>
      <div className="metric-grid">
        <Metric icon="◒" value={`${metrics.water} / 8`} label="Glasses of water" tone="blue" progress={`${metrics.water / 8 * 100}%`} onClick={() => setOpen('water')} />
        <Metric icon="✓" value={`${completed} / ${metrics.habits.length}`} label="Habits completed" tone="green" progress={`${completed / metrics.habits.length * 100}%`} onClick={() => setOpen('habits')} />
        <Metric icon="$" value={`$${metrics.budget.toLocaleString()}`} label="Budget remaining" tone="orange" onClick={() => setOpen('budget')} />
        <Metric icon="☺" value={metrics.mood} label="Today’s mood" tone="pink" onClick={() => setOpen('mood')} />
      </div>
      {open && (
        <div className="modal-backdrop" onMouseDown={() => setOpen(null)}>
          <section className="tracker-modal" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setOpen(null)} type="button">×</button>
            {open === 'water' && (
              <>
                <div className="tracker-symbol blue">◒</div><h2>Water tracker</h2>
                <p>Keep going—you’re building a healthy rhythm.</p>
                <div className="stepper">
                  <button onClick={() => setMetrics({ ...metrics, water: Math.max(0, metrics.water - 1) })} type="button">−</button>
                  <strong>{metrics.water}<small> / 8 glasses</small></strong>
                  <button onClick={() => setMetrics({ ...metrics, water: Math.min(20, metrics.water + 1) })} type="button">＋</button>
                </div>
              </>
            )}
            {open === 'habits' && (
              <>
                <div className="tracker-symbol green">✓</div><h2>Today’s habits</h2>
                <p>Tap each habit when you complete it.</p>
                <div className="habit-list">
                  {habitNames.map((habit, index) => (
                    <button onClick={() => setMetrics({ ...metrics, habits: metrics.habits.map((done, item) => item === index ? !done : done) })} type="button" key={habit}>
                      <span className={metrics.habits[index] ? 'habit-check done' : 'habit-check'}>{metrics.habits[index] ? '✓' : ''}</span>
                      {habit}
                    </button>
                  ))}
                </div>
              </>
            )}
            {open === 'budget' && <BudgetEditor
              balance={metrics.budget}
              transactions={metrics.budgetHistory ?? []}
              onAdd={(transaction) => setMetrics({
                ...metrics,
                budget: transaction.type === 'income'
                  ? metrics.budget + transaction.amount
                  : Math.max(0, metrics.budget - transaction.amount),
                budgetHistory: [transaction, ...(metrics.budgetHistory ?? [])].slice(0, 50),
              })}
            />}
            {open === 'mood' && (
              <>
                <div className="tracker-symbol pink">☺</div><h2>How are you feeling?</h2>
                <p>Select the mood that best describes today.</p>
                <div className="mood-grid">
                  {moods.map(([mood, emoji]) => (
                    <button className={metrics.mood === mood ? 'selected' : ''} onClick={() => setMetrics({ ...metrics, mood })} type="button" key={mood}>
                      <span>{emoji}</span>{mood}
                    </button>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </>
  );
}

function Metric({ icon, value, label, tone, progress, onClick }: {
  icon: string; value: string; label: string; tone: string; progress?: string; onClick: () => void;
}) {
  return (
    <button className="metric-card" onClick={onClick} type="button">
      <div className={`metric-icon ${tone}`}>{icon}</div>
      <strong>{value}</strong><span>{label}</span>
      {progress && <div className="mini-progress"><i style={{ width: progress }} /></div>}
      <small className="metric-edit">Tap to update</small>
    </button>
  );
}
