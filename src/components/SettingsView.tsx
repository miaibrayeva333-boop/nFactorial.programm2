import { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type Props = { dark: boolean; onTheme: () => void; user: User };
type Language = 'English' | 'Русский' | 'Қазақша';

export function SettingsView({ dark, onTheme, user }: Props) {
  const [name, setName] = useState(
    () => localStorage.getItem('smart-life-name') ?? 'Alex Morgan',
  );
  const [editingName, setEditingName] = useState(false);
  const [language, setLanguage] = useState<Language>(
    () => (localStorage.getItem('smart-life-language') as Language | null) ?? 'English',
  );
  const [notifications, setNotifications] = useState(
    () => localStorage.getItem('smart-life-notifications') !== 'false',
  );
  const [message, setMessage] = useState('');
  const [financeOpen, setFinanceOpen] = useState(false);

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
        <img src={typeof user.user_metadata.avatar_url === 'string' ? user.user_metadata.avatar_url : '/assets/smart-life-logo.png'} alt="Profile" />
        <div><h2>{name}</h2><p>{user.email}</p></div>
        <button onClick={() => setEditingName(true)} type="button">Edit</button>
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
          <button className="setting-row" onClick={() => setFinanceOpen(true)} type="button">
            <span className="setting-icon">▣</span>
            <span><strong>Connected finances</strong><small>Bank accounts and credit cards</small></span>
            <em>›</em>
          </button>
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

      <button className="sign-out-button" onClick={() => void supabase.auth.signOut()} type="button">Sign out</button>
      {financeOpen && <FinanceConnection onClose={() => setFinanceOpen(false)} />}
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

function FinanceConnection({ onClose }: { onClose: () => void }) {
  const [notice, setNotice] = useState(false);
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section className="tracker-modal finance-connection" onMouseDown={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} type="button">×</button>
        <div className="finance-card">
          <span>SMART LIFE</span><b>•••• •••• •••• 2480</b>
          <div><small>CONNECTED FINANCES</small><strong>Secure bank sync</strong></div>
        </div>
        <h2>Track money automatically</h2>
        <p>Connect checking, savings, or credit accounts through a secure financial-data provider. Smart Life never asks for your card number or bank password.</p>
        <ul className="finance-benefits">
          <li><span>✓</span> Automatic transaction updates</li>
          <li><span>✓</span> Spending categories and budget totals</li>
          <li><span>✓</span> Read-only access—you cannot move money</li>
        </ul>
        <button className="connect-finance-button" onClick={() => setNotice(true)} type="button">Connect bank or credit card</button>
        {notice && <div className="finance-notice">Plaid server credentials must be configured before secure connection can open.</div>}
        <small className="finance-privacy">Do not enter card details directly into Smart Life.</small>
      </section>
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
