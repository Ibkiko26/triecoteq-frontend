import "./styles.css";
import { initInteractions, refreshInteractions } from "./interactions";
import { refreshPlanListings, refreshProjectListings, renderPage, type PageName } from "./pages";
import { updateContentFromStore } from "./data";

const pageNames = new Set<PageName>(["home", "about", "services", "portfolio", "contact", "plans", "checkout"]);
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

window.addEventListener("teq-content-store:change", () => {
  if (!updateContentFromStore()) return;
  refreshProjectListings();
  refreshPlanListings();
  refreshInteractions();
});
