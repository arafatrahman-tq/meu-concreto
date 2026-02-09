// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  app: {
    head: {
      title: "Meu Concreto",
      meta: [
        {
          name: "viewport",
          content:
            "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
        },
        { name: "theme-color", content: "#ff7a3d" },
        { name: "apple-mobile-web-app-capable", content: "yes" },
        {
          name: "apple-mobile-web-app-status-bar-style",
          content: "black-translucent",
        },
        { name: "apple-mobile-web-app-title", content: "Meu Concreto" },
      ],
      link: [
        { rel: "manifest", href: "/manifest.json" },
        { rel: "apple-touch-icon", href: "/img/icon-192.png" },
      ],
    },
  },
  modules: ["@nuxtjs/color-mode"],
  nitro: {
    preset: "bun",
  },
  components: [
    {
      path: "~/components/ui",
      pathPrefix: false,
    },
    "~/components",
  ],
  typescript: {
    tsConfig: {
      compilerOptions: {
        types: ["bun"],
      },
    },
  },
  colorMode: {
    classSuffix: "",
    preference: "light",
    fallback: "light",
    storageKey: "nuxt-color-mode",
  },
  vite: {
    // @ts-ignore
    plugins: [tailwindcss()],
  },
});
