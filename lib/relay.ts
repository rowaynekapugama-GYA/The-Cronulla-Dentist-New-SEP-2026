/**
 * Form relay: SMTP2GO API → SmileOx intake address.
 *
 * The SmileOx intake parses leads ONLY from a plain-text email body that is a
 * raw JSON object with camelCase keys (firstName, lastName, email, phoneNumber
 * + any extra fields). So the intake email carries exactly
 * JSON.stringify(payload) and nothing else — no HTML part, no prose. The
 * optional NOTIFY_EMAIL copy is sent as a SEPARATE human-readable email so
 * reception never sees raw JSON.
 *
 * Env vars (see .env.example): SMTP2GO_API_KEY, SMTP2GO_SENDER,
 * SMILEOX_INTAKE_EMAIL, NOTIFY_EMAIL (optional).
 */
export interface RelayResult {
  ok: boolean;
  error?: string;
}

const esc = (s: unknown) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

/** "0412 345 678" → "+61412345678" (SmileOx dedupes on email + phone, and its examples use E.164). International input is left alone. */
export function e164(phone: string) {
  const digits = phone.replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) return digits;
  if (digits.startsWith('61')) return '+' + digits;
  if (digits.startsWith('0')) return '+61' + digits.slice(1);
  return digits;
}

export async function relay(subject: string, lead: Record<string, string>, source: string): Promise<RelayResult> {
  const apiKey = process.env.SMTP2GO_API_KEY;
  const sender = process.env.SMTP2GO_SENDER || 'website@thecronulladentists.com.au';
  const intake = process.env.SMILEOX_INTAKE_EMAIL;
  const notify = process.env.NOTIFY_EMAIL;

  if (!apiKey || !(intake || notify)) {
    // Not configured yet (local dev / preview): log and succeed so the UI can be tested.
    console.warn('[relay] SMTP2GO not configured — submission logged only:', source, lead);
    return { ok: true };
  }

  async function send(body: Record<string, unknown>) {
    const res = await fetch('https://api.smtp2go.com/v3/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) return { ok: false, error: `SMTP2GO responded ${res.status}` };
    const json = (await res.json().catch(() => ({}))) as { data?: { succeeded?: number; failures?: unknown[] } };
    if (json.data?.failures?.length) return { ok: false, error: 'Delivery failed' };
    return { ok: true };
  }

  // 1. The lead → SmileOx. Body is the JSON payload verbatim, per the intake spec.
  let result: RelayResult = { ok: true };
  if (intake) {
    result = await send({
      api_key: apiKey,
      sender,
      to: [intake],
      subject: 'Website form submission',
      text_body: JSON.stringify(lead),
    });
  }

  // 2. Readable copy → reception (best effort; never fails the submission).
  if (notify) {
    const rows = Object.entries(lead)
      .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0"><strong>${esc(k)}</strong></td><td style="padding:4px 0">${esc(v)}</td></tr>`)
      .join('');
    const text = Object.entries(lead)
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');
    await send({
      api_key: apiKey,
      sender,
      to: [notify],
      subject,
      text_body: `${source}\n\n${text}`,
      html_body: `<p>${esc(source)}</p><table>${rows}</table>`,
    }).catch(() => ({ ok: false }));
  }

  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

export const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
