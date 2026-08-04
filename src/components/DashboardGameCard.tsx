import { Link } from 'wouter';

export function DashboardGameCard() {
  return (
    <Link className="dashboard-game-card" href="/game">
      <span>🍎</span>
      <div><small>OFFLINE MINI GAME</small><h2>Play Apple Snake</h2><p>Take a quick break and beat your best score.</p></div>
      <b>Play ›</b>
    </Link>
  );
}
