import { useEffect, useState } from 'react';
import { loadTasks, saveTasks } from '../lib/tasks';

export function TasksView() {
  const [tasks, setTasks] = useState(loadTasks);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'All' | 'Today' | 'High priority'>('All');
  const visible = tasks.filter((task) => {
    const matchesQuery = task.title.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (filter !== 'High priority' || task.priority === 'High');
  });

  useEffect(() => saveTasks(tasks), [tasks]);

  function addTask() {
    const title = window.prompt('What needs to be done?');
    if (title?.trim()) {
      setTasks([...tasks, {
        id: String(Date.now()),
        title,
        category: 'Personal',
        meta: 'Personal · No due time',
        priority: 'Medium',
        done: false,
        color: 'purple',
      }]);
    }
  }

  return (
    <div className="dashboard tasks-view">
      <header className="topbar"><div className="brand-greeting"><img className="app-logo" src="/assets/smart-life-logo.png" alt="Smart Life logo" /><div><p className="eyebrow">STAY ON TRACK</p><h1>My tasks</h1></div></div>
        <button className="add-button" onClick={addTask} type="button">＋</button>
      </header>
      <div className="search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tasks" /></div>
      <div className="filter-row">
        {(['All', 'Today', 'High priority'] as const).map((option) => (
          <button
            className={filter === option ? 'selected' : ''}
            key={option}
            onClick={() => setFilter(option)}
            type="button"
          >
            {option}
          </button>
        ))}
      </div>
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
