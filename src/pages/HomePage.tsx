import { useMemo, useState } from 'react';
import { Dashboard } from '../components/Dashboard';
import { BottomNavigation, type AppTab } from '../components/BottomNavigation';
import { TasksView } from '../components/TasksView';
import { SettingsView } from '../components/SettingsView';
import { AiChat } from '../components/AiChat';
import { CalendarView } from '../components/CalendarView';
import { GoalsView } from '../components/GoalsView';
import { HealthHub } from '../components/HealthHub';

export function HomePage() {
  const [tab, setTab] = useState<AppTab>('Dashboard');
  const [dark, setDark] = useState(false);

  const content = useMemo(() => {
    if (tab === 'Tasks') return <TasksView />;
    if (tab === 'Dashboard') return <Dashboard />;
    if (tab === 'Calendar') return <CalendarView />;
    if (tab === 'Goals') return <GoalsView />;
    if (tab === 'Health') return <HealthHub />;
    if (tab === 'AI') return <AiChat />;
    if (tab === 'Settings') return <SettingsView dark={dark} onTheme={() => setDark(!dark)} />;
    return null;
  }, [dark, tab]);

  return (
    <div className={dark ? 'app dark' : 'app'}>
      <main className="app__content">{content}</main>
      <BottomNavigation active={tab} onChange={setTab} />
    </div>
  );
}
