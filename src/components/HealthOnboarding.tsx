import { FormEvent, useState } from 'react';
import { useI18n } from '../lib/i18n';
import { sectionCopy } from '../lib/sectionCopy';

export type CycleProfile = {
  periodLength: number;
  regularity: 'Regular' | 'Varies a little' | 'Irregular';
  defaultCycle: number;
};

type Props = {
  onComplete: (profile: CycleProfile, periodStarts: string[]) => void;
};

export function HealthOnboarding({ onComplete }: Props) {
  const { language, t } = useI18n();
  const copy = sectionCopy(language);
  const [step, setStep] = useState(1);
  const [latest, setLatest] = useState('');
  const [previous, setPrevious] = useState('');
  const [older, setOlder] = useState('');
  const [periodLength, setPeriodLength] = useState(5);
  const [defaultCycle, setDefaultCycle] = useState(28);
  const [regularity, setRegularity] = useState<CycleProfile['regularity']>('Regular');

  function finish(event: FormEvent) {
    event.preventDefault();
    const starts = [latest, previous, older].filter(Boolean).sort();
    onComplete({ periodLength, regularity, defaultCycle }, starts);
  }

  return (
    <div className="dashboard health-onboarding">
      <div className="onboarding-progress"><i style={{ width: `${step / 3 * 100}%` }} /></div>
      <div className="onboarding-mascot">♡</div>
      <p className="eyebrow">{copy.healthSetup} · {step} {copy.of} 3</p>
      {step === 1 && (
        <section>
          <h1>{copy.understandCycle}</h1>
          <p>{copy.recentPeriodQuestion}</p>
          <label>{copy.recentStart}<input autoFocus className="amount-input" max={new Date().toISOString().slice(0, 10)} onChange={(event) => setLatest(event.target.value)} type="date" value={latest} /></label>
          <button className="onboarding-next" disabled={!latest} onClick={() => setStep(2)} type="button">{copy.continue}</button>
        </section>
      )}
      {step === 2 && (
        <section>
          <h1>{copy.earlierStarts}</h1><p>{copy.earlierHelp}</p>
          <label>{copy.previousStart}<input autoFocus className="amount-input" max={latest} onChange={(event) => setPrevious(event.target.value)} type="date" value={previous} /></label>
          <label>{copy.optionalStart}<input className="amount-input" max={previous || latest} onChange={(event) => setOlder(event.target.value)} type="date" value={older} /></label>
          <div className="onboarding-actions"><button onClick={() => setStep(1)} type="button">{t('back')}</button><button onClick={() => setStep(3)} type="button">{copy.continue}</button></div>
        </section>
      )}
      {step === 3 && (
        <form onSubmit={finish}>
          <h1>{copy.usualPattern}</h1><p>{copy.patternHelp}</p>
          <label>{copy.periodsLast} <strong>{periodLength} {copy.days}</strong><input className="progress-range" max="10" min="1" onChange={(event) => setPeriodLength(Number(event.target.value))} type="range" value={periodLength} /></label>
          <label>{copy.cycleLength} <strong>{defaultCycle} {copy.days}</strong><input className="progress-range" max="45" min="20" onChange={(event) => setDefaultCycle(Number(event.target.value))} type="range" value={defaultCycle} /></label>
          <fieldset><legend>{copy.predictable}</legend><div className="regularity-options">
            {(['Regular', 'Varies a little', 'Irregular'] as const).map((option) => <button className={regularity === option ? 'selected' : ''} key={option} onClick={() => setRegularity(option)} type="button">{option === 'Regular' ? copy.regular : option === 'Irregular' ? copy.irregular : copy.varies}</button>)}
          </div></fieldset>
          <div className="onboarding-actions"><button onClick={() => setStep(2)} type="button">{t('back')}</button><button type="submit">{copy.insights}</button></div>
        </form>
      )}
      <small className="onboarding-privacy">{copy.cyclePrivacy}</small>
    </div>
  );
}
