export type Point = { x: number; y: number };
export type Direction = 'up' | 'down' | 'left' | 'right';
export type SnakeState = { snake: Point[]; apple: Point; direction: Direction; score: number; gameOver: boolean };

export const gridSize = 18;
const movement: Record<Direction, Point> = {
  up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 },
};

export function newSnakeGame(): SnakeState {
  return { snake: [{ x: 9, y: 9 }, { x: 8, y: 9 }, { x: 7, y: 9 }], apple: { x: 13, y: 9 }, direction: 'right', score: 0, gameOver: false };
}

export function canTurn(current: Direction, next: Direction) {
  return !((current === 'up' && next === 'down') || (current === 'down' && next === 'up')
    || (current === 'left' && next === 'right') || (current === 'right' && next === 'left'));
}

export function moveSnake(state: SnakeState): SnakeState {
  if (state.gameOver) return state;
  const move = movement[state.direction];
  const head = { x: state.snake[0].x + move.x, y: state.snake[0].y + move.y };
  const ateApple = samePoint(head, state.apple);
  const body = ateApple ? state.snake : state.snake.slice(0, -1);
  const hitWall = head.x < 0 || head.y < 0 || head.x >= gridSize || head.y >= gridSize;
  const hitBody = body.some((point) => samePoint(point, head));
  if (hitWall || hitBody) return { ...state, gameOver: true };
  const snake = [head, ...body];
  return { ...state, snake, apple: ateApple ? placeApple(snake) : state.apple, score: state.score + (ateApple ? 10 : 0) };
}

function placeApple(snake: Point[]): Point {
  const free: Point[] = [];
  for (let y = 0; y < gridSize; y += 1) for (let x = 0; x < gridSize; x += 1) {
    if (!snake.some((point) => point.x === x && point.y === y)) free.push({ x, y });
  }
  return free[Math.floor(Math.random() * free.length)] ?? { x: 0, y: 0 };
}

const samePoint = (first: Point, second: Point) => first.x === second.x && first.y === second.y;
