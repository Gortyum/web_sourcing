import 'piccolore';
import { k as decodeKey } from './chunks/astro/server_DqYe1Fwk.mjs';
import 'clsx';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/astro-designed-error-pages_BSLTCLGH.mjs';
import 'es-module-lexer';

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///F:/progra/vitrina-promo/","cacheDir":"file:///F:/progra/vitrina-promo/node_modules/.astro/","outDir":"file:///F:/progra/vitrina-promo/dist/","srcDir":"file:///F:/progra/vitrina-promo/src/","publicDir":"file:///F:/progra/vitrina-promo/public/","buildClientDir":"file:///F:/progra/vitrina-promo/dist/client/","buildServerDir":"file:///F:/progra/vitrina-promo/dist/server/","adapterName":"@astrojs/vercel","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)\\/?$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image\\/?$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/contact","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/contact\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"contact","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/contact.ts","pathname":"/api/contact","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/quote","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/quote\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"quote","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/quote.ts","pathname":"/api/quote","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/supplier","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/supplier\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"supplier","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/supplier.ts","pathname":"/api/supplier","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/index.vvE3Mw6q.css"}],"routeData":{"route":"/pt","isIndex":true,"type":"page","pattern":"^\\/pt\\/?$","segments":[[{"content":"pt","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/pt/index.astro","pathname":"/pt","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/index.vvE3Mw6q.css"}],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}}],"site":"https://www.elenisourcing.cl","base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["\u0000astro:content",{"propagation":"in-tree","containsHead":false}],["F:/progra/vitrina-promo/src/pages/index.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/index@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000@astrojs-ssr-virtual-entry",{"propagation":"in-tree","containsHead":false}],["F:/progra/vitrina-promo/src/pages/pt/index.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/pt/index@_@astro",{"propagation":"in-tree","containsHead":false}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000@astro-page:node_modules/astro/dist/assets/endpoint/generic@_@js":"pages/_image.astro.mjs","\u0000@astro-page:src/pages/api/contact@_@ts":"pages/api/contact.astro.mjs","\u0000@astro-page:src/pages/api/quote@_@ts":"pages/api/quote.astro.mjs","\u0000@astro-page:src/pages/api/supplier@_@ts":"pages/api/supplier.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astro-page:src/pages/pt/index@_@astro":"pages/pt.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000noop-middleware":"_noop-middleware.mjs","\u0000virtual:astro:actions/noop-entrypoint":"noop-entrypoint.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000@astrojs-manifest":"manifest_CdcHQWvP.mjs","F:/progra/vitrina-promo/node_modules/astro/dist/assets/services/sharp.js":"chunks/sharp_-u5XL-y5.mjs","F:\\progra\\vitrina-promo\\.astro\\content-assets.mjs":"chunks/content-assets_DleWbedO.mjs","F:\\progra\\vitrina-promo\\.astro\\content-modules.mjs":"chunks/content-modules_Dz-S_Wwv.mjs","\u0000astro:data-layer-content":"chunks/_astro_data-layer-content_DdcQmhv6.mjs","F:/progra/vitrina-promo/src/components/Hero.astro?astro&type=script&index=0&lang.ts":"_astro/Hero.astro_astro_type_script_index_0_lang.B472n4JP.js","F:/progra/vitrina-promo/src/components/QuoteForm.astro?astro&type=script&index=0&lang.ts":"_astro/QuoteForm.astro_astro_type_script_index_0_lang.C91VmL2p.js","F:/progra/vitrina-promo/src/components/Selection.astro?astro&type=script&index=0&lang.ts":"_astro/Selection.astro_astro_type_script_index_0_lang.TU8xv64Y.js","F:/progra/vitrina-promo/src/components/SupplierForm.astro?astro&type=script&index=0&lang.ts":"_astro/SupplierForm.astro_astro_type_script_index_0_lang.4SPJZFjL.js","F:/progra/vitrina-promo/src/layouts/Base.astro?astro&type=script&index=0&lang.ts":"_astro/Base.astro_astro_type_script_index_0_lang.DIcHbknm.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[["F:/progra/vitrina-promo/src/components/Hero.astro?astro&type=script&index=0&lang.ts","const a=document.querySelector(\"[data-hero-title]\"),s=window.matchMedia(\"(prefers-reduced-motion: reduce)\").matches;if(a&&!s){let d=!1;const t=()=>{d||(d=!0,a.setAttribute(\"data-anim\",\"\"),setTimeout(()=>a.setAttribute(\"data-in\",\"\"),60))};document.fonts&&document.fonts.ready?document.fonts.ready.then(t).catch(t):t(),setTimeout(t,2200)}const n=document.getElementById(\"contactForm\");n?.addEventListener(\"submit\",async d=>{if(d.preventDefault(),!n.checkValidity()){n.reportValidity();return}const t=document.getElementById(\"cFormDone\"),o=document.getElementById(\"cFormError\"),e=document.getElementById(\"cFormSubmit\"),r=document.getElementById(\"cFormSubmitLabel\"),i=e?.dataset.submit||\"\";t&&(t.hidden=!0),o&&(o.hidden=!0),r&&e?.dataset.sending&&(r.textContent=e.dataset.sending),e&&(e.disabled=!0);try{const c=await fetch(\"/api/contact\",{method:\"POST\",body:new FormData(n)});if(!c.ok)throw new Error(`HTTP ${c.status}`);t&&(t.hidden=!1),n.reset()}catch{o&&(o.hidden=!1)}finally{e&&(e.disabled=!1),r&&i&&(r.textContent=i)}});"],["F:/progra/vitrina-promo/src/components/QuoteForm.astro?astro&type=script&index=0&lang.ts","const o=document.getElementById(\"quoteForm\");document.addEventListener(\"click\",a=>{const e=a.target.closest(\"[data-quote-product]\");if(!e||!o)return;const n=document.getElementById(\"selProducto\"),t=e.dataset.quoteProduct||\"\";n&&t&&(n.value=t)});o?.addEventListener(\"submit\",async a=>{if(a.preventDefault(),!o.checkValidity()){o.reportValidity();return}const e=document.getElementById(\"qoDone\"),n=document.getElementById(\"qoError\"),t=document.getElementById(\"qoSubmit\"),d=document.getElementById(\"qoSubmitLabel\"),i=t?.dataset.submit||\"\";e&&(e.hidden=!0),n&&(n.hidden=!0),d&&t?.dataset.sending&&(d.textContent=t.dataset.sending),t&&(t.disabled=!0);try{const s=await fetch(\"/api/quote\",{method:\"POST\",body:new FormData(o)});if(!s.ok)throw new Error(`HTTP ${s.status}`);e&&(e.hidden=!1),o.reset()}catch{n&&(n.hidden=!1)}finally{t&&(t.disabled=!1),d&&i&&(d.textContent=i)}});"],["F:/progra/vitrina-promo/src/components/Selection.astro?astro&type=script&index=0&lang.ts","const r=document.getElementById(\"cueTrack\"),s=document.getElementById(\"cueViewport\"),n=Array.from(r?.querySelectorAll(\".cue__photo\")??[]),u=document.querySelector(\"[data-counter-current]\"),f=document.querySelector(\"[data-counter-progress-fill]\"),h=document.querySelector('[data-nav=\"prev\"]'),m=document.querySelector('[data-nav=\"next\"]'),l=n.length;let e=0;const d=()=>n.length?n.length>1?n[1].offsetLeft-n[0].offsetLeft:n[0].offsetWidth:0,v=()=>{if(!s||!n.length)return 0;const t=d(),a=n[n.length-1],i=t*(n.length-1)+a.offsetWidth;return Math.max(0,i-s.clientWidth)},g=(t=!1)=>{t&&r?.classList.add(\"no-trans\"),r&&(r.style.transform=`translateX(-${Math.min(e*d(),v())}px)`),u&&(u.textContent=String(e+1).padStart(2,\"0\")),f&&(f.style.width=`${(e+1)/l*100}%`),n.forEach((a,i)=>a.classList.toggle(\"is-active\",i===e)),h&&(h.disabled=e===0),m&&(m.disabled=e===l-1),t&&requestAnimationFrame(()=>r?.classList.remove(\"no-trans\"))},o=t=>{const a=Math.max(0,Math.min(l-1,t));a!==e&&(e=a,g())};document.querySelectorAll(\"[data-nav]\").forEach(t=>{t.addEventListener(\"click\",()=>o(e+(t.getAttribute(\"data-nav\")===\"next\"?1:-1)))});r?.addEventListener(\"keydown\",t=>{t.key===\"ArrowRight\"||t.key===\"PageDown\"?(t.preventDefault(),o(e+1)):(t.key===\"ArrowLeft\"||t.key===\"PageUp\")&&(t.preventDefault(),o(e-1))});let p=0,c=0;s?.addEventListener(\"touchstart\",t=>{p=t.touches[0].clientX,c=0},{passive:!0});s?.addEventListener(\"touchmove\",t=>{c=t.touches[0].clientX-p},{passive:!0});s?.addEventListener(\"touchend\",()=>{Math.abs(c)>60&&o(e+(c<0?1:-1))},{passive:!0});window.addEventListener(\"resize\",()=>{r&&(r.style.transform=`translateX(-${Math.min(e*d(),v())}px)`)});g(!0);"],["F:/progra/vitrina-promo/src/components/SupplierForm.astro?astro&type=script&index=0&lang.ts","const t=document.getElementById(\"supplierForm\");t?.addEventListener(\"submit\",async o=>{if(o.preventDefault(),!t.checkValidity()){t.reportValidity();return}const n=document.getElementById(\"supDone\"),d=document.getElementById(\"supError\"),e=document.getElementById(\"supSubmit\"),i=document.getElementById(\"supSubmitLabel\"),s=e?.dataset.submit||\"\";n&&(n.hidden=!0),d&&(d.hidden=!0),i&&e?.dataset.sending&&(i.textContent=e.dataset.sending),e&&(e.disabled=!0);try{const a=await fetch(\"/api/supplier\",{method:\"POST\",body:new FormData(t)});if(!a.ok)throw new Error(`HTTP ${a.status}`);n&&(n.hidden=!1),t.reset()}catch{d&&(d.hidden=!1)}finally{e&&(e.disabled=!1),i&&s&&(i.textContent=s)}});"],["F:/progra/vitrina-promo/src/layouts/Base.astro?astro&type=script&index=0&lang.ts","const n=document.querySelector(\".site-head\"),i=document.querySelector(\".nav-toggle\"),t=document.getElementById(\"mobile-menu\"),c=()=>n?.classList.toggle(\"is-scrolled\",window.scrollY>24);c();window.addEventListener(\"scroll\",c,{passive:!0});i?.addEventListener(\"click\",()=>{const e=n?.classList.toggle(\"is-open\")??!1;i.setAttribute(\"aria-expanded\",String(e)),t?.classList.toggle(\"is-open\",e),e||t?.classList.toggle(\"is-open\",!1)});t?.addEventListener(\"click\",e=>{e.target.closest(\"a\")&&(n?.classList.remove(\"is-open\"),t?.classList.remove(\"is-open\"),i?.setAttribute(\"aria-expanded\",\"false\"))});const a=window.matchMedia(\"(prefers-reduced-motion: reduce)\").matches,r=document.querySelectorAll(\".reveal\");if(a||!(\"IntersectionObserver\"in window))r.forEach(e=>e.classList.add(\"is-in\"));else{const e=new IntersectionObserver(s=>{s.forEach(o=>{o.isIntersecting&&(o.target.classList.add(\"is-in\"),e.unobserve(o.target))})},{threshold:.12,rootMargin:\"0px 0px -6% 0px\"});r.forEach(s=>e.observe(s))}"]],"assets":["/_astro/index.vvE3Mw6q.css","/favicon.svg","/og.svg","/robots.txt","/sitemap.xml","/admin/config.yml","/admin/index.html"],"i18n":{"fallbackType":"rewrite","strategy":"pathname-prefix-other-locales","locales":["es","pt"],"defaultLocale":"es","domainLookupTable":{}},"buildFormat":"directory","checkOrigin":false,"allowedDomains":[],"actionBodySizeLimit":1048576,"serverIslandNameMap":[],"key":"ersnKBo1mF8t6F1CpClPSXFfxjaEDmaBQDPgkiSRTFg="});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = null;

export { manifest };
