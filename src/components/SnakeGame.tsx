import { useEffect, useRef, useState } from 'react';
import { canTurn, gridSize, moveSnake, newSnakeGame, type Direction } from '../lib/snake';

const keys: Record<string, Direction> = { ArrowUp: 'up', w: 'up', ArrowDown: 'down', s: 'down', ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right' };

export function SnakeGame() {
  const [game, setGame] = useState(newSnakeGame);
  const [playing, setPlaying] = useState(false);
  const [best, setBest] = useState(() => Number(localStorage.getItem('smart-axis-snake-best') ?? 0));
  const direction = useRef(game.direction);

  function turn(next: Direction) {
    if (!canTurn(direction.current, next)) return;
    direction.current = next;
    setGame((current) => ({ ...current, direction: next }));
    setPlaying(true);
  }

  function restart() {
    const next = newSnakeGame();
    direction.current = next.direction;
    setGame(next);
    setPlaying(true);
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const next = keys[event.key];
      if (!next) return;
      event.preventDefault();
      turn(next);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  useEffect(() => {
    if (!playing || game.gameOver) return;
    const timer = window.setInterval(() => setGame((current) => moveSnake(current)), 145);
    return () => window.clearInterval(timer);
  }, [game.gameOver, playing]);

  useEffect(() => {
    if (game.score <= best) return;
    setBest(game.score);
    localStorage.setItem('smart-axis-snake-best', String(game.score));
  }, [best, game.score]);

  return (
    <section className="snake-game">
      <div className="snake-score">
        <span>Score <b>{game.score}</b></span><span>Best <b>{best}</b></span>
        <button onClick={restart} type="button">↻ Restart</button>
      </div>
      <div className="snake-board" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
        {Array.from({ length: gridSize * gridSize }, (_, index) => {
          const point = { x: index % gridSize, y: Math.floor(index / gridSize) };
          const snakeIndex = game.snake.findIndex((part) => part.x === point.x && part.y === point.y);
          const apple = game.apple.x === point.x && game.apple.y === point.y;
          return <i className={apple ? 'apple' : snakeIndex === 0 ? 'snake-head' : snakeIndex > 0 ? 'snake-body' : ''} key={index} />;
        })}
        {(!playing || game.gameOver) && <div className="snake-message"><h2>{game.gameOver ? 'Game over' : 'Snake'}</h2><p>{game.gameOver ? `You scored ${game.score} points!` : 'Eat apples and avoid the walls.'}</p><button onClick={restart} type="button">{game.gameOver ? 'Play again' : 'Start game'}</button></div>}
      </div>
      <div className="snake-controls" aria-label="Snake controls">
        <button onClick={() => turn('up')} type="button">↑</button>
        <button onClick={() => turn('left')} type="button">←</button>
        <button onClick={() => setPlaying((value) => !value)} type="button">{playing ? 'Ⅱ' : '▶'}</button>
        <button onClick={() => turn('right')} type="button">→</button>
        <button onClick={() => turn('down')} type="button">↓</button>
      </div>
      <small>Use arrow keys, WASD, or the buttons. Your best score is saved on this device.</small>
    </section>
  );
}
