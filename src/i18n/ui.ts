import type { CollectionEntry } from 'astro:content';

/* ────────────────────────────────────────────────────────────────
   Idioma de la página
   ──────────────────────────────────────────────────────────────── */

export const locales = ['es', 'pt'] as const;
export type Locale = (typeof locales)[number];

export const localeFlags: Record<Locale, string> = {
  es: 'ES',
  pt: 'PT',
};

/* ────────────────────────────────────────────────────────────────
   Diccionario de interfaz — el switch de idioma del nav muestra
   estas claves. Nunca cambies las claves, solo los valores.
   ──────────────────────────────────────────────────────────────── */

export type Dict = ReturnType<typeof makeDict>;

function makeDict(l: Locale) {
  const es = l === 'es';
  const one = (esV: string, ptV: string) => (es ? esV : ptV);
  return {
    brandTag: one('Promocionales · Importación', 'Promocionais · Importação'),
    nav: {
      home: one('Inicio', 'Início'),
      products: one('Productos', 'Produtos'),
      about: one('Nosotros', 'Nós'),
      process: one('Cómo trabajamos', 'Como trabalhamos'),
      contact: one('Contacto', 'Contato'),
      quote: one('Solicitar cotización', 'Solicitar cotação'),
    },
    hero: {
      eyebrow: one('Productos promocionales · Chile', 'Produtos promocionais · Chile'),
      title: one('Productos que hacen', 'Produtos que tornam') as string,
      titleEm: one('visible', 'visível') as string,
      titleEnd: one('tu marca.', 'a sua marca.') as string,
      sub: one(
        'Soluciones promocionales para empresas, eventos y campañas. Sourcing, importación y personalización de productos con la gestión que tu marca merece.',
        'Soluções promocionais para empresas, eventos e campanhas. Sourcing, importação e personalização de produtos com a gestão que a sua marca merece.'
      ),
      cta: one('Solicitar cotización', 'Solicitar cotação'),
      viewProducts: one('Ver productos', 'Ver produtos'),
      suppliers: one('Para proveedores', 'Para fornecedores'),
      meta1: one('Desde 10 a 500.000 unidades', 'De 10 a 500.000 unidades'),
      meta2: one('Personalización propia', 'Personalização própria'),
      note: one(
        'El sello de cada producto se imprime con la marca de tu empresa.',
        'O selo de cada produto é aplicado com a marca da sua empresa.'
      ),
      updated: one('Cerrado el', 'Fechado em'),
      strip: one('Sourcing · Importación · Personalización · Logística', 'Sourcing · Importação · Personalização · Logística'),
    },
    cue: {
      eyebrow: one('Selección mensual', 'Seleção mensal'),
      title: one('Selección del mes', 'Seleção do mês'),
      desc: one(
        'Una selección de productos para campañas, eventos y regalos corporativos. Renovamos la vitrina cada mes.',
        'Uma seleção de produtos para campanhas, eventos e presentes corporativos. Renovamos a vitrine a cada mês.'
      ),
      prev: one('Producto anterior', 'Produto anterior'),
      next: one('Producto siguiente', 'Próximo produto'),
      region: one('Productos destacados', 'Produtos em destaque'),
      cust: one('Personalización', 'Personalização'),
      quote: one('Solicitar cotización', 'Solicitar cotação'),
      of: one('de', 'de'),
      specMaterial: one('Material', 'Material'),
      specMoq: one('Mínimo', 'Mínimo'),
      specOrigin: one('Origen', 'Origem'),
    },
    svc: {
      eyebrow: one('Qué hacemos', 'O que fazemos'),
      title: one('Más que un producto.', 'Mais que um produto.'),
      lede: one(
        'Encontramos, gestionamos y entregamos soluciones promocionales adaptadas a las necesidades de cada empresa.',
        'Encontramos, gerimos e entregamos soluções promocionais adaptadas às necessidades de cada empresa.'
      ),
      note: one('Un solo equipo desde la búsqueda hasta la entrega.', 'Um único time da busca à entrega.'),
      items: [
        {
          name: one('Sourcing', 'Sourcing'),
          desc: one(
            'Búsqueda y selección de productos según las necesidades del cliente.',
            'Busca e seleção de produtos de acordo com as necessidades do cliente.'
          ),
          tag: one('Proveedores curados y validados', 'Fornecedores curados e validados'),
        },
        {
          name: one('Importación', 'Importação'),
          desc: one(
            'Gestión de productos y proveedores internacionales, con foco en Brasil y el mercado asiático.',
            'Gestão de produtos e fornecedores internacionais, com foco no Brasil e no mercado asiático.'
          ),
          tag: one('Origen Brasil ↔ Chile', 'Origem Brasil ↔ Chile'),
        },
        {
          name: one('Personalización', 'Personalização'),
          desc: one(
            'Opciones de personalización y branding según el producto: grabado, serigrafía, bordado y más.',
            'Opções de personalização e branding conforme o produto: gravação, serigrafia, bordado e mais.'
          ),
          tag: one('Grabado · Serigrafía · Bordado', 'Gravação · Serigrafia · Bordado'),
        },
        {
          name: one('Logística', 'Logística'),
          desc: one(
            'Gestión y coordinación de la entrega de los productos, hasta la mano de tu marca.',
            'Gestão e coordenação da entrega dos produtos, até a mão da sua marca.'
          ),
          tag: one('Coordinar y entregar en tiempo', 'Coordenar e entregar no prazo'),
        },
      ],
    },
    prc: {
      eyebrow: one('Cómo trabajamos', 'Como trabalhamos'),
      title: one('De la idea al producto.', 'Da ideia ao produto.'),
      desc: one(
        'Cotizar tu merch corporativo es más simple de lo que parece. Tres pasos y tienes tu propuesta.',
        'Cotar o seu merch corporativo é mais simples do que parece. Três passos e você tem a sua proposta.'
      ),
      steps: [
        {
          name: one('Elige', 'Escolha'),
          desc: one(
            'Explora nuestra selección de productos o cuéntanos qué estás buscando.',
            'Explore a nossa seleção de produtos ou conte o que você procura.'
          ),
          hint: one('Vitrina mensual o búsqueda a medida', 'Vitrine mensal ou busca sob medida'),
        },
        {
          name: one('Cuéntanos', 'Conte-nos'),
          desc: one(
            'Indica cantidades, personalización, presupuesto y fecha requerida.',
            'Indique quantidades, personalização, orçamento e data desejada.'
          ),
          hint: one('Solo lo que necesitamos para cotizar', 'Apenas o que precisamos para cotar'),
        },
        {
          name: one('Recibe', 'Receba'),
          desc: one(
            'Preparamos una propuesta adaptada a tu proyecto. Tú decides cómo seguir.',
            'Preparamos uma proposta adaptada ao seu projeto. Você decide como seguir.'
          ),
          hint: one('Respuesta dentro de 24 h hábiles', 'Resposta em até 24 h úteis'),
        },
      ],
    },
    apps: {
      eyebrow: one('Aplicaciones', 'Aplicações'),
      title: one('Para cada momento de tu marca.', 'Para cada momento da sua marca.'),
      uses: [
        { name: one('Eventos corporativos', 'Eventos corporativos'), ex: one('Lanyards, credenciales y regalos para asistentes', 'Lanyards, crachás e brindes para participantes') },
        { name: one('Regalos empresariales', 'Presentes empresariais'), ex: one('Obsequios de cierre de año y de agradecimiento', 'Brindes de fim de ano e de agradecimento') },
        { name: one('Campañas de marketing', 'Campanhas de marketing'), ex: one('Merch que acompaña cada lanzamiento', 'Merch que acompanha cada lançamento') },
        { name: one('Merchandising', 'Merchandising'), ex: one('Productos con tu marca para la calle y la oficina', 'Produtos com a sua marca para a rua e o escritório') },
        { name: one('Activaciones de marca', 'Ativações de marca'), ex: one('Material memorable para tu próxima activación', 'Material memorável para a sua próxima ativação') },
        { name: one('Kits corporativos', 'Kits corporativos'), ex: one('Onboarding, equipos y clientes nuevos', 'Onboarding, equipes e novos clientes') },
      ],
    },
    abt: {
      eyebrow: one('Sobre nosotros', 'Sobre nós'),
      title: one('Soluciones promocionales para marcas que quieren', 'Soluções promocionais para marcas que querem'),
      titleEm: one('destacar.', 'se destacar.'),
      p1: one(
        'Productos promocionales para empresas, merchandising corporativo y regalos de marca. Eleni Sourcing encuentra, importa y personaliza productos para marcas en Chile — con proveedores seleccionados en Brasil y otros mercados — para que tu campaña tenga el producto correcto, al precio correcto, en el momento correcto.',
        'Produtos promocionais para empresas, merchandising corporativo e presentes de marca. A Eleni Sourcing encontra, importa e personaliza produtos para marcas no Chile — com fornecedores selecionados no Brasil e em outros mercados — para que a sua campanha tenha o produto certo, pelo preço certo, no momento certo.'
      ),
      p2: one(
        'Trabajamos el detalle de fondo para que tu marca luzca bien. Desde la primera cotización hasta la última unidad entregada, hay una persona de nuestro equipo responsable de que todo llegue como se prometió.',
        'Trabalhamos o detalhe de fundo para que a sua marca brilhe. Da primeira cotação à última unidade entregue, há uma pessoa do nosso time responsável por tudo chegar como foi prometido.'
      ),
      caps: [
        one('Sourcing curado proveedor por proveedor', 'Sourcing curado fornecedor a fornecedor'),
        one('Importación Brasil ↔ Chile', 'Importação Brasil ↔ Chile'),
        one('Personalización con calidad verificada', 'Personalização com qualidade verificada'),
        one('Gestión de tiempos, aduana y despacho', 'Gestão de prazos, alfândega e entrega'),
      ],
    },
    cta: {
      eyebrow: one('Cotización sin compromiso', 'Cotação sem compromisso'),
      title: one('¿Tienes un proyecto en mente?', 'Tem um projeto em mente?'),
      sub: one(
        'Cuéntanos qué necesitas y preparemos una propuesta para tu empresa.',
        'Conte o que você precisa e preparemos uma proposta para a sua empresa.'
      ),
      btn: one('Solicitar cotización', 'Solicitar cotação'),
      suppliers: one('Para proveedores', 'Para fornecedores'),
      wa: one('WhatsApp', 'WhatsApp'),
      email: one('Email', 'E-mail'),
      tel: one('Teléfono', 'Telefone'),
    },
    qo: {
      eyebrow: one('Cotización', 'Cotação'),
      title: one('Hablemos de tu proyecto.', 'Vamos falar do seu projeto.'),
      lede: one(
        'Completa el formulario y te respondemos dentro de las próximas 24 horas hábiles con una propuesta adaptada a tu campaña.',
        'Preencha o formulário e respondemos em até 24 horas úteis com uma proposta adaptada à sua campanha.'
      ),
      what: [
        { label: one('Producto', 'Produto'), text: one('Cuéntanos qué necesitas o elige uno de la selección', 'Conte o que precisa ou escolha um da seleção') },
        { label: one('Cantidad', 'Quantidade'), text: one('Para poder hablar de precios reales', 'Para falarmos de preços reais') },
        { label: one('Fecha', 'Prazo'), text: one('El momento en que lo necesitas entregado', 'Quando você precisa da entrega') },
        { label: one('Personalización', 'Personalização'), text: one('Técnica y colores si ya los tienes en mente', 'Técnica e cores, se você já tem em mente') },
      ],
      alt: one('¿Prefieres no escribir? Escríbenos por', 'Prefere não escrever? Fale com a gente pelo'),
      wa: one('WhatsApp', 'WhatsApp'),
      fName: one('Nombre', 'Nome'),
      fCompany: one('Empresa', 'Empresa'),
      fEmail: one('Email', 'E-mail'),
      fPhone: one('Teléfono', 'Telefone'),
      fProduct: one('Producto de interés', 'Produto de interesse'),
      selProduct: one('— Elige una opción o cuéntanos a medida —', '— Escolha uma opção ou conte sob medida —'),
      otrodProduct: one('A medida / otro producto', 'Sob medida / outro produto'),
      fQty: one('Cantidad aproximada', 'Quantidade aproximada'),
      selQty: one('— Selecciona —', '— Selecione —'),
      quantities: [one('Menos de 50', 'Menos de 50'), one('50 – 199', '50 – 199'), one('200 – 499', '200 – 499'), one('500 – 999', '500 – 999'), one('1.000 o más', '1.000 ou mais')],
      fDate: one('Fecha requerida', 'Data desejada'),
      fMsg: one('Mensaje', 'Mensagem'),
      msgPh: one(
        'Cuéntanos sobre tu proyecto: técnica de personalización, colores, entrega…',
        'Conte sobre o seu projeto: técnica de personalização, cores, entrega…'
      ),
      submit: one('Enviar solicitud', 'Enviar solicitação'),
      fine: one('Sin descargas · sin e-commerce · directamente con el equipo', 'Sem downloads · sem e-commerce · direto com o time'),
      doneTitle: one('Solicitud enviada.', 'Solicitação enviada.'),
      doneText: one(
        'Gracias por tu interés. Te responderemos dentro de las próximas 24 horas hábiles con una propuesta para tu proyecto.',
        'Obrigado pelo seu interesse. Responderemos em até 24 horas úteis com uma proposta para o seu projeto.'
      ),
      doneNote: one(
        'Recibirás la respuesta en el correo que indicaste.',
        'Você receberá a resposta no e-mail informado.'
      ),
      sending: one('Enviando…', 'Enviando…'),
      sendError: one(
        'No pudimos enviar el correo. Vuelve a intentar o escríbenos a eleni@elenisourcing.com.',
        'Não foi possível enviar o e-mail. Tente novamente ou escreva para eleni@elenisourcing.com.'
      ),
    },
    sup: {
      eyebrow: one('Para proveedores', 'Para fornecedores'),
      title: one(
        '¿Fabricas o importas? Agreguemos tus productos a nuestro catálogo.',
        'Você fabrica ou importa? Vamos colocar seus produtos no nosso catálogo.'
      ),
      lede: one(
        'Trabajamos con fábricas e importadores que comparten nuestro estándar de calidad. Cuéntanos qué produce tu empresa y cómo podríamos colaborar.',
        'Trabalhamos com fábricas e importadores que compartilham o nosso padrão de qualidade. Conte o que a sua empresa produz e como poderíamos colaborar.'
      ),
      what: [
        { label: one('Producto', 'Produto'), text: one('Las categorías que fabricas, importas o distribuyes', 'As categorias que você fabrica, importa ou distribui') },
        { label: one('Origen', 'Origem'), text: one('Dónde se produce o desde dónde llega al mercado', 'Onde é produzido ou de onde chega ao mercado') },
        { label: one('Capacidad', 'Capacidade'), text: one('Volúmenes, MOQ y certificaciones si las tienes', 'Volumes, MOQ e certificações, se você tiver') },
      ],
      alt: one('¿Prefieres que te contactemos por', 'Prefere que entremos em contato pelo'),
      wa: one('WhatsApp', 'WhatsApp'),
      fCompany: one('Empresa', 'Empresa'),
      fName: one('Nombre de contacto', 'Nome para contato'),
      fEmail: one('Email', 'E-mail'),
      fPhone: one('Teléfono', 'Telefone'),
      fCategory: one('Categorías de producto', 'Categorias de produto'),
      selCategory: one('— Selecciona las que ofreces —', '— Selecione as que oferece —'),
      categoryOptions: [
        one('Papelería y escritura', 'Papelaria e escrita'),
        one('Botellas y vasos', 'Garrafas e copos'),
        one('Tecnológicos y accesorios', 'Eletrônicos e acessórios'),
        one('Textil y wearables', 'Têxtil e wearables'),
        one('Empaques y retail', 'Embalagens e retail'),
        one('Otro', 'Outro'),
      ],
      fOrigin: one('Origen del producto', 'Origem do produto'),
      selOrigin: one('— Selecciona —', '— Selecione —'),
      originOptions: [one('China', 'China'), one('India', 'Índia'), one('Chile / local', 'Chile / local'), one('Otro', 'Outro')],
      fMoq: one('MOQ mínimo', 'MOQ mínimo'),
      moqPh: one('Ej. 500 unidades por SKU', 'Ex.: 500 unidades por SKU'),
      fMsg: one('Mensaje', 'Mensagem'),
      msgPh: one(
        'Cuéntanos sobre tu oferta: materiales, capacidades, certificaciones, tiempos…',
        'Conte sobre a sua oferta: materiais, capacidades, certificações, prazos…'
      ),
      submit: one('Enviar postulación', 'Enviar candidatura'),
      fine: one(
        'Revisamos cada postulación y respondemos dentro de 5 días hábiles.',
        'Revisamos cada candidatura e respondemos em até 5 dias úteis.'
      ),
      doneTitle: one('Postulación enviada.', 'Candidatura enviada.'),
      doneText: one(
        'Gracias por tu interés. Si tu oferta encaja con lo que buscamos, te escribiremos pronto.',
        'Obrigado pelo interesse. Se a sua oferta combinar com o que buscamos, entraremos em contato em breve.'
      ),
      doneNote: one(
        'Recibirás la respuesta en el correo que indicaste.',
        'Você receberá a resposta no e-mail informado.'
      ),
      sending: one('Enviando…', 'Enviando…'),
      sendError: one(
        'No pudimos enviar el correo. Vuelve a intentar o escríbenos a eleni@elenisourcing.com.',
        'Não foi possível enviar o e-mail. Tente novamente ou escreva para eleni@elenisourcing.com.'
      ),
    },
    contact: {
      fName: one('Nombre', 'Nome'),
      fEmail: one('Email', 'E-mail'),
      fMsg: one('Mensaje', 'Mensagem'),
      msgPh: one('Cuéntanos en qué podemos ayudarte.', 'Conte-nos como podemos ajudar.'),
      submit: one('Enviar mensaje', 'Enviar mensagem'),
      sending: one('Enviando…', 'Enviando…'),
      sendError: one(
        'No pudimos enviar el correo. Vuelve a intentar o escríbenos a eleni@elenisourcing.com.',
        'Não foi possível enviar o e-mail. Tente novamente ou escreva para eleni@elenisourcing.com.'
      ),
      doneTitle: one('Mensaje enviado.', 'Mensagem enviada.'),
      doneText: one('Gracias por escribirnos. Te responderemos a la brevedad.', 'Obrigado por escrever. Responderemos em breve.'),
      note: one('Respuesta directa por email', 'Resposta direta por e-mail'),
    },
    foot: {
      blurb: one(
        'Productos promocionales y merchandising corporativo para marcas que quieren destacar. Sourcing, importación, personalización y logística — de la idea al producto.',
        'Produtos promocionais e merchandising corporativo para marcas que querem se destacar. Sourcing, importação, personalização e logística — da ideia ao produto.'
      ),
      nav: one('Navegación', 'Navegação'),
      contact: one('Contacto', 'Contato'),
      legalTerms: one('Términos', 'Termos'),
      legalPrivacy: one('Privacidad', 'Privacidade'),
      rights: one('Todos los derechos reservados.', 'Todos os direitos reservados.'),
    },
  };
}

export const dicts: Record<Locale, Dict> = { es: makeDict('es'), pt: makeDict('pt') };

/* ────────────────────────────────────────────────────────────────
   Productos — selecciona el campo localizado según el idioma
   ──────────────────────────────────────────────────────────────── */

export type Product = CollectionEntry<'products'>['data'];

export function productDisplay(p: Product, l: Locale) {
  const pt = l === 'pt';
  return {
    name: pt && p.name_pt ? p.name_pt : p.name,
    description: pt && p.description_pt ? p.description_pt : p.description,
    category: pt && p.category_pt ? p.category_pt : p.category,
    material: pt && p.material_pt ? p.material_pt : p.material,
    customization: pt && p.customization_pt ? p.customization_pt : p.customization,
    origin: pt && p.origin_pt ? p.origin_pt : p.origin,
  };
}