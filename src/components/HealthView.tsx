import { FormEvent, useMemo, useState } from 'react';
import { HealthOnboarding, type CycleProfile } from './HealthOnboarding';
import { localeForLanguage, useI18n, type Language } from '../lib/i18n';

type HealthLog = {
  id: number;
  date: string;
  period: boolean;
  periodStart?: boolean;
  pain: number;
  symptoms: string[];
  bodyFeelings?: string[];
  emotions?: string[];
  notes: string;
};

const symptomOptions = ['Cramps', 'Headache', 'Bloating', 'Fatigue', 'Back pain', 'Mood changes'];
const bodyOptions = ['Bloated', 'Crampy', 'Heavy', 'Tender', 'Achy', 'Energetic'];
const emotionOptions = ['Calm', 'Sensitive', 'Irritable', 'Anxious', 'Low', 'Emotional', 'Confident'];
const cyclePageCopy: Record<Language, string[]> = {
  English: ['UNDERSTAND YOUR BODY', 'NEXT PERIOD ESTIMATE', 'Add your first period', 'Estimate based on your', 'day average', 'CURRENT CYCLE', 'Day', 'Avg. cycle', 'Avg. period', 'Day variation', 'Cycles logged', 'Recent check-ins', 'Add check-in', 'Period day', 'Health check-in', 'Pain', 'No symptoms', 'Start a private check-in', 'Track period days, pain, and symptoms.', 'Edit cycle answers'],
  Русский: ['ПОНИМАЙТЕ СВОЁ ТЕЛО', 'ПРОГНОЗ СЛЕДУЮЩЕЙ МЕНСТРУАЦИИ', 'Добавьте первую менструацию', 'Прогноз на основе среднего цикла:', 'дней', 'ТЕКУЩИЙ ЦИКЛ', 'День', 'Средний цикл', 'Средняя менструация', 'Разница в днях', 'Циклов записано', 'Последние отметки', 'Добавить отметку', 'День менструации', 'Проверка здоровья', 'Боль', 'Нет симптомов', 'Начать личную отметку', 'Отмечайте дни менструации, боль и симптомы.', 'Изменить ответы о цикле'],
  Қазақша: ['ДЕНЕҢІЗДІ ТҮСІНІҢІЗ', 'КЕЛЕСІ ЕТЕККІР БОЛЖАМЫ', 'Алғашқы етеккірді қосыңыз', 'Орташа циклге негізделген болжам:', 'күн', 'АҒЫМДАҒЫ ЦИКЛ', 'Күн', 'Орташа цикл', 'Орташа етеккір', 'Күн ауытқуы', 'Жазылған циклдер', 'Соңғы белгілеулер', 'Белгілеу қосу', 'Етеккір күні', 'Денсаулық белгілеуі', 'Ауырсыну', 'Белгілер жоқ', 'Жеке белгілеуді бастау', 'Етеккір күндерін, ауырсыну мен белгілерді бақылаңыз.', 'Цикл жауаптарын өзгерту'],
  Español: ['CONOCE TU CUERPO', 'ESTIMACIÓN DEL PRÓXIMO PERIODO', 'Añade tu primer periodo', 'Estimación basada en tu promedio de', 'días', 'CICLO ACTUAL', 'Día', 'Ciclo medio', 'Periodo medio', 'Variación de días', 'Ciclos registrados', 'Controles recientes', 'Añadir control', 'Día de periodo', 'Control de salud', 'Dolor', 'Sin síntomas', 'Iniciar un control privado', 'Registra días de periodo, dolor y síntomas.', 'Editar respuestas del ciclo'],
  Français: ['COMPRENEZ VOTRE CORPS', 'ESTIMATION DES PROCHAINES RÈGLES', 'Ajoutez vos premières règles', 'Estimation basée sur votre moyenne de', 'jours', 'CYCLE ACTUEL', 'Jour', 'Cycle moyen', 'Règles moyennes', 'Variation en jours', 'Cycles enregistrés', 'Bilans récents', 'Ajouter un bilan', 'Jour de règles', 'Bilan de santé', 'Douleur', 'Aucun symptôme', 'Commencer un bilan privé', 'Suivez les jours de règles, la douleur et les symptômes.', 'Modifier les réponses du cycle'],
  Deutsch: ['VERSTEHE DEINEN KÖRPER', 'SCHÄTZUNG DER NÄCHSTEN PERIODE', 'Füge deine erste Periode hinzu', 'Schätzung basierend auf deinem Durchschnitt von', 'Tagen', 'AKTUELLER ZYKLUS', 'Tag', 'Ø Zyklus', 'Ø Periode', 'Tagesabweichung', 'Erfasste Zyklen', 'Letzte Check-ins', 'Check-in hinzufügen', 'Periodentag', 'Gesundheits-Check-in', 'Schmerz', 'Keine Symptome', 'Privaten Check-in starten', 'Erfasse Periodentage, Schmerzen und Symptome.', 'Zyklusantworten bearbeiten'],
};

