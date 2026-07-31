import { useState } from 'react';
import { HealthView } from './HealthView';
import { getGender } from '../lib/profile';
import { EmotionalWellbeing } from './EmotionalWellbeing';

export function HealthHub() {
  const showCycle = getGender() === 'female';
  const [section, setSection] = useState<'Wellbeing' | 'Cycle'>('Wellbeing');

  return (
    <>
      {showCycle && <div className="health-tabs">
        <button className={section === 'Wellbeing' ? 'selected' : ''} onClick={() => setSection('Wellbeing')} type="button">◡ Wellbeing</button>
        <button className={section === 'Cycle' ? 'selected' : ''} onClick={() => setSection('Cycle')} type="button">♡ Cycle</button>
      </div>}
      {section === 'Cycle' && showCycle ? <HealthView /> : <EmotionalWellbeing />}
    </>
  );
}
