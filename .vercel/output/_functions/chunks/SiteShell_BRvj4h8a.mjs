import { escape } from 'html-escaper';
import { Traverse } from 'neotraverse/modern';
import pLimit from 'p-limit';
import { z } from 'zod';
import { r as removeBase, i as isRemotePath, p as prependForwardSlash } from './path_tbLlI_c1.mjs';
import { V as VALID_INPUT_FORMATS } from './consts_Bd-1c2lz.mjs';
import { A as AstroError, U as UnknownContentCollectionError, c as createComponent, R as RenderUndefinedEntryError, u as unescapeHTML, a as renderTemplate, b as renderUniqueStylesheet, d as renderScriptElement, e as createHeadAndContent, r as renderComponent, f as createAstro, g as renderScript, h as renderSlot, i as renderHead, j as addAttribute, m as maybeRenderHead, F as Fragment } from './astro/server_DqYe1Fwk.mjs';
import 'piccolore';
import * as devalue from 'devalue';
import 'clsx';
/* empty css                         */

const CONTENT_IMAGE_FLAG = "astroContentImageFlag";
const IMAGE_IMPORT_PREFIX = "__ASTRO_IMAGE_";

function imageSrcToImportId(imageSrc, filePath) {
  imageSrc = removeBase(imageSrc, IMAGE_IMPORT_PREFIX);
  if (isRemotePath(imageSrc)) {
    return;
  }
  const ext = imageSrc.split(".").at(-1)?.toLowerCase();
  if (!ext || !VALID_INPUT_FORMATS.includes(ext)) {
    return;
  }
  const params = new URLSearchParams(CONTENT_IMAGE_FLAG);
  if (filePath) {
    params.set("importer", filePath);
  }
  return `${imageSrc}?${params.toString()}`;
}

class ImmutableDataStore {
  _collections = /* @__PURE__ */ new Map();
  constructor() {
    this._collections = /* @__PURE__ */ new Map();
  }
  get(collectionName, key) {
    return this._collections.get(collectionName)?.get(String(key));
  }
  entries(collectionName) {
    const collection = this._collections.get(collectionName) ?? /* @__PURE__ */ new Map();
    return [...collection.entries()];
  }
  values(collectionName) {
    const collection = this._collections.get(collectionName) ?? /* @__PURE__ */ new Map();
    return [...collection.values()];
  }
  keys(collectionName) {
    const collection = this._collections.get(collectionName) ?? /* @__PURE__ */ new Map();
    return [...collection.keys()];
  }
  has(collectionName, key) {
    const collection = this._collections.get(collectionName);
    if (collection) {
      return collection.has(String(key));
    }
    return false;
  }
  hasCollection(collectionName) {
    return this._collections.has(collectionName);
  }
  collections() {
    return this._collections;
  }
  /**
   * Attempts to load a DataStore from the virtual module.
   * This only works in Vite.
   */
  static async fromModule() {
    try {
      const data = await import('./_astro_data-layer-content_DdcQmhv6.mjs');
      if (data.default instanceof Map) {
        return ImmutableDataStore.fromMap(data.default);
      }
      const map = devalue.unflatten(data.default);
      return ImmutableDataStore.fromMap(map);
    } catch {
    }
    return new ImmutableDataStore();
  }
  static async fromMap(data) {
    const store = new ImmutableDataStore();
    store._collections = data;
    return store;
  }
}
function dataStoreSingleton() {
  let instance = void 0;
  return {
    get: async () => {
      if (!instance) {
        instance = ImmutableDataStore.fromModule();
      }
      return instance;
    },
    set: (store) => {
      instance = store;
    }
  };
}
const globalDataStore = dataStoreSingleton();

const __vite_import_meta_env__ = {"ASSETS_PREFIX": undefined, "BASE_URL": "/", "DEV": false, "MODE": "production", "PROD": true, "SITE": "https://www.elenisourcing.cl", "SSR": true};
function createCollectionToGlobResultMap({
  globResult,
  contentDir
}) {
  const collectionToGlobResultMap = {};
  for (const key in globResult) {
    const keyRelativeToContentDir = key.replace(new RegExp(`^${contentDir}`), "");
    const segments = keyRelativeToContentDir.split("/");
    if (segments.length <= 1) continue;
    const collection = segments[0];
    collectionToGlobResultMap[collection] ??= {};
    collectionToGlobResultMap[collection][key] = globResult[key];
  }
  return collectionToGlobResultMap;
}
z.object({
  tags: z.array(z.string()).optional(),
  lastModified: z.date().optional()
});
function createGetCollection({
  contentCollectionToEntryMap,
  dataCollectionToEntryMap,
  getRenderEntryImport,
  cacheEntriesByCollection,
  liveCollections
}) {
  return async function getCollection(collection, filter) {
    if (collection in liveCollections) {
      throw new AstroError({
        ...UnknownContentCollectionError,
        message: `Collection "${collection}" is a live collection. Use getLiveCollection() instead of getCollection().`
      });
    }
    const hasFilter = typeof filter === "function";
    const store = await globalDataStore.get();
    let type;
    if (collection in contentCollectionToEntryMap) {
      type = "content";
    } else if (collection in dataCollectionToEntryMap) {
      type = "data";
    } else if (store.hasCollection(collection)) {
      const { default: imageAssetMap } = await import('./content-assets_DleWbedO.mjs');
      const result = [];
      for (const rawEntry of store.values(collection)) {
        const data = updateImageReferencesInData(rawEntry.data, rawEntry.filePath, imageAssetMap);
        let entry = {
          ...rawEntry,
          data,
          collection
        };
        if (entry.legacyId) {
          entry = emulateLegacyEntry(entry);
        }
        if (hasFilter && !filter(entry)) {
          continue;
        }
        result.push(entry);
      }
      return result;
    } else {
      console.warn(
        `The collection ${JSON.stringify(
          collection
        )} does not exist or is empty. Please check your content config file for errors.`
      );
      return [];
    }
    const lazyImports = Object.values(
      type === "content" ? contentCollectionToEntryMap[collection] : dataCollectionToEntryMap[collection]
    );
    let entries = [];
    if (!Object.assign(__vite_import_meta_env__, { Path: process.env.Path })?.DEV && cacheEntriesByCollection.has(collection)) {
      entries = cacheEntriesByCollection.get(collection);
    } else {
      const limit = pLimit(10);
      entries = await Promise.all(
        lazyImports.map(
          (lazyImport) => limit(async () => {
            const entry = await lazyImport();
            return type === "content" ? {
              id: entry.id,
              slug: entry.slug,
              body: entry.body,
              collection: entry.collection,
              data: entry.data,
              async render() {
                return render({
                  collection: entry.collection,
                  id: entry.id,
                  renderEntryImport: await getRenderEntryImport(collection, entry.slug)
                });
              }
            } : {
              id: entry.id,
              collection: entry.collection,
              data: entry.data
            };
          })
        )
      );
      cacheEntriesByCollection.set(collection, entries);
    }
    if (hasFilter) {
      return entries.filter(filter);
    } else {
      return entries.slice();
    }
  };
}
function emulateLegacyEntry({ legacyId, ...entry }) {
  const legacyEntry = {
    ...entry,
    id: legacyId,
    slug: entry.id
  };
  return {
    ...legacyEntry,
    // Define separately so the render function isn't included in the object passed to `renderEntry()`
    render: () => renderEntry(legacyEntry)
  };
}
const CONTENT_LAYER_IMAGE_REGEX = /__ASTRO_IMAGE_="([^"]+)"/g;
async function updateImageReferencesInBody(html, fileName) {
  const { default: imageAssetMap } = await import('./content-assets_DleWbedO.mjs');
  const imageObjects = /* @__PURE__ */ new Map();
  const { getImage } = await import('./_astro_assets_Cinlob2D.mjs').then(n => n._);
  for (const [_full, imagePath] of html.matchAll(CONTENT_LAYER_IMAGE_REGEX)) {
    try {
      const decodedImagePath = JSON.parse(imagePath.replaceAll("&#x22;", '"'));
      let image;
      if (URL.canParse(decodedImagePath.src)) {
        image = await getImage(decodedImagePath);
      } else {
        const id = imageSrcToImportId(decodedImagePath.src, fileName);
        const imported = imageAssetMap.get(id);
        if (!id || imageObjects.has(id) || !imported) {
          continue;
        }
        image = await getImage({ ...decodedImagePath, src: imported });
      }
      imageObjects.set(imagePath, image);
    } catch {
      throw new Error(`Failed to parse image reference: ${imagePath}`);
    }
  }
  return html.replaceAll(CONTENT_LAYER_IMAGE_REGEX, (full, imagePath) => {
    const image = imageObjects.get(imagePath);
    if (!image) {
      return full;
    }
    const { index, ...attributes } = image.attributes;
    return Object.entries({
      ...attributes,
      src: image.src,
      srcset: image.srcSet.attribute,
      // This attribute is used by the toolbar audit
      ...Object.assign(__vite_import_meta_env__, { Path: process.env.Path }).DEV ? { "data-image-component": "true" } : {}
    }).map(([key, value]) => value ? `${key}="${escape(value)}"` : "").join(" ");
  });
}
function updateImageReferencesInData(data, fileName, imageAssetMap) {
  return new Traverse(data).map(function(ctx, val) {
    if (typeof val === "string" && val.startsWith(IMAGE_IMPORT_PREFIX)) {
      const src = val.replace(IMAGE_IMPORT_PREFIX, "");
      const id = imageSrcToImportId(src, fileName);
      if (!id) {
        ctx.update(src);
        return;
      }
      const imported = imageAssetMap?.get(id);
      if (imported) {
        ctx.update(imported);
      } else {
        ctx.update(src);
      }
    }
  });
}
async function renderEntry(entry) {
  if (!entry) {
    throw new AstroError(RenderUndefinedEntryError);
  }
  if ("render" in entry && !("legacyId" in entry)) {
    return entry.render();
  }
  if (entry.deferredRender) {
    try {
      const { default: contentModules } = await import('./content-modules_Dz-S_Wwv.mjs');
      const renderEntryImport = contentModules.get(entry.filePath);
      return render({
        collection: "",
        id: entry.id,
        renderEntryImport
      });
    } catch (e) {
      console.error(e);
    }
  }
  const html = entry?.rendered?.metadata?.imagePaths?.length && entry.filePath ? await updateImageReferencesInBody(entry.rendered.html, entry.filePath) : entry?.rendered?.html;
  const Content = createComponent(() => renderTemplate`${unescapeHTML(html)}`);
  return {
    Content,
    headings: entry?.rendered?.metadata?.headings ?? [],
    remarkPluginFrontmatter: entry?.rendered?.metadata?.frontmatter ?? {}
  };
}
async function render({
  collection,
  id,
  renderEntryImport
}) {
  const UnexpectedRenderError = new AstroError({
    ...UnknownContentCollectionError,
    message: `Unexpected error while rendering ${String(collection)} → ${String(id)}.`
  });
  if (typeof renderEntryImport !== "function") throw UnexpectedRenderError;
  const baseMod = await renderEntryImport();
  if (baseMod == null || typeof baseMod !== "object") throw UnexpectedRenderError;
  const { default: defaultMod } = baseMod;
  if (isPropagatedAssetsModule(defaultMod)) {
    const { collectedStyles, collectedLinks, collectedScripts, getMod } = defaultMod;
    if (typeof getMod !== "function") throw UnexpectedRenderError;
    const propagationMod = await getMod();
    if (propagationMod == null || typeof propagationMod !== "object") throw UnexpectedRenderError;
    const Content = createComponent({
      factory(result, baseProps, slots) {
        let styles = "", links = "", scripts = "";
        if (Array.isArray(collectedStyles)) {
          styles = collectedStyles.map((style) => {
            return renderUniqueStylesheet(result, {
              type: "inline",
              content: style
            });
          }).join("");
        }
        if (Array.isArray(collectedLinks)) {
          links = collectedLinks.map((link) => {
            return renderUniqueStylesheet(result, {
              type: "external",
              src: isRemotePath(link) ? link : prependForwardSlash(link)
            });
          }).join("");
        }
        if (Array.isArray(collectedScripts)) {
          scripts = collectedScripts.map((script) => renderScriptElement(script)).join("");
        }
        let props = baseProps;
        if (id.endsWith("mdx")) {
          props = {
            components: propagationMod.components ?? {},
            ...baseProps
          };
        }
        return createHeadAndContent(
          unescapeHTML(styles + links + scripts),
          renderTemplate`${renderComponent(
            result,
            "Content",
            propagationMod.Content,
            props,
            slots
          )}`
        );
      },
      propagation: "self"
    });
    return {
      Content,
      headings: propagationMod.getHeadings?.() ?? [],
      remarkPluginFrontmatter: propagationMod.frontmatter ?? {}
    };
  } else if (baseMod.Content && typeof baseMod.Content === "function") {
    return {
      Content: baseMod.Content,
      headings: baseMod.getHeadings?.() ?? [],
      remarkPluginFrontmatter: baseMod.frontmatter ?? {}
    };
  } else {
    throw UnexpectedRenderError;
  }
}
function isPropagatedAssetsModule(module) {
  return typeof module === "object" && module != null && "__astroPropagation" in module;
}

