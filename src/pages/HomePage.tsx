import { useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Dashboard } from '../components/Dashboard';
import { BottomNavigation, type AppTab } from '../components/BottomNavigation';
import { TasksView } from '../components/TasksView';
import { SettingsView } from '../components/SettingsView';
import { AiChat } from '../components/AiChat';
import { CalendarView } from '../components/CalendarView';
import { HealthHub } from '../components/HealthHub';
import { Auth } from '../components/Auth';
import { AppIntroduction } from '../components/AppIntroduction';
import { supabase } from '../lib/supabase';
import { hasCompletedIntro } from '../lib/profile';

export function HomePage() {
  const [tab, setTab] = useState<AppTab>('Dashboard');
  const [dark, setDark] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [introComplete, setIntroComplete] = useState(hasCompletedIntro);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthReady(true);
      const displayName = nextSession?.user.user_metadata?.full_name;
      if (typeof displayName === 'string' && displayName.trim()) {
        localStorage.setItem('smart-life-name', displayName.trim());
      }
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const content = useMemo(() => {
    if (!session) return null;
    if (tab === 'Tasks') return <TasksView />;
    if (tab === 'Dashboard') return <Dashboard onOpenSettings={() => setTab('Settings')} />;
    if (tab === 'Calendar') return <CalendarView />;
    if (tab === 'Health') return <HealthHub />;
    if (tab === 'AI') return <AiChat />;
    if (tab === 'Settings') return <SettingsView dark={dark} onTheme={() => setDark(!dark)} user={session.user} />;
    return null;
  }, [dark, session, tab]);

  if (!authReady) return <div className="auth-loading"><img src="/assets/smart-life-logo.png" alt="" /><span>Opening Smart Axis…</span></div>;
  if (!session && !introComplete) return <AppIntroduction onComplete={() => setIntroComplete(true)} />;
  if (!session) return <Auth />;

  return (
    <div className={dark ? 'app dark' : 'app'}>
      <main className="app__content">{content}</main>
      <BottomNavigation active={tab} onChange={setTab} />
    </div>
  );
}
