import { Route, Switch } from 'wouter';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { I18nProvider } from './lib/i18n';

// Здесь живут только маршруты. Сами экраны складывай в src/pages/.
export default function App() {
  return (
    <I18nProvider><Switch>
      <Route path="/" component={HomePage} />
      <Route path="/leaderboard" component={LeaderboardPage} />
      <Route component={NotFoundPage} />
    </Switch></I18nProvider>
  );
}