// astro-head-inject

const liveCollections = {};

const contentDir = '/src/content/';

const contentEntryGlob = "";
const contentCollectionToEntryMap = createCollectionToGlobResultMap({
	globResult: contentEntryGlob,
	contentDir,
});

const dataEntryGlob = "";
const dataCollectionToEntryMap = createCollectionToGlobResultMap({
	globResult: dataEntryGlob,
	contentDir,
});
createCollectionToGlobResultMap({
	globResult: { ...contentEntryGlob, ...dataEntryGlob },
	contentDir,
});

let lookupMap = {};
lookupMap = {};

new Set(Object.keys(lookupMap));

function createGlobLookup(glob) {
	return async (collection, lookupId) => {
		const filePath = lookupMap[collection]?.entries[lookupId];

		if (!filePath) return undefined;
		return glob[collection][filePath];
	};
}

const renderEntryGlob = "";
const collectionToRenderEntryMap = createCollectionToGlobResultMap({
	globResult: renderEntryGlob,
	contentDir,
});

const cacheEntriesByCollection = new Map();
const getCollection = createGetCollection({
	contentCollectionToEntryMap,
	dataCollectionToEntryMap,
	getRenderEntryImport: createGlobLookup(collectionToRenderEntryMap),
	cacheEntriesByCollection,
	liveCollections,
});

