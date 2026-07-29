import { useState } from 'react';
import { HealthView } from './HealthView';
import { NutritionTracker } from './NutritionTracker';

export function HealthHub() {
  const [section, setSection] = useState<'Cycle' | 'Nutrition'>('Cycle');
  return (
    <>
      <div className="health-tabs">
        <button className={section === 'Cycle' ? 'selected' : ''} onClick={() => setSection('Cycle')} type="button">♡ Cycle</button>
        <button className={section === 'Nutrition' ? 'selected' : ''} onClick={() => setSection('Nutrition')} type="button">◉ Nutrition</button>
      </div>
      {section === 'Cycle' ? <HealthView /> : <NutritionTracker />}
    </>
  );
}
