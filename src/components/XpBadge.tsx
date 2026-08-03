import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { loadMyXp, syncXpProfile } from '../lib/xp';

export function XpBadge() {
  const [xp, setXp] = useState(0);
  const [earned, setEarned] = useState(0);

  useEffect(() => {
    const refresh = (event?: Event) => {
      void loadMyXp().then(setXp).catch(() => undefined);
      if (event instanceof CustomEvent && typeof event.detail === 'number') {
        setEarned(event.detail);
        window.setTimeout(() => setEarned(0), 2400);
      }
    };
    const name = localStorage.getItem('smart-life-name') ?? 'Smart Axis learner';
    void syncXpProfile(name).then(() => refresh()).catch(() => undefined);
    window.addEventListener('smart-axis-xp-earned', refresh);
    return () => window.removeEventListener('smart-axis-xp-earned', refresh);
  }, []);

  return <Link className="xp-badge" href="/leaderboard">🏆 <strong>{xp} XP</strong>{earned > 0 && <span>+{earned}!</span>}</Link>;
}
