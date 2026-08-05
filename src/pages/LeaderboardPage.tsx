import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { loadLeaderboard, syncXpProfile, type LeaderboardEntry } from '../lib/xp';
import { useI18n } from '../lib/i18n';

export function LeaderboardPage() {
  const { t } = useI18n();
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const name = localStorage.getItem('smart-life-name') ?? 'Smart Axis learner';
    void syncXpProfile(name)
      .then(loadLeaderboard)
      .then(setLeaders)
      .catch(() => setError('load'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="leaderboard-page">
      <header className="leaderboard-header">
        <Link href="/">‹ {t('back')}</Link>
        <div><p className="eyebrow">{t('learnTogether')}</p><h1>{t('xpLeaderboard')}</h1></div>
      </header>
      <section className="xp-rules">
        <h2>{t('earnXp')}</h2>
        <div><span>✓<b>+50 XP</b><small>{t('finishDaily')}</small></span><span>♡<b>+30 XP</b><small>{t('healthCheckIn')}</small></span></div>
      </section>
      {loading && <p className="leaderboard-status">{t('loadingRankings')}</p>}
      {error && <p className="leaderboard-status error">{t('leaderboardError')}</p>}
      {!loading && !error && (
        <section className="leaderboard-list">
          {leaders.map((leader, index) => (
            <article className={leader.is_current_user ? 'leaderboard-row current' : 'leaderboard-row'} key={`${leader.rank}-${leader.display_name}-${index}`}>
              <strong className="leader-rank">{leader.rank <= 3 ? ['🥇', '🥈', '🥉'][leader.rank - 1] : `#${leader.rank}`}</strong>
              <div><h2>{leader.display_name}{leader.is_current_user ? ` (${t('you')})` : ''}</h2><p>{t('level')} {leader.level}</p></div>
              <b>{leader.total_xp.toLocaleString()} XP</b>
            </article>
          ))}
          {!leaders.length && <p className="leaderboard-status">{t('firstPlayer')}</p>}
        </section>
      )}
    </main>
  );
}
