import { s as sendMail } from '../../chunks/mail_twaPztmv.mjs';
export { renderers } from '../../renderers.mjs';

const apiKey = process.env.RESEND_API_KEY;
const emptyRow = { label: "", value: "" };
const prerender = false;
const POST = async ({ request }) => {
  if (!apiKey) {
    console.error("[contact] RESEND_API_KEY no configurada (revisa .env)");
    return Response.json({ error: "not_configured" }, { status: 503 });
  }
  const data = await request.formData();
  const get = (k) => data.get(k)?.trim() ?? "";
  const name = get("name");
  const email = get("email");
  const message = get("message");
  const lang = get("lang") === "pt" ? "pt" : "es";
  if (!name || !email) {
    return Response.json({ error: "required" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "invalid_email" }, { status: 400 });
  }
  const labels = {
    name: lang === "pt" ? "Nome" : "Nombre",
    email: "Email",
    message: lang === "pt" ? "Mensagem" : "Mensaje"
  };
  const rows = [
    { label: labels.name, value: name },
    { label: labels.email, value: email },
    message ? { label: labels.message, value: message } : emptyRow
  ];
  const subject = `${lang === "pt" ? "Mensagem de contato" : "Mensaje de contacto"} · ${name}`;
  try {
    const err = await sendMail({
      apiKey,
      from: "Eleni Sourcing <onboarding@resend.dev>",
      to: "hola@elenisourcing.cl",
      reply_to: email,
      subject,
      rows
    });
    if (err) {
      console.error("[contact] Resend error:", err);
      return Response.json({ error: "send_failed", detail: err.message }, { status: 502 });
    }
    return Response.json({ ok: true });
  } catch (e) {
    console.error("[contact] exception:", e);
    return Response.json({ error: "send_failed" }, { status: 502 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
