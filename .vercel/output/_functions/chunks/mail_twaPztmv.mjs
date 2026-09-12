import { Resend } from 'resend';

const esc = (v) => v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const mailHtml = (rows) => `
<div style="margin:0;padding:0;background:#f3f1ea;">
  <div style="background:#151710;padding:28px 32px;">
    <span style="font:600 22px/1 Georgia,serif;color:#faf8f1;letter-spacing:.02em;">Eleni Sourcing</span>
    <span style="display:block;margin-top:4px;font:italic 14px/1.4 Georgia,serif;color:#a8c2ae;">Productos promocionales, merchandising corporativo e importación.</span>
  </div>
  <div style="padding:28px 32px;font-family:Arial,sans-serif;color:#3a3a34;">
    <p style="margin:0 0 18px;font-size:15px;">Hay un pedido de contacto nuevo:</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;">
      ${rows.filter((r) => r.value).map((r) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e6e3d9;color:#6b6a5f;text-transform:uppercase;font-size:11px;letter-spacing:.08em;white-space:nowrap;">${esc(r.label)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e6e3d9;color:#2b2b26;">${esc(r.value)}</td>
      </tr>`).join("")}
    </table>
    <p style="margin:22px 0 0;font-size:12px;color:#8b897d;">Responder directamente al remitente usando el botón "Responder".</p>
  </div>
</div>`;
async function sendMail(opts) {
  const resend = new Resend(opts.apiKey);
  const { error } = await resend.emails.send({
    from: opts.from,
    to: opts.to,
    reply_to: opts.replyTo,
    subject: opts.subject,
    html: mailHtml(opts.rows),
    text: opts.rows.filter((r) => r.value).map((r) => `${r.label}: ${r.value}`).join("\n")
  });
  return error ?? null;
}

export { sendMail as s };
