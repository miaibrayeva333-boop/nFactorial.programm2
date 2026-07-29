import { BrowserMultiFormatReader, type IScannerControls } from '@zxing/browser';
import { FormEvent, useEffect, useRef, useState } from 'react';

export type ScannedFood = {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

type Props = { onClose: () => void; onFound: (food: ScannedFood) => void };

export function BarcodeScanner({ onClose, onFound }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls>();
  const foundRef = useRef(false);
  const [manualCode, setManualCode] = useState('');
  const [status, setStatus] = useState('Point the camera at a food barcode');

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    let active = true;
    void reader.decodeFromVideoDevice(undefined, videoRef.current!, (result) => {
      if (result && active && !foundRef.current) {
        foundRef.current = true;
        controlsRef.current?.stop();
        void lookup(result.getText());
      }
    }).then((controls) => {
      controlsRef.current = controls;
    }).catch(() => setStatus('Camera unavailable—enter the barcode below.'));
    return () => {
      active = false;
      controlsRef.current?.stop();
    };
  }, []);

  async function lookup(code: string) {
    const clean = code.replace(/\D/g, '');
    if (!clean) return;
    setStatus('Looking up product…');
    try {
      const fields = 'product_name,nutriments,serving_quantity,serving_size';
      const response = await fetch(`https://world.openfoodfacts.org/api/v3/product/${clean}.json?fields=${fields}`);
      const data = await response.json() as {
        status?: string;
        product?: { product_name?: string; serving_quantity?: number; nutriments?: Record<string, number> };
      };
      if (!response.ok || !data.product?.product_name) {
        setStatus('Product not found. You can add it manually.');
        foundRef.current = false;
        return;
      }
      const nutrients = data.product.nutriments ?? {};
      const serving = data.product.serving_quantity ? data.product.serving_quantity / 100 : 1;
      onFound({
        name: data.product.product_name,
        calories: Math.round((nutrients['energy-kcal_100g'] ?? 0) * serving),
        protein: round((nutrients.proteins_100g ?? 0) * serving),
        carbs: round((nutrients.carbohydrates_100g ?? 0) * serving),
        fat: round((nutrients.fat_100g ?? 0) * serving),
      });
    } catch {
      setStatus('Could not reach the food database. Try manual entry.');
      foundRef.current = false;
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    foundRef.current = true;
    controlsRef.current?.stop();
    void lookup(manualCode);
  }

  return (
    <div className="modal-backdrop barcode-backdrop" onMouseDown={onClose}>
      <section className="tracker-modal barcode-scanner" onMouseDown={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} type="button">×</button>
        <h2>Scan food barcode</h2><p>{status}</p>
        <div className="scanner-window"><video muted playsInline ref={videoRef} /><i /><span /></div>
        <form className="barcode-manual" onSubmit={submit}>
          <input inputMode="numeric" onChange={(event) => setManualCode(event.target.value)} placeholder="Enter barcode number" value={manualCode} />
          <button disabled={!manualCode.trim()} type="submit">Look up</button>
        </form>
        <small>Product data is supplied by Open Food Facts and may be incomplete. Check the package label.</small>
      </section>
    </div>
  );
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}
