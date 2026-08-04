import { FormEvent, useMemo, useState } from 'react';
import { getHolidays } from '../lib/holidays';
import { appToday } from '../lib/tasks';
import { localeForLanguage, useI18n } from '../lib/i18n';

type CalendarEvent = {
  id: number;
  title: string;
  date: string;
  time: string;
  color: string;
  kind?: 'Want to do' | 'Have to do';
};

const colors = ['#6259df', '#32a97b', '#e9983f', '#e65f75'];

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function CalendarView() {
  const { language, t } = useI18n();
  const locale = localeForLanguage(language);
  const today = useMemo(appToday, []);
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState(today);
  const [editorOpen, setEditorOpen] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('smart-life-events');
    return saved ? JSON.parse(saved) as CalendarEvent[] : [];
  });
  const holidays = useMemo(() => getHolidays(month.getFullYear()), [month]);
  const weekdays = useMemo(() => Array.from({ length: 7 }, (_, index) => new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(new Date(2024, 0, index + 1))), [locale]);

  const firstOffset = (month.getDay() + 6) % 7;
  const numberOfDays = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = Array.from({ length: firstOffset + numberOfDays }, (_, index) =>
    index < firstOffset ? null : new Date(month.getFullYear(), month.getMonth(), index - firstOffset + 1),
  );
  while (cells.length % 7) cells.push(null);

  const selectedEvents = events
    .filter((event) => event.date === dateKey(selected))
    .sort((a, b) => a.time.localeCompare(b.time));
  const selectedHolidays = holidays.filter((holiday) => holiday.date === dateKey(selected));

  function save(next: CalendarEvent[]) {
    setEvents(next);
    localStorage.setItem('smart-life-events', JSON.stringify(next));
  }

  function changeMonth(offset: number) {
    const next = new Date(month.getFullYear(), month.getMonth() + offset, 1);
    setMonth(next);
    setSelected(next);
  }

  return (
    <div className="dashboard calendar-view">
      <header className="topbar calendar-header">
        <div><p className="eyebrow">{t('planYourTime')}</p><h1>{t('calendar')}</h1></div>
        <button className="add-button" onClick={() => setEditorOpen(true)} type="button">＋</button>
      </header>

      <section className="calendar-card">
        <div className="month-header">
          <button onClick={() => changeMonth(-1)} type="button">‹</button>
          <h2>{month.toLocaleDateString(locale, { month: 'long', year: 'numeric' })}</h2>
          <button onClick={() => changeMonth(1)} type="button">›</button>
        </div>
        <div className="weekday-row">
          {weekdays.map((day) => <span key={day}>{day}</span>)}
        </div>
        <div className="month-grid">
          {cells.map((date, index) => {
            if (!date) return <span className="calendar-day empty" key={`empty-${index}`} />;
            const key = dateKey(date);
            const isToday = key === dateKey(today);
            const isSelected = key === dateKey(selected);
            const dayEvents = events.filter((event) => event.date === key);
            const dayHolidays = holidays.filter((holiday) => holiday.date === key);
            return (
              <button
                className={`calendar-day${isToday ? ' today' : ''}${isSelected ? ' selected' : ''}`}
                key={key}
                onClick={() => setSelected(date)}
                type="button"
              >
                <span>{date.getDate()}</span>
                <i>
                  {dayHolidays.length > 0 && <b className="holiday-dot" />}
                  {dayEvents.slice(0, 2).map((event) => <b key={event.id} style={{ background: event.color }} />)}
                </i>
              </button>
            );
          })}
        </div>
      </section>

      <section className="agenda-section">
        <div className="section-title">
          <h2>{selected.toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric' })}</h2>
        </div>
        {selectedEvents.length || selectedHolidays.length ? (
          <div className="agenda-list">
            {selectedHolidays.map((holiday) => (
              <article className="agenda-event holiday-event" key={`${holiday.region}-${holiday.name}`}>
                <i /><time>{t('allDay')}</time>
                <div><h3>{holiday.name}</h3><p>{holiday.region} {t('holiday')}</p></div>
              </article>
            ))}
            {selectedEvents.map((event) => (
              <article className="agenda-event" key={event.id}>
                <i style={{ background: event.color }} />
                <time>{event.time}</time>
                <div><h3>{event.title}</h3><p><b className={event.kind === 'Have to do' ? 'plan-kind required' : 'plan-kind'}>{event.kind === 'Have to do' ? t('haveToDo') : t('wantToDo')}</b> {t('reminderAtTime')}</p></div>
                <button aria-label={`Delete ${event.title}`} onClick={() => save(events.filter((item) => item.id !== event.id))} type="button">×</button>
              </article>
            ))}
          </div>
        ) : (
          <button className="empty-agenda" onClick={() => setEditorOpen(true)} type="button">
            <span>＋</span><strong>{t('noEvents')}</strong><small>{t('addToDay')}</small>
          </button>
        )}
      </section>
      {editorOpen && <EventEditor date={selected} onClose={() => setEditorOpen(false)} onSave={(event) => { save([...events, event]); setEditorOpen(false); }} />}
    </div>
  );
}

function EventEditor({ date, onClose, onSave }: {
  date: Date;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
}) {
  const { language, t } = useI18n();
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('09:00');
  const [color, setColor] = useState(colors[0]);
  const [kind, setKind] = useState<'Want to do' | 'Have to do'>('Want to do');
  function submit(event: FormEvent) {
    event.preventDefault();
    if (title.trim()) onSave({ id: Date.now(), title: title.trim(), date: dateKey(date), time, color, kind });
  }
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form className="tracker-modal event-editor" onMouseDown={(event) => event.stopPropagation()} onSubmit={submit}>
        <button className="modal-close" onClick={onClose} type="button">×</button>
        <div className="tracker-symbol blue">□</div>
        <h2>{t('newEvent')}</h2><p>{date.toLocaleDateString(localeForLanguage(language), { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        <label>{t('eventName')}<input autoFocus className="amount-input" value={title} onChange={(event) => setTitle(event.target.value)} placeholder={t('eventPlaceholder')} /></label>
        <label>{t('time')}<input className="amount-input" value={time} onChange={(event) => setTime(event.target.value)} type="time" /></label>
        <fieldset><legend>{t('planKind')}</legend><div className="plan-type-options">
          {(['Want to do', 'Have to do'] as const).map((option) => <button className={kind === option ? 'selected' : ''} key={option} onClick={() => setKind(option)} type="button">{option === 'Want to do' ? t('wantToDo') : t('haveToDo')}</button>)}
        </div></fieldset>
        <div className="color-picker">{colors.map((item) => <button aria-label={`Use ${item}`} className={color === item ? 'selected' : ''} key={item} onClick={() => setColor(item)} style={{ background: item }} type="button" />)}</div>
        <button className="save-profile-button" disabled={!title.trim()} type="submit">{t('addEvent')}</button>
      </form>
    </div>
  );
}
