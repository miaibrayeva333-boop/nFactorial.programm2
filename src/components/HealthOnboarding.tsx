import { FormEvent, useState } from 'react';

export type CycleProfile = {
  periodLength: number;
  regularity: 'Regular' | 'Varies a little' | 'Irregular';
  defaultCycle: number;
};

type Props = {
  onComplete: (profile: CycleProfile, periodStarts: string[]) => void;
};

export function HealthOnboarding({ onComplete }: Props) {
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
      <p className="eyebrow">HEALTH SETUP · {step} OF 3</p>
      {step === 1 && (
        <section>
          <h1>Let’s understand your cycle</h1>
          <p>When did your most recent period start? Day 1 is the first day of bleeding.</p>
          <label>Most recent start date<input autoFocus className="amount-input" max={new Date().toISOString().slice(0, 10)} onChange={(event) => setLatest(event.target.value)} type="date" value={latest} /></label>
          <button className="onboarding-next" disabled={!latest} onClick={() => setStep(2)} type="button">Continue</button>
        </section>
      )}
      {step === 2 && (
        <section>
          <h1>Add earlier period starts</h1>
          <p>Two earlier dates help calculate your personal average. Skip any date you do not remember.</p>
          <label>Previous start date<input autoFocus className="amount-input" max={latest} onChange={(event) => setPrevious(event.target.value)} type="date" value={previous} /></label>
          <label>One more start date — optional<input className="amount-input" max={previous || latest} onChange={(event) => setOlder(event.target.value)} type="date" value={older} /></label>
          <div className="onboarding-actions"><button onClick={() => setStep(1)} type="button">Back</button><button onClick={() => setStep(3)} type="button">Continue</button></div>
        </section>
      )}
      {step === 3 && (
        <form onSubmit={finish}>
          <h1>Your usual pattern</h1>
          <p>These answers provide a starting estimate and improve as you log more cycles.</p>
          <label>Periods usually last <strong>{periodLength} days</strong><input className="progress-range" max="10" min="1" onChange={(event) => setPeriodLength(Number(event.target.value))} type="range" value={periodLength} /></label>
          <label>Usual cycle length <strong>{defaultCycle} days</strong><input className="progress-range" max="45" min="20" onChange={(event) => setDefaultCycle(Number(event.target.value))} type="range" value={defaultCycle} /></label>
          <fieldset><legend>How predictable are your periods?</legend><div className="regularity-options">
            {(['Regular', 'Varies a little', 'Irregular'] as const).map((option) => <button className={regularity === option ? 'selected' : ''} key={option} onClick={() => setRegularity(option)} type="button">{option}</button>)}
          </div></fieldset>
          <div className="onboarding-actions"><button onClick={() => setStep(2)} type="button">Back</button><button type="submit">See my insights</button></div>
        </form>
      )}
      <small className="onboarding-privacy">Your cycle data stays on this device. Predictions are estimates and are not birth-control advice.</small>
    </div>
  );
}
