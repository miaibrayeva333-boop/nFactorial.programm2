export type AppTab = 'Dashboard' | 'Tasks' | 'Calendar' | 'Goals' | 'Settings';

const tabs: { label: AppTab; icon: string }[] = [
  { label: 'Dashboard', icon: '⌂' },
  { label: 'Tasks', icon: '✓' },
  { label: 'Calendar', icon: '□' },
  { label: 'Goals', icon: '⚑' },
  { label: 'Settings', icon: '⚙' },
];

type Props = {
  active: AppTab;
  onChange: (tab: AppTab) => void;
};

export function BottomNavigation({ active, onChange }: Props) {
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
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
