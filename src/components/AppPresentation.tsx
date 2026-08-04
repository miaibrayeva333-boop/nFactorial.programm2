import { useState } from 'react';
import { useI18n } from '../lib/i18n';

const slides = {
  English: [
    ['✓', 'Plan your day', 'Organize tasks, priorities, and calendar plans in one calm space.'],
    ['♡', 'Understand your wellbeing', 'Track health and emotions, with gentle AI support when days feel difficult.'],
    ['🏆', 'Grow with XP', 'Complete daily goals, earn XP, and move up the community leaderboard.'],
    ['🍎', 'Take a playful break', 'Play Apple Snake on your phone or computer—even offline after your first visit.'],
  ],
  Русский: [
    ['✓', 'Планируйте свой день', 'Задачи, приоритеты и календарь в одном спокойном пространстве.'],
    ['♡', 'Понимайте своё состояние', 'Отмечайте здоровье и эмоции, а ИИ мягко поддержит в сложный день.'],
    ['🏆', 'Развивайтесь с XP', 'Выполняйте цели, получайте XP и поднимайтесь в рейтинге.'],
    ['🍎', 'Отдыхайте с игрой', 'Играйте в Apple Snake на телефоне или компьютере даже без интернета.'],
  ],
  Қазақша: [
    ['✓', 'Күніңізді жоспарлаңыз', 'Тапсырмалар, басымдықтар және күнтізбе бір тыныш кеңістікте.'],
    ['♡', 'Көңіл күйіңізді түсініңіз', 'Денсаулық пен эмоцияларды белгілеңіз, қиын кезде AI қолдау көрсетеді.'],
    ['🏆', 'XP арқылы өсіңіз', 'Күнделікті мақсаттарды орындап, XP жинап, рейтингте көтеріліңіз.'],
    ['🍎', 'Ойынмен демалыңыз', 'Apple Snake ойынын телефонда немесе компьютерде интернетсіз ойнаңыз.'],
  ],
  Español: [
    ['✓', 'Planifica tu día', 'Organiza tareas, prioridades y calendario en un espacio tranquilo.'],
    ['♡', 'Comprende tu bienestar', 'Registra salud y emociones con apoyo amable de IA.'],
    ['🏆', 'Crece con XP', 'Completa objetivos, gana XP y sube en la clasificación.'],
    ['🍎', 'Descansa jugando', 'Juega Apple Snake en el móvil o el ordenador, incluso sin conexión.'],
  ],
  Français: [
    ['✓', 'Planifiez votre journée', 'Organisez tâches, priorités et calendrier dans un espace calme.'],
    ['♡', 'Comprenez votre bien-être', 'Suivez santé et émotions avec un soutien bienveillant de l’IA.'],
    ['🏆', 'Progressez avec les XP', 'Terminez vos objectifs et montez dans le classement.'],
    ['🍎', 'Faites une pause', 'Jouez à Apple Snake sur téléphone ou ordinateur, même hors ligne.'],
  ],
  Deutsch: [
    ['✓', 'Plane deinen Tag', 'Organisiere Aufgaben, Prioritäten und Kalender an einem ruhigen Ort.'],
    ['♡', 'Verstehe dein Wohlbefinden', 'Erfasse Gesundheit und Gefühle mit einfühlsamer KI-Hilfe.'],
    ['🏆', 'Wachse mit XP', 'Erledige Ziele, sammle XP und steige in der Rangliste auf.'],
    ['🍎', 'Mach eine Spielpause', 'Spiele Apple Snake auf Handy oder Computer, auch offline.'],
  ],
} as const;

export function AppPresentation() {
  const { language } = useI18n();
  const [active, setActive] = useState(0);
  const slide = slides[language][active];
  return (
    <section className="auth-presentation">
      <img src="/assets/smart-life-logo.png" alt="Smart Axis" />
      <p className="eyebrow">SMART AXIS</p>
      <div className="presentation-icon">{slide[0]}</div>
      <h2>{slide[1]}</h2><p>{slide[2]}</p>
      <div className="presentation-dots">
        {slides[language].map((item, index) => <button aria-label={`Show ${item[1]}`} className={active === index ? 'selected' : ''} key={item[1]} onClick={() => setActive(index)} type="button" />)}
      </div>
    </section>
  );
}
