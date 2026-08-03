import { useState } from 'react';
import { completeIntro, saveGender, type Gender } from '../lib/profile';

const choices: Array<{ value: Gender; label: string }> = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'nonbinary', label: 'Non-binary' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
];

export function AppIntroduction({ onComplete }: { onComplete: () => void }) {
  const [gender, setGender] = useState<Gender | null>(null);

  function continueToLogin() {
    if (!gender) return;
    saveGender(gender);
    completeIntro();
    onComplete();
  }

  return (
    <main className="intro-page">
      <section className="intro-copy">
        <img src="/assets/smart-life-logo.png" alt="Smart Axis" />
        <p className="eyebrow">WELCOME TO SMART AXIS</p>
        <h1>One calm place for your day and wellbeing.</h1>
        <p>Plan tasks, check your calendar, talk with your AI helper, and understand your health without the clutter.</p>
        <div className="intro-features">
          <article><span>✓</span><div><strong>Stay organized</strong><small>Tasks and calendar together.</small></div></article>
          <article><span>♡</span><div><strong>Know your rhythm</strong><small>Health, nutrition, and daily habits.</small></div></article>
          <article><span>✦</span><div><strong>Get thoughtful help</strong><small>Your AI assistant is ready when you need it.</small></div></article>
        </div>
      </section>
      <section className="gender-card">
        <span className="intro-step">A QUICK START</span>
        <h2>How would you describe yourself?</h2>
        <p>This only personalizes health features. Cycle tracking is shown when Female is selected.</p>
        <div className="gender-options">
          {choices.map((choice) => (
            <button
              className={gender === choice.value ? 'selected' : ''}
              key={choice.value}
              onClick={() => setGender(choice.value)}
              type="button"
            >
              <span>{gender === choice.value ? '✓' : ''}</span>{choice.label}
            </button>
          ))}
        </div>
        <button className="intro-continue" disabled={!gender} onClick={continueToLogin} type="button">
          Continue to sign in
        </button>
        <small>Your choice stays private on this device.</small>
      </section>
    </main>
  );
}
