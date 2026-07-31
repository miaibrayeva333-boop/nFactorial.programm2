import { HealthView } from './HealthView';
import { getGender } from '../lib/profile';

export function HealthHub() {
  const showCycle = getGender() === 'female';
  if (showCycle) return <HealthView />;

  return (
    <div className="dashboard health-empty-view">
      <span>♡</span>
      <h1>Health</h1>
      <p>Cycle tracking is available only when Female is selected in Settings.</p>
    </div>
  );
}
