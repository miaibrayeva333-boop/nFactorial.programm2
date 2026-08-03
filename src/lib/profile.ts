export type Gender = 'female' | 'male' | 'nonbinary' | 'prefer-not-to-say';

const genderKey = 'smart-axis-gender';

export function getGender(): Gender | null {
  const value = localStorage.getItem(genderKey);
  return value === 'female' || value === 'male' || value === 'nonbinary' || value === 'prefer-not-to-say'
    ? value
    : null;
}

export function saveGender(gender: Gender) {
  localStorage.setItem(genderKey, gender);
}
