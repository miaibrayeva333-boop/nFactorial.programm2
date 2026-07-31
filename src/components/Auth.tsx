import { FormEvent, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { SupabaseSetupMessage } from './SupabaseSetupMessage';

export function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  if (!isSupabaseConfigured) return <SupabaseSetupMessage />;

  async function useGoogle() {
    setBusy(true);
    setMessage('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: { access_type: 'offline', prompt: 'select_account' },
      },
    });
    if (error) {
      setMessage(error.message);
      setBusy(false);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    const result = mode === 'signup'
      ? await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        })
      : await supabase.auth.signInWithPassword({ email, password });
    if (result.error) setMessage(result.error.message);
    else if (mode === 'signup' && !result.data.session) {
      setMessage('Check your email to confirm your new account.');
    }
    setBusy(false);
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <img className="auth-logo" src="/assets/smart-life-logo.png" alt="Smart Axis" />
        <p className="eyebrow">WELCOME TO SMART AXIS</p>
        <div className="auth-mode-tabs" aria-label="Account access">
          <button className={mode === 'signin' ? 'selected' : ''} onClick={() => { setMode('signin'); setMessage(''); }} type="button">Log in</button>
          <button className={mode === 'signup' ? 'selected' : ''} onClick={() => { setMode('signup'); setMessage(''); }} type="button">Register</button>
        </div>
        <h1>{mode === 'signin' ? 'Log in to Smart Axis' : 'Create your account'}</h1>
        <p className="auth-subtitle">Your tasks, health, calendar, and daily plans in one calm place.</p>

        <button className="google-auth-button" disabled={busy} onClick={() => void useGoogle()} type="button">
          <GoogleMark />
          Continue with Google
        </button>
        <div className="auth-divider"><span>or continue with email</span></div>

        <form className="auth-form" onSubmit={submit}>
          <label>Email address<input autoComplete="email" onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required type="email" value={email} /></label>
          <label>Password<input autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} minLength={6} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" required type="password" value={password} /></label>
          <button className="auth-submit" disabled={busy} type="submit">
            {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        {message && <p className="auth-message" role="status">{message}</p>}
        <button className="auth-switch" disabled={busy} onClick={() => {
          setMode(mode === 'signin' ? 'signup' : 'signin');
          setMessage('');
        }} type="button">
          {mode === 'signin' ? "New to Smart Axis? Create an account" : 'Already have an account? Sign in'}
        </button>
        <small>By continuing, you agree to securely authenticate through Supabase.</small>
      </section>
    </main>
  );
}

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.6 12.2c0-.7-.1-1.5-.2-2.2H12v4.3h6a5.2 5.2 0 0 1-2.2 3.3v2.8h3.6c2.1-2 3.2-4.8 3.2-8.2Z" />
      <path fill="#34A853" d="M12 23c3 0 5.5-1 7.4-2.6l-3.6-2.8c-1 .7-2.3 1.1-3.8 1.1-2.9 0-5.4-2-6.3-4.6H2v2.9A11.2 11.2 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.7 14.1a6.8 6.8 0 0 1 0-4.2V7H2a11.2 11.2 0 0 0 0 10l3.7-2.9Z" />
      <path fill="#EA4335" d="M12 5.3c1.6 0 3.1.6 4.3 1.7l3.2-3.2A10.8 10.8 0 0 0 2 7l3.7 2.9C6.6 7.2 9.1 5.3 12 5.3Z" />
    </svg>
  );
}