export function HealthView() {
  const { language, t } = useI18n();
  const c = cyclePageCopy[language];
  const locale = localeForLanguage(language);
  const [profile, setProfile] = useState<CycleProfile | null>(() => {
    const saved = localStorage.getItem('smart-life-health-profile');
    return saved ? JSON.parse(saved) as CycleProfile : null;
  });
  const [logs, setLogs] = useState<HealthLog[]>(() => {
    const saved = localStorage.getItem('smart-life-health');
    return saved ? JSON.parse(saved) as HealthLog[] : [];
  });
  const [editorOpen, setEditorOpen] = useState(false);

  const periodStarts = useMemo(() =>
    [...logs].filter((log) => log.periodStart ?? log.period).sort((a, b) => a.date.localeCompare(b.date)),
  [logs]);
  const cycleLengths = periodStarts.slice(1).map((log, index) =>
    Math.round((new Date(`${log.date}T12:00:00`).getTime() -
      new Date(`${periodStarts[index].date}T12:00:00`).getTime()) / 86400000),
  ).filter((days) => days >= 15 && days <= 60);
  const averageCycle = cycleLengths.length
    ? Math.round(cycleLengths.reduce((sum, days) => sum + days, 0) / cycleLengths.length)
    : profile?.defaultCycle ?? 28;
  const latestPeriod = periodStarts[periodStarts.length - 1];
  const nextPeriod = latestPeriod
    ? new Date(new Date(`${latestPeriod.date}T12:00:00`).getTime() + averageCycle * 86400000)
    : null;
  const variability = cycleLengths.length > 1 ? Math.max(...cycleLengths) - Math.min(...cycleLengths) : 0;
  const cycleDay = latestPeriod
    ? Math.max(1, Math.floor((Date.now() - new Date(`${latestPeriod.date}T00:00:00`).getTime()) / 86400000) + 1)
    : 1;

  function save(next: HealthLog[]) {
    setLogs(next);
    localStorage.setItem('smart-life-health', JSON.stringify(next));
  }

  function completeOnboarding(nextProfile: CycleProfile, starts: string[]) {
    localStorage.setItem('smart-life-health-profile', JSON.stringify(nextProfile));
    const seeded = starts.map((date, index) => ({
      id: Date.now() + index, date, period: true, periodStart: true, pain: 0, symptoms: [], notes: 'Period start',
    }));
    save([...logs, ...seeded]);
    setProfile(nextProfile);
  }

  if (!profile) return <HealthOnboarding onComplete={completeOnboarding} />;

  return (
    <div className="dashboard health-view">
      <header className="topbar">
        <div><p className="eyebrow">{c[0]}</p><h1>{t('health')}</h1></div>
        <button className="add-button" onClick={() => setEditorOpen(true)} type="button">＋</button>
      </header>

      <section className="health-overview">
        <article className="cycle-card">
          <span className="health-icon">♡</span><p>{c[1]}</p>
          <h2>{nextPeriod ? nextPeriod.toLocaleDateString(locale, { month: 'long', day: 'numeric' }) : c[2]}</h2>
          <small>{c[3]} {averageCycle} {c[4]}</small>
        </article>
        <article className="cycle-settings cycle-day-card">
          <span>{c[5]}</span><strong>{c[6]} {cycleDay}</strong><small>{profile.regularity}</small>
        </article>
      </section>
      <section className="cycle-stats">
        <div><strong>{averageCycle}</strong><span>{c[7]}</span></div><div><strong>{profile.periodLength}</strong><span>{c[8]}</span></div>
        <div><strong>±{variability}</strong><span>{c[9]}</span></div><div><strong>{periodStarts.length}</strong><span>{c[10]}</span></div>
      </section>

      <div className="section-title health-title"><h2>{c[11]}</h2><button onClick={() => setEditorOpen(true)} type="button">{c[12]}</button></div>
      {logs.length ? (
        <section className="health-log-list">
          {[...logs].sort((a, b) => b.date.localeCompare(a.date)).map((log) => (
            <article className="health-log" key={log.id}>
              <div className={log.period ? 'health-date period' : 'health-date'}>
                <strong>{new Date(`${log.date}T12:00:00`).getDate()}</strong>
                <small>{new Date(`${log.date}T12:00:00`).toLocaleDateString(locale, { month: 'short' })}</small>
              </div>
              <div>
                <h3>{log.period ? c[13] : c[14]} · {c[15]} {log.pain}/10</h3>
                <p>{[...(log.bodyFeelings ?? []), ...(log.emotions ?? []), ...log.symptoms].join(' · ') || c[16]}{log.notes ? ` — ${log.notes}` : ''}</p>
              </div>
              <button aria-label="Delete health entry" onClick={() => save(logs.filter((item) => item.id !== log.id))} type="button">×</button>
            </article>
          ))}
        </section>
      ) : (
        <button className="empty-health" onClick={() => setEditorOpen(true)} type="button"><span>♡</span><strong>{c[17]}</strong><small>{c[18]}</small></button>
      )}
      <p className="health-note">This tracker provides estimates only and is not medical advice. Seek medical care for severe or unusual pain.</p>
      <button className="reset-cycle-profile" onClick={() => { localStorage.removeItem('smart-life-health-profile'); setProfile(null); }} type="button">{c[19]}</button>
      {editorOpen && <HealthEditor onClose={() => setEditorOpen(false)} onSave={(log) => { save([...logs, log]); setEditorOpen(false); }} />}
    </div>
  );
}

