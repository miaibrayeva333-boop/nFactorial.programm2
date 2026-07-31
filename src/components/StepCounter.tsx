import { useEffect, useRef, useState } from 'react';

type MotionPermission = { requestPermission?: () => Promise<'granted' | 'denied'> };
type StepRecord = { date: string; steps: number };

const storageKey = 'smart-axis-steps';
const today = () => new Date().toISOString().slice(0, 10);

function loadSteps(): StepRecord {
  const saved = localStorage.getItem(storageKey);
  if (!saved) return { date: today(), steps: 0 };
  const record = JSON.parse(saved) as StepRecord;
  return record.date === today() ? record : { date: today(), steps: 0 };
}

export function StepCounter() {
  const [record, setRecord] = useState(loadSteps);
  const [active, setActive] = useState(false);
  const [message, setMessage] = useState('Tap Start on your phone to count movement.');
  const lastStep = useRef(0);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(record));
  }, [record]);

  useEffect(() => {
    if (!active) return;
    const onMotion = (event: DeviceMotionEvent) => {
      const force = event.accelerationIncludingGravity;
      if (!force) return;
      const magnitude = Math.sqrt((force.x ?? 0) ** 2 + (force.y ?? 0) ** 2 + (force.z ?? 0) ** 2);
      const now = Date.now();
      if (magnitude > 12.2 && now - lastStep.current > 360) {
        lastStep.current = now;
        setRecord((current) => ({ date: today(), steps: current.date === today() ? current.steps + 1 : 1 }));
      }
    };
    window.addEventListener('devicemotion', onMotion);
    return () => window.removeEventListener('devicemotion', onMotion);
  }, [active]);

  async function start() {
    const motion = DeviceMotionEvent as unknown as MotionPermission;
    if (motion.requestPermission) {
      const permission = await motion.requestPermission();
      if (permission !== 'granted') {
        setMessage('Motion access was not allowed.');
        return;
      }
    }
    if (!('DeviceMotionEvent' in window)) {
      setMessage('This device or browser does not provide motion data.');
      return;
    }
    setActive(true);
    setMessage('Counting while Smart Axis is open.');
  }

  const progress = Math.min(100, record.steps / 80);
  return (
    <article className="step-counter">
      <div className="step-counter__top"><span>◒</span><div><small>TODAY’S MOVEMENT</small><h2>{record.steps.toLocaleString()} steps</h2></div></div>
      <div className="step-progress"><i style={{ width: `${progress}%` }} /></div>
      <div className="step-counter__footer">
        <small>{message}</small>
        <button onClick={() => active ? setActive(false) : void start()} type="button">{active ? 'Pause' : 'Start'}</button>
      </div>
    </article>
  );
}
