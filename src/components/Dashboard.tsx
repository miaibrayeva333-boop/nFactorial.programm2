const tasks = [
  { title: 'Finish project presentation', meta: 'Work · 10:30 AM', done: false, color: 'purple' },
  { title: 'Morning workout', meta: 'Wellness · 7:00 AM', done: true, color: 'green' },
  { title: 'Review monthly budget', meta: 'Finance · 6:00 PM', done: false, color: 'orange' },
];

type Props = { dark: boolean; onTheme: () => void };

export function Dashboard({ dark, onTheme }: Props) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const today = new Intl.DateTimeFormat('en', {
    weekday: 'long', month: 'long', day: 'numeric',
  }).format(new Date());

  return (
    <div className="dashboard">
      <header className="topbar">
        <div>
          <p className="eyebrow">{today}</p>
          <h1>{greeting}, Alex <span>👋</span></h1>
        </div>
        <button className="icon-button" onClick={onTheme} aria-label="Toggle theme" type="button">
          {dark ? '☀' : '☾'}
        </button>
      </header>

      <section className="priority-card">
        <div className="priority-card__top">
          <span className="priority-label">TODAY’S TOP PRIORITY</span>
          <button type="button">•••</button>
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
        <div className="section-title"><h2>Your day</h2><button type="button">View insights</button></div>
        <div className="metric-grid">
          <Metric icon="◒" value="5 / 8" label="Glasses of water" tone="blue" progress="62%" />
          <Metric icon="✓" value="4 / 6" label="Habits completed" tone="green" progress="66%" />
          <Metric icon="$" value="$1,240" label="Budget remaining" tone="orange" progress="78%" />
          <Metric icon="☺" value="Focused" label="Today’s mood" tone="pink" />
        </div>
      </section>

      <section className="section">
        <div className="section-title"><h2>Today’s tasks <span>3</span></h2><button type="button">See all</button></div>
        <div className="task-list">
          {tasks.map((task) => (
            <article className="task-row" key={task.title}>
              <button className={task.done ? 'check checked' : 'check'} type="button">{task.done ? '✓' : ''}</button>
              <i className={`task-dot ${task.color}`} />
              <div><h3 className={task.done ? 'done' : ''}>{task.title}</h3><p>{task.meta}</p></div>
              <span>›</span>
            </article>
          ))}
        </div>
      </section>

      <div className="wide-grid">
        <section className="section">
          <div className="section-title"><h2>Upcoming</h2><button type="button">Calendar</button></div>
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
      <button className="ai-button" type="button"><span>✦</span> Ask Smart Life</button>
    </div>
  );
}

function Metric({ icon, value, label, tone, progress }: {
  icon: string; value: string; label: string; tone: string; progress?: string;
}) {
  return (
    <article className="metric-card">
      <div className={`metric-icon ${tone}`}>{icon}</div>
      <strong>{value}</strong><span>{label}</span>
      {progress && <div className="mini-progress"><i style={{ width: progress }} /></div>}
    </article>
  );
}
