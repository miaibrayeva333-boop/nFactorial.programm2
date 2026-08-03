import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { loadLeaderboard, syncXpProfile, type LeaderboardEntry } from '../lib/xp';

export function LeaderboardPage() {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const name = localStorage.getItem('smart-life-name') ?? 'Smart Axis learner';
    void syncXpProfile(name)
      .then(loadLeaderboard)
      .then(setLeaders)
      .catch(() => setError('The leaderboard could not load. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="leaderboard-page">
      <header className="leaderboard-header">
        <Link href="/">‹ Back</Link>
        <div><p className="eyebrow">LEARN AND GROW TOGETHER</p><h1>XP Leaderboard</h1></div>
      </header>
      <section className="xp-rules">
        <h2>Earn XP every day</h2>
        <div><span>✓<b>+50 XP</b><small>Finish all daily tasks</small></span><span>♡<b>+30 XP</b><small>Complete a health check-in</small></span></div>
      </section>
      {loading && <p className="leaderboard-status">Loading rankings…</p>}
      {error && <p className="leaderboard-status error">{error}</p>}
      {!loading && !error && (
        <section className="leaderboard-list">
          {leaders.map((leader, index) => (
            <article className={leader.is_current_user ? 'leaderboard-row current' : 'leaderboard-row'} key={`${leader.rank}-${leader.display_name}-${index}`}>
              <strong className="leader-rank">{leader.rank <= 3 ? ['🥇', '🥈', '🥉'][leader.rank - 1] : `#${leader.rank}`}</strong>
              <div><h2>{leader.display_name}{leader.is_current_user ? ' (You)' : ''}</h2><p>Level {leader.level}</p></div>
              <b>{leader.total_xp.toLocaleString()} XP</b>
            </article>
          ))}
          {!leaders.length && <p className="leaderboard-status">Complete an activity to become the first player!</p>}
        </section>
      )}
    </main>
  );
}
