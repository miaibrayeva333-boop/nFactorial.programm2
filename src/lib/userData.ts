const currentUserKey = 'smart-axis-current-user';
const preservedKeys = new Set(['smart-life-language', 'smart-axis-gender']);

export function prepareLocalDataForUser(userId: string, createdAt: string) {
  const previousUserId = localStorage.getItem(currentUserKey);
  const accountAge = Date.now() - new Date(createdAt).getTime();
  const isBrandNewAccount = !previousUserId && accountAge >= 0 && accountAge < 10 * 60 * 1000;
  if ((previousUserId && previousUserId !== userId) || isBrandNewAccount) clearLocalUserData();
  localStorage.setItem(currentUserKey, userId);
}

function clearLocalUserData() {
  const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index))
    .filter((key): key is string => Boolean(key));
  keys.forEach((key) => {
    const belongsToApp = key.startsWith('smart-life-') || key.startsWith('smart-axis-');
    if (belongsToApp && !preservedKeys.has(key) && key !== currentUserKey) localStorage.removeItem(key);
  });
}
