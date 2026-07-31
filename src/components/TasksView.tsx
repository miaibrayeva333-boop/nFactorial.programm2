import { FormEvent, useEffect, useState } from 'react';
import { loadTasks, saveTasks, type SmartTask, type TaskPriority } from '../lib/tasks';

export function TasksView() {
  const [tasks, setTasks] = useState(loadTasks);
  const [filter, setFilter] = useState<'All' | 'Today' | 'High priority'>('All');
  const [editorOpen, setEditorOpen] = useState(false);
  const visible = tasks.filter((task) => filter !== 'High priority' || task.priority === 'High');

  useEffect(() => saveTasks(tasks), [tasks]);

  return (
    <div className="dashboard tasks-view">
      <header className="topbar"><div className="brand-greeting"><img className="app-logo" src="/assets/smart-life-logo.png" alt="Smart Axis logo" /><div><p className="eyebrow">STAY ON TRACK</p><h1>My tasks</h1></div></div>
        <button className="add-button" aria-label="Add task" onClick={() => setEditorOpen(true)} type="button">＋</button>
      </header>
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
          <article className={task.priority === 'High' ? 'task-row high-priority' : 'task-row'} key={task.id}>
            <button className={task.done ? 'check checked' : 'check'} onClick={() => setTasks(tasks.map((item) => item.id === task.id ? { ...item, done: !item.done } : item))} type="button">{task.done ? '✓' : ''}</button>
            <div><h3 className={task.done ? 'done' : ''}>{task.title}</h3><p>{task.category} · {task.priority}</p></div>
            <button className="delete" onClick={() => setTasks(tasks.filter((item) => item.id !== task.id))} type="button">×</button>
          </article>
        ))}
      </section>
      {editorOpen && <TaskEditor onClose={() => setEditorOpen(false)} onSave={(task) => {
        setTasks([...tasks, task]);
        setEditorOpen(false);
      }} />}
    </div>
  );
}

function TaskEditor({ onClose, onSave }: { onClose: () => void; onSave: (task: SmartTask) => void }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Personal');
  const [time, setTime] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Medium');

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    onSave({
      id: String(Date.now()),
      title: title.trim(),
      category,
      meta: `${category} · ${time || 'No due time'}`,
      priority,
      done: false,
      color: priority === 'High' ? 'orange' : priority === 'Low' ? 'green' : 'purple',
    });
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form className="tracker-modal task-editor" onMouseDown={(event) => event.stopPropagation()} onSubmit={submit}>
        <button className="modal-close" onClick={onClose} type="button">×</button>
        <div className="tracker-symbol green">✓</div>
        <h2>Add a task</h2>
        <p>Give your task a clear name and priority.</p>
        <label>Task name<input autoFocus className="amount-input" maxLength={80} onChange={(event) => setTitle(event.target.value)} placeholder="What needs to be done?" value={title} /></label>
        <div className="task-editor__row">
          <label>Category<select onChange={(event) => setCategory(event.target.value)} value={category}><option>Personal</option><option>School</option><option>Work</option><option>Wellness</option></select></label>
          <label>Time<input className="amount-input" onChange={(event) => setTime(event.target.value)} type="time" value={time} /></label>
        </div>
        <fieldset><legend>Priority</legend><div className="priority-options">
          {(['Low', 'Medium', 'High'] as const).map((value) => <button className={priority === value ? `selected ${value.toLowerCase()}` : ''} key={value} onClick={() => setPriority(value)} type="button">{value}</button>)}
        </div></fieldset>
        <button className="save-profile-button" disabled={!title.trim()} type="submit">Add task</button>
      </form>
    </div>
  );
}
