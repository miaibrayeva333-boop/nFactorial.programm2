import { useState } from 'react';
import { saveGender, type Gender } from '../lib/profile';
import { useI18n } from '../lib/i18n';
import { LanguagePicker } from './LanguagePicker';
import { onboardingCopy } from '../lib/onboardingCopy';

const values: Gender[] = ['female', 'male', 'nonbinary', 'prefer-not-to-say'];
const icons = ['✓', '♡', '✦'];

export function AppIntroduction({ onComplete }: { onComplete: () => void }) {
  const { language } = useI18n();
  const copy = onboardingCopy[language];
  const [gender, setGender] = useState<Gender | null>(null);

  function continueToLogin() {
    if (!gender) return;
    saveGender(gender);
    onComplete();
  }

  return (
    <main className="intro-page">
      <section className="intro-copy">
        <LanguagePicker />
        <img src="/assets/smart-life-logo.png" alt="Smart Axis" />
        <p className="eyebrow">{copy.welcome}</p>
        <h1>{copy.headline}</h1>
        <p>{copy.intro}</p>
        <div className="intro-features">
          {copy.features.map(([title, detail], index) => <article key={title}><span>{icons[index]}</span><div><strong>{title}</strong><small>{detail}</small></div></article>)}
        </div>
      </section>
      <section className="gender-card">
        <span className="intro-step">{copy.quickStart}</span>
        <h2>{copy.describe}</h2>
        <p>{copy.healthNote}</p>
        <div className="gender-options">
          {values.map((value, index) => (
            <button
              className={gender === value ? 'selected' : ''}
              key={value}
              onClick={() => setGender(value)}
              type="button"
            >
              <span>{gender === value ? '✓' : ''}</span>{copy.genders[index]}
            </button>
          ))}
        </div>
        <button className="intro-continue" disabled={!gender} onClick={continueToLogin} type="button">
          {copy.continue}
        </button>
        <small>{copy.private}</small>
      </section>
    </main>
  );
}
