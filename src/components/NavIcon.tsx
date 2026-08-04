export type NavIconName = 'leaders' | 'tasks' | 'calendar' | 'dashboard' | 'health' | 'ai' | 'settings';

const paths: Record<NavIconName, string[]> = {
  leaders: ['M8 21h8', 'M12 17v4', 'M7 4h10v4a5 5 0 0 1-10 0V4Z', 'M7 6H4v2a4 4 0 0 0 4 4', 'M17 6h3v2a4 4 0 0 1-4 4'],
  tasks: ['m5 12 4 4L19 6'],
  calendar: ['M5 5h14v15H5z', 'M8 3v4', 'M16 3v4', 'M5 9h14'],
  dashboard: ['m4 11 8-7 8 7', 'M6 10v10h12V10', 'M10 20v-6h4v6'],
  health: ['M20.8 5.8a5.4 5.4 0 0 0-7.6 0L12 7l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 22l8.8-8.6a5.4 5.4 0 0 0 0-7.6Z'],
  ai: ['M12 3l1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z', 'M19 17l.7 2.3L22 20l-2.3.7L19 23l-.7-2.3L16 20l2.3-.7L19 17Z'],
  settings: ['M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z', 'M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H3v-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V3h4v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z'],
};

export function NavIcon({ name }: { name: NavIconName }) {
  return <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">{paths[name].map((path) => <path d={path} key={path} />)}</svg>;
}
