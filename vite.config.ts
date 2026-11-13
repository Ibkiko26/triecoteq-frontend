import { defineConfig } from "vite";

export default defineConfig({
  base: "/",
  publicDir: false,
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        home: "index.html",
        about: "about.html",
        services: "services.html",
        portfolio: "portfolio.html",
        contact: "contact.html",
        plans: "buy-plan.html",
        checkout: "checkout.html"
      }
    }
  }
});
