import type { APIRoute } from 'astro';
import { sendMail, type MailRow } from '../../lib/mail';

const apiKey = (import.meta.env.RESEND_API_KEY as string | undefined) || process.env.RESEND_API_KEY;

const emptyRow: MailRow = { label: '', value: '' };

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (!apiKey) {
    console.error('[supplier] RESEND_API_KEY no configurada (revisa .env)');
    return Response.json({ error: 'not_configured' }, { status: 503 });
  }

  const data = await request.formData();
  const get = (k: string) => (data.get(k) as string | null)?.trim() ?? '';
  const company = get('company');
  const name = get('name');
  const email = get('email');
  const phone = get('phone');
  const category = get('category');
  const origin = get('origin');
  const moq = get('moq');
  const message = get('message');
  const lang = get('lang') === 'pt' ? 'pt' : 'es';

  if (!company || !name || !email) {
    return Response.json({ error: 'required' }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: 'invalid_email' }, { status: 400 });
  }

  const labels = {
    company: lang === 'pt' ? 'Empresa' : 'Empresa',
    name: lang === 'pt' ? 'Contato' : 'Contacto',
    email: 'Email',
    phone: lang === 'pt' ? 'Telefone' : 'Teléfono',
    category: lang === 'pt' ? 'Categorias' : 'Categorías de producto',
    origin: lang === 'pt' ? 'Origem' : 'Origen',
    moq: lang === 'pt' ? 'MOQ mínimo' : 'MOQ mínimo',
    message: lang === 'pt' ? 'Mensagem' : 'Mensaje',
  };

  const rows = [
    { label: labels.company, value: company },
    { label: labels.name, value: name },
    { label: labels.email, value: email },
    phone ? { label: labels.phone, value: phone } : emptyRow,
    category ? { label: labels.category, value: category } : emptyRow,
    origin ? { label: labels.origin, value: origin } : emptyRow,
    moq ? { label: labels.moq, value: moq } : emptyRow,
    message ? { label: labels.message, value: message } : emptyRow,
  ];

  const subject = `Proveedor · ${company}`;

  try {
    const err = await sendMail({
      apiKey,
      from: (import.meta.env.RESEND_FROM as string | undefined) || 'Eleni Sourcing <onboarding@resend.dev>',
      to: (import.meta.env.RESEND_TO_SUPPLIERS as string | undefined) || process.env.RESEND_TO_SUPPLIERS || 'eleni@elenisourcing.com',
      reply_to: email,
      subject,
      rows,
    });

    if (err) {
      console.error('[supplier] Resend error:', err);
      return Response.json({ error: 'send_failed', detail: err.message }, { status: 502 });
    }

    return Response.json({ ok: true });
  } catch (e) {
    console.error('[supplier] exception:', e);
    return Response.json({ error: 'send_failed' }, { status: 502 });
  }
};