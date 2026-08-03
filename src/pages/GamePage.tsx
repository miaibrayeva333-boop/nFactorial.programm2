import { Link } from 'wouter';
import { SnakeGame } from '../components/SnakeGame';

export function GamePage() {
  return (
    <main className="game-page">
      <header className="game-header"><Link href="/">‹ Back</Link><div><p className="eyebrow">OFFLINE MINI GAME</p><h1>Apple Snake</h1></div></header>
      <SnakeGame />
    </main>
  );
}
