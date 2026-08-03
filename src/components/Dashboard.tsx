import { useEffect, useMemo, useState } from 'react';
import { DailyTrackers } from './DailyTrackers';
import { loadTasks, saveTasks } from '../lib/tasks';

const completionPoems = [
  ['One brave step, one task now done,', 'You made your way toward the sun.'],
  ['The list grew quiet, the moment grew bright,', 'You kept your promise and finished it right.'],
  ['Small wins gather, steady and true,', 'Today moved forward because of you.'],
  ['You chose your focus, you followed it through,', 'A calmer tomorrow begins here with you.'],
];

export function Dashboard() {
  const [tasks, setTasks] = useState(loadTasks);
  const [message, setMessage] = useState('');
  const [revision, setRevision] = useState(0);
  const [priorityWins, setPriorityWins] = useState(
    () => Number(localStorage.getItem('smart-life-priority-wins') ?? 0),
  );
  const name = localStorage.getItem('smart-life-name') ?? 'Alex Morgan';
  const firstName = name.trim().split(/\s+/)[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const today = new Intl.DateTimeFormat('en', {
    weekday: 'long', month: 'long', day: 'numeric',
  }).format(new Date());
  const topPriority = tasks[0];
  const activePoem = completionPoems[Math.max(0, priorityWins - 1) % completionPoems.length];

  function toggleTask(title: string) {
    setTasks(tasks.map((task) => {
      if (task.title !== title) return task;
      if (task === topPriority && !task.done) {
        const nextWins = priorityWins + 1;
        setPriorityWins(nextWins);
        localStorage.setItem('smart-life-priority-wins', String(nextWins));
      }
      return { ...task, done: !task.done };
    }));
  }

  useEffect(() => {
    saveTasks(tasks);
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
    const rates = [tasks.filter((task) => task.done).length / tasks.length];
    if (habits.length) rates.push(habits.filter(Boolean).length / habits.length);
    return Math.round(rates.reduce((sum, rate) => sum + rate, 0) / rates.length * 100);
  }, [revision, tasks]);

  return (
    <div className="dashboard">
      <header className="topbar">
        <div className="brand-greeting">
          <img className="app-logo" src="/assets/smart-life-logo.png" alt="Smart Axis logo" />
          <div>
            <p className="eyebrow">{today}</p>
            <h1>{greeting}, {firstName} <span>👋</span></h1>
          </div>
        </div>
      </header>

      <section className={topPriority.done ? 'priority-card completed' : 'priority-card'}>
        <div className="priority-card__top">
          <span className="priority-label">{topPriority.done ? '✓ FINISHED' : 'TODAY’S TOP PRIORITY'}</span>
          <button onClick={() => setMessage('Priority options opened')} type="button">•••</button>
        </div>
        {!topPriority.done && <h2>{topPriority.title}</h2>}
        <p>{topPriority.done ? 'Beautiful work—your most important task is complete.' : 'Complete your most important task and make today count.'}</p>
        {topPriority.done && (
          <div className="moving-poem" key={priorityWins}>
            <span>{activePoem[0]}</span><span>{activePoem[1]}</span>
          </div>
        )}
        <div className="progress-row">
          <div className="progress"><i style={{ width: topPriority.done ? '100%' : '72%' }} /></div>
          <b>{topPriority.done ? '100%' : '72%'}</b>
        </div>
        <div className="priority-footer">
          <span>{topPriority.done ? '✓ Completed today' : '◷ Today, 10:30 AM'}</span>
          <span>{topPriority.done ? `★ Priority win ${priorityWins}` : '● High priority'}</span>
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
            <article className={task.priority === 'High' ? 'task-row high-priority' : 'task-row'} key={task.id}>
              <button
                aria-label={`Mark ${task.title} ${task.done ? 'incomplete' : 'complete'}`}
                className={task.done ? 'check checked' : 'check'}
                onClick={() => toggleTask(task.title)}
                type="button"
              >{task.done ? '✓' : ''}</button>
              <i className={`task-dot ${task.color}`} />
              <div>
                <h3 className={task.done ? 'done' : ''}>{task.title}</h3>
                <p>{task.meta}{task.priority === 'High' && <strong className="priority-badge">High priority</strong>}</p>
              </div>
              <span>›</span>
            </article>
          ))}
        </div>
      </section>

      <section className="productivity">
        <div><span>WEEKLY PRODUCTIVITY</span><h2>{productivity}%</h2><p>Updates as you complete items</p></div>
        <div className="ring" style={{ background: `conic-gradient(var(--primary) ${productivity}%, rgba(98,89,223,.15) 0)` }}><b>{productivity}</b></div>
      </section>
      {message && <button className="toast" onClick={() => setMessage('')} type="button">{message}<span>×</span></button>}
    </div>
  );
}
