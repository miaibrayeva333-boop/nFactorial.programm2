export type TaskPriority = 'High' | 'Medium' | 'Low';

export type SmartTask = {
  id: string;
  title: string;
  category: string;
  meta: string;
  priority: TaskPriority;
  done: boolean;
  color: string;
};

export const defaultTasks: SmartTask[] = [
  { id: 'presentation', title: 'Finish project presentation', category: 'Work', meta: 'Work · 10:30 AM', priority: 'High', done: false, color: 'purple' },
  { id: 'workout', title: 'Morning workout', category: 'Wellness', meta: 'Wellness · 7:00 AM', priority: 'Medium', done: true, color: 'green' },
  { id: 'budget', title: 'Review monthly budget', category: 'Finance', meta: 'Finance · 6:00 PM', priority: 'Low', done: false, color: 'orange' },
];

export function loadTasks(): SmartTask[] {
  const saved = localStorage.getItem('smart-life-tasks');
  if (saved) return JSON.parse(saved) as SmartTask[];

  const legacy = localStorage.getItem('smart-life-dashboard-tasks');
  if (legacy) {
    const oldTasks = JSON.parse(legacy) as Array<Partial<SmartTask> & { title: string }>;
    return oldTasks.map((task, index) => ({
      id: task.id ?? `legacy-${index}`,
      title: task.title,
      category: task.category ?? task.meta?.split(' · ')[0] ?? 'Personal',
      meta: task.meta ?? 'Personal',
      priority: normalizePriority(task.priority),
      done: task.done ?? false,
      color: task.color ?? 'purple',
    }));
  }
  return defaultTasks;
}

export function saveTasks(tasks: SmartTask[]) {
  localStorage.setItem('smart-life-tasks', JSON.stringify(tasks));
  window.dispatchEvent(new Event('smart-life-tasks'));
  window.dispatchEvent(new Event('smart-life-progress'));
}

function normalizePriority(priority: SmartTask['priority'] | string | undefined): TaskPriority {
  const normalized = priority?.toLowerCase();
  if (normalized === 'high') return 'High';
  if (normalized === 'low') return 'Low';
  return 'Medium';
}
