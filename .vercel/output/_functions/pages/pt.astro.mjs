import { c as createComponent, r as renderComponent, a as renderTemplate } from '../chunks/astro/server_DqYe1Fwk.mjs';
import 'piccolore';
import { g as getCollection, $ as $$Base, a as $$SiteShell } from '../chunks/SiteShell_BRvj4h8a.mjs';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const products = (await getCollection("products", ({ data }) => data.active && data.featured)).filter((p) => p.data.active && p.data.featured).sort((a, b) => a.data.display_order - b.data.display_order);
  if (products.length === 0) {
    throw new Error("No hay productos activos destacados en la colecci\xF3n.");
  }
  return renderTemplate`${renderComponent($$result, "Base", $$Base, {}, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "SiteShell", $$SiteShell, { "products": products })} ` })}`;
}, "F:/progra/vitrina-promo/src/pages/pt/index.astro", void 0);

const $$file = "F:/progra/vitrina-promo/src/pages/pt/index.astro";
const $$url = "/pt";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
