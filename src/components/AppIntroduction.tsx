import { useState } from 'react';
import { saveGender, type Gender } from '../lib/profile';
import { useI18n } from '../lib/i18n';
import { LanguagePicker } from './LanguagePicker';

const choices: Array<{ value: Gender; label: string }> = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'nonbinary', label: 'Non-binary' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
];

const introText = {
  English: ['WELCOME TO SMART AXIS', 'One calm place for your day and wellbeing.', 'Plan tasks, check your calendar, talk with your AI helper, and understand your health without the clutter.', 'A QUICK START', 'How would you describe yourself?', 'This only personalizes health features.', 'Continue to sign in'],
  Русский: ['ДОБРО ПОЖАЛОВАТЬ В SMART AXIS', 'Спокойное место для ваших дел и самочувствия.', 'Планируйте задачи, проверяйте календарь, общайтесь с ИИ-помощником и следите за здоровьем.', 'БЫСТРЫЙ СТАРТ', 'Как вы себя описываете?', 'Это нужно только для настройки функций здоровья.', 'Перейти ко входу'],
  Қазақша: ['SMART AXIS-ҚА ҚОШ КЕЛДІҢІЗ', 'Күнделікті істер мен көңіл күйге арналған тыныш орын.', 'Тапсырмаларды жоспарлаңыз, күнтізбені қараңыз, AI көмекшісімен сөйлесіңіз және денсаулықты бақылаңыз.', 'ЖЫЛДАМ БАСТАУ', 'Өзіңізді қалай сипаттайсыз?', 'Бұл тек денсаулық мүмкіндіктерін баптау үшін қажет.', 'Кіруге өту'],
  Español: ['BIENVENIDO A SMART AXIS', 'Un lugar tranquilo para tu día y bienestar.', 'Planifica tareas, consulta tu calendario, habla con tu asistente de IA y cuida tu salud.', 'INICIO RÁPIDO', '¿Cómo te describirías?', 'Esto solo personaliza las funciones de salud.', 'Continuar para iniciar sesión'],
  Français: ['BIENVENUE SUR SMART AXIS', 'Un espace calme pour votre journée et votre bien-être.', 'Planifiez vos tâches, consultez le calendrier, parlez à votre assistant IA et suivez votre santé.', 'DÉMARRAGE RAPIDE', 'Comment vous décririez-vous ?', 'Cela personnalise uniquement les fonctions de santé.', 'Continuer vers la connexion'],
  Deutsch: ['WILLKOMMEN BEI SMART AXIS', 'Ein ruhiger Ort für deinen Tag und dein Wohlbefinden.', 'Plane Aufgaben, prüfe den Kalender, sprich mit deinem KI-Assistenten und achte auf deine Gesundheit.', 'SCHNELLSTART', 'Wie würdest du dich beschreiben?', 'Dies passt nur die Gesundheitsfunktionen an.', 'Weiter zur Anmeldung'],
} as const;

export function AppIntroduction({ onComplete }: { onComplete: () => void }) {
  const { language } = useI18n();
  const text = introText[language];
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
        <p className="eyebrow">{text[0]}</p>
        <h1>{text[1]}</h1>
        <p>{text[2]}</p>
        <div className="intro-features">
          <article><span>✓</span><div><strong>Stay organized</strong><small>Tasks and calendar together.</small></div></article>
          <article><span>♡</span><div><strong>Know your rhythm</strong><small>Health, nutrition, and daily habits.</small></div></article>
          <article><span>✦</span><div><strong>Get thoughtful help</strong><small>Your AI assistant is ready when you need it.</small></div></article>
        </div>
      </section>
      <section className="gender-card">
        <span className="intro-step">{text[3]}</span>
        <h2>{text[4]}</h2>
        <p>{text[5]}</p>
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
          {text[6]}
        </button>
        <small>Your choice stays private on this device.</small>
      </section>
    </main>
  );
}
