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
  if (body.website) return NextResponse.json({ ok: true });
  const name = (body.name || '').trim();
  const email = (body.email || '').trim();
  const phone = (body.phone || '').trim();
  const message = (body.message || '').trim();
  if (!name || !isEmail(email) || !message) return NextResponse.json({ error: 'Please complete all required fields.' }, { status: 400 });

  // SmileOx intake schema wants firstName/lastName; the contact form collects one
  // name field, so split on the first space (single-word names go to firstName).
  const firstName = name.split(/\s+/)[0];
  const lastName = name.split(/\s+/).slice(1).join(' ');
  const lead: Record<string, string> = { firstName, email, message, source: 'thecronulladentists.com.au /contact' };
  if (lastName) lead.lastName = lastName;
  if (phone) lead.phoneNumber = e164(phone);
  const result = await relay(`Website message: ${name}`, lead, 'Contact form — The Cronulla Dentists website');
  if (!result.ok) return NextResponse.json({ error: 'We could not send your message. Please try again or email us.' }, { status: 502 });
  return NextResponse.json({ ok: true });
}
