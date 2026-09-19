import type { APIRoute } from 'astro';
import { sendMail, type MailRow } from '../../lib/mail';
import {
  anyFieldOver,
  checkRateLimit,
  consentAccepted,
  getClientIp,
  isHoneypotFilled,
} from '../../lib/guard';

const apiKey = (import.meta.env.RESEND_API_KEY as string | undefined) || process.env.RESEND_API_KEY;
const ROUTE = 'contact';
const emptyRow: MailRow = { label: '', value: '' };

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (!apiKey) {
    console.error('[contact] RESEND_API_KEY no configurada (revisa .env)');
    return Response.json({ error: 'not_configured' }, { status: 503 });
  }

  const rate = checkRateLimit(`${ROUTE}:${getClientIp(request)}`);
  if (!rate.allowed) {
    return Response.json(
      { error: 'rate_limited' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSec) } }
    );
  }

  const data = await request.formData();
  const lang = data.get('lang') === 'pt' ? 'pt' : 'es';

  if (isHoneypotFilled(data)) {
    console.warn('[contact] intento de spam descartado (honeypot)');
    return Response.json({ ok: true });
  }
  if (!consentAccepted(data)) {
    return Response.json({ error: 'consent_required' }, { status: 400 });
  }
  const over = anyFieldOver(data);
  if (over) {
    return Response.json({ error: 'invalid_field', field: over }, { status: 400 });
  }

  const get = (k: string) => (data.get(k) as string | null)?.trim() ?? '';
  const name = get('name');
  const email = get('email');
  const message = get('message');

  if (!name || !email) {
    return Response.json({ error: 'required' }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: 'invalid_email' }, { status: 400 });
  }

  const labels = {
    name: lang === 'pt' ? 'Nome' : 'Nombre',
    email: 'Email',
    message: lang === 'pt' ? 'Mensagem' : 'Mensaje',
    consent: lang === 'pt' ? 'Consentimento (dados pessoais)' : 'Consentimiento (datos personales)',
  };

  const rows = [
    { label: labels.name, value: name },
    { label: labels.email, value: email },
    message ? { label: labels.message, value: message } : emptyRow,
    {
      label: labels.consent,
      value: `${lang === 'pt' ? 'Aceito' : 'Aceptado'} · ${new Date().toISOString()}`,
    },
  ];

  const subject = `${lang === 'pt' ? 'Mensagem de contato' : 'Mensaje de contacto'} · ${name}`;

  try {
    const err = await sendMail({
      apiKey,
      from: (import.meta.env.RESEND_FROM as string | undefined) || 'Eleni Sourcing <onboarding@resend.dev>',
      to: (import.meta.env.RESEND_TO as string | undefined) || process.env.RESEND_TO || 'eleni@elenisourcing.com',
      reply_to: email,
      subject,
      rows,
    });

    if (err) {
      console.error('[contact] Resend error:', err);
      return Response.json({ error: 'send_failed', detail: err.message }, { status: 502 });
    }

    return Response.json({ ok: true });
  } catch (e) {
    console.error('[contact] exception:', e);
    return Response.json({ error: 'send_failed' }, { status: 502 });
  }
};