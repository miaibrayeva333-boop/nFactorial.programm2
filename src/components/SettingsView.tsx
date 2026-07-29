import { useState } from 'react';

type Props = { dark: boolean; onTheme: () => void };
type Language = 'English' | 'Русский' | 'Қазақша';

export function SettingsView({ dark, onTheme }: Props) {
  const [language, setLanguage] = useState<Language>(
    () => (localStorage.getItem('smart-life-language') as Language | null) ?? 'English',
  );
  const [notifications, setNotifications] = useState(
    () => localStorage.getItem('smart-life-notifications') !== 'false',
  );
  const [message, setMessage] = useState('');

  function chooseLanguage(value: Language) {
    setLanguage(value);
    localStorage.setItem('smart-life-language', value);
    setMessage(`Language changed to ${value}`);
  }

  function toggleNotifications() {
    const next = !notifications;
    setNotifications(next);
    localStorage.setItem('smart-life-notifications', String(next));
  }

  return (
    <div className="dashboard settings-view">
      <header className="topbar">
        <div><p className="eyebrow">PERSONALIZE YOUR SPACE</p><h1>Settings</h1></div>
      </header>

      <section className="profile-card">
        <img src="/assets/smart-life-logo.png" alt="Profile" />
        <div><h2>Alex Morgan</h2><p>alex@example.com</p></div>
        <button onClick={() => setMessage('Profile editor opened')} type="button">Edit</button>
      </section>

      <section className="settings-section">
        <h2>Preferences</h2>
        <div className="settings-list">
          <button className="setting-row" onClick={onTheme} type="button">
            <span className="setting-icon">◐</span>
            <span><strong>Appearance</strong><small>{dark ? 'Dark mode' : 'Light mode'}</small></span>
            <i className={dark ? 'switch on' : 'switch'}><b /></i>
          </button>
          <button className="setting-row" onClick={toggleNotifications} type="button">
            <span className="setting-icon">♢</span>
            <span><strong>Notifications</strong><small>Reminders and daily summary</small></span>
            <i className={notifications ? 'switch on' : 'switch'}><b /></i>
          </button>
          <div className="setting-row language-row">
            <span className="setting-icon">文</span>
            <span><strong>Language</strong><small>Choose the app language</small></span>
            <select value={language} onChange={(event) => chooseLanguage(event.target.value as Language)}>
              <option>English</option>
              <option>Русский</option>
              <option>Қазақша</option>
            </select>
          </div>
        </div>
      </section>

      <section className="settings-section">
        <h2>Account</h2>
        <div className="settings-list">
          <button className="setting-row" onClick={() => setMessage('Google Calendar connection opened')} type="button">
            <span className="setting-icon">↻</span><span><strong>Calendar sync</strong><small>Connect Google Calendar</small></span><em>›</em>
          </button>
          <button className="setting-row" onClick={() => setMessage('Your data is stored safely on this device')} type="button">
            <span className="setting-icon">⌾</span><span><strong>Privacy & data</strong><small>Manage your information</small></span><em>›</em>
          </button>
        </div>
      </section>

      <button className="sign-out-button" onClick={() => setMessage('Sign out will be available after authentication is connected')} type="button">Sign out</button>
      {message && <button className="toast" onClick={() => setMessage('')} type="button">{message}<span>×</span></button>}
    </div>
  );
}
