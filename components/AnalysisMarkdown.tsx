"use client";

import ReactMarkdown from "react-markdown";
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
};

export function AnalysisMarkdown({ children }: { children: string }) {
  return <ReactMarkdown components={components}>{children}</ReactMarkdown>;
}
