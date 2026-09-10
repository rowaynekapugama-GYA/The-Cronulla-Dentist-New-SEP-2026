import { NextResponse } from 'next/server';
import { relay, isEmail, e164 } from '@/lib/relay';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  // Honeypot: bots fill the hidden "website" field. Pretend success.
  if (body.website) return NextResponse.json({ ok: true });

  const first_name = (body.first_name || '').trim();
  const last_name = (body.last_name || '').trim();
  const email = (body.email || '').trim();
  const phone = (body.phone || '').trim();
  const interest = (body.interest || '').trim();
  if (!first_name || !last_name || !isEmail(email) || !phone || !interest || body.consent !== 'yes') {
    return NextResponse.json({ error: 'Please complete all fields.' }, { status: 400 });
  }

  const result = await relay(
    `New EOI: ${first_name} ${last_name}`,
    // Field names follow the SmileOx intake schema (camelCase, phoneNumber in E.164).
    { firstName: first_name, lastName: last_name, email, phoneNumber: e164(phone), interest, consent: 'yes', source: 'thecronulladentists.com.au /register' },
    'Founding patient expression of interest — The Cronulla Dentists website',
  );
  if (!result.ok) return NextResponse.json({ error: 'We could not send your registration. Please try again or email us.' }, { status: 502 });
  return NextResponse.json({ ok: true });
}
