import { defineConfig, type Connect } from "vite";
import { getArchitectureNews } from "./api/architecture-news.js";

function mountNewsApi(server: { middlewares: Connect.Server }): void {
  server.middlewares.use(async (request, response, next) => {
    if (request.url?.split("?")[0] !== "/api/architecture-news") return next();

    try {
      const news = await getArchitectureNews(request.method);
      response.statusCode = news.status;
      news.headers.forEach((value, name) => response.setHeader(name, value));
      response.end(await news.text());
    } catch (error) {
      next(error);
    }
  });
}

export default defineConfig({
  base: "/",
  publicDir: false,
  plugins: [{ name: "architecture-news-api", configureServer: mountNewsApi, configurePreviewServer: mountNewsApi }],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        home: "index.html",
        about: "about.html",
        services: "services.html",
        portfolio: "portfolio.html",
        careers: "careers.html",
        contact: "contact.html",
        plans: "buy-plan.html",
        checkout: "checkout.html"
      }
    }
  }
});
