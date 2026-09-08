import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  site: 'https://www.elenisourcing.cl',
  compressHTML: true,
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'pt'],
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
      fallbackType: 'rewrite',
    },
  },
  // El endpoint /api/quote es una API pública de captación de leads que se
  // consume solo desde el propio frontend; checkOrigin (default) rechazaba
  // los POST legítimos al comparar el host de producción.
  security: { checkOrigin: false },
});