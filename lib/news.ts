import { XMLParser } from "fast-xml-parser";

export interface NewsArticle {
  title: string;
  source: string;
  link: string;
  pubDate: string;
}

const ENTITIES: Record<string, string> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&quot;": '"',
  "&#39;": "'",
  "&lt;": "<",
  "&gt;": ">",
};

function decodeEntities(input: string): string {
  return input.replace(/&nbsp;|&amp;|&quot;|&#39;|&lt;|&gt;/g, (m) => ENTITIES[m]);
}

function cleanText(input: string): string {
  return decodeEntities(input.replace(/<[^>]*>/g, "")).replace(/\s+/g, " ").trim();
}

/** Google News RSS titles are formatted "Headline - Source"; split them apart. */
function splitTitleAndSource(raw: string): { title: string; source: string } {
  const cleaned = cleanText(raw);
  const lastDash = cleaned.lastIndexOf(" - ");
  if (lastDash === -1) return { title: cleaned, source: "" };
  return { title: cleaned.slice(0, lastDash), source: cleaned.slice(lastDash + 3) };
}

export async function getLatestNews(ticker: string): Promise<NewsArticle[]> {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(
    `${ticker} stock`
  )}&hl=en-US&gl=US&ceid=US:en`;

  try {
    const res = await fetch(url, { next: { revalidate: 300 } });
    const xml = await res.text();
    const parser = new XMLParser();
    const parsed = parser.parse(xml);
    const items = parsed?.rss?.channel?.item ?? [];
    const list = Array.isArray(items) ? items : [items];

    return list.slice(0, 5).map((item: Record<string, unknown>) => {
      const { title, source } = splitTitleAndSource(String(item.title ?? ""));
      return {
        title,
        source,
        link: String(item.link ?? "#"),
        pubDate: String(item.pubDate ?? ""),
      };
    });
  } catch (e) {
    return [
      {
        title: "News fetch failed",
        source: "",
        link: "#",
        pubDate: e instanceof Error ? e.message : String(e),
      },
    ];
  }
}
