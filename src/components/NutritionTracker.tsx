import { FormEvent, useState } from 'react';

type Meal = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
type FoodEntry = {
  id: number;
  date: string;
  meal: Meal;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

const meals: Meal[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

export function NutritionTracker() {
  const today = new Date().toISOString().slice(0, 10);
  const [target, setTarget] = useState(() => Number(localStorage.getItem('smart-life-calorie-target') ?? 2000));
  const [entries, setEntries] = useState<FoodEntry[]>(() => {
    const saved = localStorage.getItem('smart-life-foods');
    return saved ? JSON.parse(saved) as FoodEntry[] : [];
  });
  const [editorOpen, setEditorOpen] = useState(false);
  const todaysEntries = entries.filter((entry) => entry.date === today);
  const totals = todaysEntries.reduce((sum, entry) => ({
    calories: sum.calories + entry.calories,
    protein: sum.protein + entry.protein,
    carbs: sum.carbs + entry.carbs,
    fat: sum.fat + entry.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  const remaining = target - totals.calories;
  const calorieProgress = Math.min(100, totals.calories / target * 100);

  function save(next: FoodEntry[]) {
    setEntries(next);
    localStorage.setItem('smart-life-foods', JSON.stringify(next));
  }
  function updateTarget(value: number) {
    const safe = Math.max(500, Math.min(6000, value || 2000));
    setTarget(safe);
    localStorage.setItem('smart-life-calorie-target', String(safe));
  }

  return (
    <div className="dashboard nutrition-view">
      <header className="topbar nutrition-header">
        <div><p className="eyebrow">DAILY FOOD DIARY</p><h1>Nutrition</h1></div>
        <button className="add-button" onClick={() => setEditorOpen(true)} type="button">＋</button>
      </header>
      <section className="calorie-summary">
        <div className="calorie-ring" style={{ background: `conic-gradient(#36ad82 ${calorieProgress}%, var(--line) 0)` }}>
          <div><strong>{Math.abs(remaining)}</strong><span>{remaining >= 0 ? 'remaining' : 'over target'}</span></div>
        </div>
        <div className="calorie-equation">
          <div><strong>{target}</strong><span>Target</span></div><b>−</b>
          <div><strong>{totals.calories}</strong><span>Food</span></div><b>=</b>
          <div><strong>{remaining}</strong><span>Left</span></div>
        </div>
      </section>
      <section className="macro-grid">
        <Macro label="Protein" value={totals.protein} target={120} color="#6259df" />
        <Macro label="Carbs" value={totals.carbs} target={250} color="#e9983f" />
        <Macro label="Fat" value={totals.fat} target={70} color="#d95688" />
      </section>
      <section className="calorie-target-setting">
        <label>Daily calorie target<input min="500" max="6000" onBlur={(event) => updateTarget(Number(event.target.value))} defaultValue={target} type="number" /></label>
        <small>This is a personal tracking target, not a medical recommendation.</small>
      </section>
      <div className="meal-list">
        {meals.map((meal) => {
          const foods = todaysEntries.filter((entry) => entry.meal === meal);
          const calories = foods.reduce((sum, entry) => sum + entry.calories, 0);
          return (
            <section className="meal-card" key={meal}>
              <header><div><h2>{meal}</h2><span>{calories} kcal</span></div><button onClick={() => setEditorOpen(true)} type="button">＋</button></header>
              {foods.length ? foods.map((food) => (
                <article className="food-row" key={food.id}>
                  <div><strong>{food.name}</strong><span>{food.protein}g P · {food.carbs}g C · {food.fat}g F</span></div>
                  <b>{food.calories}</b>
                  <button aria-label={`Remove ${food.name}`} onClick={() => save(entries.filter((entry) => entry.id !== food.id))} type="button">×</button>
                </article>
              )) : <button className="empty-meal" onClick={() => setEditorOpen(true)} type="button">Add food to {meal.toLowerCase()}</button>}
            </section>
          );
        })}
      </div>
      <p className="nutrition-note">Nutrition values are estimates. Individual calorie needs vary; talk with a qualified health professional for personalized guidance.</p>
      {editorOpen && <FoodEditor onClose={() => setEditorOpen(false)} onSave={(entry) => { save([...entries, entry]); setEditorOpen(false); }} />}
    </div>
  );
}

function Macro({ label, value, target, color }: { label: string; value: number; target: number; color: string }) {
  return <article><div><strong>{value}g</strong><span>/ {target}g</span></div><p>{label}</p><i><b style={{ width: `${Math.min(100, value / target * 100)}%`, background: color }} /></i></article>;
}

function FoodEditor({ onClose, onSave }: { onClose: () => void; onSave: (entry: FoodEntry) => void }) {
  const [meal, setMeal] = useState<Meal>('Breakfast');
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('0');
  const [carbs, setCarbs] = useState('0');
  const [fat, setFat] = useState('0');
  function submit(event: FormEvent) {
    event.preventDefault();
    if (name.trim() && Number(calories) >= 0) onSave({
      id: Date.now(), date: new Date().toISOString().slice(0, 10), meal, name: name.trim(),
      calories: Number(calories), protein: Number(protein), carbs: Number(carbs), fat: Number(fat),
    });
  }
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form className="tracker-modal food-editor" onMouseDown={(event) => event.stopPropagation()} onSubmit={submit}>
        <button className="modal-close" onClick={onClose} type="button">×</button>
        <div className="tracker-symbol orange">◉</div><h2>Add food</h2><p>Use the nutrition label or a trusted food database.</p>
        <label>Meal<select value={meal} onChange={(event) => setMeal(event.target.value as Meal)}>{meals.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Food name<input autoFocus className="amount-input" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Greek yogurt" /></label>
        <label>Calories<input className="amount-input" min="0" value={calories} onChange={(event) => setCalories(event.target.value)} type="number" /></label>
        <div className="food-macros">
          <label>Protein (g)<input min="0" value={protein} onChange={(event) => setProtein(event.target.value)} type="number" /></label>
          <label>Carbs (g)<input min="0" value={carbs} onChange={(event) => setCarbs(event.target.value)} type="number" /></label>
          <label>Fat (g)<input min="0" value={fat} onChange={(event) => setFat(event.target.value)} type="number" /></label>
        </div>
        <button className="save-profile-button" disabled={!name.trim() || calories === ''} type="submit">Add to diary</button>
      </form>
    </div>
  );
}
