import { useState } from 'react';
import { DailyTrackers } from './DailyTrackers';

const initialTasks = [
  { title: 'Finish project presentation', meta: 'Work · 10:30 AM', done: false, color: 'purple', priority: 'high' },
  { title: 'Morning workout', meta: 'Wellness · 7:00 AM', done: true, color: 'green', priority: 'medium' },
  { title: 'Review monthly budget', meta: 'Finance · 6:00 PM', done: false, color: 'orange', priority: 'low' },
];

type Props = { dark: boolean; onTheme: () => void };

export function Dashboard({ dark, onTheme }: Props) {
  const [tasks, setTasks] = useState(initialTasks);
  const [message, setMessage] = useState('');
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const today = new Intl.DateTimeFormat('en', {
    weekday: 'long', month: 'long', day: 'numeric',
  }).format(new Date());

  return (
    <div className="dashboard">
      <header className="topbar">
        <div className="brand-greeting">
          <img className="app-logo" src="/assets/smart-life-logo.png" alt="Smart Life logo" />
          <div>
            <p className="eyebrow">{today}</p>
            <h1>{greeting}, Alex <span>👋</span></h1>
          </div>
        </div>
        <button className="icon-button" onClick={onTheme} aria-label="Toggle theme" type="button">
          {dark ? '☀' : '☾'}
        </button>
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

      <div className="wide-grid">
        <section className="section">
          <div className="section-title"><h2>Upcoming</h2><button onClick={() => setMessage('Choose Calendar in the bottom menu')} type="button">Calendar</button></div>
          <article className="event-card">
            <div className="date-tile"><b>29</b><small>JUL</small></div>
            <div><h3>Weekly planning</h3><p>4:00 – 4:45 PM · Focus room</p></div><span>›</span>
          </article>
        </section>
        <section className="productivity">
          <div><span>WEEKLY PRODUCTIVITY</span><h2>84%</h2><p>↑ 12% from last week</p></div>
          <div className="ring"><b>84</b></div>
        </section>
      </div>
      {message && <button className="toast" onClick={() => setMessage('')} type="button">{message}<span>×</span></button>}
      <button className="ai-button" onClick={() => setMessage('Your best focus window is 10:30 AM–12:00 PM')} type="button"><span>✦</span> Ask Smart Life</button>
    </div>
  );
}