function HealthEditor({ onClose, onSave }: { onClose: () => void; onSave: (log: HealthLog) => void }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [period, setPeriod] = useState(false);
  const [pain, setPain] = useState(0);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [bodyFeelings, setBodyFeelings] = useState<string[]>([]);
  const [emotions, setEmotions] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  function submit(event: FormEvent) {
    event.preventDefault();
    onSave({ id: Date.now(), date, period, periodStart: period, pain, symptoms, bodyFeelings, emotions, notes: notes.trim() });
  }
  function toggle(symptom: string) {
    setSymptoms(symptoms.includes(symptom) ? symptoms.filter((item) => item !== symptom) : [...symptoms, symptom]);
  }
  function toggleChoice(value: string, selected: string[], update: (values: string[]) => void) {
    update(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]);
  }
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form className="tracker-modal health-editor" onMouseDown={(event) => event.stopPropagation()} onSubmit={submit}>
        <button className="modal-close" onClick={onClose} type="button">×</button>
        <div className="tracker-symbol pink">♡</div><h2>Health check-in</h2><p>Your entry stays private on this device.</p>
        <label>Date<input className="amount-input" onChange={(event) => setDate(event.target.value)} type="date" value={date} /></label>
        <button className={period ? 'period-toggle selected' : 'period-toggle'} onClick={() => setPeriod(!period)} type="button"><span>{period ? '✓' : ''}</span> My period started today</button>
        <label>Pain level: <strong>{pain}/10</strong><input className="pain-range" max="10" min="0" onChange={(event) => setPain(Number(event.target.value))} type="range" value={pain} /></label>
        <fieldset><legend>How does your body feel today?</legend><div className="health-choice-grid body-choices">
          {bodyOptions.map((feeling) => <button className={bodyFeelings.includes(feeling) ? 'selected' : ''} key={feeling} onClick={() => toggleChoice(feeling, bodyFeelings, setBodyFeelings)} type="button">{feeling}</button>)}
        </div></fieldset>
        <fieldset><legend>How do you feel emotionally?</legend><div className="health-choice-grid emotion-choices">
          {emotionOptions.map((emotion) => <button className={emotions.includes(emotion) ? 'selected' : ''} key={emotion} onClick={() => toggleChoice(emotion, emotions, setEmotions)} type="button">{emotion}</button>)}
        </div></fieldset>
        <fieldset><legend>Symptoms</legend><div className="symptom-grid">{symptomOptions.map((symptom) => <button className={symptoms.includes(symptom) ? 'selected' : ''} key={symptom} onClick={() => toggle(symptom)} type="button">{symptom}</button>)}</div></fieldset>
        <label>Notes<textarea maxLength={300} onChange={(event) => setNotes(event.target.value)} placeholder="Anything else you noticed?" value={notes} /></label>
        <button className="save-profile-button" type="submit">Save check-in</button>
      </form>
    </div>
  );
}
