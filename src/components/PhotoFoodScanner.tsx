import { ChangeEvent, useRef, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type { ScannedFood } from './BarcodeScanner';

type Props = { onClose: () => void; onFound: (food: ScannedFood) => void };

const prompt = `Identify the complete meal in this photo and estimate the visible portion.
Return ONLY valid JSON with this exact shape:
{"name":"short meal name","calories":0,"protein":0,"carbs":0,"fat":0}
Numbers describe the entire visible serving. Use grams for macros and kcal for calories.
Include sauces and drinks when visible. If this is not food, use "No food detected" as the name.`;

export function PhotoFoodScanner({ onClose, onFound }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState('');
  const [status, setStatus] = useState('Take a clear photo showing the whole meal.');
  const [busy, setBusy] = useState(false);

  async function choosePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return setStatus('Please choose an image file.');
    setBusy(true);
    setStatus('Estimating your meal…');
    try {
      const resized = await resizeImage(file);
      setPreview(resized.url);
      if (!isSupabaseConfigured) throw new Error('AI is not configured yet.');
      const { data, error } = await supabase.functions.invoke('ai', {
        body: {
          prompt,
          system: 'You are a careful nutrition estimation assistant. Never claim medical accuracy.',
          image: resized.base64,
          imageMimeType: 'image/jpeg',
        },
      });
      if (error) throw error;
      const estimate = parseEstimate((data as { text?: unknown })?.text);
      if (estimate.name === 'No food detected') throw new Error('No food was detected. Try a clearer photo.');
      onFound(estimate);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not analyze this photo. Try again.');
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop barcode-backdrop" onMouseDown={onClose}>
      <section className="tracker-modal photo-food-scanner" onMouseDown={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} type="button">×</button>
        <div className="photo-scan-icon">✦</div><h2>Scan your meal</h2><p>{status}</p>
        {preview
          ? <img className="meal-photo-preview" src={preview} alt="Meal selected for analysis" />
          : <div className="meal-photo-placeholder"><span>📷</span><strong>Center the full plate</strong><small>Good lighting improves the estimate</small></div>}
        <input accept="image/*" capture="environment" hidden onChange={choosePhoto} ref={inputRef} type="file" />
        <button className="save-profile-button" disabled={busy} onClick={() => inputRef.current?.click()} type="button">
          {busy ? 'Analyzing meal…' : preview ? 'Try another photo' : 'Take or choose photo'}
        </button>
        <small>AI estimates can be wrong, especially for oils, sauces, and portion sizes. Review the values before saving.</small>
      </section>
    </div>
  );
}

function parseEstimate(value: unknown): ScannedFood {
  if (typeof value !== 'string') throw new Error('AI returned no estimate.');
  const match = value.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('AI returned an unreadable estimate.');
  const raw = JSON.parse(match[0]) as Partial<ScannedFood>;
  if (!raw.name || [raw.calories, raw.protein, raw.carbs, raw.fat].some((item) => typeof item !== 'number')) {
    throw new Error('AI returned an incomplete estimate.');
  }
  return {
    name: raw.name, calories: Math.max(0, Math.round(raw.calories ?? 0)),
    protein: round(raw.protein ?? 0), carbs: round(raw.carbs ?? 0), fat: round(raw.fat ?? 0),
  };
}

async function resizeImage(file: File) {
  const source = await createImageBitmap(file);
  const scale = Math.min(1, 1280 / Math.max(source.width, source.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(source.width * scale);
  canvas.height = Math.round(source.height * scale);
  canvas.getContext('2d')?.drawImage(source, 0, 0, canvas.width, canvas.height);
  source.close();
  const url = canvas.toDataURL('image/jpeg', 0.78);
  return { url, base64: url.split(',')[1] };
}

function round(value: number) {
  return Math.round(Math.max(0, value) * 10) / 10;
}
