import { escapeHtml } from "./utils";

const regions = [
  {
    id: "kenya",
    label: "Kenya",
    sources: [
      { name: "Architectural Association of Kenya", url: "https://aak.or.ke/news" },
      { name: "Construction Kenya", url: "https://www.constructionkenya.com/projects/" }
    ]
  },
  {
    id: "global",
    label: "Global",
    sources: [{ name: "Dezeen", url: "https://www.dezeen.com/architecture/" }]
  }
] as const;

const refreshInterval = 15 * 60 * 1000;
const newsDate = new Intl.DateTimeFormat("en-KE", {
  day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Nairobi"
});

type Headline = { title: string; source: string; publishedAt: string; url: string };

export function renderNewsSection(): string {
  return `
    <section class="container news-panel" aria-labelledby="news-title" data-news-panel>
      <header class="news-heading">
        <h2 id="news-title">Latest news</h2>
        <p>Architecture &amp; built environment</p>
      </header>
      <div class="news-regions">
        ${regions.map(({ id, label, sources }) => `
          <section class="news-region" aria-labelledby="news-${id}" data-news-region="${id}">
            <h3 id="news-${id}" class="eyebrow">${label}</h3>
            <p class="news-status" role="status">Loading headlines&hellip;</p>
            <ul class="news-stories" hidden></ul>
            <div class="news-sources" hidden>
              ${sources.map(({ name, url }) => `<a class="text-link" href="${url}">${name} <span aria-hidden="true">&#8599;</span></a>`).join("")}
            </div>
          </section>
        `).join("")}
      </div>
    </section>`;
}

function renderHeadline(article: Partial<Headline> | null): string {
  if (typeof article?.title !== "string" || typeof article.source !== "string" ||
      typeof article.publishedAt !== "string" || typeof article.url !== "string") return "";

  const date = new Date(article.publishedAt);
  if (!Number.isFinite(date.getTime())) return "";

  let link: URL;
  try {
    link = new URL(article.url);
  } catch {
    return "";
  }
  if (link.protocol !== "https:") return "";

  return `
    <li class="news-story">
      <a class="news-story-link" href="${escapeHtml(link.href)}">
        <span>${escapeHtml(article.title)}</span><span aria-hidden="true">&#8599;</span>
      </a>
      <p class="news-story-meta">
        <span>${escapeHtml(article.source)}</span>
        <time datetime="${date.toISOString()}">${newsDate.format(date)}</time>
      </p>
    </li>`;
}

export function initNews(): void {
  const panel = document.querySelector<HTMLElement>("[data-news-panel]");
  if (!panel) return;

  const updateRegions = regions.map(({ id }) => {
    const region = panel.querySelector(`[data-news-region="${id}"]`);
    const list = region?.querySelector<HTMLUListElement>(".news-stories");
    const status = region?.querySelector<HTMLElement>(".news-status");
    const sources = region?.querySelector<HTMLElement>(".news-sources");
    let current = "";

    return (headlines: unknown) => {
      if (!list || !status || !sources) return;
      const markup = Array.isArray(headlines) ? headlines.map(renderHeadline).join("") : "";
      if (!markup) {
        if (!current) {
          status.textContent = "Headlines are temporarily unavailable.";
          sources.hidden = false;
        }
      } else if (markup !== current && !list.contains(document.activeElement)) {
        current = markup;
        list.innerHTML = markup;
        list.hidden = false;
        status.hidden = true;
        sources.hidden = true;
      }
    };
  });

  let checking = false;
  let lastCheck = 0;

  async function refresh(): Promise<void> {
    if (checking || document.hidden) return;
    checking = true;
    lastCheck = Date.now();

    try {
      const response = await fetch("/api/architecture-news", { signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw new Error(`News request returned ${response.status}`);
      const news = await response.json();
      updateRegions.forEach((update, index) => update(news?.[regions[index].id]));
    } catch {
      updateRegions.forEach((update) => update(null));
    } finally {
      checking = false;
    }
  }

  void refresh();
  window.setInterval(refresh, refreshInterval);
  document.addEventListener("visibilitychange", () => {
    if (Date.now() - lastCheck >= refreshInterval) void refresh();
  });
}
