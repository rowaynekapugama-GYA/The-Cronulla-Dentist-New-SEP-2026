import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * TEMPORARY DIAGNOSTIC — delete this file once the forms are confirmed working.
 *
 * Open in a browser:
 *   https://www.thecronulladentists.com.au/api/relay-check/?token=cronulla-check-2026
 *
 * It reports what the running function can actually see in its environment, then
 * performs one real send through SMTP2GO and prints SMTP2GO's own reply verbatim.
 * That is the piece we have been missing: the forms only ever say "we could not
 * send", which is the same message for a bad key, an unverified sender and an
 * account out of credits.
 *
 * The API key is never printed. Only its length and first/last few characters,
 * which is enough to spot the usual causes — a value pasted with a trailing
 * space or newline, a truncated paste, or the name and value entered the wrong
 * way round — without exposing the secret at a public URL.
 *
 * The token below is not real security, it just stops the endpoint being
 * stumbled upon or crawled. Delete the file when you are done.
 */
const TOKEN = 'cronulla-check-2026';

const describe = (name: string, value: string | undefined, secret = false) => {
  if (value === undefined) return `${name}: NOT SET`;
  if (value === '') return `${name}: SET BUT EMPTY`;
  const trimmed = value.trim();
  const whitespace = trimmed !== value ? '  <-- HAS LEADING/TRAILING WHITESPACE, this alone will break it' : '';
  const shown = secret ? `${trimmed.slice(0, 8)}…${trimmed.slice(-4)}` : trimmed;
  return `${name}: ${shown}   (length ${value.length})${whitespace}`;
};

export async function GET(req: Request) {
  if (new URL(req.url).searchParams.get('token') !== TOKEN) {
    return new NextResponse('Not found', { status: 404 });
  }

  const key = process.env.SMTP2GO_API_KEY;
  const sender = process.env.SMTP2GO_SENDER;
  const intake = process.env.SMILEOX_INTAKE_EMAIL;
  const notify = process.env.NOTIFY_EMAIL;

  const lines = [
    'RELAY CHECK — The Cronulla Dentists',
    `Run at ${new Date().toISOString()}`,
    '',
    'WHAT THIS DEPLOYMENT CAN SEE',
    '----------------------------',
    describe('SMTP2GO_API_KEY     ', key, true),
    describe('SMTP2GO_SENDER      ', sender),
    describe('SMILEOX_INTAKE_EMAIL', intake),
    describe('NOTIFY_EMAIL        ', notify),
    '',
  ];

  if (!key) {
    lines.push(
      'STOP: no API key in this deployment.',
      'Either the variable is not saved for Production, or this deployment was',
      'built before it was saved. Variables are baked in at build time, so save',
      'first, then Redeploy.',
    );
    return new NextResponse(lines.join('\n'), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
  }

  lines.push('LIVE SEND TEST', '--------------', `Sending one test email from ${sender} to ${intake || notify}`, '');

  try {
    const res = await fetch('https://api.smtp2go.com/v3/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: key.trim(),
        sender: (sender || '').trim(),
        to: [(intake || notify || '').trim()],
        subject: 'Relay check',
        text_body: JSON.stringify({ firstName: 'Relay', lastName: 'Check', email: 'relay-check@example.com', source: 'relay-check' }),
      }),
    });
    const raw = await res.text();
    lines.push(`HTTP ${res.status}`, '', 'SMTP2GO replied:', raw.slice(0, 2000), '');

    if (res.ok && !raw.includes('"error"') && !raw.includes('"failures":["')) {
      lines.push('READS AS SUCCESS. If the form still fails, the problem is not SMTP2GO.');
    } else {
      lines.push(
        'READS AS A REJECTION. The "error" / "error_code" above is the answer.',
        'Common ones:',
        '  bad_api_key / E_ApiResponseCodes.bad_api_key  -> key wrong, revoked, or from another account',
        '  sender not allowed / unverified               -> verify the exact sender address or its domain',
        '  quota / credits                               -> monthly allowance used up, or trial ended',
      );
    }
  } catch (e) {
    lines.push(`Could not reach SMTP2GO at all: ${(e as Error).message}`);
  }

  return new NextResponse(lines.join('\n'), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