const locales = ["es", "pt"];
const localeFlags = {
  es: "ES",
  pt: "PT"
};
function makeDict(l) {
  const es = l === "es";
  const one = (esV, ptV) => es ? esV : ptV;
  return {
    brandTag: one("Promocionales · Importación", "Promocionais · Importação"),
    nav: {
      home: one("Inicio", "Início"),
      products: one("Productos", "Produtos"),
      about: one("Nosotros", "Nós"),
      process: one("Cómo trabajamos", "Como trabalhamos"),
      contact: one("Contacto", "Contato"),
      quote: one("Solicitar cotización", "Solicitar cotação")
    },
    hero: {
      eyebrow: one("Productos promocionales · Chile", "Produtos promocionais · Chile"),
      title: one("Productos que hacen", "Produtos que tornam"),
      titleEm: one("visible", "visível"),
      titleEnd: one("tu marca.", "a sua marca."),
      sub: one(
        "Soluciones promocionales para empresas, eventos y campañas. Sourcing, importación y personalización de productos con la gestión que tu marca merece.",
        "Soluções promocionais para empresas, eventos e campanhas. Sourcing, importação e personalização de produtos com a gestão que a sua marca merece."
      ),
      cta: one("Solicitar cotización", "Solicitar cotação"),
      viewProducts: one("Ver productos", "Ver produtos"),
      suppliers: one("Para proveedores", "Para fornecedores"),
      meta1: one("Desde 10 a 500.000 unidades", "De 10 a 500.000 unidades"),
      meta2: one("Personalización propia", "Personalização própria"),
      note: one(
        "El sello de cada producto se imprime con la marca de tu empresa.",
        "O selo de cada produto é aplicado com a marca da sua empresa."
      ),
      updated: one("Cerrado el", "Fechado em"),
      strip: one("Sourcing · Importación · Personalización · Logística", "Sourcing · Importação · Personalização · Logística")
    },
    cue: {
      eyebrow: one("Selección mensual", "Seleção mensal"),
      title: one("Selección del mes", "Seleção do mês"),
      desc: one(
        "Una selección de productos para campañas, eventos y regalos corporativos. Renovamos la vitrina cada mes.",
        "Uma seleção de produtos para campanhas, eventos e presentes corporativos. Renovamos a vitrine a cada mês."
      ),
      prev: one("Producto anterior", "Produto anterior"),
      next: one("Producto siguiente", "Próximo produto"),
      region: one("Productos destacados", "Produtos em destaque"),
      cust: one("Personalización", "Personalização"),
      quote: one("Solicitar cotización", "Solicitar cotação"),
      of: one("de", "de"),
      specMaterial: one("Material", "Material"),
      specMoq: one("Mínimo", "Mínimo"),
      specOrigin: one("Origen", "Origem")
    },
    svc: {
      eyebrow: one("Qué hacemos", "O que fazemos"),
      title: one("Más que un producto.", "Mais que um produto."),
      lede: one(
        "Encontramos, gestionamos y entregamos soluciones promocionales adaptadas a las necesidades de cada empresa.",
        "Encontramos, gerimos e entregamos soluções promocionais adaptadas às necessidades de cada empresa."
      ),
      note: one("Un solo equipo desde la búsqueda hasta la entrega.", "Um único time da busca à entrega."),
      items: [
        {
          name: one("Sourcing", "Sourcing"),
          desc: one(
            "Búsqueda y selección de productos según las necesidades del cliente.",
            "Busca e seleção de produtos de acordo com as necessidades do cliente."
          ),
          tag: one("Proveedores curados y validados", "Fornecedores curados e validados")
        },
        {
          name: one("Importación", "Importação"),
          desc: one(
            "Gestión de productos y proveedores internacionales, con foco en Brasil y el mercado asiático.",
            "Gestão de produtos e fornecedores internacionais, com foco no Brasil e no mercado asiático."
          ),
          tag: one("Origen Brasil ↔ Chile", "Origem Brasil ↔ Chile")
        },
        {
          name: one("Personalización", "Personalização"),
          desc: one(
            "Opciones de personalización y branding según el producto: grabado, serigrafía, bordado y más.",
            "Opções de personalização e branding conforme o produto: gravação, serigrafia, bordado e mais."
          ),
          tag: one("Grabado · Serigrafía · Bordado", "Gravação · Serigrafia · Bordado")
        },
        {
          name: one("Logística", "Logística"),
          desc: one(
            "Gestión y coordinación de la entrega de los productos, hasta la mano de tu marca.",
            "Gestão e coordenação da entrega dos produtos, até a mão da sua marca."
          ),
          tag: one("Coordinar y entregar en tiempo", "Coordenar e entregar no prazo")
        }
      ]
    },
    prc: {
      eyebrow: one("Cómo trabajamos", "Como trabalhamos"),
      title: one("De la idea al producto.", "Da ideia ao produto."),
      desc: one(
        "Cotizar tu merch corporativo es más simple de lo que parece. Tres pasos y tienes tu propuesta.",
        "Cotar o seu merch corporativo é mais simples do que parece. Três passos e você tem a sua proposta."
      ),
      steps: [
        {
          name: one("Elige", "Escolha"),
          desc: one(
            "Explora nuestra selección de productos o cuéntanos qué estás buscando.",
            "Explore a nossa seleção de produtos ou conte o que você procura."
          ),
          hint: one("Vitrina mensual o búsqueda a medida", "Vitrine mensal ou busca sob medida")
        },
        {
          name: one("Cuéntanos", "Conte-nos"),
          desc: one(
            "Indica cantidades, personalización, presupuesto y fecha requerida.",
            "Indique quantidades, personalização, orçamento e data desejada."
          ),
          hint: one("Solo lo que necesitamos para cotizar", "Apenas o que precisamos para cotar")
        },
        {
          name: one("Recibe", "Receba"),
          desc: one(
            "Preparamos una propuesta adaptada a tu proyecto. Tú decides cómo seguir.",
            "Preparamos uma proposta adaptada ao seu projeto. Você decide como seguir."
          ),
          hint: one("Respuesta dentro de 24 h hábiles", "Resposta em até 24 h úteis")
        }
      ]
    },
    apps: {
      eyebrow: one("Aplicaciones", "Aplicações"),
      title: one("Para cada momento de tu marca.", "Para cada momento da sua marca."),
      uses: [
        { name: one("Eventos corporativos", "Eventos corporativos"), ex: one("Lanyards, credenciales y regalos para asistentes", "Lanyards, crachás e brindes para participantes") },
        { name: one("Regalos empresariales", "Presentes empresariais"), ex: one("Obsequios de cierre de año y de agradecimiento", "Brindes de fim de ano e de agradecimento") },
        { name: one("Campañas de marketing", "Campanhas de marketing"), ex: one("Merch que acompaña cada lanzamiento", "Merch que acompanha cada lançamento") },
        { name: one("Merchandising", "Merchandising"), ex: one("Productos con tu marca para la calle y la oficina", "Produtos com a sua marca para a rua e o escritório") },
        { name: one("Activaciones de marca", "Ativações de marca"), ex: one("Material memorable para tu próxima activación", "Material memorável para a sua próxima ativação") },
        { name: one("Kits corporativos", "Kits corporativos"), ex: one("Onboarding, equipos y clientes nuevos", "Onboarding, equipes e novos clientes") }
      ]
    },
    abt: {
      eyebrow: one("Sobre nosotros", "Sobre nós"),
      title: one("Soluciones promocionales para marcas que quieren", "Soluções promocionais para marcas que querem"),
      titleEm: one("destacar.", "se destacar."),
      p1: one(
        "Productos promocionales para empresas, merchandising corporativo y regalos de marca. Eleni Sourcing encuentra, importa y personaliza productos para marcas en Chile — con proveedores seleccionados en Brasil y otros mercados — para que tu campaña tenga el producto correcto, al precio correcto, en el momento correcto.",
        "Produtos promocionais para empresas, merchandising corporativo e presentes de marca. A Eleni Sourcing encontra, importa e personaliza produtos para marcas no Chile — com fornecedores selecionados no Brasil e em outros mercados — para que a sua campanha tenha o produto certo, pelo preço certo, no momento certo."
      ),
      p2: one(
        "Trabajamos el detalle de fondo para que tu marca luzca bien. Desde la primera cotización hasta la última unidad entregada, hay una persona de nuestro equipo responsable de que todo llegue como se prometió.",
        "Trabalhamos o detalhe de fundo para que a sua marca brilhe. Da primeira cotação à última unidade entregue, há uma pessoa do nosso time responsável por tudo chegar como foi prometido."
      ),
      caps: [
        one("Sourcing curado proveedor por proveedor", "Sourcing curado fornecedor a fornecedor"),
        one("Importación Brasil ↔ Chile", "Importação Brasil ↔ Chile"),
        one("Personalización con calidad verificada", "Personalização com qualidade verificada"),
        one("Gestión de tiempos, aduana y despacho", "Gestão de prazos, alfândega e entrega")
      ]
    },
    cta: {
      eyebrow: one("Cotización sin compromiso", "Cotação sem compromisso"),
      title: one("¿Tienes un proyecto en mente?", "Tem um projeto em mente?"),
      sub: one(
        "Cuéntanos qué necesitas y preparemos una propuesta para tu empresa.",
        "Conte o que você precisa e preparemos uma proposta para a sua empresa."
      ),
      btn: one("Solicitar cotización", "Solicitar cotação"),
      suppliers: one("Para proveedores", "Para fornecedores"),
      wa: one("WhatsApp", "WhatsApp"),
      email: one("Email", "E-mail"),
      tel: one("Teléfono", "Telefone")
    },
    qo: {
      eyebrow: one("Cotización", "Cotação"),
      title: one("Hablemos de tu proyecto.", "Vamos falar do seu projeto."),
      lede: one(
        "Completa el formulario y te respondemos dentro de las próximas 24 horas hábiles con una propuesta adaptada a tu campaña.",
        "Preencha o formulário e respondemos em até 24 horas úteis com uma proposta adaptada à sua campanha."
      ),
      what: [
        { label: one("Producto", "Produto"), text: one("Cuéntanos qué necesitas o elige uno de la selección", "Conte o que precisa ou escolha um da seleção") },
        { label: one("Cantidad", "Quantidade"), text: one("Para poder hablar de precios reales", "Para falarmos de preços reais") },
        { label: one("Fecha", "Prazo"), text: one("El momento en que lo necesitas entregado", "Quando você precisa da entrega") },
        { label: one("Personalización", "Personalização"), text: one("Técnica y colores si ya los tienes en mente", "Técnica e cores, se você já tem em mente") }
      ],
      alt: one("¿Prefieres no escribir? Escríbenos por", "Prefere não escrever? Fale com a gente pelo"),
      wa: one("WhatsApp", "WhatsApp"),
      fName: one("Nombre", "Nome"),
      fCompany: one("Empresa", "Empresa"),
      fEmail: one("Email", "E-mail"),
      fPhone: one("Teléfono", "Telefone"),
      fProduct: one("Producto de interés", "Produto de interesse"),
      selProduct: one("— Elige una opción o cuéntanos a medida —", "— Escolha uma opção ou conte sob medida —"),
      otrodProduct: one("A medida / otro producto", "Sob medida / outro produto"),
      fQty: one("Cantidad aproximada", "Quantidade aproximada"),
      selQty: one("— Selecciona —", "— Selecione —"),
      quantities: [one("Menos de 50", "Menos de 50"), one("50 – 199", "50 – 199"), one("200 – 499", "200 – 499"), one("500 – 999", "500 – 999"), one("1.000 o más", "1.000 ou mais")],
      fDate: one("Fecha requerida", "Data desejada"),
      fMsg: one("Mensaje", "Mensagem"),
      msgPh: one(
        "Cuéntanos sobre tu proyecto: técnica de personalización, colores, entrega…",
        "Conte sobre o seu projeto: técnica de personalização, cores, entrega…"
      ),
      submit: one("Enviar solicitud", "Enviar solicitação"),
      fine: one("Sin descargas · sin e-commerce · directamente con el equipo", "Sem downloads · sem e-commerce · direto com o time"),
      doneTitle: one("Solicitud enviada.", "Solicitação enviada."),
      doneText: one(
        "Gracias por tu interés. Te responderemos dentro de las próximas 24 horas hábiles con una propuesta para tu proyecto.",
        "Obrigado pelo seu interesse. Responderemos em até 24 horas úteis com uma proposta para o seu projeto."
      ),
      doneNote: one(
        "Recibirás la respuesta en el correo que indicaste.",
        "Você receberá a resposta no e-mail informado."
      ),
      sending: one("Enviando…", "Enviando…"),
      sendError: one(
        "No pudimos enviar el correo. Vuelve a intentar o escríbenos a hola@elenisourcing.cl.",
        "Não foi possível enviar o e-mail. Tente novamente ou escreva para hola@elenisourcing.cl."
      )
    },
    sup: {
      eyebrow: one("Para proveedores", "Para fornecedores"),
      title: one(
        "¿Fabricas o importas? Agreguemos tus productos a nuestro catálogo.",
        "Você fabrica ou importa? Vamos colocar seus produtos no nosso catálogo."
      ),
      lede: one(
        "Trabajamos con fábricas e importadores que comparten nuestro estándar de calidad. Cuéntanos qué produce tu empresa y cómo podríamos colaborar.",
        "Trabalhamos com fábricas e importadores que compartilham o nosso padrão de qualidade. Conte o que a sua empresa produz e como poderíamos colaborar."
      ),
      what: [
        { label: one("Producto", "Produto"), text: one("Las categorías que fabricas, importas o distribuyes", "As categorias que você fabrica, importa ou distribui") },
        { label: one("Origen", "Origem"), text: one("Dónde se produce o desde dónde llega al mercado", "Onde é produzido ou de onde chega ao mercado") },
        { label: one("Capacidad", "Capacidade"), text: one("Volúmenes, MOQ y certificaciones si las tienes", "Volumes, MOQ e certificações, se você tiver") }
      ],
      alt: one("¿Prefieres que te contactemos por", "Prefere que entremos em contato pelo"),
      wa: one("WhatsApp", "WhatsApp"),
      fCompany: one("Empresa", "Empresa"),
      fName: one("Nombre de contacto", "Nome para contato"),
      fEmail: one("Email", "E-mail"),
      fPhone: one("Teléfono", "Telefone"),
      fCategory: one("Categorías de producto", "Categorias de produto"),
      selCategory: one("— Selecciona las que ofreces —", "— Selecione as que oferece —"),
      categoryOptions: [
        one("Papelería y escritura", "Papelaria e escrita"),
        one("Botellas y vasos", "Garrafas e copos"),
        one("Tecnológicos y accesorios", "Eletrônicos e acessórios"),
        one("Textil y wearables", "Têxtil e wearables"),
        one("Empaques y retail", "Embalagens e retail"),
        one("Otro", "Outro")
      ],
      fOrigin: one("Origen del producto", "Origem do produto"),
      selOrigin: one("— Selecciona —", "— Selecione —"),
      originOptions: [one("China", "China"), one("India", "Índia"), one("Chile / local", "Chile / local"), one("Otro", "Outro")],
      fMoq: one("MOQ mínimo", "MOQ mínimo"),
      moqPh: one("Ej. 500 unidades por SKU", "Ex.: 500 unidades por SKU"),
      fMsg: one("Mensaje", "Mensagem"),
      msgPh: one(
        "Cuéntanos sobre tu oferta: materiales, capacidades, certificaciones, tiempos…",
        "Conte sobre a sua oferta: materiais, capacidades, certificações, prazos…"
      ),
      submit: one("Enviar postulación", "Enviar candidatura"),
      fine: one(
        "Revisamos cada postulación y respondemos dentro de 5 días hábiles.",
        "Revisamos cada candidatura e respondemos em até 5 dias úteis."
      ),
      doneTitle: one("Postulación enviada.", "Candidatura enviada."),
      doneText: one(
        "Gracias por tu interés. Si tu oferta encaja con lo que buscamos, te escribiremos pronto.",
        "Obrigado pelo interesse. Se a sua oferta combinar com o que buscamos, entraremos em contato em breve."
      ),
      doneNote: one(
        "Recibirás la respuesta en el correo que indicaste.",
        "Você receberá a resposta no e-mail informado."
      ),
      sending: one("Enviando…", "Enviando…"),
      sendError: one(
        "No pudimos enviar el correo. Vuelve a intentar o escríbenos a hola@elenisourcing.cl.",
        "Não foi possível enviar o e-mail. Tente novamente ou escreva para hola@elenisourcing.cl."
      )
    },
    contact: {
      fName: one("Nombre", "Nome"),
      fEmail: one("Email", "E-mail"),
      fMsg: one("Mensaje", "Mensagem"),
      msgPh: one("Cuéntanos en qué podemos ayudarte.", "Conte-nos como podemos ajudar."),
      submit: one("Enviar mensaje", "Enviar mensagem"),
      sending: one("Enviando…", "Enviando…"),
      sendError: one(
        "No pudimos enviar el correo. Vuelve a intentar o escríbenos a hola@elenisourcing.cl.",
        "Não foi possível enviar o e-mail. Tente novamente ou escreva para hola@elenisourcing.cl."
      ),
      doneTitle: one("Mensaje enviado.", "Mensagem enviada."),
      doneText: one("Gracias por escribirnos. Te responderemos a la brevedad.", "Obrigado por escrever. Responderemos em breve."),
      note: one("Respuesta directa por email", "Resposta direta por e-mail")
    },
    foot: {
      blurb: one(
        "Productos promocionales y merchandising corporativo para marcas que quieren destacar. Sourcing, importación, personalización y logística — de la idea al producto.",
        "Produtos promocionais e merchandising corporativo para marcas que querem se destacar. Sourcing, importação, personalização e logística — da ideia ao produto."
      ),
      nav: one("Navegación", "Navegação"),
      contact: one("Contacto", "Contato"),
      legalTerms: one("Términos", "Termos"),
      legalPrivacy: one("Privacidad", "Privacidade"),
      rights: one("Todos los derechos reservados.", "Todos os direitos reservados.")
    }
  };
}
const dicts = { es: makeDict("es"), pt: makeDict("pt") };
function productDisplay(p, l) {
  const pt = l === "pt";
  return {
    name: pt && p.name_pt ? p.name_pt : p.name,
    description: pt && p.description_pt ? p.description_pt : p.description,
    category: pt && p.category_pt ? p.category_pt : p.category,
    material: pt && p.material_pt ? p.material_pt : p.material,
    customization: pt && p.customization_pt ? p.customization_pt : p.customization,
    origin: pt && p.origin_pt ? p.origin_pt : p.origin
  };
}

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro$f = createAstro("https://www.elenisourcing.cl");
const $$Base = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$f, $$props, $$slots);
  Astro2.self = $$Base;
  const SITE = {
    name: "Eleni Sourcing",
    url: "https://www.elenisourcing.cl"
  };
  const locale = Astro2.currentLocale ?? "es";
  const isPt = locale === "pt";
  const path = isPt ? "/pt/" : "/";
  const canonical = `${SITE.url}${path}`;
  const ogLocale = isPt ? "pt_BR" : "es_CL";
  const descEs = "Productos promocionales, merchandising corporativo y regalos empresariales para marcas en Chile. Sourcing, importaci\xF3n y personalizaci\xF3n de productos para empresas, eventos y campa\xF1as.";
  const descPt = "Produtos promocionais, merchandising corporativo e presentes empresariais para marcas no Chile. Sourcing, importa\xE7\xE3o e personaliza\xE7\xE3o de produtos para empresas, eventos e campanhas.";
  const defaults = {
    title: isPt ? "Eleni Sourcing \u2014 Produtos promocionais para empresas no Chile | Merchandising corporativo" : "Eleni Sourcing \u2014 Productos promocionales para empresas en Chile | Merchandising corporativo",
    description: isPt ? descPt : descEs
  };
  const { title = defaults.title, description = defaults.description, ogType = "website" } = Astro2.props;
  const fullTitle = title === defaults.title ? title : `${title} \xB7 Eleni Sourcing`;
  const ogImage = `${SITE.url}/og.svg`;
  return renderTemplate(_a || (_a = __template(["<html", '> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>', '</title><meta name="description"', '><meta name="robots" content="index, follow"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="canonical"', ">", '<!-- Open Graph --><meta property="og:type"', '><meta property="og:site_name"', '><meta property="og:locale"', '><meta property="og:title"', '><meta property="og:description"', '><meta property="og:url"', '><meta property="og:image"', '><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title"', '><meta name="twitter:description"', '><!-- Tipograf\xEDa --><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,340..600;1,9..144,340..600&family=Manrope:wght@400;500;600;750&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet"><!-- Schema.org --><script type="application/ld+json">', '<\/script><script type="application/ld+json">', "<\/script>", '</head> <body> <a class="skip-link" href="#contenido">Saltar al contenido</a> ', " ", " </body> </html>"])), addAttribute(locale, "lang"), fullTitle, addAttribute(description, "content"), addAttribute(canonical, "href"), locales.map((l) => renderTemplate`<link rel="alternate"${addAttribute(l, "hreflang")}${addAttribute(`${SITE.url}${l === "es" ? "/" : `/${l}/`}`, "href")}>`), addAttribute(ogType, "content"), addAttribute(SITE.name, "content"), addAttribute(ogLocale, "content"), addAttribute(fullTitle, "content"), addAttribute(description, "content"), addAttribute(canonical, "content"), addAttribute(ogImage, "content"), addAttribute(fullTitle, "content"), addAttribute(description, "content"), unescapeHTML(JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Eleni Sourcing",
    url: SITE.url,
    logo: `${SITE.url}/favicon.svg`,
    description: defaults.description,
    address: { "@type": "PostalAddress", addressCountry: "CL", addressLocality: "Santiago" },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      email: "hola@elenisourcing.cl",
      availableLanguage: ["es"]
    }
  })), unescapeHTML(JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    inLanguage: "es-CL"
  })), renderHead(), renderSlot($$result, $$slots["default"]), renderScript($$result, "F:/progra/vitrina-promo/src/layouts/Base.astro?astro&type=script&index=0&lang.ts"));
}, "F:/progra/vitrina-promo/src/layouts/Base.astro", void 0);

