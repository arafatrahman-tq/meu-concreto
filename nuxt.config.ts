import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  modules: ['@nuxtjs/color-mode', '@nuxt/eslint'],

  components: [
    { path: '~/components/ui', pathPrefix: false },
    { path: '~/components/form', pathPrefix: false },
    '~/components',
  ],
  imports: {
    dirs: ['shared/utils', 'shared/types'],
  },
  devtools: { enabled: true },

  app: {
    head: {
      title: 'Meu Concreto',
      meta: [
        {
          name: 'viewport',
          content:
            'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0',
        },
        { name: 'theme-color', content: '#ff7a3d' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        {
          name: 'apple-mobile-web-app-status-bar-style',
          content: 'black-translucent',
        },
        { name: 'apple-mobile-web-app-title', content: 'Meu Concreto' },
      ],
      link: [
        { rel: 'manifest', href: '/manifest.json' },
        { rel: 'apple-touch-icon', href: '/img/icon-192.png' },
      ],
    },
  },

  colorMode: {
    classSuffix: '',
    preference: 'light',
    fallback: 'light',
    storageKey: 'nuxt-color-mode',
  },
  compatibilityDate: '2024-11-01',
  // Configuração unificada do Nitro
  nitro: {
    preset: 'bun', // Use o preset bun para otimizações específicas [page:2]
    externals: {
      external: ['bun:sqlite', 'bun:*'], // Externaliza todos os módulos internos do Bun
    },
    imports: {
      dirs: ['shared/utils', 'shared/types'],
    },
  },

  vite: {
    // @ts-ignore
    plugins: [tailwindcss()],
    build: {
      sourcemap: false,
    },
    optimizeDeps: {
      exclude: ['exsolve'],
    },
  },

  typescript: {
    tsConfig: {
      compilerOptions: {
        types: ['bun'],
      },
    },
  },

  eslint: {
    config: {
      stylistic: true, // Habilita regras de estilo por padrão
    },
  },
})
