'use client';

import { useState } from 'react';
import { I } from '@/components/Icons';

const INTERESTS = [
  'General check-up & clean',
  "Family / children's dentistry",
  'Cosmetic: whitening or veneers',
  'Implants or restorative work',
  "I'm a nervous patient",
  'Just keep me updated',
];

/** Founding-patient EOI form (approved landing page copy + success state). Posts to /api/eoi. */
export default function EoiForm({ compact = false, openingLabel }: { compact?: boolean; openingLabel: string }) {
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState('sending');
    setError('');
    const f = e.currentTarget;
    const data = Object.fromEntries(new FormData(f).entries());
    try {
      const res = await fetch('/api/eoi', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || 'Something went wrong');
      setState('done');
    } catch (err) {
      setState('error');
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  }

  if (state === 'done') {
    return (
      <div className="form-success" role="status">
        <I name="check" />
        <h3>You&rsquo;re on the list</h3>
        <p>Thanks for registering. We&rsquo;ll be in touch with opening news and your priority booking invitation.</p>
      </div>
    );
  }

  return (
    <div>
      <span className="card-tag">Founding Patients</span>
      <h2>Register your interest</h2>
      <p>Be first to book when our doors open {openingLabel}. Founding patients get priority appointments and exclusive opening offers.</p>
      <form onSubmit={onSubmit} noValidate={false}>
        <div className="hp" aria-hidden="true">
          <label>
            Leave this field empty <input type="text" name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <div className="field field-row">
          <div>
            <label htmlFor="eoi-first" className={compact ? 'sr-only' : ''}>
              First name
            </label>
            <input id="eoi-first" type="text" name="first_name" placeholder="First name" autoComplete="given-name" required />
          </div>
          <div>
            <label htmlFor="eoi-last" className={compact ? 'sr-only' : ''}>
              Last name
            </label>
            <input id="eoi-last" type="text" name="last_name" placeholder="Last name" autoComplete="family-name" required />
          </div>
        </div>
        <div className="field">
          <label htmlFor="eoi-email" className={compact ? 'sr-only' : ''}>
            Email address
          </label>
          <input id="eoi-email" type="email" name="email" placeholder="Email address" autoComplete="email" required />
        </div>
        <div className="field">
          <label htmlFor="eoi-phone" className={compact ? 'sr-only' : ''}>
            Mobile number
          </label>
          <input id="eoi-phone" type="tel" name="phone" placeholder="Mobile number" autoComplete="tel" required />
        </div>
        <div className="field">
          <label htmlFor="eoi-interest" className={compact ? 'sr-only' : ''}>
            What are you interested in?
          </label>
          <select id="eoi-interest" name="interest" required defaultValue="">
            <option value="" disabled>
              What are you interested in?
            </option>
            {INTERESTS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
        <label className="field-check">
          <input type="checkbox" name="consent" value="yes" required />
          <span>I agree to be contacted about opening news and my booking, and I have read the <a href="/privacy-policy/">privacy policy</a>.</span>
        </label>
        {state === 'error' && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}
        <button type="submit" className="btn btn-block" disabled={state === 'sending'}>
          {state === 'sending' ? 'Sending…' : 'Register My Interest'}
        </button>
      </form>
      <p className="card-note">No obligation. We&rsquo;ll only contact you about opening news and your booking.</p>
    </div>
  );
}
