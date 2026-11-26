import { DOMParser } from "@xmldom/xmldom";

const headlinesPerRegion = 3;
const maxFeedBytes = 6 * 1024 * 1024;

async function loadFeed(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!response.ok || !response.body) throw new Error(`Feed returned ${response.status}`);

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let size = 0;
  let text = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) return text + decoder.decode();
      size += value.byteLength;
      if (size > maxFeedBytes) {
        await reader.cancel();
        throw new Error("Feed is too large");
      }
      text += decoder.decode(value, { stream: true });
    }
  } finally {
    reader.releaseLock();
  }
}

function getRssStories(xml, include) {
  const document = new DOMParser().parseFromString(xml, "application/xml");
  const channel = document.documentElement?.getElementsByTagName("channel").item(0);
  if (document.documentElement?.tagName !== "rss" || !channel) throw new Error("Invalid RSS feed");

  return Array.from(channel.getElementsByTagName("item")).flatMap((item) => {
    const categories = Array.from(item.getElementsByTagName("category"), (tag) => tag.textContent.trim());
    if (!include(categories)) return [];
    return [{
      title: item.getElementsByTagName("title").item(0)?.textContent,
      url: item.getElementsByTagName("link").item(0)?.textContent,
      date: item.getElementsByTagName("pubDate").item(0)?.textContent
    }];
  });
}

const publishers = [
  {
    region: "kenya",
    name: "Architectural Association of Kenya",
    origin: "https://aak.or.ke",
    async stories() {
      const body = await loadFeed(`${this.origin}/api/news?page=1&per_page=8`);
      return JSON.parse(body).posts.flatMap(({ title, slug, date }) =>
        typeof slug === "string" && slug ? [{ title, url: `${this.origin}/news/${encodeURIComponent(slug)}`, date }] : []
      );
    }
  },
  {
    region: "kenya",
    name: "Construction Kenya",
    origin: "https://www.constructionkenya.com",
    async stories() {
      const xml = await loadFeed(`${this.origin}/projects/feed/`);
      return getRssStories(xml, (categories) => categories.includes("News") && !categories.includes("Global"));
    }
  },
  {
    region: "global",
    name: "Dezeen",
    origin: "https://www.dezeen.com",
    async stories() {
      const xml = await loadFeed(`${this.origin}/architecture/feed/`);
      return getRssStories(xml, (categories) => categories.includes("News"));
    }
  }
];

async function publisherHeadlines(publisher) {
  try {
    const stories = await publisher.stories();
    return stories.flatMap(({ title, url, date }) => {
      const headline = typeof title === "string" ? title.trim().replace(/\s+/g, " ") : "";
      const link = typeof url === "string" && URL.canParse(url) ? new URL(url) : null;
      const published = typeof date === "string" ? Date.parse(date) : NaN;
      if (!headline || link?.origin !== publisher.origin || !Number.isFinite(published)) return [];
      link.hash = "";
      return [{ title: headline, url: link.href, publishedAt: new Date(published).toISOString(), source: publisher.name }];
    });
  } catch (error) {
    console.warn(`Architecture news feed unavailable for ${publisher.name}`, error instanceof Error ? error.name : "UnknownError");
    return [];
  }
}

function latestHeadlines(articles) {
  const unique = [...new Map(articles.map((article) => [article.url, article])).values()];
  return unique.sort((left, right) => right.publishedAt.localeCompare(left.publishedAt)).slice(0, headlinesPerRegion);
}

export async function getArchitectureNews(method) {
  if (method !== "GET") {
    return Response.json({ error: "Use GET to read the news." }, { status: 405, headers: { Allow: "GET" } });
  }

  const feeds = await Promise.all(publishers.map(publisherHeadlines));
  const byRegion = { kenya: [], global: [] };
  publishers.forEach(({ region }, index) => byRegion[region].push(...feeds[index]));
  const kenya = latestHeadlines(byRegion.kenya);
  const global = latestHeadlines(byRegion.global);

  if (!kenya.length && !global.length) {
    return Response.json({ kenya, global }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }

  const complete = feeds.every((feed) => feed.length > 0);
  return Response.json({ kenya, global }, {
    headers: {
      "Cache-Control": "public, max-age=60",
      "Vercel-CDN-Cache-Control": complete ? "max-age=600, stale-while-revalidate=120" : "max-age=60"
    }
  });
}

export default { fetch: (request) => getArchitectureNews(request.method) };
