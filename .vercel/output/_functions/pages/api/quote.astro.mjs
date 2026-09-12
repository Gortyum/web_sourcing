import { s as sendMail } from '../../chunks/mail_twaPztmv.mjs';
export { renderers } from '../../renderers.mjs';

const apiKey = process.env.RESEND_API_KEY;
const emptyRow = { label: "", value: "" };
const prerender = false;
const POST = async ({ request }) => {
  if (!apiKey) {
    console.error("[quote] RESEND_API_KEY no configurada (revisa .env)");
    return Response.json({ error: "not_configured" }, { status: 503 });
  }
  const data = await request.formData();
  const get = (k) => data.get(k)?.trim() ?? "";
  const name = get("name");
  const email = get("email");
  const company = get("company");
  const phone = get("phone");
  const product = get("product");
  const quantity = get("quantity");
  const date = get("date");
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
    company: lang === "pt" ? "Empresa" : "Empresa",
    phone: "Teléfono",
    product: lang === "pt" ? "Produto" : "Producto",
    quantity: lang === "pt" ? "Cantidad" : "Cantidad",
    date: lang === "pt" ? "Tiempo" : "Tiempo",
    message: lang === "pt" ? "Mensaje" : "Mensaje"
  };
  const subject = `${lang === "pt" ? "Cotação" : "Cotización"}` + (product ? ` · ${product}` : "") + (company ? ` · ${company}` : "");
  const rows = [
    { label: labels.name, value: name },
    { label: labels.email, value: email },
    company ? { label: labels.company, value: company } : emptyRow,
    phone ? { label: labels.phone, value: phone } : emptyRow,
    product ? { label: labels.product, value: product } : emptyRow,
    quantity ? { label: labels.quantity, value: quantity } : emptyRow,
    date ? { label: labels.date, value: date } : emptyRow,
    message ? { label: labels.message, value: message } : emptyRow
  ];
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
      console.error("[quote] Resend error:", err);
      return Response.json({ error: "send_failed", detail: err.message }, { status: 502 });
    }
    return Response.json({ ok: true });
  } catch (e) {
    console.error("[quote] exception:", e);
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