const $$Astro$e = createAstro("https://www.elenisourcing.cl");
const $$LeafMark = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$e, $$props, $$slots);
  Astro2.self = $$LeafMark;
  const { n = 30 } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<svg${addAttribute(n, "width")}${addAttribute(n, "height")} viewBox="0 0 40 40" fill="none" aria-hidden="true"> <rect class="leaf-square" width="40" height="40" rx="3" fill="var(--pine)"></rect> <path d="M20 30.5C10.5 27.5 7.5 20 11.5 11.5C19.5 12 24.5 14.5 26.5 19.5C27.5 21.5 27.9 24 26.8 26.8C24.5 29.8 22.5 31.2 20 30.5Z" fill="var(--bone)"></path> <path d="M12 13C17.5 10 25 11 29 17.5C23 15.5 16 15.5 12 13Z" fill="var(--pine-hi)"></path> </svg>`;
}, "F:/progra/vitrina-promo/src/components/LeafMark.astro", void 0);

const $$Astro$d = createAstro("https://www.elenisourcing.cl");
const $$ArrowIcon = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$d, $$props, $$slots);
  Astro2.self = $$ArrowIcon;
  const { dir = "right", n = 18 } = Astro2.props;
  const angle = dir === "right" ? 0 : dir === "down" ? 90 : -90;
  return renderTemplate`${maybeRenderHead()}<svg class="btn__arrow"${addAttribute(n, "width")}${addAttribute(n, "height")} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="square"${addAttribute(`transform:rotate(${angle}deg)`, "style")} aria-hidden="true"> <path d="M3 12h17"></path> <path d="M14 6l6 6 -6 6"></path> </svg>`;
}, "F:/progra/vitrina-promo/src/components/ArrowIcon.astro", void 0);

const $$Astro$c = createAstro("https://www.elenisourcing.cl");
const $$Navbar = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$c, $$props, $$slots);
  Astro2.self = $$Navbar;
  const locale = Astro2.currentLocale ?? "es";
  const t = dicts[locale];
  const links = [
    { href: "#inicio", label: t.nav.home },
    { href: "#productos", label: t.nav.products },
    { href: "#nosotros", label: t.nav.about },
    { href: "#proceso", label: t.nav.process },
    { href: "#contacto", label: t.nav.contact }
  ];
  return renderTemplate`${maybeRenderHead()}<header class="site-head" data-astro-cid-5blmo7yk> <div class="shell site-head__inner" data-astro-cid-5blmo7yk> <a class="brand" href="#inicio" aria-label="Eleni Sourcing — inicio" data-astro-cid-5blmo7yk> <span class="brand__mark" data-astro-cid-5blmo7yk>${renderComponent($$result, "LeafMark", $$LeafMark, { "n": 34, "data-astro-cid-5blmo7yk": true })}</span> <span class="brand__name" data-astro-cid-5blmo7yk>
Eleni Sourcing
<span class="brand__tag" data-astro-cid-5blmo7yk>${t.brandTag}</span> </span> </a> <nav class="site-nav" aria-label="Principal" data-astro-cid-5blmo7yk> <ul class="site-nav__list" data-astro-cid-5blmo7yk> ${links.map((l) => renderTemplate`<li data-astro-cid-5blmo7yk><a${addAttribute(l.href, "href")} data-astro-cid-5blmo7yk>${l.label}</a></li>`)} </ul> </nav> <div class="site-head__btns" data-astro-cid-5blmo7yk> <nav class="lang" aria-label="Idioma / Language" data-astro-cid-5blmo7yk> <a href="/" hreflang="es"${addAttribute(locale === "es" ? "is-active" : "", "class")} data-astro-cid-5blmo7yk>${localeFlags.es}</a> <span aria-hidden="true" data-astro-cid-5blmo7yk>/</span> <a href="/pt/" hreflang="pt"${addAttribute(locale === "pt" ? "is-active" : "", "class")} data-astro-cid-5blmo7yk>${localeFlags.pt}</a> </nav> <a class="btn btn--primary" href="#formulario" data-astro-cid-5blmo7yk> ${t.nav.quote} ${renderComponent($$result, "ArrowIcon", $$ArrowIcon, { "n": 15, "data-astro-cid-5blmo7yk": true })} </a> <button class="nav-toggle tablet-hidden" type="button" aria-label="Abrir menú" aria-expanded="false" aria-controls="mobile-menu" data-astro-cid-5blmo7yk> <span class="nav-toggle__line" data-astro-cid-5blmo7yk></span> <span class="nav-toggle__line" data-astro-cid-5blmo7yk></span> <span class="nav-toggle__line" data-astro-cid-5blmo7yk></span> </button> </div> </div> <nav class="mobile-menu" id="mobile-menu" aria-label="Menú móvil" data-astro-cid-5blmo7yk> <div class="shell" data-astro-cid-5blmo7yk> <ul data-astro-cid-5blmo7yk> ${links.map((l) => renderTemplate`<li data-astro-cid-5blmo7yk><a${addAttribute(l.href, "href")} data-astro-cid-5blmo7yk>${l.label}</a></li>`)} </ul> <div class="mobile-menu__lang" data-astro-cid-5blmo7yk> <a href="/" hreflang="es"${addAttribute(locale === "es" ? "is-active" : "", "class")} data-astro-cid-5blmo7yk>${localeFlags.es}</a> <span aria-hidden="true" data-astro-cid-5blmo7yk>/</span> <a href="/pt/" hreflang="pt"${addAttribute(locale === "pt" ? "is-active" : "", "class")} data-astro-cid-5blmo7yk>${localeFlags.pt}</a> </div> <a class="btn btn--primary" href="#formulario" data-astro-cid-5blmo7yk> ${t.nav.quote} ${renderComponent($$result, "ArrowIcon", $$ArrowIcon, { "n": 16, "data-astro-cid-5blmo7yk": true })} </a> </div> </nav> </header> `;
}, "F:/progra/vitrina-promo/src/components/Navbar.astro", void 0);

const $$Astro$b = createAstro("https://www.elenisourcing.cl");
const $$Hero = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$b, $$props, $$slots);
  Astro2.self = $$Hero;
  const locale = Astro2.currentLocale ?? "es";
  const t = dicts[locale];
  const dateLabel = new Intl.DateTimeFormat(locale === "pt" ? "pt-BR" : "es-CL", {
    month: "long",
    year: "numeric"
  }).format(/* @__PURE__ */ new Date());
  const tokens = [
    ...t.hero.title.split(" ").map((word) => ({ word })),
    { word: t.hero.titleEm, em: true },
    ...t.hero.titleEnd.split(" ").map((word) => ({ word }))
  ];
  return renderTemplate`${maybeRenderHead()}<section class="hero" id="inicio"${addAttribute(locale === "pt" ? "In\xEDcio" : "Inicio", "aria-label")} data-astro-cid-bbe6dxrz> <div class="shell hero__grid" data-astro-cid-bbe6dxrz> <div class="hero__copy" data-astro-cid-bbe6dxrz> <p class="eyebrow reveal" style="--rd:.05s" data-astro-cid-bbe6dxrz>${t.hero.eyebrow}</p> <h1 class="hero__title" data-hero-title data-astro-cid-bbe6dxrz> ${tokens.map((tok, i) => renderTemplate`${renderComponent($$result, "Fragment", Fragment, { "data-astro-cid-bbe6dxrz": true }, { "default": async ($$result2) => renderTemplate`${i > 0 && " "}<span class="hw" data-astro-cid-bbe6dxrz> <span class="hw__in"${addAttribute(`--wd:${(i * 0.08).toFixed(2)}s`, "style")} data-astro-cid-bbe6dxrz> ${tok.em ? renderTemplate`<em class="i hero__em" data-astro-cid-bbe6dxrz>${tok.word}</em>` : tok.word} </span> </span> ` })}`)} </h1> <p class="hero__lede reveal" style="--rd:.32s" data-astro-cid-bbe6dxrz> ${t.hero.sub} </p> <div class="hero__cta reveal" style="--rd:.46s" data-astro-cid-bbe6dxrz> <a class="btn btn--primary btn--big" href="#formulario" data-astro-cid-bbe6dxrz> ${t.hero.cta} ${renderComponent($$result, "ArrowIcon", $$ArrowIcon, { "n": 17, "data-astro-cid-bbe6dxrz": true })} </a> <a class="btn btn--outline btn--big" href="#proveedores" data-astro-cid-bbe6dxrz> ${t.hero.suppliers} </a> <a class="btn btn--text" href="#productos" data-astro-cid-bbe6dxrz> ${t.hero.viewProducts} ${renderComponent($$result, "ArrowIcon", $$ArrowIcon, { "dir": "down", "n": 16, "data-astro-cid-bbe6dxrz": true })} </a> </div> <p class="hero__meta mono reveal" style="--rd:.6s" data-astro-cid-bbe6dxrz> <span data-astro-cid-bbe6dxrz>${t.hero.meta1}</span> <span data-astro-cid-bbe6dxrz>${t.hero.meta2}</span> </p> </div> <div class="hero__art reveal" style="--rd:.4s" data-astro-cid-bbe6dxrz> <form class="hform" id="contactForm" novalidate data-astro-cid-bbe6dxrz> <input type="hidden" name="lang"${addAttribute(locale, "value")} data-astro-cid-bbe6dxrz> <label class="hform__field" data-astro-cid-bbe6dxrz> <span data-astro-cid-bbe6dxrz>${t.contact.fName}</span> <input type="text" name="name" autocomplete="name" required data-astro-cid-bbe6dxrz> </label> <label class="hform__field" data-astro-cid-bbe6dxrz> <span data-astro-cid-bbe6dxrz>${t.contact.fEmail}</span> <input type="email" name="email" autocomplete="email" required data-astro-cid-bbe6dxrz> </label> <label class="hform__field" data-astro-cid-bbe6dxrz> <span data-astro-cid-bbe6dxrz>${t.contact.fMsg}</span> <textarea name="message"${addAttribute(4, "rows")}${addAttribute(t.contact.msgPh, "placeholder")} data-astro-cid-bbe6dxrz></textarea> </label> <button class="btn btn--primary btn--big hform__btn" type="submit" id="cFormSubmit"${addAttribute(t.contact.submit, "data-submit")}${addAttribute(t.contact.sending, "data-sending")} data-astro-cid-bbe6dxrz> <span id="cFormSubmitLabel" data-astro-cid-bbe6dxrz>${t.contact.submit}</span> ${renderComponent($$result, "ArrowIcon", $$ArrowIcon, { "n": 17, "data-astro-cid-bbe6dxrz": true })} </button> <p class="hform__error" id="cFormError" role="alert" hidden data-astro-cid-bbe6dxrz>${t.contact.sendError}</p> <p class="hform__done" id="cFormDone" hidden data-astro-cid-bbe6dxrz> <span class="hform__done-title" data-astro-cid-bbe6dxrz>${t.contact.doneTitle}</span> <span data-astro-cid-bbe6dxrz>${t.contact.doneText}</span> </p> <p class="hform__note mono" data-astro-cid-bbe6dxrz> ${t.contact.note} <a href="mailto:hola@elenisourcing.cl" data-astro-cid-bbe6dxrz>hola@elenisourcing.cl</a> </p> </form> </div> </div> <div class="shell hero__foot-meta" data-astro-cid-bbe6dxrz> <p class="mono muted-d" data-astro-cid-bbe6dxrz>${t.hero.strip}</p> <p class="mono muted-d" data-astro-cid-bbe6dxrz>${t.hero.updated} ${dateLabel}</p> </div> </section>  ${renderScript($$result, "F:/progra/vitrina-promo/src/components/Hero.astro?astro&type=script&index=0&lang.ts")}`;
}, "F:/progra/vitrina-promo/src/components/Hero.astro", void 0);

const $$Astro$a = createAstro("https://www.elenisourcing.cl");
const $$ProductArt = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$a, $$props, $$slots);
  Astro2.self = $$ProductArt;
  const { variant, uid } = Astro2.props;
  const GRAIN = `
