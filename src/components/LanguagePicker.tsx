import { languages, useI18n } from '../lib/i18n';

export function LanguagePicker() {
  const { language, setLanguage } = useI18n();
  return (
    <div className="welcome-language" aria-label="Choose language">
      {languages.map((option) => <button className={language === option ? 'selected' : ''} key={option} onClick={() => setLanguage(option)} type="button">{option}</button>)}
    </div>
  );
}
