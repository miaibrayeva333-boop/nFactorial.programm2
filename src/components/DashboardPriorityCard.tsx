import type { SmartTask } from '../lib/tasks';

type Props = {
  task?: SmartTask;
  priorityWins: number;
  poem: string[];
  labels: { topPriority: string; finished: string };
  onOptions: () => void;
};

export function DashboardPriorityCard({ task, priorityWins, poem, labels, onOptions }: Props) {
  if (!task) return (
    <section className="priority-card empty-priority">
      <span className="priority-label">{labels.topPriority}</span>
      <h2>No priority yet</h2>
      <p>Add a task to start planning your day.</p>
    </section>
  );

  return (
    <section className={task.done ? 'priority-card completed' : 'priority-card'}>
      <div className="priority-card__top">
        <span className="priority-label">{task.done ? `✓ ${labels.finished}` : labels.topPriority}</span>
        <button onClick={onOptions} type="button">•••</button>
      </div>
      {!task.done && <h2>{task.title}</h2>}
      <p>{task.done ? 'Beautiful work—your most important task is complete.' : 'Complete your most important task and make today count.'}</p>
      {task.done && <div className="moving-poem" key={priorityWins}><span>{poem[0]}</span><span>{poem[1]}</span></div>}
      <div className="progress-row">
        <div className="progress"><i style={{ width: task.done ? '100%' : '72%' }} /></div><b>{task.done ? '100%' : '72%'}</b>
      </div>
      <div className="priority-footer">
        <span>{task.done ? '✓ Completed today' : '◷ Today, 10:30 AM'}</span>
        <span>{task.done ? `★ Priority win ${priorityWins}` : '● High priority'}</span>
      </div>
    </section>
  );
}
