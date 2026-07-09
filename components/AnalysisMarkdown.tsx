"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

const components: Components = {
  h1: (props) => <h4 className="mt-4 font-display text-base text-paper first:mt-0" {...props} />,
  h2: (props) => <h4 className="mt-4 font-display text-base text-paper first:mt-0" {...props} />,
  h3: (props) => (
    <h4
      className="mt-4 font-display text-xs uppercase tracking-widest text-paper/60 first:mt-0"
      {...props}
    />
  ),
  p: (props) => <p className="mt-2 leading-relaxed first:mt-0" {...props} />,
  strong: (props) => <strong className="font-semibold text-brass" {...props} />,
  ul: (props) => <ul className="mt-2 list-disc space-y-1 pl-5" {...props} />,
  ol: (props) => <ol className="mt-2 list-decimal space-y-1 pl-5" {...props} />,
  li: (props) => <li className="pl-1" {...props} />,
  hr: () => <hr className="my-4 border-paper/15" />,
  table: (props) => (
    <div className="mt-3 overflow-x-auto rounded-sm border border-paper/15">
      <table className="w-full min-w-[420px] border-collapse font-mono text-xs" {...props} />
    </div>
  ),
  thead: (props) => <thead className="bg-paper/[0.04]" {...props} />,
  tr: (props) => (
    <tr className="border-b border-paper/10 last:border-0 even:bg-paper/[0.02]" {...props} />
  ),
  th: (props) => (
    <th
      className="whitespace-nowrap px-3 py-2 text-left text-[0.65rem] uppercase tracking-wide text-brass"
      {...props}
    />
  ),
  td: (props) => (
    <td className="whitespace-nowrap px-3 py-2 tabular-nums text-paper/85" {...props} />
  ),
};

export function AnalysisMarkdown({ children }: { children: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {children}
    </ReactMarkdown>
  );
}
