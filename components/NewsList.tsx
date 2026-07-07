import type { NewsArticle } from "@/lib/news";

export function NewsList({ articles }: { articles: NewsArticle[] }) {
  if (!articles.length) {
    return <p className="text-sm text-paper/60">No recent headlines found.</p>;
  }

  return (
    <ul className="divide-y divide-paper/10">
      {articles.map((article, i) => (
        <li key={i} className="py-4 first:pt-0">
          <a
            href={article.link}
            target="_blank"
            rel="noreferrer"
            className="font-display text-base text-paper underline decoration-brass/40 underline-offset-4 hover:decoration-brass"
          >
            {article.title}
          </a>
          <p className="mt-1 font-mono text-xs uppercase tracking-wide text-paper/50">
            {[article.source, article.pubDate && new Date(article.pubDate).toLocaleDateString()]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </li>
      ))}
    </ul>
  );
}
