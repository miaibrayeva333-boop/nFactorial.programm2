import { FormEvent, useState } from 'react';
import { awardXp } from '../lib/xp';
import { getWellbeingSupport } from '../lib/wellbeingAi';
import { localeForLanguage, useI18n } from '../lib/i18n';
import { sectionCopy } from '../lib/sectionCopy';
import { todayKey } from '../lib/tasks';

type CheckIn = {
  id: number;
  date: string;
  mood: string;
  energy: number;
  stress: number;
  note: string;
  aiSupport?: string;
};

const moods = [
  ['Calm', '◡'], ['Happy', '☀'], ['Focused', '◎'],
  ['Tired', '☾'], ['Anxious', '≈'], ['Sad', '☂'],
];

export function EmotionalWellbeing() {
  const { language } = useI18n();
  const copy = sectionCopy(language);
  const locale = localeForLanguage(language);
  const [entries, setEntries] = useState<CheckIn[]>(() => {
    const saved = localStorage.getItem('smart-axis-wellbeing');
    return saved ? JSON.parse(saved) as CheckIn[] : [];
  });
  const [editorOpen, setEditorOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const latest = entries[0];

  function save(entry: CheckIn) {
    const next = [entry, ...entries].slice(0, 30);
    setEntries(next);
    localStorage.setItem('smart-axis-wellbeing', JSON.stringify(next));
    void awardXp('health_checkin').catch(() => undefined);
    setEditorOpen(false);
    if (needsSupport(entry)) void addAiSupport(entry, next);
  }

  async function addAiSupport(entry: CheckIn, currentEntries: CheckIn[]) {
    setAiLoading(true);
    try {
      const aiSupport = await getWellbeingSupport(entry, language);
      const updated = currentEntries.map((item) => item.id === entry.id ? { ...item, aiSupport } : item);
      setEntries(updated);
      localStorage.setItem('smart-axis-wellbeing', JSON.stringify(updated));
    } catch {
      const fallback = supportFallback[language];
      const updated = currentEntries.map((item) => item.id === entry.id ? { ...item, aiSupport: fallback } : item);
      setEntries(updated);
      localStorage.setItem('smart-axis-wellbeing', JSON.stringify(updated));
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div className="dashboard wellbeing-view">
      <header className="topbar">
        <div><p className="eyebrow">{copy.gentleCheck}</p><h1>{copy.emotionalWellbeing}</h1></div>
        <button className="add-button" aria-label={copy.addCheckIn} onClick={() => setEditorOpen(true)} type="button">＋</button>
      </header>
      <section className="wellbeing-hero">
        <div><span>♡</span><p>{copy.feelingsMatter}</p><h2>{latest ? `${copy.felt} ${latest.mood.toLowerCase()}` : copy.moment}</h2>
          <small>{latest ? `${copy.checkedIn} ${new Date(`${latest.date}T12:00:00`).toLocaleDateString(locale, { month: 'long', day: 'numeric' })}` : copy.noticeMood}</small>
        </div>
        <button onClick={() => setEditorOpen(true)} type="button">{latest ? copy.again : copy.start}</button>
      </section>
      {(aiLoading || latest?.aiSupport) && <section className="wellbeing-ai-support"><span>✦</span><div><h2>{copy.axieSupport}</h2><p>{aiLoading ? copy.thinking : latest?.aiSupport}</p></div></section>}
      <div className="section-title wellbeing-title"><h2>{copy.recent}</h2></div>
      {entries.length ? (
        <section className="wellbeing-list">
          {entries.map((entry) => (
            <article key={entry.id}>
              <span className="wellbeing-mood">{moods.find(([name]) => name === entry.mood)?.[1] ?? '♡'}</span>
              <div><h3>{entry.mood}</h3><p>{copy.energy} {entry.energy}/5 · {copy.stress} {entry.stress}/5{entry.note ? ` · ${entry.note}` : ''}</p></div>
              <small>{new Date(`${entry.date}T12:00:00`).toLocaleDateString(locale, { month: 'short', day: 'numeric' })}</small>
            </article>
          ))}
        </section>
      ) : <button className="empty-wellbeing" onClick={() => setEditorOpen(true)} type="button">{copy.emptyCheckIns}</button>}
      <p className="wellbeing-note">{copy.reflectionNote}</p>
      {editorOpen && <WellbeingEditor onClose={() => setEditorOpen(false)} onSave={save} />}
    </div>
  );
}

function WellbeingEditor({ onClose, onSave }: { onClose: () => void; onSave: (entry: CheckIn) => void }) {
  const { language, t } = useI18n();
  const copy = sectionCopy(language);
  const [mood, setMood] = useState('');
  const [energy, setEnergy] = useState(3);
  const [stress, setStress] = useState(3);
  const [note, setNote] = useState('');

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!mood) return;
    onSave({ id: Date.now(), date: todayKey(), mood, energy, stress, note: note.trim() });
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form className="tracker-modal wellbeing-editor" onMouseDown={(event) => event.stopPropagation()} onSubmit={submit}>
        <button className="modal-close" onClick={onClose} type="button">×</button>
        <div className="tracker-symbol pink">♡</div><h2>{t('feeling')}</h2><p>{copy.chooseFeeling}</p>
        <div className="wellbeing-moods">{moods.map(([name, icon]) => <button className={mood === name ? 'selected' : ''} key={name} onClick={() => setMood(name)} type="button"><span>{icon}</span>{name}</button>)}</div>
        <label>{copy.energy} <strong>{energy}/5</strong><input max="5" min="1" onChange={(event) => setEnergy(Number(event.target.value))} type="range" value={energy} /></label>
        <label>{copy.stress} <strong>{stress}/5</strong><input max="5" min="1" onChange={(event) => setStress(Number(event.target.value))} type="range" value={stress} /></label>
        <label>{copy.optionalNote}<textarea maxLength={180} onChange={(event) => setNote(event.target.value)} placeholder={copy.mindPlaceholder} value={note} /></label>
        <button className="save-profile-button" disabled={!mood} type="submit">{copy.saveCheckIn}</button>
      </form>
    </div>
  );
}

function needsSupport(entry: CheckIn) {
  const negativeNote = /sad|anxious|bad|lonely|angry|overwhelmed|scared|груст|тревож|плохо|одинок|злю|қорқ|мұң|жаман|жалғыз|ашу/i.test(entry.note);
  return ['Tired', 'Anxious', 'Sad'].includes(entry.mood) || entry.stress >= 4 || entry.energy <= 2 || negativeNote;
}

const supportFallback = {
  English: 'This sounds like a difficult moment. Try one slow breath, get some water, and consider telling a trusted person how you feel.',
  Русский: 'Похоже, сейчас вам непросто. Сделайте медленный вдох, выпейте воды и попробуйте рассказать о своих чувствах человеку, которому доверяете.',
  Қазақша: 'Қазір сізге қиын болып тұрған сияқты. Баяу тыныс алып, су ішіп, сезіміңізді сенетін адамыңызға айтып көріңіз.',
  Español: 'Parece un momento difícil. Respira lentamente, bebe un poco de agua y considera contarle cómo te sientes a alguien de confianza.',
  Français: 'Ce moment semble difficile. Respirez lentement, buvez un peu d’eau et pensez à parler de vos émotions à une personne de confiance.',
  Deutsch: 'Das klingt nach einem schwierigen Moment. Atme langsam, trink etwas Wasser und sprich vielleicht mit einer vertrauten Person über deine Gefühle.',
};
