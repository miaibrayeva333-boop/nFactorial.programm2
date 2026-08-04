import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { canTurn, gridSize, moveSnake, newSnakeGame, type Direction } from '../lib/snake';
import { useI18n } from '../lib/i18n';

const keys: Record<string, Direction> = { ArrowUp: 'up', w: 'up', ArrowDown: 'down', s: 'down', ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right' };
const snakeColors = ['#35ad82', '#6259df', '#3198e8', '#ef6b7c', '#e9983f', '#252632'];

export function SnakeGame() {
  const { t } = useI18n();
  const [game, setGame] = useState(newSnakeGame);
  const [playing, setPlaying] = useState(false);
  const [best, setBest] = useState(() => Number(localStorage.getItem('smart-axis-snake-best') ?? 0));
  const [snakeColor, setSnakeColor] = useState(() => localStorage.getItem('smart-axis-snake-color') ?? snakeColors[0]);
  const direction = useRef(game.direction);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

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

  function chooseColor(color: string) {
    setSnakeColor(color);
    localStorage.setItem('smart-axis-snake-color', color);
  }

  function finishSwipe(x: number, y: number) {
    if (!touchStart.current) return;
    const horizontal = x - touchStart.current.x;
    const vertical = y - touchStart.current.y;
    touchStart.current = null;
    if (Math.max(Math.abs(horizontal), Math.abs(vertical)) < 20) return;
    if (Math.abs(horizontal) > Math.abs(vertical)) turn(horizontal > 0 ? 'right' : 'left');
    else turn(vertical > 0 ? 'down' : 'up');
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
        <span>{t('score')} <b>{game.score}</b></span><span>{t('best')} <b>{best}</b></span>
        <button onClick={restart} type="button">↻ {t('restart')}</button>
      </div>
      <div
        className="snake-board"
        onTouchEnd={(event) => finishSwipe(event.changedTouches[0].clientX, event.changedTouches[0].clientY)}
        onTouchStart={(event) => { touchStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }}
        style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)`, '--snake-color': snakeColor } as CSSProperties}
      >
        {Array.from({ length: gridSize * gridSize }, (_, index) => {
          const point = { x: index % gridSize, y: Math.floor(index / gridSize) };
          const snakeIndex = game.snake.findIndex((part) => part.x === point.x && part.y === point.y);
          const apple = game.apple.x === point.x && game.apple.y === point.y;
          return <i className={apple ? 'apple' : snakeIndex === 0 ? 'snake-head' : snakeIndex > 0 ? 'snake-body' : ''} key={index} />;
        })}
        {(!playing || game.gameOver) && <div className="snake-message"><h2>{game.gameOver ? t('gameOver') : t('snake')}</h2><p>{game.gameOver ? t('scored').replace('{score}', String(game.score)) : t('snakeHelp')}</p><button onClick={restart} type="button">{game.gameOver ? t('playAgain') : t('startGame')}</button></div>}
      </div>
      <div className="snake-colors" aria-label="Choose snake color">
        <small>{t('snakeColor')}</small>
        {snakeColors.map((color) => (
          <button
            aria-label={`Use ${color} for the snake`}
            aria-pressed={snakeColor === color}
            className={snakeColor === color ? 'selected' : ''}
            key={color}
            onClick={() => chooseColor(color)}
            style={{ backgroundColor: color }}
            type="button"
          />
        ))}
      </div>
      <div className="snake-controls" aria-label="Snake controls">
        <button onClick={() => turn('up')} type="button">↑</button>
        <button onClick={() => turn('left')} type="button">←</button>
        <button onClick={() => setPlaying((value) => !value)} type="button">{playing ? 'Ⅱ' : '▶'}</button>
        <button onClick={() => turn('right')} type="button">→</button>
        <button onClick={() => turn('down')} type="button">↓</button>
      </div>
      <small>{t('gameControls')}</small>
    </section>
  );
}
