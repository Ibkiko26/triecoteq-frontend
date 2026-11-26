import "./styles.css";
import { initInteractions, refreshInteractions } from "./interactions";
import { refreshPlanListings, refreshProjectListings, renderPage, type PageName } from "./pages";
import { updateContentFromStore } from "./data";
import { initCareers } from "./careers";
import { initNews } from "./news";

const pageNames = new Set<PageName>(["home", "about", "services", "portfolio", "careers", "contact", "plans", "checkout"]);
const page = document.body.dataset.page as PageName;
const app = document.querySelector<HTMLElement>("#app");

if (!app) {
  throw new Error("The page is missing its #app mount point.");
}

if (!pageNames.has(page)) {
  throw new Error(`Unknown website page: ${page}`);
}

updateContentFromStore();
app.innerHTML = renderPage(page);
initInteractions(page);
if (page === "careers") initCareers();
if (page === "home") initNews();

window.addEventListener("teq-content-store:change", () => {
  if (!updateContentFromStore()) return;
  refreshProjectListings();
  refreshPlanListings();
  refreshInteractions();
});
