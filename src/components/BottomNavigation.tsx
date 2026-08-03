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
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      <Link className="nav-item" href="/leaderboard">
        <span>🏆</span>
        <small>Leaders</small>
      </Link>
      {tabs.map((tab) => (
        <button
          className={active === tab.label ? 'nav-item active' : 'nav-item'}
          key={tab.label}
          onClick={() => onChange(tab.label)}
          type="button"
        >
          <span>{tab.icon}</span>
          <small>{tab.label}</small>
        </button>
      ))}
    </nav>
  );
}
import { Link } from 'wouter';
