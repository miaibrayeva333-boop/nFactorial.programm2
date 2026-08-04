import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export const languages = ['English', 'Русский', 'Қазақша', 'Español', 'Français', 'Deutsch'] as const;
export type Language = typeof languages[number];

const translations = {
  English: {
    leaders: 'Leaders', tasks: 'Tasks', calendar: 'Calendar', dashboard: 'Dashboard', health: 'Health', settings: 'Settings',
    personalize: 'PERSONALIZE YOUR SPACE', edit: 'Edit', preferences: 'Preferences', appearance: 'Appearance', darkMode: 'Dark mode', lightMode: 'Light mode',
    notifications: 'Notifications', reminders: 'Reminders and daily summary', language: 'Language', chooseLanguage: 'Choose the app language', gender: 'Gender', account: 'Account',
    calendarSync: 'Calendar sync', connectCalendar: 'Connect Google Calendar', privacy: 'Privacy & data', manageInfo: 'Manage your information', signOut: 'Sign out',
    yourDay: 'Your day', todaysTasks: "Today's tasks", weeklyProductivity: 'WEEKLY PRODUCTIVITY', updates: 'Updates as you complete items',
    goodMorning: 'Good morning', goodAfternoon: 'Good afternoon', goodEvening: 'Good evening', topPriority: 'TOP PRIORITY', finished: 'FINISHED', today: 'Today', yesterday: 'Yesterday', tomorrow: 'Tomorrow',
  },
  Русский: {
    leaders: 'Лидеры', tasks: 'Задачи', calendar: 'Календарь', dashboard: 'Главная', health: 'Здоровье', settings: 'Настройки',
    personalize: 'НАСТРОЙТЕ ПРИЛОЖЕНИЕ', edit: 'Изменить', preferences: 'Предпочтения', appearance: 'Оформление', darkMode: 'Тёмная тема', lightMode: 'Светлая тема',
    notifications: 'Уведомления', reminders: 'Напоминания и итоги дня', language: 'Язык', chooseLanguage: 'Выберите язык приложения', gender: 'Пол', account: 'Аккаунт',
    calendarSync: 'Синхронизация календаря', connectCalendar: 'Подключить Google Календарь', privacy: 'Данные и приватность', manageInfo: 'Управление информацией', signOut: 'Выйти',
    yourDay: 'Ваш день', todaysTasks: 'Задачи на сегодня', weeklyProductivity: 'ПРОДУКТИВНОСТЬ ЗА НЕДЕЛЮ', updates: 'Обновляется по мере выполнения',
    goodMorning: 'Доброе утро', goodAfternoon: 'Добрый день', goodEvening: 'Добрый вечер', topPriority: 'ГЛАВНАЯ ЗАДАЧА', finished: 'ГОТОВО', today: 'Сегодня', yesterday: 'Вчера', tomorrow: 'Завтра',
  },
  Қазақша: {
    leaders: 'Көшбасшылар', tasks: 'Тапсырмалар', calendar: 'Күнтізбе', dashboard: 'Басты бет', health: 'Денсаулық', settings: 'Баптаулар',
    personalize: 'ҚОЛДАНБАНЫ БАПТАҢЫЗ', edit: 'Өзгерту', preferences: 'Қалаулар', appearance: 'Көрініс', darkMode: 'Қараңғы режим', lightMode: 'Жарық режим',
    notifications: 'Хабарландырулар', reminders: 'Еске салулар және күн қорытындысы', language: 'Тіл', chooseLanguage: 'Қолданба тілін таңдаңыз', gender: 'Жыныс', account: 'Аккаунт',
    calendarSync: 'Күнтізбені синхрондау', connectCalendar: 'Google Күнтізбесін қосу', privacy: 'Құпиялылық және деректер', manageInfo: 'Ақпаратты басқару', signOut: 'Шығу',
    yourDay: 'Сіздің күніңіз', todaysTasks: 'Бүгінгі тапсырмалар', weeklyProductivity: 'АПТАЛЫҚ ӨНІМДІЛІК', updates: 'Орындалған сайын жаңарады',
    goodMorning: 'Қайырлы таң', goodAfternoon: 'Қайырлы күн', goodEvening: 'Қайырлы кеш', topPriority: 'БАСТЫ МАҚСАТ', finished: 'ДАЙЫН', today: 'Бүгін', yesterday: 'Кеше', tomorrow: 'Ертең',
  },
  Español: {
    leaders: 'Líderes', tasks: 'Tareas', calendar: 'Calendario', dashboard: 'Inicio', health: 'Salud', settings: 'Ajustes',
    personalize: 'PERSONALIZA TU ESPACIO', edit: 'Editar', preferences: 'Preferencias', appearance: 'Apariencia', darkMode: 'Modo oscuro', lightMode: 'Modo claro',
    notifications: 'Notificaciones', reminders: 'Recordatorios y resumen diario', language: 'Idioma', chooseLanguage: 'Elige el idioma', gender: 'Género', account: 'Cuenta',
    calendarSync: 'Sincronizar calendario', connectCalendar: 'Conectar Google Calendar', privacy: 'Privacidad y datos', manageInfo: 'Gestionar tu información', signOut: 'Cerrar sesión',
    yourDay: 'Tu día', todaysTasks: 'Tareas de hoy', weeklyProductivity: 'PRODUCTIVIDAD SEMANAL', updates: 'Se actualiza al completar elementos',
    goodMorning: 'Buenos días', goodAfternoon: 'Buenas tardes', goodEvening: 'Buenas noches', topPriority: 'PRIORIDAD PRINCIPAL', finished: 'TERMINADO', today: 'Hoy', yesterday: 'Ayer', tomorrow: 'Mañana',
  },
  Français: {
    leaders: 'Classement', tasks: 'Tâches', calendar: 'Calendrier', dashboard: 'Accueil', health: 'Santé', settings: 'Réglages',
    personalize: 'PERSONNALISEZ VOTRE ESPACE', edit: 'Modifier', preferences: 'Préférences', appearance: 'Apparence', darkMode: 'Mode sombre', lightMode: 'Mode clair',
    notifications: 'Notifications', reminders: 'Rappels et résumé quotidien', language: 'Langue', chooseLanguage: "Choisir la langue de l’app", gender: 'Genre', account: 'Compte',
    calendarSync: 'Synchronisation calendrier', connectCalendar: 'Connecter Google Agenda', privacy: 'Confidentialité et données', manageInfo: 'Gérer vos informations', signOut: 'Se déconnecter',
    yourDay: 'Votre journée', todaysTasks: "Tâches d’aujourd’hui", weeklyProductivity: 'PRODUCTIVITÉ HEBDOMADAIRE', updates: 'Évolue avec vos tâches terminées',
    goodMorning: 'Bonjour', goodAfternoon: 'Bon après-midi', goodEvening: 'Bonsoir', topPriority: 'PRIORITÉ PRINCIPALE', finished: 'TERMINÉ', today: "Aujourd’hui", yesterday: 'Hier', tomorrow: 'Demain',
  },
  Deutsch: {
    leaders: 'Rangliste', tasks: 'Aufgaben', calendar: 'Kalender', dashboard: 'Übersicht', health: 'Gesundheit', settings: 'Einstellungen',
    personalize: 'DEINEN BEREICH ANPASSEN', edit: 'Bearbeiten', preferences: 'Präferenzen', appearance: 'Darstellung', darkMode: 'Dunkler Modus', lightMode: 'Heller Modus',
    notifications: 'Mitteilungen', reminders: 'Erinnerungen und Tagesübersicht', language: 'Sprache', chooseLanguage: 'App-Sprache auswählen', gender: 'Geschlecht', account: 'Konto',
    calendarSync: 'Kalender synchronisieren', connectCalendar: 'Google Kalender verbinden', privacy: 'Datenschutz & Daten', manageInfo: 'Informationen verwalten', signOut: 'Abmelden',
    yourDay: 'Dein Tag', todaysTasks: 'Heutige Aufgaben', weeklyProductivity: 'WÖCHENTLICHE PRODUKTIVITÄT', updates: 'Aktualisiert sich mit erledigten Aufgaben',
    goodMorning: 'Guten Morgen', goodAfternoon: 'Guten Tag', goodEvening: 'Guten Abend', topPriority: 'HÖCHSTE PRIORITÄT', finished: 'ERLEDIGT', today: 'Heute', yesterday: 'Gestern', tomorrow: 'Morgen',
  },
} as const;

type TranslationKey = keyof typeof translations.English;
type I18nContextValue = { language: Language; setLanguage: (value: Language) => void; t: (key: TranslationKey) => string };
const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('smart-life-language');
    return languages.includes(saved as Language) ? saved as Language : 'English';
  });

  function setLanguage(value: Language) {
    localStorage.setItem('smart-life-language', value);
    setLanguageState(value);
  }

  useEffect(() => { document.documentElement.lang = localeForLanguage(language); }, [language]);
  return <I18nContext.Provider value={{ language, setLanguage, t: (key) => translations[language][key] }}>{children}</I18nContext.Provider>;
}

export function localeForLanguage(language: Language) {
  return { English: 'en', Русский: 'ru', Қазақша: 'kk', Español: 'es', Français: 'fr', Deutsch: 'de' }[language];
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used inside I18nProvider');
  return context;
}
