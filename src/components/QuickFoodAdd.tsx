import { FormEvent, lazy, Suspense, useState } from 'react';
import type { ScannedFood } from './BarcodeScanner';

const BarcodeScanner = lazy(() =>
  import('./BarcodeScanner').then((module) => ({ default: module.BarcodeScanner })),
);
const PhotoFoodScanner = lazy(() =>
  import('./PhotoFoodScanner').then((module) => ({ default: module.PhotoFoodScanner })),
);

type Meal = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
const meals: Meal[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

export function QuickFoodAdd({ onAdd }: { onAdd: (food: ScannedFood, meal: Meal) => void }) {
  const [meal, setMeal] = useState<Meal>('Breakfast');
  const [query, setQuery] = useState('');
  const [scanner, setScanner] = useState<'barcode' | 'photo' | null>(null);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  function add(food: ScannedFood) {
    onAdd(food, meal);
    setScanner(null);
    setQuery('');
    setStatus(`${food.name} added to ${meal.toLowerCase()}.`);
  }

  async function search(event: FormEvent) {
    event.preventDefault();
    if (!query.trim()) return;
    setBusy(true);
    setStatus('Finding nutrition information…');
    try {
      const fields = 'product_name,nutriments';
      const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=1&fields=${fields}`;
      const response = await fetch(url);
      const data = await response.json() as {
        products?: Array<{ product_name?: string; nutriments?: Record<string, number> }>;
      };
      const product = data.products?.[0];
      if (!product?.product_name) throw new Error('Food not found. Try a more specific name.');
      const nutrients = product.nutriments ?? {};
      add({
        name: `${product.product_name} (100 g)`,
        calories: Math.round(nutrients['energy-kcal_100g'] ?? 0),
        protein: round(nutrients.proteins_100g ?? 0),
        carbs: round(nutrients.carbohydrates_100g ?? 0),
        fat: round(nutrients.fat_100g ?? 0),
      });
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not reach the food database.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="quick-food-add">
      <header><div><span>QUICK ADD</span><h2>Log food automatically</h2></div>
        <select aria-label="Meal" onChange={(event) => setMeal(event.target.value as Meal)} value={meal}>{meals.map((item) => <option key={item}>{item}</option>)}</select>
      </header>
      <form onSubmit={search}><input onChange={(event) => setQuery(event.target.value)} placeholder="Type a food name, e.g. banana" value={query} /><button disabled={busy || !query.trim()} type="submit">{busy ? 'Finding…' : 'Add'}</button></form>
      <div className="quick-scan-actions">
        <button onClick={() => setScanner('barcode')} type="button"><span>▥</span> Scan barcode</button>
        <button onClick={() => setScanner('photo')} type="button"><span>✦</span> Scan meal photo</button>
      </div>
      {status && <p>{status}</p>}
      {scanner === 'barcode' && <Suspense fallback={null}><BarcodeScanner onClose={() => setScanner(null)} onFound={add} /></Suspense>}
      {scanner === 'photo' && <Suspense fallback={null}><PhotoFoodScanner onClose={() => setScanner(null)} onFound={add} /></Suspense>}
    </section>
  );
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}
