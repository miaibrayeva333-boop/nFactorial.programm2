import { useI18n } from '../lib/i18n';

type Props = {
  date: string;
  onChange: (date: Date) => void;
  onMove: (offset: number) => void;
};

export function DashboardDatePicker({ date, onChange, onMove }: Props) {
  const { t } = useI18n();
  return (
    <div className="dashboard-date-picker">
      <button aria-label="Previous day" onClick={() => onMove(-1)} type="button">‹</button>
      <input aria-label="Dashboard date" onChange={(event) => onChange(new Date(`${event.target.value}T12:00:00`))} type="date" value={date} />
      <button aria-label="Next day" onClick={() => onMove(1)} type="button">›</button>
      <button onClick={() => onChange(new Date())} type="button">{t('today')}</button>
    </div>
  );
}