<filter id="grain-${uid}" x="0" y="0" width="100%" height="100%">
  <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" result="n"/>
  <feColorMatrix type="saturate" values="0" in="n" result="g"/>
  <feComponentTransfer in="g">
    <feFuncA type="linear" slope="0.055"/>
  </feComponentTransfer>
</filter>`;
  function seal(cx, cy, s, bg, fg, vein) {
    const leaf = "M20 30.5C10.5 27.5 7.5 20 11.5 11.5C19.5 12 24.5 14.5 26.5 19.5C27.5 21.5 27.9 24 26.8 26.8C24.5 29.8 22.5 31.2 20 30.5Z";
    const v = "M12 13C17.5 10 25 11 29 17.5C23 15.5 16 15.5 12 13Z";
    return `
  <g transform="translate(${cx - 40 * s} ${cy - 40 * s}) scale(${s})">
    <circle cx="20" cy="20" r="20" fill="${bg}"/>
    <path d="${leaf}" fill="${fg}"/>
    <path d="${v}" fill="${vein}"/>
  </g>`;
  }
  const PAIR = {
    bottle: "bottle",
    tote: "tote",
    notebook: "notebook",
    mug: "mug",
    cap: "cap",
    kit: "kit"
  };
  const shape = PAIR[variant] ?? "bottle";
  return renderTemplate`${maybeRenderHead()}<svg viewBox="0 0 800 1000" role="img" class="p-art" preserveAspectRatio="xMidYMid slice" aria-hidden="true"> <defs> <linearGradient id="bg-\${uid}" x1="0" y1="0" x2="0" y2="1"> <stop offset="0" stop-color="\${sc.top}"></stop> <stop offset="1" stop-color="\${sc.bottom}"></stop> </linearGradient> <radialGradient id="light-\${uid}" cx="0.5" cy="0.12" r="0.85"> <stop offset="0" stop-color="#ffffff" stop-opacity="0.22"></stop> <stop offset="1" stop-color="#ffffff" stop-opacity="0"></stop> </radialGradient> <radialGradient id="vign-\${uid}" cx="0.5" cy="1" r="1"> <stop offset="0" stop-color="#151710" stop-opacity="0"></stop> <stop offset="1" stop-color="#151710" stop-opacity="0.16"></stop> </radialGradient> <filter id="soft-\${uid}" x="-40%" y="-40%" width="180%" height="180%"> <feGaussianBlur stdDeviation="14"></feGaussianBlur> </filter> <linearGradient id="metal-\${uid}" x1="0" y1="0" x2="1" y2="0"> <stop offset="0" stop-color="#DFE1D7"></stop> <stop offset="0.5" stop-color="#C6C9BC"></stop> <stop offset="1" stop-color="#A9AD9E"></stop> </linearGradient> <linearGradient id="pine-\${uid}" x1="0" y1="0" x2="0" y2="1"> <stop offset="0" stop-color="#4A7355"></stop> <stop offset="1" stop-color="#31603F"></stop> </linearGradient> <linearGradient id="bone-\${uid}" x1="0" y1="0" x2="0" y2="1"> <stop offset="0" stop-color="#F4F1E3"></stop> <stop offset="1" stop-color="#DDD7C0"></stop> </linearGradient>
