import type { APIRoute } from 'astro';
import { Resend } from 'resend';

const apiKey = (import.meta.env.RESEND_API_KEY as string | undefined) || process.env.RESEND_API_KEY;

const esc = (v: string) =>
  v
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const mailHtml = (rows: { label: string; value: string }[]) => `
<div style="margin:0;padding:0;background:#f3f1ea;">
  <div style="background:#151710;padding:28px 32px;">
    <span style="font:600 22px/1 Georgia,serif;color:#faf8f1;letter-spacing:.02em;">Eleni Sourcing</span>
    <span style="display:block;margin-top:4px;font:italic 14px/1.4 Georgia,serif;color:#a8c2ae;">Productos promocionales, merchandising corporativo e importación.</span>
  </div>
  <div style="padding:28px 32px;font-family:Arial,sans-serif;color:#3a3a34;">
    <p style="margin:0 0 18px;font-size:15px;">Nueva solicitud de cotización recibida desde la vitrina:</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;">
      ${rows
        .filter((r) => r.value)
        .map((r) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e6e3d9;color:#6b6a5f;text-transform:uppercase;font-size:11px;letter-spacing:.08em;white-space:nowrap;">${esc(r.label)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e6e3d9;color:#2b2b26;">${esc(r.value)}</td>
      </tr>`)
        .join('')}
    </table>
    <p style="margin:22px 0 0;font-size:12px;color:#8b897d;">Responder directamente al remitente usando el botón "Responder".</p>
  </div>
</div>`;

const emptyRow = { label: '', value: '' };

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (!apiKey) {
    console.error('[quote] RESEND_API_KEY no configurada (revisa .env)');
    return Response.json({ error: 'not_configured' }, { status: 503 });
  }

  const data = await request.formData();
  const get = (k: string) => (data.get(k) as string | null)?.trim() ?? '';
  const name = get('name');
  const email = get('email');
  const company = get('company');
  const phone = get('phone');
  const product = get('product');
  const quantity = get('quantity');
  const date = get('date');
  const message = get('message');
  const lang = get('lang') === 'pt' ? 'pt' : 'es';

  if (!name || !email) {
    return Response.json({ error: 'required' }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: 'invalid_email' }, { status: 400 });
  }

  const labels = {
    name: lang === 'pt' ? 'Nome' : 'Nombre',
    email: 'Email',
    company: lang === 'pt' ? 'Empresa' : 'Empresa',
    phone: 'Teléfono',
    product: lang === 'pt' ? 'Produto' : 'Producto',
    quantity: lang === 'pt' ? 'Cantidad' : 'Cantidad',
    date: lang === 'pt' ? 'Tiempo' : 'Tiempo',
    message: lang === 'pt' ? 'Mensaje' : 'Mensaje',
  };

  const subject =
    `${lang === 'pt' ? 'Cotação' : 'Cotización'}` +
    (product ? ` · ${product}` : '') +
    (company ? ` · ${company}` : '');

  const rows = [
    { label: labels.name, value: name },
    { label: labels.email, value: email },
    company ? { label: labels.company, value: company } : emptyRow,
    phone ? { label: labels.phone, value: phone } : emptyRow,
    product ? { label: labels.product, value: product } : emptyRow,
    quantity ? { label: labels.quantity, value: quantity } : emptyRow,
    date ? { label: labels.date, value: date } : emptyRow,
    message ? { label: labels.message, value: message } : emptyRow,
  ];

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: (import.meta.env.RESEND_FROM as string | undefined) || 'Eleni Sourcing <onboarding@resend.dev>',
      to: (import.meta.env.RESEND_TO as string | undefined) || 'hola@elenisourcing.cl',
      reply_to: email,
      subject,
      html: mailHtml(rows),
      text: rows
        .filter((r) => r.value)
        .map((r) => `${r.label}: ${r.value}`)
        .join('\n'),
    });

    if (error) {
      console.error('[quote] Resend error:', error);
      return Response.json({ error: 'send_failed', detail: error.message }, { status: 502 });
    }

    return Response.json({ ok: true });
  } catch (e) {
    console.error('[quote] exception:', e);
    return Response.json({ error: 'send_failed' }, { status: 502 });
  }
};