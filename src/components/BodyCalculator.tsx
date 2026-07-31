import { FormEvent, useState } from 'react';

type Activity = 'sedentary' | 'low' | 'active' | 'very';
type CalculationProfile = 'female' | 'male';
type Result = { bmi: number; calories: number };

const activityLabels: Record<Activity, string> = {
  sedentary: 'Mostly sitting',
  low: 'Lightly active',
  active: 'Active',
  very: 'Very active',
};

const activityFactors: Record<CalculationProfile, Record<Activity, number>> = {
  male: { sedentary: 1, low: 1.13, active: 1.26, very: 1.42 },
  female: { sedentary: 1, low: 1.16, active: 1.31, very: 1.56 },
};

export function BodyCalculator({ onUseTarget }: { onUseTarget: (calories: number) => void }) {
  const [age, setAge] = useState('15');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [profile, setProfile] = useState<CalculationProfile>('female');
  const [activity, setActivity] = useState<Activity>('low');
  const [result, setResult] = useState<Result | null>(null);

  function calculate(event: FormEvent) {
    event.preventDefault();
    const years = Number(age);
    const heightCm = Number(height);
    const weightKg = Number(weight);
    if (years < 9 || years > 18 || heightCm <= 0 || weightKg <= 0) return;
    const heightM = heightCm / 100;
    const pa = activityFactors[profile][activity];
    const calories = profile === 'male'
      ? 88.5 - 61.9 * years + pa * (26.7 * weightKg + 903 * heightM) + 25
      : 135.3 - 30.8 * years + pa * (10 * weightKg + 934 * heightM) + 25;
    setResult({
      bmi: weightKg / (heightM * heightM),
      calories: Math.round(calories / 10) * 10,
    });
  }

  return (
    <section className="body-calculator">
      <header><div><span>HEALTH CALCULATOR</span><h2>BMI & daily energy</h2></div><small>For ages 9–18</small></header>
      <form onSubmit={calculate}>
        <div className="calculator-fields">
          <label>Age<input max="18" min="9" onChange={(event) => setAge(event.target.value)} type="number" value={age} /></label>
          <label>Height (cm)<input min="80" onChange={(event) => setHeight(event.target.value)} placeholder="165" type="number" value={height} /></label>
          <label>Weight (kg)<input min="20" onChange={(event) => setWeight(event.target.value)} placeholder="55" type="number" value={weight} /></label>
        </div>
        <div className="calculator-fields calculator-options">
          <label>Calculation profile<select onChange={(event) => setProfile(event.target.value as CalculationProfile)} value={profile}><option value="female">Female</option><option value="male">Male</option></select></label>
          <label>Activity<select onChange={(event) => setActivity(event.target.value as Activity)} value={activity}>{Object.entries(activityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        </div>
        <button className="calculator-submit" disabled={!height || !weight} type="submit">Calculate</button>
      </form>
      {result && (
        <div className="calculator-result">
          <article><small>YOUR BMI NUMBER</small><strong>{result.bmi.toFixed(1)}</strong><span>kg/m²</span></article>
          <article><small>ESTIMATED DAILY ENERGY</small><strong>{result.calories.toLocaleString()}</strong><span>kcal/day</span></article>
          <button onClick={() => onUseTarget(result.calories)} type="button">Use as calorie target</button>
        </div>
      )}
      <p>For teens, BMI must be interpreted by age and sex percentile—not adult BMI categories. Energy needs are estimates and can vary during growth.</p>
    </section>
  );
}
