# Vitrina Promocional — Eleni Sourcing

### https://www.elenisourcing.com/

---

Sitio web de vitrina digital para **Eleni Sourcing**: productos promocionales, merchandising corporativo e importación (Sourcing Brasil ↔ Chile). Diseño editorial premium sobre fondo carbon con tinta bone y acentos pine, animaciones de entrada sutiles y soporte completo es-ES / pt-BR.

## Caracteristicas

- **Hero con formulario general de contacto** — nombre, email y mensaje, con estados de envio (enviando / error / exito).
- **Seleccion del mes** — carrusel de fotos con varias imagenes visibles a la vez, correctamente espaciadas (sin solape), con leyenda, contador, navegacion por teclado y swipe; cada foto puede prefillear el formulario de cotizacion.
- **Catalogo de productos** — detalle y ficha tecnica de cada articulo.
- **Formulario de cotizacion** (`#formulario`) — producto, cantidad, plazo, mensaje y datos de contacto, con prefill desde el catalogo.
- **Formulario para proveedores** (`#proveedores`) — postulacion con categoria, origen, MOQ y datos de contacto.
- **i18n** — espanol y portugues con ruteo (`/pt/`), conmutador de idioma y textos, cantidades y fechas localizados.
- **Tema visual** — paleta carbon / bone / pine, tipografia editorial, animaciones `reveal` con respeto a `prefers-reduced-motion`.
- **Email transaccional** — los tres formularios entregan el correo via **Resend** a los buzones de la marca.

## Stack

| Capa | Tecnologia |
| --- | --- |
| Framework | [Astro 5](https://astro.build) (islas, TypeScript) |
| Renderizado | `output: 'server'` (SSR) |
| Adapter | `@astrojs/vercel` (funciones serverless) |
| Email | [Resend](https://resend.com) v6 |
| Servidores de prueba | Playwright (validacion de regresion) |

## Estructura

```
vitrina-promo/
  astro.config.mjs        # adapter Vercel, i18n es/pt, checkOrigin off
  .env                    # SECRETOS — nunca se sube al repo
  src/
    components/           # Hero, Selection, Products, QuoteForm, SupplierForm, Footer, SiteShell...
    layouts/              # Base.astro (head SEO, JSON-LD, fuentes)
    pages/
      index.astro         # es (default)
      pt/index.astro      # pt-BR
      api/
        contact.ts        # formulario general de contacto
        quote.ts          # solicitud de cotizacion
        supplier.ts       # postulacion de proveedores
    i18n/ui.ts            # diccionarios es/pt y helpers de producto
    lib/mail.ts           # utilidad compartida: esc HTML, HTML del correo, envio Resend
  public/
    favicon.svg, og.svg, robots.txt, sitemap.xml, admin/
```

## Comandos

```bash
npm install        # instalar dependencias
npm run dev        # servidor de desarrollo (http://localhost:4321)
npm run build      # build de produccion (.vercel/output para Vercel)
npm run preview    # previsualizar el build
```

## Endpoints

| Ruta | Metodo | Uso |
| --- | --- | --- |
| `/api/contact` | POST | Formulario de contacto del hero |
| `/api/quote` | POST | Solicitud de cotizacion |
| `/api/supplier` | POST | Postulacion de proveedores |

Respuestas posibles (form-data con `name`, `email`, `lang` y campos propios de cada formulario):

- `200 { ok: true }` — correo enviado.
- `400` — validacion fallida (`required` / `invalid_email`).
- `503 { error: 'not_configured' }` — falta `RESEND_API_KEY`.
- `502 { error: 'send_failed', detail }` — Resend rechazo el envio (el detalle se muestra en pantalla).

## Variables de entorno

Copia `.env` (el archivo ya incluye los nombres) y usa valores reales. **Estos datos son confidenciales: no se suben al repositorio.**

```bash
RESEND_API_KEY=                      # obligatoria, se crea en https://resend.com/api-keys
RESEND_FROM=Eleni Sourcing <contacto@elenisourcing.com>
RESEND_TO=eleni@elenisourcing.com
RESEND_TO_SUPPLIERS=eleni@elenisourcing.com
```

En produccion, configura las mismas variables en **Vercel → Settings → Environment Variables** (Production/Preview) y vuelve a desplegar. Sin `RESEND_API_KEY` los formularios responden `503` y no crashean.

> Nota sobre el remitente: con `RESEND_FROM` = `onboarding@resend.dev`, Resend solo permite enviar a la cuenta propietaria. Para enviar a los buzones de la marca, verifica el dominio `elenisourcing.com` en Resend (registros DNS que Resend te indica) y usa una direccion de ese dominio en `RESEND_FROM`.

## Despliegue en Vercel

1. El proyecto usa `@astrojs/vercel` (`output: 'server'`), de modo que Vercel ejecuta `astro build` y genera la funcion serverless correspondiente.
2. **IMPORTANTE**: `.vercel/` esta en `.gitignore`. Nunca subas el artefacto `.vercel/output` al repositorio: Vercel lo detecta y se salta el build, desplegando un artefacto local incompleto (error tipico: `ERR_MODULE_NOT_FOUND ... dist/server/entry.mjs`). Con el artefacto ausente, Vercel compila en su propia infraestructura (Linux) con las dependencias nativas correctas.
3. Ajustes recomendados en el proyecto: Framework Preset `Astro`, Build `astro build`, Node 20+.
4. Tras cada push, Vercel despliega automaticamente; recuerda que un cambio de variables de entorno solo aplica a deployments nuevos.

