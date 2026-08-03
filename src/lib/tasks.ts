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

export const defaultTasks: SmartTask[] = [];

export const dateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
export const todayKey = () => dateKey(new Date());
const storageKey = (date: string) => `smart-life-tasks-${date}`;

export function loadTasks(date = todayKey()): SmartTask[] {
  const dated = localStorage.getItem(storageKey(date));
  if (dated) return JSON.parse(dated) as SmartTask[];

  const saved = date === todayKey() ? localStorage.getItem('smart-life-tasks') : null;
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
  return defaultTasks.map((task) => ({ ...task, done: false }));
}

export function saveTasks(tasks: SmartTask[], date = todayKey()) {
  localStorage.setItem(storageKey(date), JSON.stringify(tasks));
  if (date === todayKey()) localStorage.setItem('smart-life-tasks', JSON.stringify(tasks));
  window.dispatchEvent(new Event('smart-life-tasks'));
  window.dispatchEvent(new Event('smart-life-progress'));
  if (date === todayKey() && tasks.length > 0 && tasks.every((task) => task.done)) {
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
