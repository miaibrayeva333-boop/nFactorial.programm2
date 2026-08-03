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

const taskDateKey = 'smart-life-tasks-date';
const today = () => new Date().toISOString().slice(0, 10);

export function loadTasks(): SmartTask[] {
  const saved = localStorage.getItem('smart-life-tasks');
  if (saved) {
    const tasks = JSON.parse(saved) as SmartTask[];
    return localStorage.getItem(taskDateKey) === today()
      ? tasks
      : tasks.map((task) => ({ ...task, done: false }));
  }

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
  localStorage.setItem(taskDateKey, today());
  window.dispatchEvent(new Event('smart-life-tasks'));
  window.dispatchEvent(new Event('smart-life-progress'));
  if (tasks.length > 0 && tasks.every((task) => task.done)) {
    void awardXp('daily_tasks').catch(() => undefined);
  }
}

function normalizePriority(priority: SmartTask['priority'] | string | undefined): TaskPriority {
  const normalized = priority?.toLowerCase();
  if (normalized === 'high') return 'High';
  if (normalized === 'low') return 'Low';
  return 'Medium';
}
import { awardXp } from './xp';