$${GRAIN} </defs> <rect width="800" height="1000" fill="url(#bg-\${uid})"></rect> <rect width="800" height="1000" fill="url(#light-\${uid})"></rect> <rect width="800" height="1000" fill="url(#vign-\${uid})"></rect> ${shape === "bottle" && renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result2) => renderTemplate`<ellipse cx="400" cy="852" rx="175" ry="26" fill="#151710" opacity="0.22" filter="url(#soft-\${uid})"></ellipse> <rect x="310" y="770" width="180" height="30" rx="12" fill="#8F9486"></rect> <rect x="318" y="352" width="164" height="422" rx="34" fill="url(#metal-\${uid})"></rect> <rect x="350" y="296" width="100" height="92" rx="18" fill="#C7CABC"></rect> <rect x="334" y="390" width="22" height="330" rx="11" fill="#FFFFFF" opacity="0.30"></rect> <rect x="342" y="214" width="116" height="30" rx="10" fill="#3A3D33"></rect> <rect x="342" y="232" width="116" height="92" rx="18" fill="#25281F"></rect> <rect x="368" y="248" width="5" height="58" rx="2" fill="#3E4138"></rect> <rect x="385" y="248" width="5" height="58" rx="2" fill="#3E4138"></rect> <rect x="402" y="248" width="5" height="58" rx="2" fill="#3E4138"></rect> <rect x="318" y="480" width="164" height="122" rx="10" fill="#20221B" opacity="0.94"></rect> <rect x="332" y="498" width="136" height="2" fill="#FAF8F1" opacity="0.18"></rect> <rect x="332" y="584" width="136" height="2" fill="#FAF8F1" opacity="0.18"></rect> ${renderComponent($$result2, "Fragment", Fragment, {}, { "default": ($$result3) => renderTemplate`${unescapeHTML(seal(400, 528, 1.1, "#F4F1E4", "#3D6A4C", "#5D8A69"))}` })} <text x="400" y="622" text-anchor="middle" font-family="'IBM Plex Mono',monospace" font-size="22" letter-spacing="4" fill="#FAF8F1" opacity="0.85">ET-TERMO-500</text> ` })}`} ${shape === "tote" && renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result2) => renderTemplate`<ellipse cx="400" cy="760" rx="180" ry="22" fill="#151710" opacity="0.20" filter="url(#soft-\${uid})"></ellipse> <path d="M286 352 C268 252 290 178 366 174 M498 352 C510 240 500 168 432 166" stroke="#C9C1A2" stroke-width="12" fill="none" stroke-linecap="round"></path> <path d="M302 352 C284 240 306 168 380 166 M472 352 C510 240 500 168 440 164" stroke="#E7E2CA" stroke-width="26" fill="none" stroke-linecap="round"></path> <path d="M262 350 L538 350 L514 720 Q511 748 486 748 L314 748 Q289 748 286 720 Z" fill="#E7E2CA"></path> <rect x="258" y="344" width="284" height="14" rx="7" fill="#CFC7A8"></rect> <rect x="258" y="344" width="284" height="5" rx="3" fill="#BDB394" opacity="0.6"></rect> <path d="M262 350 L538 350 L534 384 L266 384 Z" fill="#D5CDAF"></path> <path d="M268 358 L532 358" stroke="#B7AE8F" stroke-width="2" stroke-dasharray="8 6"></path> <rect x="318" y="548" width="164" height="160" rx="8" fill="#DCD4B8"></rect> <rect x="328" y="558" width="144" height="140" rx="5" fill="none" stroke="#B9B091" stroke-width="2" stroke-dasharray="6 5"></rect> ${renderComponent($$result2, "Fragment", Fragment, {}, { "default": ($$result3) => renderTemplate`${unescapeHTML(seal(400, 600, 0.85, "#6B6652", "#EFEAD6", "#B9B091"))}` })} <text x="400" y="690" text-anchor="middle" font-family="'IBM Plex Mono',monospace" font-size="19" letter-spacing="5" fill="#6B6652">ELENI</text> ` })}`} ${shape === "notebook" && renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result2) => renderTemplate`<ellipse cx="400" cy="772" rx="150" ry="20" fill="#151710" opacity="0.24" filter="url(#soft-\${uid})"></ellipse> <rect x="508" y="280" width="24" height="448" rx="5" fill="#F2EFE2"></rect> <rect x="508" y="312" width="24" height="3" fill="#C9C3AC"></rect> <rect x="508" y="352" width="24" height="3" fill="#C9C3AC"></rect> <rect x="508" y="392" width="24" height="3" fill="#C9C3AC"></rect> <rect x="492" y="268" width="8" height="160" rx="3" fill="#8A8E80"></rect> <rect x="274" y="270" width="28" height="464" rx="7" fill="#2B4637"></rect> <rect x="286" y="284" width="3" height="436" stroke="#1A3525" stroke-width="3" stroke-dasharray="10 9"></rect> <rect x="297" y="292" width="3" height="420" stroke="#1A3525" stroke-width="3" stroke-dasharray="10 9"></rect> <rect x="296" y="270" width="216" height="464" rx="5" fill="url(#pine-\${uid})"></rect> <rect x="296" y="270" width="4" height="464" rx="2" fill="#FFFFFF" opacity="0.12"></rect> <rect x="444" y="270" width="16" height="464" rx="4" fill="#1E241B"></rect> ${renderComponent($$result2, "Fragment", Fragment, {}, { "default": ($$result3) => renderTemplate`${unescapeHTML(seal(404, 372, 1.05, "#F4F1E4", "#3D6A4C", "#5D8A69"))}` })} <text x="404" y="474" text-anchor="middle" font-family="'IBM Plex Mono',monospace" font-size="20" letter-spacing="4" fill="#F4F1E4" opacity="0.75">ET-NOTE-HC</text> ` })}`} ${shape === "mug" && renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result2) => renderTemplate`<ellipse cx="400" cy="812" rx="160" ry="20" fill="#151710" opacity="0.18" filter="url(#soft-\${uid})"></ellipse> <path d="M470 396 C556 388 566 528 484 562" stroke="#C9C0A6" stroke-width="10" fill="none" stroke-linecap="round"></path> <path d="M472 392 C552 388 560 520 484 552" stroke="#DED7C2" stroke-width="22" fill="none" stroke-linecap="round"></path> <ellipse cx="400" cy="352" rx="88" ry="24" fill="url(#bone-\${uid})"></ellipse> <ellipse cx="400" cy="352" rx="70" ry="15" fill="#B9B298"></ellipse> <ellipse cx="396" cy="348" rx="42" ry="10" fill="#817D6B" opacity="0.55"></ellipse> <path d="M314 350 L486 350 L502 718 Q503 768 456 772 L344 772 Q297 768 298 718 Z" fill="url(#bone-\${uid})"></path> <rect x="326" y="376" width="18" height="320" rx="9" fill="#FFFFFF" opacity="0.30"></rect> <rect x="310" y="742" width="180" height="20" rx="9" fill="#C6BEA2"></rect> ${renderComponent($$result2, "Fragment", Fragment, {}, { "default": ($$result3) => renderTemplate`${unescapeHTML(seal(400, 528, 1, "#3D6A4C", "#F4F1E4", "#5D8A69"))}` })} <text x="400" y="630" text-anchor="middle" font-family="'IBM Plex Mono',monospace" font-size="20" letter-spacing="4" fill="#6E6A58">ET-CER-330</text> ` })}`} ${shape === "cap" && renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result2) => renderTemplate`<ellipse cx="400" cy="808" rx="185" ry="22" fill="#151710" opacity="0.20" filter="url(#soft-\${uid})"></ellipse> <path d="M282 470 C278 340 330 260 436 260 C522 260 576 318 556 452 L548 470 Z" fill="#D6D0B8"></path> <path d="M286 470 L298 400 C306 316 362 280 436 280 C506 280 548 318 564 400 L574 470 Z" fill="url(#pine-\${uid})"></path> <path d="M436 470 C436 470 434 384 436 296" stroke="#2C4A38" stroke-width="4"></path> <path d="M316 352 Q436 300 560 352" stroke="#2C4A38" stroke-width="3" stroke-dasharray="7 6"></path> <rect x="430" y="258" width="12" height="8" rx="3" fill="#20221C"></rect> <rect x="280" y="470" width="300" height="30" rx="9" fill="#20221C"></rect> <rect x="284" y="474" width="292" height="3" stroke="#3C3E35" stroke-width="3" stroke-dasharray="8 6"></rect> ${renderComponent($$result2, "Fragment", Fragment, {}, { "default": ($$result3) => renderTemplate`${unescapeHTML(seal(430, 378, 1.05, "#F4F1E4", "#3D6A4C", "#5D8A69"))}` })} <path d="M150 500 Q400 530 650 500 L658 526 Q400 554 142 526 Z" fill="#D8D2BA"></path> <path d="M158 508 Q400 536 642 508 L650 526 Q400 554 150 526 Z" fill="#C6BE9F" opacity="0.65"></path> ` })}`} ${shape === "kit" && renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result2) => renderTemplate`<ellipse cx="400" cy="806" rx="200" ry="26" fill="#151710" opacity="0.22" filter="url(#soft-\${uid})"></ellipse> <rect x="322" y="394" width="156" height="3" fill="#B3AB92"></rect> <path d="M296 470 L504 470" stroke="#FAF8F1" stroke-opacity="0.08" stroke-width="2"></path> <rect x="306" y="424" width="188" height="46" fill="#2B2E27"></rect> <rect x="328" y="432" width="44" height="38" rx="6" fill="#E7E2CA" opacity="0.9"></rect> <rect x="382" y="434" width="26" height="36" rx="4" fill="#C7CABC" opacity="0.95"></rect> <rect x="296" y="470" width="208" height="300" rx="10" fill="#23251D"></rect> <rect x="296" y="470" width="208" height="300" rx="10" fill="none" stroke="#FAF8F1" stroke-opacity="0.05"></rect> <rect x="390" y="470" width="20" height="300" fill="#3D6A4C"></rect> <rect x="282" y="330" width="236" height="78" rx="10" fill="#F4F1E4"></rect> <rect x="282" y="330" width="236" height="14" rx="7" fill="#FFFFFF" opacity="0.35"></rect> <rect x="390" y="330" width="20" height="78" fill="#3D6A4C"></rect> ${renderComponent($$result2, "Fragment", Fragment, {}, { "default": ($$result3) => renderTemplate`${unescapeHTML(seal(400, 369, 0.9, "#3D6A4C", "#F4F1E4", "#7FA587"))}` })} <path d="M404 556 L404 524 L426 508 L404 520 L382 508 L404 524 L404 556 Z" fill="#F4F1E4"></path> <rect x="412" y="530" width="26" height="66" rx="3" fill="#F4F1E4"></rect> <rect x="412" y="530" width="26" height="66" rx="3" fill="none" stroke="#CCC4AB" stroke-width="2"></rect> <circle cx="425" cy="544" r="3" fill="#B9B091"></circle> ${renderComponent($$result2, "Fragment", Fragment, {}, { "default": ($$result3) => renderTemplate`${unescapeHTML(seal(425, 584, 0.55, "#3D6A4C", "#F4F1E4", "#7FA587"))}` })} ` })}`} <rect width="800" height="1000" filter="url(#grain-\${uid})" pointer-events="none"></rect> </svg>`;
}, "F:/progra/vitrina-promo/src/components/ProductArt.astro", void 0);

const $$Astro$9 = createAstro("https://www.elenisourcing.cl");
const $$Selection = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$9, $$props, $$slots);
  Astro2.self = $$Selection;
  const { products } = Astro2.props;
  const locale = Astro2.currentLocale ?? "es";
  const t = dicts[locale];
  const total = products.length;
  const pad = (n) => String(n).padStart(2, "0");
  return renderTemplate`${maybeRenderHead()}<section class="cue" id="productos" aria-labelledby="cue-title" data-astro-cid-j2tfcmmf> <div class="shell" data-astro-cid-j2tfcmmf> <header class="cue__head" data-astro-cid-j2tfcmmf> <div class="cue__head-left" data-astro-cid-j2tfcmmf> <p class="eyebrow reveal" data-astro-cid-j2tfcmmf>${t.cue.eyebrow}</p> <h2 class="cue__title reveal" id="cue-title" style="--rd:.1s" data-astro-cid-j2tfcmmf>${t.cue.title}</h2> <p class="cue__desc reveal" style="--rd:.2s" data-astro-cid-j2tfcmmf> ${t.cue.desc} </p> </div> <div class="cue__head-right reveal" style="--rd:.3s" data-astro-cid-j2tfcmmf> <p class="cue__count mono" aria-live="polite" data-astro-cid-j2tfcmmf> <span data-counter-current data-astro-cid-j2tfcmmf>${pad(1)}</span> / ${pad(total)} </p> <div class="cue__nav" data-astro-cid-j2tfcmmf> <button class="arrowbtn" type="button" data-nav="prev"${addAttribute(t.cue.prev, "aria-label")} data-astro-cid-j2tfcmmf> ${renderComponent($$result, "ArrowIcon", $$ArrowIcon, { "n": 16, "data-astro-cid-j2tfcmmf": true })} </button> <button class="arrowbtn" type="button" data-nav="next"${addAttribute(t.cue.next, "aria-label")} data-astro-cid-j2tfcmmf> ${renderComponent($$result, "ArrowIcon", $$ArrowIcon, { "n": 16, "data-astro-cid-j2tfcmmf": true })} </button> </div> </div> </header> </div> <div class="cue__viewport" id="cueViewport" data-astro-cid-j2tfcmmf> <div class="cue__track" id="cueTrack" role="region"${addAttribute(t.cue.region, "aria-label")} tabindex="0" data-astro-cid-j2tfcmmf> ${products.map((p, i) => {
    const disp = productDisplay(p.data, locale);
    return renderTemplate`<article${addAttribute(`cue__photo${i === 0 ? " is-active" : ""}`, "class")}${addAttribute(`cue-slide-${p.data.slug}`, "id")}${addAttribute(i, "data-index")}${addAttribute(disp.name, "aria-label")} data-astro-cid-j2tfcmmf> <div class="cue__photo-art" data-astro-cid-j2tfcmmf> ${renderComponent($$result, "ProductArt", $$ProductArt, { "variant": p.data.art, "uid": `deck-${p.data.slug}`, "data-astro-cid-j2tfcmmf": true })} </div> <p class="cue__cap" data-astro-cid-j2tfcmmf> <a href="#formulario"${addAttribute(disp.name, "data-quote-product")} data-astro-cid-j2tfcmmf> ${disp.name} </a> <span class="cue__fig mono" data-astro-cid-j2tfcmmf>${pad(i + 1)}</span> </p> </article>`;
  })} </div> </div> <div class="shell" data-astro-cid-j2tfcmmf> <div class="cue__progress" aria-hidden="true" data-astro-cid-j2tfcmmf> <span class="cue__progress-fill" data-counter-progress-fill data-astro-cid-j2tfcmmf></span> </div> </div> </section>  ${renderScript($$result, "F:/progra/vitrina-promo/src/components/Selection.astro?astro&type=script&index=0&lang.ts")}`;
}, "F:/progra/vitrina-promo/src/components/Selection.astro", void 0);

const $$Astro$8 = createAstro("https://www.elenisourcing.cl");
const $$Services = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$8, $$props, $$slots);
  Astro2.self = $$Services;
  const locale = Astro2.currentLocale ?? "es";
  const t = dicts[locale];
  const services = t.svc.items.map((s, i) => ({
    n: String(i + 1).padStart(2, "0"),
    ...s
  }));
  return renderTemplate`${maybeRenderHead()}<section class="svc sec--paper" aria-labelledby="svc-title" data-astro-cid-g5jplrhu> <div class="shell svc__grid" data-astro-cid-g5jplrhu> <div class="svc__intro" data-astro-cid-g5jplrhu> <p class="eyebrow reveal" data-astro-cid-g5jplrhu>${t.svc.eyebrow}</p> <h2 class="svc__title reveal" id="svc-title" style="--rd:.1s" data-astro-cid-g5jplrhu>${t.svc.title}</h2> <p class="svc__lede reveal" style="--rd:.2s" data-astro-cid-g5jplrhu> ${t.svc.lede} </p> <p class="svc__note mono reveal" style="--rd:.3s" data-astro-cid-g5jplrhu> ${t.svc.note} </p> </div> <ol class="svc__list" data-astro-cid-g5jplrhu> ${services.map((s, i) => renderTemplate`<li class="svc__row reveal"${addAttribute(`--rd:${i * 0.08}s`, "style")} data-astro-cid-g5jplrhu> <span class="svc__row-n mono" aria-hidden="true" data-astro-cid-g5jplrhu>${s.n}</span> <div class="svc__row-body" data-astro-cid-g5jplrhu> <h3 class="svc__row-name" data-astro-cid-g5jplrhu>${s.name}</h3> <p class="svc__row-desc" data-astro-cid-g5jplrhu>${s.desc}</p> </div> <span class="svc__row-tag mono" data-astro-cid-g5jplrhu>${s.tag}</span> </li>`)} </ol> </div> </section> `;
}, "F:/progra/vitrina-promo/src/components/Services.astro", void 0);

const $$Astro$7 = createAstro("https://www.elenisourcing.cl");
const $$Process = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$7, $$props, $$slots);
  Astro2.self = $$Process;
  const locale = Astro2.currentLocale ?? "es";
  const t = dicts[locale];
  const steps = t.prc.steps.map((s, i) => ({
    n: String(i + 1).padStart(2, "0"),
    ...s
  }));
  return renderTemplate`${maybeRenderHead()}<section class="proc" id="proceso" aria-labelledby="proc-title" data-astro-cid-fz4tclxl> <div class="shell" data-astro-cid-fz4tclxl> <header class="proc__head" data-astro-cid-fz4tclxl> <div data-astro-cid-fz4tclxl> <p class="eyebrow reveal" data-astro-cid-fz4tclxl>${t.prc.eyebrow}</p> <h2 class="proc__title reveal" id="proc-title" style="--rd:.1s" data-astro-cid-fz4tclxl>${t.prc.title}</h2> </div> <p class="proc__desc reveal" style="--rd:.2s" data-astro-cid-fz4tclxl> ${t.prc.desc} </p> </header> <ol class="proc__steps" data-astro-cid-fz4tclxl> ${steps.map((s, i) => renderTemplate`<li class="proc__step reveal"${addAttribute(`--rd:${0.1 + i * 0.12}s`, "style")} data-astro-cid-fz4tclxl> <span class="proc__num" aria-hidden="true" data-astro-cid-fz4tclxl>${s.n}</span> <h3 class="proc__name" data-astro-cid-fz4tclxl>${s.name}</h3> <p class="proc__desc" data-astro-cid-fz4tclxl>${s.desc}</p> <p class="proc__hint mono" data-astro-cid-fz4tclxl>${s.hint}</p> </li>`)} </ol> </div> </section> `;
}, "F:/progra/vitrina-promo/src/components/Process.astro", void 0);

const $$Astro$6 = createAstro("https://www.elenisourcing.cl");
const $$Applications = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$6, $$props, $$slots);
  Astro2.self = $$Applications;
  const locale = Astro2.currentLocale ?? "es";
  const t = dicts[locale];
  const letters = ["a", "b", "c", "d", "e", "f"];
  const uses = t.apps.uses.map((u, i) => ({
    n: String(i + 1).padStart(2, "0"),
    ...u,
    cls: letters[i]
  }));
  return renderTemplate`${maybeRenderHead()}<section class="apps" aria-labelledby="apps-title" data-astro-cid-vnr6tbjs> <div class="shell" data-astro-cid-vnr6tbjs> <div class="apps__head" data-astro-cid-vnr6tbjs> <p class="eyebrow reveal" data-astro-cid-vnr6tbjs>${t.apps.eyebrow}</p> <h2 class="apps__title reveal" id="apps-title" style="--rd:.1s" data-astro-cid-vnr6tbjs>${t.apps.title}</h2> </div> </div> <div class="apps__wall" data-astro-cid-vnr6tbjs> ${uses.map((u, i) => renderTemplate`<article${addAttribute(`app-tile app-tile--${u.cls} reveal`, "class")}${addAttribute(`--rd:${0.05 + i * 0.05}s`, "style")} data-astro-cid-vnr6tbjs> <div class="shell app-tile__inner" data-astro-cid-vnr6tbjs> <span class="app-tile__ix mono" data-astro-cid-vnr6tbjs>${u.n}</span> <h3 class="app-tile__name" data-astro-cid-vnr6tbjs>${u.name}</h3> <p class="app-tile__ex" data-astro-cid-vnr6tbjs>${u.ex}</p> </div> </article>`)} </div> </section> `;
}, "F:/progra/vitrina-promo/src/components/Applications.astro", void 0);

const $$Astro$5 = createAstro("https://www.elenisourcing.cl");
const $$About = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$5, $$props, $$slots);
  Astro2.self = $$About;
  const locale = Astro2.currentLocale ?? "es";
  const t = dicts[locale];
  const caps = t.abt.caps;
  return renderTemplate`${maybeRenderHead()}<section class="abt" id="nosotros" aria-labelledby="abt-title" data-astro-cid-v2cbyr3p> <div class="shell abt__grid" data-astro-cid-v2cbyr3p> <div class="abt__side" data-astro-cid-v2cbyr3p> <p class="eyebrow reveal" data-astro-cid-v2cbyr3p>${t.abt.eyebrow}</p> <div class="abt__mark reveal" aria-hidden="true" data-astro-cid-v2cbyr3p> <!-- sello hoja --> </div> </div> <div class="abt__body" data-astro-cid-v2cbyr3p> <h2 class="abt__title reveal" id="abt-title" style="--rd:.1s" data-astro-cid-v2cbyr3p> ${t.abt.title} <em class="i" data-astro-cid-v2cbyr3p>${t.abt.titleEm}</em> </h2> <div class="abt__cols" data-astro-cid-v2cbyr3p> <p class="abt__p reveal" style="--rd:.2s" data-astro-cid-v2cbyr3p> ${t.abt.p1} </p> <p class="abt__p reveal" style="--rd:.3s" data-astro-cid-v2cbyr3p> ${t.abt.p2} </p> </div> <ul class="abt__caps" role="list" data-astro-cid-v2cbyr3p> ${caps.map((c, i) => renderTemplate`<li class="reveal"${addAttribute(`--rd:${0.15 + i * 0.07}s`, "style")} data-astro-cid-v2cbyr3p> <span class="abt__caps-n mono" aria-hidden="true" data-astro-cid-v2cbyr3p>${String(i + 1).padStart(2, "0")}</span> <span data-astro-cid-v2cbyr3p>${c}</span> </li>`)} </ul> </div> </div> </section> `;
}, "F:/progra/vitrina-promo/src/components/About.astro", void 0);

const $$Astro$4 = createAstro("https://www.elenisourcing.cl");
const $$CTASection = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$4, $$props, $$slots);
  Astro2.self = $$CTASection;
  const locale = Astro2.currentLocale ?? "es";
  const t = dicts[locale];
  return renderTemplate`${maybeRenderHead()}<section class="cta" id="contacto" aria-labelledby="cta-title" data-astro-cid-frbqrhml> <div class="shell cta__inner" data-astro-cid-frbqrhml> <p class="eyebrow reveal" data-astro-cid-frbqrhml>${t.cta.eyebrow}</p> <h2 class="cta__title reveal" id="cta-title" style="--rd:.12s" data-astro-cid-frbqrhml> ${t.cta.title} </h2> <p class="cta__sub reveal" style="--rd:.24s" data-astro-cid-frbqrhml> ${t.cta.sub} </p> <div class="cta__actions reveal" style="--rd:.36s" data-astro-cid-frbqrhml> <a class="btn btn--primary btn--big" href="#formulario" data-astro-cid-frbqrhml> ${t.cta.btn} ${renderComponent($$result, "ArrowIcon", $$ArrowIcon, { "n": 18, "data-astro-cid-frbqrhml": true })} </a> <a class="btn btn--outline btn--big" href="#proveedores" data-astro-cid-frbqrhml> ${t.cta.suppliers} </a> </div> <ul class="cta__contacts reveal" style="--rd:.48s" data-astro-cid-frbqrhml> <li data-astro-cid-frbqrhml><span class="mono" data-astro-cid-frbqrhml>${t.cta.wa}</span><a href="https://wa.me/56900000000" rel="noopener" data-astro-cid-frbqrhml>+56 9 0000 0000</a></li> <li data-astro-cid-frbqrhml><span class="mono" data-astro-cid-frbqrhml>${t.cta.email}</span><a href="mailto:hola@elenisourcing.cl" data-astro-cid-frbqrhml>hola@elenisourcing.cl</a></li> <li data-astro-cid-frbqrhml><span class="mono" data-astro-cid-frbqrhml>${t.cta.tel}</span><a href="tel:+56200000000" data-astro-cid-frbqrhml>+56 2 0000 0000</a></li> </ul> </div> </section> `;
}, "F:/progra/vitrina-promo/src/components/CTASection.astro", void 0);

const $$Astro$3 = createAstro("https://www.elenisourcing.cl");
const $$QuoteForm = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
  Astro2.self = $$QuoteForm;
  const { products } = Astro2.props;
  const locale = Astro2.currentLocale ?? "es";
  const t = dicts[locale];
  const todayISO = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  return renderTemplate`${maybeRenderHead()}<section class="qo" id="formulario" aria-labelledby="qo-title" data-astro-cid-dmdhz2qs> <div class="shell qo__grid" data-astro-cid-dmdhz2qs> <div class="qo__intro" data-astro-cid-dmdhz2qs> <p class="eyebrow reveal" data-astro-cid-dmdhz2qs>${t.qo.eyebrow}</p> <h2 class="qo__title reveal" id="qo-title" style="--rd:.1s" data-astro-cid-dmdhz2qs>${t.qo.title}</h2> <p class="qo__lede reveal" style="--rd:.2s" data-astro-cid-dmdhz2qs> ${t.qo.lede} </p> <ul class="qo__what reveal" style="--rd:.3s" data-astro-cid-dmdhz2qs> ${t.qo.what.map((w) => renderTemplate`<li data-astro-cid-dmdhz2qs><span class="mono" data-astro-cid-dmdhz2qs>${w.label}</span>${w.text}</li>`)} </ul> <p class="qo__alt mono reveal" style="--rd:.4s" data-astro-cid-dmdhz2qs> ${t.qo.alt} <a href="https://wa.me/56900000000" rel="noopener" data-astro-cid-dmdhz2qs>${t.qo.wa}</a> </p> </div> <form class="qo__form reveal" style="--rd:.25s" id="quoteForm" novalidate data-astro-cid-dmdhz2qs> <input type="hidden" name="lang"${addAttribute(locale, "value")} data-astro-cid-dmdhz2qs> <div class="qo__fields" data-astro-cid-dmdhz2qs> <label class="field field--half" data-astro-cid-dmdhz2qs> <span data-astro-cid-dmdhz2qs>${t.qo.fName}</span> <input type="text" name="name" autocomplete="name" required data-astro-cid-dmdhz2qs> </label> <label class="field field--half" data-astro-cid-dmdhz2qs> <span data-astro-cid-dmdhz2qs>${t.qo.fCompany}</span> <input type="text" name="company" autocomplete="organization" data-astro-cid-dmdhz2qs> </label> <label class="field field--half" data-astro-cid-dmdhz2qs> <span data-astro-cid-dmdhz2qs>${t.qo.fEmail}</span> <input type="email" name="email" autocomplete="email" required data-astro-cid-dmdhz2qs> </label> <label class="field field--half" data-astro-cid-dmdhz2qs> <span data-astro-cid-dmdhz2qs>${t.qo.fPhone}</span> <input type="tel" name="phone" autocomplete="tel" data-astro-cid-dmdhz2qs> </label> <label class="field" data-astro-cid-dmdhz2qs> <span data-astro-cid-dmdhz2qs>${t.qo.fProduct}</span> <select name="product" id="selProducto" data-astro-cid-dmdhz2qs> <option value="" data-astro-cid-dmdhz2qs>${t.qo.selProduct}</option> ${products.map((p) => {
    const disp = productDisplay(p.data, locale);
    return renderTemplate`<option${addAttribute(disp.name, "value")} data-astro-cid-dmdhz2qs>${disp.name} · ${p.data.sku}</option>`;
  })} <option${addAttribute(t.qo.otrodProduct, "value")} data-astro-cid-dmdhz2qs>${t.qo.otrodProduct}</option> </select> </label> <div class="field-row" data-astro-cid-dmdhz2qs> <label class="field" data-astro-cid-dmdhz2qs> <span data-astro-cid-dmdhz2qs>${t.qo.fQty}</span> <select name="quantity" data-astro-cid-dmdhz2qs> <option value="" data-astro-cid-dmdhz2qs>${t.qo.selQty}</option> ${t.qo.quantities.map((q) => renderTemplate`<option data-astro-cid-dmdhz2qs>${q}</option>`)} </select> </label> <label class="field" data-astro-cid-dmdhz2qs> <span data-astro-cid-dmdhz2qs>${t.qo.fDate}</span> <input type="date" name="date"${addAttribute(todayISO, "min")} data-astro-cid-dmdhz2qs> </label> </div> <label class="field" data-astro-cid-dmdhz2qs> <span data-astro-cid-dmdhz2qs>${t.qo.fMsg}</span> <textarea name="message"${addAttribute(4, "rows")}${addAttribute(t.qo.msgPh, "placeholder")} data-astro-cid-dmdhz2qs></textarea> </label> </div> <div class="qo__actions" data-astro-cid-dmdhz2qs> <button class="btn btn--primary btn--big" type="submit" id="qoSubmit"${addAttribute(t.qo.submit, "data-submit")}${addAttribute(t.qo.sending, "data-sending")} data-astro-cid-dmdhz2qs> <span id="qoSubmitLabel" data-astro-cid-dmdhz2qs>${t.qo.submit}</span> ${renderComponent($$result, "ArrowIcon", $$ArrowIcon, { "n": 17, "data-astro-cid-dmdhz2qs": true })} </button> <p class="qo__fine mono" id="qoFine" data-astro-cid-dmdhz2qs>${t.qo.fine}</p> </div> <p class="qo__error" id="qoError" role="alert" hidden data-astro-cid-dmdhz2qs>${t.qo.sendError}</p> <div class="qo__done" id="qoDone" hidden data-astro-cid-dmdhz2qs> <span class="qo__done-mark" aria-hidden="true" data-astro-cid-dmdhz2qs></span> <h3 class="qo__done-title" data-astro-cid-dmdhz2qs>${t.qo.doneTitle}</h3> <p class="qo__done-text" data-astro-cid-dmdhz2qs> ${t.qo.doneText} </p> <p class="qo__done-note mono" data-astro-cid-dmdhz2qs> ${t.qo.doneNote} </p> </div> </form> </div> </section>  ${renderScript($$result, "F:/progra/vitrina-promo/src/components/QuoteForm.astro?astro&type=script&index=0&lang.ts")}`;
}, "F:/progra/vitrina-promo/src/components/QuoteForm.astro", void 0);

const $$Astro$2 = createAstro("https://www.elenisourcing.cl");
const $$SupplierForm = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$SupplierForm;
  const locale = Astro2.currentLocale ?? "es";
  const t = dicts[locale];
  return renderTemplate`${maybeRenderHead()}<section class="sup" id="proveedores" aria-labelledby="sup-title" data-astro-cid-ws4oumaj> <div class="shell sup__grid" data-astro-cid-ws4oumaj> <div class="sup__intro" data-astro-cid-ws4oumaj> <p class="eyebrow reveal" data-astro-cid-ws4oumaj>${t.sup.eyebrow}</p> <h2 class="sup__title reveal" id="sup-title" style="--rd:.1s" data-astro-cid-ws4oumaj>${t.sup.title}</h2> <p class="sup__lede reveal" style="--rd:.2s" data-astro-cid-ws4oumaj>${t.sup.lede}</p> <ul class="sup__what reveal" style="--rd:.3s" data-astro-cid-ws4oumaj> ${t.sup.what.map((w) => renderTemplate`<li data-astro-cid-ws4oumaj><span class="mono" data-astro-cid-ws4oumaj>${w.label}</span>${w.text}</li>`)} </ul> <p class="sup__alt mono reveal" style="--rd:.4s" data-astro-cid-ws4oumaj> ${t.sup.alt} <a href="https://wa.me/56900000000" rel="noopener" data-astro-cid-ws4oumaj>${t.sup.wa}</a> </p> </div> <form class="sup__form reveal" style="--rd:.25s" id="supplierForm" novalidate data-astro-cid-ws4oumaj> <input type="hidden" name="lang"${addAttribute(locale, "value")} data-astro-cid-ws4oumaj> <div class="sup__fields" data-astro-cid-ws4oumaj> <label class="field field--half" data-astro-cid-ws4oumaj> <span data-astro-cid-ws4oumaj>${t.sup.fCompany}</span> <input type="text" name="company" autocomplete="organization" required data-astro-cid-ws4oumaj> </label> <label class="field field--half" data-astro-cid-ws4oumaj> <span data-astro-cid-ws4oumaj>${t.sup.fName}</span> <input type="text" name="name" autocomplete="name" required data-astro-cid-ws4oumaj> </label> <label class="field field--half" data-astro-cid-ws4oumaj> <span data-astro-cid-ws4oumaj>${t.sup.fEmail}</span> <input type="email" name="email" autocomplete="email" required data-astro-cid-ws4oumaj> </label> <label class="field field--half" data-astro-cid-ws4oumaj> <span data-astro-cid-ws4oumaj>${t.sup.fPhone}</span> <input type="tel" name="phone" autocomplete="tel" data-astro-cid-ws4oumaj> </label> <label class="field" data-astro-cid-ws4oumaj> <span data-astro-cid-ws4oumaj>${t.sup.fCategory}</span> <select name="category" data-astro-cid-ws4oumaj> <option value="" data-astro-cid-ws4oumaj>${t.sup.selCategory}</option> ${t.sup.categoryOptions.map((c) => renderTemplate`<option data-astro-cid-ws4oumaj>${c}</option>`)} </select> </label> <div class="field-row" data-astro-cid-ws4oumaj> <label class="field" data-astro-cid-ws4oumaj> <span data-astro-cid-ws4oumaj>${t.sup.fOrigin}</span> <select name="origin" data-astro-cid-ws4oumaj> <option value="" data-astro-cid-ws4oumaj>${t.sup.selOrigin}</option> ${t.sup.originOptions.map((o) => renderTemplate`<option data-astro-cid-ws4oumaj>${o}</option>`)} </select> </label> <label class="field" data-astro-cid-ws4oumaj> <span data-astro-cid-ws4oumaj>${t.sup.fMoq}</span> <input type="text" name="moq"${addAttribute(t.sup.moqPh, "placeholder")} data-astro-cid-ws4oumaj> </label> </div> <label class="field" data-astro-cid-ws4oumaj> <span data-astro-cid-ws4oumaj>${t.sup.fMsg}</span> <textarea name="message"${addAttribute(4, "rows")}${addAttribute(t.sup.msgPh, "placeholder")} data-astro-cid-ws4oumaj></textarea> </label> </div> <div class="sup__actions" data-astro-cid-ws4oumaj> <button class="btn btn--primary btn--big" type="submit" id="supSubmit"${addAttribute(t.sup.submit, "data-submit")}${addAttribute(t.sup.sending, "data-sending")} data-astro-cid-ws4oumaj> <span id="supSubmitLabel" data-astro-cid-ws4oumaj>${t.sup.submit}</span> ${renderComponent($$result, "ArrowIcon", $$ArrowIcon, { "n": 17, "data-astro-cid-ws4oumaj": true })} </button> <p class="sup__fine mono" id="supFine" data-astro-cid-ws4oumaj>${t.sup.fine}</p> </div> <p class="sup__error" id="supError" role="alert" hidden data-astro-cid-ws4oumaj>${t.sup.sendError}</p> <div class="sup__done" id="supDone" hidden data-astro-cid-ws4oumaj> <span class="sup__done-mark" aria-hidden="true" data-astro-cid-ws4oumaj></span> <h3 class="sup__done-title" data-astro-cid-ws4oumaj>${t.sup.doneTitle}</h3> <p class="sup__done-text" data-astro-cid-ws4oumaj>${t.sup.doneText}</p> <p class="sup__done-note mono" data-astro-cid-ws4oumaj>${t.sup.doneNote}</p> </div> </form> </div> </section>  ${renderScript($$result, "F:/progra/vitrina-promo/src/components/SupplierForm.astro?astro&type=script&index=0&lang.ts")}`;
}, "F:/progra/vitrina-promo/src/components/SupplierForm.astro", void 0);

const $$Astro$1 = createAstro("https://www.elenisourcing.cl");
const $$Footer = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Footer;
  const locale = Astro2.currentLocale ?? "es";
  const t = dicts[locale];
  const year = (/* @__PURE__ */ new Date()).getFullYear();
  const navLinks = [
    { href: "#inicio", label: t.nav.home },
    { href: "#productos", label: t.nav.products },
    { href: "#nosotros", label: t.nav.about },
    { href: "#proceso", label: t.nav.process },
    { href: "#contacto", label: t.nav.contact }
  ];
  return renderTemplate`${maybeRenderHead()}<footer class="site-foot"> <div class="shell"> <div class="site-foot__top"> <div class="site-foot__brand"> <a class="brand" href="#inicio"${addAttribute(`Eleni Sourcing \u2014 ${t.nav.home}`, "aria-label")}> <span class="brand__mark">${renderComponent($$result, "LeafMark", $$LeafMark, { "n": 34 })}</span> <span class="brand__name">
