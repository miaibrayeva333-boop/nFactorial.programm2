type Props = {
  date: string;
  label: string;
  onChange: (date: Date) => void;
  onMove: (offset: number) => void;
};

export function DashboardDatePicker({ date, label, onChange, onMove }: Props) {
  return (
    <div className="dashboard-date-picker">
      <button aria-label="Previous day" onClick={() => onMove(-1)} type="button">‹</button>
      <input aria-label="Dashboard date" onChange={(event) => onChange(new Date(`${event.target.value}T12:00:00`))} type="date" value={date} />
      <button aria-label="Next day" onClick={() => onMove(1)} type="button">›</button>
      <button aria-label="Return to today" onClick={() => onChange(new Date())} type="button">{label}</button>
    </div>
  );
}
