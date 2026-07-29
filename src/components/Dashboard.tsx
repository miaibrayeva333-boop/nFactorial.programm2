import { useEffect, useMemo, useState } from 'react';
import { DailyTrackers } from './DailyTrackers';

const initialTasks = [
  { title: 'Finish project presentation', meta: 'Work · 10:30 AM', done: false, color: 'purple', priority: 'high' },
  { title: 'Morning workout', meta: 'Wellness · 7:00 AM', done: true, color: 'green', priority: 'medium' },
  { title: 'Review monthly budget', meta: 'Finance · 6:00 PM', done: false, color: 'orange', priority: 'low' },
];

export function Dashboard() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('smart-life-dashboard-tasks');
    return saved ? JSON.parse(saved) as typeof initialTasks : initialTasks;
  });
  const [message, setMessage] = useState('');
  const [revision, setRevision] = useState(0);
  const name = localStorage.getItem('smart-life-name') ?? 'Alex Morgan';
  const firstName = name.trim().split(/\s+/)[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const today = new Intl.DateTimeFormat('en', {
    weekday: 'long', month: 'long', day: 'numeric',
  }).format(new Date());

  useEffect(() => {
    localStorage.setItem('smart-life-dashboard-tasks', JSON.stringify(tasks));
    window.dispatchEvent(new Event('smart-life-progress'));
  }, [tasks]);

  useEffect(() => {
    const update = () => setRevision((value) => value + 1);
    window.addEventListener('smart-life-progress', update);
    return () => window.removeEventListener('smart-life-progress', update);
  }, []);

  const productivity = useMemo(() => {
    const savedMetrics = localStorage.getItem('smart-life-metrics');
    const habits = savedMetrics
      ? (JSON.parse(savedMetrics) as { habits?: boolean[] }).habits ?? []
      : [];
    const savedGoals = localStorage.getItem('smart-life-goals');
    const goals = savedGoals
      ? JSON.parse(savedGoals) as Array<{ progress: number }>
      : [];
    const rates = [tasks.filter((task) => task.done).length / tasks.length];
    if (habits.length) rates.push(habits.filter(Boolean).length / habits.length);
    if (goals.length) rates.push(goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length / 100);
    return Math.round(rates.reduce((sum, rate) => sum + rate, 0) / rates.length * 100);
  }, [revision, tasks]);

  const dashboardGoals = useMemo(() => {
    const saved = localStorage.getItem('smart-life-goals');
    const goals = saved ? JSON.parse(saved) as Array<{
      id: number;
      title: string;
      date: string;
      time: string;
      urgency: 'Low' | 'Medium' | 'Urgent';
      progress: number;
    }> : [];
    const rank = (goal: typeof goals[number]) => {
      if (goal.urgency === 'Urgent' && goal.progress === 0) return 0;
      if (goal.urgency === 'Urgent') return 1;
      if (goal.urgency === 'Medium') return 2;
      return 3;
    };
    return goals.sort((a, b) => rank(a) - rank(b) || a.date.localeCompare(b.date)).slice(0, 3);
  }, [revision]);

  return (
    <div className="dashboard">
      <header className="topbar">
        <div className="brand-greeting">
          <img className="app-logo" src="/assets/smart-life-logo.png" alt="Smart Life logo" />
          <div>
            <p className="eyebrow">{today}</p>
            <h1>{greeting}, {firstName} <span>👋</span></h1>
          </div>
        </div>
      </header>

      <section className="priority-card">
        <div className="priority-card__top">
          <span className="priority-label">TODAY’S TOP PRIORITY</span>
          <button onClick={() => setMessage('Priority options opened')} type="button">•••</button>
        </div>
        <h2>Finish project presentation</h2>
        <p>Complete the final slides and prepare speaker notes.</p>
        <div className="progress-row">
          <div className="progress"><i style={{ width: '72%' }} /></div>
          <b>72%</b>
        </div>
        <div className="priority-footer">
          <span>◷ Today, 10:30 AM</span>
          <span>● High priority</span>
        </div>
      </section>

      <section className="section">
        <div className="section-title"><h2>Your day</h2></div>
        <DailyTrackers />
      </section>

      <section className="section">
        <div className="section-title"><h2>Today’s tasks <span>{tasks.length}</span></h2></div>
        <div className="task-list">
          {tasks.map((task) => (
            <article className={task.priority === 'high' ? 'task-row high-priority' : 'task-row'} key={task.title}>
              <button
                aria-label={`Mark ${task.title} ${task.done ? 'incomplete' : 'complete'}`}
                className={task.done ? 'check checked' : 'check'}
                onClick={() => setTasks(tasks.map((item) => item.title === task.title ? { ...item, done: !item.done } : item))}
                type="button"
              >{task.done ? '✓' : ''}</button>
              <i className={`task-dot ${task.color}`} />
              <div>
                <h3 className={task.done ? 'done' : ''}>{task.title}</h3>
                <p>{task.meta}{task.priority === 'high' && <strong className="priority-badge">High priority</strong>}</p>
              </div>
              <span>›</span>
            </article>
          ))}
        </div>
      </section>

      {dashboardGoals.length > 0 && (
        <section className="section">
          <div className="section-title"><h2>Your goals <span>{dashboardGoals.length}</span></h2></div>
          <div className="dashboard-goals">
            {dashboardGoals.map((goal) => (
              <article className={goal.urgency === 'Urgent' ? 'dashboard-goal urgent' : 'dashboard-goal'} key={goal.id}>
                <div>
                  <span>{goal.urgency}</span>
                  <h3>{goal.title}</h3>
                  <p>Due {new Date(`${goal.date}T${goal.time}`).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</p>
                </div>
                <strong>{goal.progress}%</strong>
                <div className="dashboard-goal__progress"><i style={{ width: `${goal.progress}%` }} /></div>
              </article>
            ))}
          </div>
        </section>
      )}
      <section className="productivity">
        <div><span>WEEKLY PRODUCTIVITY</span><h2>{productivity}%</h2><p>Updates as you complete items</p></div>
        <div className="ring" style={{ background: `conic-gradient(var(--primary) ${productivity}%, rgba(98,89,223,.15) 0)` }}><b>{productivity}</b></div>
      </section>
      {message && <button className="toast" onClick={() => setMessage('')} type="button">{message}<span>×</span></button>}
    </div>
  );
}
