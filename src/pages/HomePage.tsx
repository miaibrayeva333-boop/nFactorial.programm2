import { useMemo, useState } from 'react';
import { Dashboard } from '../components/Dashboard';
import { BottomNavigation, type AppTab } from '../components/BottomNavigation';
import { TasksView } from '../components/TasksView';
import { SettingsView } from '../components/SettingsView';

export function HomePage() {
  const [tab, setTab] = useState<AppTab>('Dashboard');
  const [dark, setDark] = useState(false);

  const content = useMemo(() => {
    if (tab === 'Tasks') return <TasksView />;
    if (tab === 'Dashboard') return <Dashboard dark={dark} onTheme={() => setDark(!dark)} />;
    if (tab === 'Settings') return <SettingsView dark={dark} onTheme={() => setDark(!dark)} />;
    return (
      <section className="empty-view">
        <div className="empty-view__icon">
          {tab === 'Calendar' ? '◫' : tab === 'Goals' ? '◎' : '☺'}
        </div>
        <h2>{tab}</h2>
        <p>Your {tab.toLowerCase()} workspace is ready.</p>
        <button onClick={() => window.alert(`New ${tab.toLowerCase()} item editor is ready to connect.`)} type="button">Add your first item</button>
      </section>
    );
  }, [dark, tab]);

  return (
    <div className={dark ? 'app dark' : 'app'}>
      <main className="app__content">{content}</main>
      <BottomNavigation active={tab} onChange={setTab} />
    </div>
  );
}
