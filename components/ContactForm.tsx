'use client';

import { useState } from 'react';
import { I } from '@/components/Icons';

/** Contact form (copy: Name, Email, Phone, Message). Posts to /api/contact. */
export default function ContactForm() {
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState('sending');
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
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
        <h3>Message sent</h3>
        <p>Thanks for getting in touch. We will get back to you as soon as we can.</p>
      </div>
    );
  }
  return (
    <form onSubmit={onSubmit}>
      <div className="hp" aria-hidden="true">
        <label>
          Leave this field empty <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="field">
        <label htmlFor="c-name">Name</label>
        <input id="c-name" name="name" type="text" autoComplete="name" required />
      </div>
      <div className="field field-row">
        <div>
          <label htmlFor="c-email">Email</label>
          <input id="c-email" name="email" type="email" autoComplete="email" required />
        </div>
        <div>
          <label htmlFor="c-phone">Phone</label>
          <input id="c-phone" name="phone" type="tel" autoComplete="tel" />
        </div>
      </div>
      <div className="field">
        <label htmlFor="c-message">Message</label>
        <textarea id="c-message" name="message" required />
      </div>
      {state === 'error' && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
      <button type="submit" className="btn btn-block" disabled={state === 'sending'}>
        {state === 'sending' ? 'Sending…' : 'Send message'}
      </button>
      <p className="card-note">
        We only use your details to reply to your message. See our <a href="/privacy-policy/">privacy policy</a>.
      </p>
    </form>
  );
}
