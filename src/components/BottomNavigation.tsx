import { Link } from 'wouter';
import { useI18n } from '../lib/i18n';

export type AppTab = 'Dashboard' | 'Tasks' | 'Calendar' | 'Health' | 'AI' | 'Settings';

const tabs: { label: AppTab; icon: string }[] = [
  { label: 'Tasks', icon: '✓' },
  { label: 'Calendar', icon: '□' },
  { label: 'Dashboard', icon: '⌂' },
  { label: 'Health', icon: '♡' },
  { label: 'AI', icon: '✦' },
  { label: 'Settings', icon: '⚙' },
];

type Props = {
  active: AppTab;
  onChange: (tab: AppTab) => void;
};

export function BottomNavigation({ active, onChange }: Props) {
  const { t } = useI18n();
  const labels: Record<AppTab, string> = { Dashboard: t('dashboard'), Tasks: t('tasks'), Calendar: t('calendar'), Health: t('health'), AI: 'AI', Settings: t('settings') };
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      <Link className="nav-item" href="/leaderboard">
        <span>🏆</span>
        <small>{t('leaders')}</small>
      </Link>
      {tabs.map((tab) => (
        <button
          className={`${active === tab.label ? 'nav-item active' : 'nav-item'}${tab.label === 'Dashboard' ? ' dashboard-nav' : ''}`}
          key={tab.label}
          onClick={() => onChange(tab.label)}
          type="button"
        >
          <span>{tab.icon}</span>
          <small>{labels[tab.label]}</small>
        </button>
      ))}
    </nav>
  );
}
