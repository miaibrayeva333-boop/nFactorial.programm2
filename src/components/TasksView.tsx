import { useState } from 'react';

const seed = [
  { id: 1, title: 'Finish project presentation', category: 'Work', priority: 'High', done: false },
  { id: 2, title: 'Morning workout', category: 'Wellness', priority: 'Medium', done: true },
  { id: 3, title: 'Review monthly budget', category: 'Finance', priority: 'Low', done: false },
];

export function TasksView() {
  const [tasks, setTasks] = useState(seed);
  const [query, setQuery] = useState('');
  const visible = tasks.filter((task) => task.title.toLowerCase().includes(query.toLowerCase()));

  function addTask() {
    const title = window.prompt('What needs to be done?');
    if (title?.trim()) {
      setTasks([...tasks, { id: Date.now(), title, category: 'Personal', priority: 'Medium', done: false }]);
    }
  }

  return (
    <div className="dashboard tasks-view">
      <header className="topbar"><div><p className="eyebrow">STAY ON TRACK</p><h1>My tasks</h1></div>
        <button className="add-button" onClick={addTask} type="button">＋</button>
      </header>
      <div className="search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tasks" /></div>
      <div className="filter-row"><button className="selected" type="button">All</button><button type="button">Today</button><button type="button">High priority</button></div>
      <section className="task-list">
        {visible.map((task) => (
          <article className="task-row" key={task.id}>
            <button className={task.done ? 'check checked' : 'check'} onClick={() => setTasks(tasks.map((item) => item.id === task.id ? { ...item, done: !item.done } : item))} type="button">{task.done ? '✓' : ''}</button>
            <div><h3 className={task.done ? 'done' : ''}>{task.title}</h3><p>{task.category} · {task.priority}</p></div>
            <button className="delete" onClick={() => setTasks(tasks.filter((item) => item.id !== task.id))} type="button">×</button>
          </article>
        ))}
      </section>
    </div>
  );
}
