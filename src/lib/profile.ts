export type Gender = 'female' | 'male' | 'nonbinary' | 'prefer-not-to-say';

const genderKey = 'smart-axis-gender';
const introKey = 'smart-axis-intro-complete';

export function getGender(): Gender | null {
  const value = localStorage.getItem(genderKey);
  return value === 'female' || value === 'male' || value === 'nonbinary' || value === 'prefer-not-to-say'
    ? value
    : null;
}

export function saveGender(gender: Gender) {
  localStorage.setItem(genderKey, gender);
}

export function hasCompletedIntro() {
  return localStorage.getItem(introKey) === 'true';
}

export function completeIntro() {
  localStorage.setItem(introKey, 'true');
}
