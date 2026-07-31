import { FormEvent, lazy, Suspense, useEffect, useState } from 'react';
import type { ScannedFood } from './BarcodeScanner';

const BarcodeScanner = lazy(() =>
  import('./BarcodeScanner').then((module) => ({ default: module.BarcodeScanner })),
);
const PhotoFoodScanner = lazy(() =>
  import('./PhotoFoodScanner').then((module) => ({ default: module.PhotoFoodScanner })),
);

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
  const [region, setRegion] = useState(() => localStorage.getItem('smart-life-food-region') ?? 'Detecting…');
  const todaysEntries = entries.filter((entry) => entry.date === today);
  const totals = todaysEntries.reduce((sum, entry) => ({
    calories: sum.calories + entry.calories,
    protein: sum.protein + entry.protein,
    carbs: sum.carbs + entry.carbs,
    fat: sum.fat + entry.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  const remaining = target - totals.calories;
  const calorieProgress = Math.min(100, totals.calories / target * 100);
  const consumedProgress = Math.min(100, totals.calories / target * 100);

  useEffect(() => {
    if (region !== 'Detecting…') return;
    const fallback = () => {
      const localeRegion = navigator.language.split('-')[1]?.toUpperCase() ?? 'WORLD';
      setRegion(localeRegion);
      localStorage.setItem('smart-life-food-region', localeRegion);
    };
    if (!navigator.geolocation) return fallback();
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coords.latitude}&longitude=${coords.longitude}&localityLanguage=en`;
        const response = await fetch(url);
        const data = await response.json() as { countryCode?: string };
        const detected = data.countryCode?.toUpperCase() ?? 'WORLD';
        setRegion(detected);
        localStorage.setItem('smart-life-food-region', detected);
      } catch {
        fallback();
      }
    }, fallback, { maximumAge: 86400000, timeout: 8000 });
  }, [region]);

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
        <div className="nutrition-header-actions">
          <select aria-label="Food region" onChange={(event) => { setRegion(event.target.value); localStorage.setItem('smart-life-food-region', event.target.value); }} value={region}>
            <option value="WORLD">Worldwide</option><option value="US">US</option><option value="CA">Canada</option>
            <option value="GB">UK</option><option value="EU">Europe</option><option value="KZ">Kazakhstan</option>
            <option value="AU">Australia</option><option value="IN">India</option><option value="JP">Japan</option>
            {region === 'Detecting…' && <option>Detecting…</option>}
            {!['Detecting…', 'WORLD', 'US', 'CA', 'GB', 'EU', 'KZ', 'AU', 'IN', 'JP'].includes(region) &&
              <option value={region}>{region}</option>}
          </select>
          <button className="add-button" onClick={() => setEditorOpen(true)} type="button">＋</button>
        </div>
      </header>
      <section className="nutrition-overview">
        <header><div><span>TODAY</span><h2>Energy balance</h2></div><small>{calorieProgress.toFixed(0)}% of daily target</small></header>
        <div className="energy-rings">
          <EnergyRing label="Consumed" value={totals.calories} progress={consumedProgress} color="#ef9b3f" />
          <EnergyRing label={remaining >= 0 ? 'Remaining' : 'Over target'} value={Math.abs(remaining)} progress={Math.max(0, 100 - consumedProgress)} color={remaining >= 0 ? '#36ad82' : '#e95c6d'} featured />
          <EnergyRing label="Daily target" value={target} progress={100} color="#6259df" />
        </div>
      </section>
      <div className="nutrient-heading"><div><span>MACRONUTRIENTS</span><h2>Daily targets</h2></div><small>Consumed / target</small></div>
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

function EnergyRing({ label, value, progress, color, featured = false }: {
  label: string; value: number; progress: number; color: string; featured?: boolean;
}) {
  return (
    <article className={featured ? 'energy-ring featured' : 'energy-ring'}>
      <div style={{ background: `conic-gradient(${color} ${progress}%, var(--line) 0)` }}><span><strong>{value}</strong><small>kcal</small></span></div>
      <p>{label}</p>
    </article>
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
  const [scannerOpen, setScannerOpen] = useState(false);
  const [photoScannerOpen, setPhotoScannerOpen] = useState(false);
  function applyScannedFood(food: ScannedFood) {
    setName(food.name); setCalories(String(food.calories)); setProtein(String(food.protein));
    setCarbs(String(food.carbs)); setFat(String(food.fat)); setScannerOpen(false);
  }
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
        <div className="food-scan-actions">
          <button className="scan-photo-button" onClick={() => setPhotoScannerOpen(true)} type="button"><span>✦</span> Scan meal photo</button>
          <button className="scan-barcode-button" onClick={() => setScannerOpen(true)} type="button"><span>▥</span> Scan barcode</button>
        </div>
        <label>Meal<select value={meal} onChange={(event) => setMeal(event.target.value as Meal)}>{meals.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Food name<input autoFocus className="amount-input" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Greek yogurt" /></label>
        <label>Calories<input className="amount-input" min="0" value={calories} onChange={(event) => setCalories(event.target.value)} type="number" /></label>
        <div className="food-macros">
          <label>Protein (g)<input min="0" value={protein} onChange={(event) => setProtein(event.target.value)} type="number" /></label>
          <label>Carbs (g)<input min="0" value={carbs} onChange={(event) => setCarbs(event.target.value)} type="number" /></label>
          <label>Fat (g)<input min="0" value={fat} onChange={(event) => setFat(event.target.value)} type="number" /></label>
        </div>
        <button className="save-profile-button" disabled={!name.trim() || calories === ''} type="submit">Add to diary</button>
        {scannerOpen && (
          <Suspense fallback={<div className="nutrition-scanner-loading">Opening camera…</div>}>
            <BarcodeScanner onClose={() => setScannerOpen(false)} onFound={applyScannedFood} />
          </Suspense>
        )}
        {photoScannerOpen && (
          <Suspense fallback={<div className="nutrition-scanner-loading">Opening photo scanner…</div>}>
            <PhotoFoodScanner onClose={() => setPhotoScannerOpen(false)} onFound={applyScannedFood} />
          </Suspense>
        )}
      </form>
    </div>
  );
}
