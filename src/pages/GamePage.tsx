import { Link } from 'wouter';
import { SnakeGame } from '../components/SnakeGame';
import { useI18n } from '../lib/i18n';

export function GamePage() {
  const { t } = useI18n();
  return (
    <main className="game-page">
      <header className="game-header"><Link href="/">‹ {t('back')}</Link><div><p className="eyebrow">{t('gameLabel')}</p><h1>{t('playSnake')}</h1></div></header>
      <SnakeGame />
    </main>
  );
}
