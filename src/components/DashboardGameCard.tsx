import { Link } from 'wouter';
import { useI18n } from '../lib/i18n';

export function DashboardGameCard() {
  const { t } = useI18n();
  return (
    <Link className="dashboard-game-card" href="/game">
      <span>🍎</span>
      <div><small>{t('gameLabel')}</small><h2>{t('playSnake')}</h2><p>{t('gameBreak')}</p></div>
      <b>{t('play')} ›</b>
    </Link>
  );
}