Eleni Sourcing
<span class="brand__tag">${t.brandTag}</span> </span> </a> <p class="site-foot__blurb"> ${t.foot.blurb} </p> </div> <div class="site-foot__col"> <p class="mono">${t.foot.nav}</p> <ul> ${navLinks.map((l) => renderTemplate`<li><a${addAttribute(l.href, "href")}>${l.label}</a></li>`)} </ul> </div> <div class="site-foot__col"> <p class="mono">${t.foot.contact}</p> <ul class="site-foot__contact"> <li><a href="mailto:hola@elenisourcing.cl">hola@elenisourcing.cl</a></li> <li><a href="https://wa.me/56900000000" rel="noopener">WhatsApp +56 9 0000 0000</a></li> <li><span class="mono">Santiago · Chile</span></li> <li><span class="mono">Sourcing Brasil ↔ Chile</span></li> </ul> </div> </div> <div class="site-foot__bottom"> <p>© ${year} Eleni Sourcing SPA. ${t.foot.rights}</p> <nav class="site-foot__legal" aria-label="Legal"> <a href="#inicio">${t.foot.legalTerms}</a> <a href="#inicio">${t.foot.legalPrivacy}</a> </nav> </div> </div> </footer>`;
}, "F:/progra/vitrina-promo/src/components/Footer.astro", void 0);

const $$Astro = createAstro("https://www.elenisourcing.cl");
const $$SiteShell = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$SiteShell;
  const { products } = Astro2.props;
  return renderTemplate`${renderComponent($$result, "Navbar", $$Navbar, {})} ${maybeRenderHead()}<main id="contenido"> ${renderComponent($$result, "Hero", $$Hero, {})} ${renderComponent($$result, "Selection", $$Selection, { "products": products })} ${renderComponent($$result, "Services", $$Services, {})} ${renderComponent($$result, "Process", $$Process, {})} ${renderComponent($$result, "Applications", $$Applications, {})} ${renderComponent($$result, "About", $$About, {})} ${renderComponent($$result, "CTASection", $$CTASection, {})} ${renderComponent($$result, "QuoteForm", $$QuoteForm, { "products": products })} ${renderComponent($$result, "SupplierForm", $$SupplierForm, {})} </main> ${renderComponent($$result, "Footer", $$Footer, {})}`;
}, "F:/progra/vitrina-promo/src/components/SiteShell.astro", void 0);

export { $$Base as $, $$SiteShell as a, getCollection as g };
