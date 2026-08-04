import { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { getGender, saveGender, type Gender } from '../lib/profile';
import { languages, useI18n, type Language } from '../lib/i18n';

type Props = { dark: boolean; onTheme: () => void; user: User };

export function SettingsView({ dark, onTheme, user }: Props) {
  const [name, setName] = useState(
    () => localStorage.getItem('smart-life-name') ?? 'Alex Morgan',
  );
  const [editingName, setEditingName] = useState(false);
  const { language, setLanguage, t } = useI18n();
  const [notifications, setNotifications] = useState(
    () => localStorage.getItem('smart-life-notifications') !== 'false',
  );
  const [message, setMessage] = useState('');
  const [gender, setGender] = useState<Gender>(() => getGender() ?? 'prefer-not-to-say');

  function chooseLanguage(value: Language) {
    setLanguage(value);
    setMessage(`Language changed to ${value}`);
  }

  function toggleNotifications() {
    const next = !notifications;
    setNotifications(next);
    localStorage.setItem('smart-life-notifications', String(next));
  }

  function chooseGender(value: Gender) {
    setGender(value);
    saveGender(value);
    setMessage(value === 'female'
      ? 'Gender updated. Cycle tracking is now available in Health.'
      : 'Gender updated. Cycle tracking is hidden.');
  }

  return (
    <div className="dashboard settings-view">
      <header className="topbar">
        <div><p className="eyebrow">{t('personalize')}</p><h1>{t('settings')}</h1></div>
      </header>

      <section className="profile-card">
        <img src={typeof user.user_metadata.avatar_url === 'string' ? user.user_metadata.avatar_url : '/assets/smart-life-logo.png'} alt="Profile" />
        <div><h2>{name}</h2><p>{user.email}</p></div>
        <button onClick={() => setEditingName(true)} type="button">{t('edit')}</button>
      </section>

      <section className="settings-section">
        <h2>{t('preferences')}</h2>
        <div className="settings-list">
          <button className="setting-row" onClick={onTheme} type="button">
            <span className="setting-icon">◐</span>
            <span><strong>{t('appearance')}</strong><small>{dark ? t('darkMode') : t('lightMode')}</small></span>
            <i className={dark ? 'switch on' : 'switch'}><b /></i>
          </button>
          <button className="setting-row" onClick={toggleNotifications} type="button">
            <span className="setting-icon">♢</span>
            <span><strong>{t('notifications')}</strong><small>{t('reminders')}</small></span>
            <i className={notifications ? 'switch on' : 'switch'}><b /></i>
          </button>
          <div className="setting-row language-row">
            <span className="setting-icon">文</span>
            <span><strong>{t('language')}</strong><small>{t('chooseLanguage')}</small></span>
            <select value={language} onChange={(event) => chooseLanguage(event.target.value as Language)}>
              {languages.map((option) => <option key={option}>{option}</option>)}
            </select>
          </div>
          <div className="setting-row language-row">
            <span className="setting-icon">♡</span>
            <span><strong>{t('gender')}</strong></span>
            <select value={gender} onChange={(event) => chooseGender(event.target.value as Gender)}>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="nonbinary">Non-binary</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>
        </div>
      </section>

      <section className="settings-section">
        <h2>{t('account')}</h2>
        <div className="settings-list">
          <button className="setting-row" onClick={() => setMessage('Google Calendar connection opened')} type="button">
            <span className="setting-icon">↻</span><span><strong>{t('calendarSync')}</strong><small>{t('connectCalendar')}</small></span><em>›</em>
          </button>
          <button className="setting-row" onClick={() => setMessage('Your data is stored safely on this device')} type="button">
            <span className="setting-icon">⌾</span><span><strong>{t('privacy')}</strong><small>{t('manageInfo')}</small></span><em>›</em>
          </button>
        </div>
      </section>

      <button className="sign-out-button" onClick={() => void supabase.auth.signOut()} type="button">{t('signOut')}</button>
      {editingName && (
        <NameEditor
          currentName={name}
          onClose={() => setEditingName(false)}
          onSave={(newName) => {
            setName(newName);
            localStorage.setItem('smart-life-name', newName);
            setEditingName(false);
            setMessage('Profile name updated');
          }}
        />
      )}
      {message && <button className="toast" onClick={() => setMessage('')} type="button">{message}<span>×</span></button>}
    </div>
  );
}

function NameEditor({ currentName, onClose, onSave }: {
  currentName: string;
  onClose: () => void;
  onSave: (name: string) => void;
}) {
  const [value, setValue] = useState(currentName);
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form
        className="tracker-modal name-editor"
        onMouseDown={(event) => event.stopPropagation()}
        onSubmit={(event) => {
          event.preventDefault();
          if (value.trim()) onSave(value.trim());
        }}
      >
        <button className="modal-close" onClick={onClose} type="button">×</button>
        <div className="tracker-symbol pink">☺</div>
        <h2>Edit profile</h2>
        <p>Choose the name shown across your dashboard.</p>
        <label htmlFor="profile-name">Your name</label>
        <input
          autoFocus
          className="amount-input"
          id="profile-name"
          maxLength={40}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Enter your name"
          value={value}
        />
        <button className="save-profile-button" disabled={!value.trim()} type="submit">Save changes</button>
      </form>
    </div>
  );
}
