import { useState } from 'react';
import { HealthView } from './HealthView';
import { getGender } from '../lib/profile';
import { EmotionalWellbeing } from './EmotionalWellbeing';
import { useI18n } from '../lib/i18n';
import { sectionCopy } from '../lib/sectionCopy';

export function HealthHub() {
  const { language } = useI18n();
  const copy = sectionCopy(language);
  const showCycle = getGender() === 'female';
  const [section, setSection] = useState<'Wellbeing' | 'Cycle'>('Wellbeing');

  return (
    <>
      {showCycle && <div className="health-tabs">
        <button className={section === 'Wellbeing' ? 'selected' : ''} onClick={() => setSection('Wellbeing')} type="button">◡ {copy.wellbeing}</button>
        <button className={section === 'Cycle' ? 'selected' : ''} onClick={() => setSection('Cycle')} type="button">♡ {copy.cycle}</button>
      </div>}
      {section === 'Cycle' && showCycle ? <HealthView /> : <EmotionalWellbeing />}
    </>
  );
}
