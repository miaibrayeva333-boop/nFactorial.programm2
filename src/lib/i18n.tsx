import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Language = 'English' | 'Русский' | 'Қазақша';

const translations = {
  English: {
    leaders: 'Leaders', tasks: 'Tasks', calendar: 'Calendar', dashboard: 'Dashboard', health: 'Health', settings: 'Settings',
    personalize: 'PERSONALIZE YOUR SPACE', edit: 'Edit', preferences: 'Preferences', appearance: 'Appearance', darkMode: 'Dark mode', lightMode: 'Light mode',
    notifications: 'Notifications', reminders: 'Reminders and daily summary', language: 'Language', chooseLanguage: 'Choose the app language', gender: 'Gender', account: 'Account',
    calendarSync: 'Calendar sync', connectCalendar: 'Connect Google Calendar', privacy: 'Privacy & data', manageInfo: 'Manage your information', signOut: 'Sign out',
    yourDay: 'Your day', todaysTasks: "Today's tasks", weeklyProductivity: 'WEEKLY PRODUCTIVITY', updates: 'Updates as you complete items',
    goodMorning: 'Good morning', goodAfternoon: 'Good afternoon', goodEvening: 'Good evening', topPriority: "TODAY'S TOP PRIORITY", finished: 'FINISHED',
  },
  Русский: {
    leaders: 'Лидеры', tasks: 'Задачи', calendar: 'Календарь', dashboard: 'Главная', health: 'Здоровье', settings: 'Настройки',
    personalize: 'НАСТРОЙТЕ ПРИЛОЖЕНИЕ', edit: 'Изменить', preferences: 'Предпочтения', appearance: 'Оформление', darkMode: 'Тёмная тема', lightMode: 'Светлая тема',
    notifications: 'Уведомления', reminders: 'Напоминания и итоги дня', language: 'Язык', chooseLanguage: 'Выберите язык приложения', gender: 'Пол', account: 'Аккаунт',
    calendarSync: 'Синхронизация календаря', connectCalendar: 'Подключить Google Календарь', privacy: 'Данные и приватность', manageInfo: 'Управление информацией', signOut: 'Выйти',
    yourDay: 'Ваш день', todaysTasks: 'Задачи на сегодня', weeklyProductivity: 'ПРОДУКТИВНОСТЬ ЗА НЕДЕЛЮ', updates: 'Обновляется по мере выполнения',
    goodMorning: 'Доброе утро', goodAfternoon: 'Добрый день', goodEvening: 'Добрый вечер', topPriority: 'ГЛАВНАЯ ЗАДАЧА ДНЯ', finished: 'ГОТОВО',
  },
  Қазақша: {
    leaders: 'Көшбасшылар', tasks: 'Тапсырмалар', calendar: 'Күнтізбе', dashboard: 'Басты бет', health: 'Денсаулық', settings: 'Баптаулар',
    personalize: 'ҚОЛДАНБАНЫ БАПТАҢЫЗ', edit: 'Өзгерту', preferences: 'Қалаулар', appearance: 'Көрініс', darkMode: 'Қараңғы режим', lightMode: 'Жарық режим',
    notifications: 'Хабарландырулар', reminders: 'Еске салулар және күн қорытындысы', language: 'Тіл', chooseLanguage: 'Қолданба тілін таңдаңыз', gender: 'Жыныс', account: 'Аккаунт',
    calendarSync: 'Күнтізбені синхрондау', connectCalendar: 'Google Күнтізбесін қосу', privacy: 'Құпиялылық және деректер', manageInfo: 'Ақпаратты басқару', signOut: 'Шығу',
    yourDay: 'Сіздің күніңіз', todaysTasks: 'Бүгінгі тапсырмалар', weeklyProductivity: 'АПТАЛЫҚ ӨНІМДІЛІК', updates: 'Орындалған сайын жаңарады',
    goodMorning: 'Қайырлы таң', goodAfternoon: 'Қайырлы күн', goodEvening: 'Қайырлы кеш', topPriority: 'БҮГІНГІ БАСТЫ МАҚСАТ', finished: 'ДАЙЫН',
  },
} as const;

type TranslationKey = keyof typeof translations.English;
type I18nContextValue = { language: Language; setLanguage: (value: Language) => void; t: (key: TranslationKey) => string };
const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('smart-life-language');
    return saved === 'Русский' || saved === 'Қазақша' ? saved : 'English';
  });

  function setLanguage(value: Language) {
    localStorage.setItem('smart-life-language', value);
    setLanguageState(value);
  }

  useEffect(() => { document.documentElement.lang = language === 'Русский' ? 'ru' : language === 'Қазақша' ? 'kk' : 'en'; }, [language]);
  return <I18nContext.Provider value={{ language, setLanguage, t: (key) => translations[language][key] }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used inside I18nProvider');
  return context;
}
