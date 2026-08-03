import { Route, Switch } from 'wouter';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { LeaderboardPage } from './pages/LeaderboardPage';

// Здесь живут только маршруты. Сами экраны складывай в src/pages/.
export default function App() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/leaderboard" component={LeaderboardPage} />
      <Route component={NotFoundPage} />
    </Switch>
  );
}
