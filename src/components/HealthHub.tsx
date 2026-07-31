import { useState } from 'react';
import { HealthView } from './HealthView';
import { NutritionTracker } from './NutritionTracker';
import { getGender } from '../lib/profile';

export function HealthHub() {
  const showCycle = getGender() === 'female';
  const [section, setSection] = useState<'Cycle' | 'Nutrition'>(showCycle ? 'Cycle' : 'Nutrition');
  return (
    <>
      <div className="health-tabs">
        {showCycle && <button className={section === 'Cycle' ? 'selected' : ''} onClick={() => setSection('Cycle')} type="button">♡ Cycle</button>}
        <button className={section === 'Nutrition' ? 'selected' : ''} onClick={() => setSection('Nutrition')} type="button">◉ Nutrition</button>
      </div>
      {section === 'Cycle' ? <HealthView /> : <NutritionTracker />}
    </>
  );
}
