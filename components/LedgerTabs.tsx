"use client";

export function LedgerTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex gap-1 border-b border-paper/20">
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`relative -mb-px rounded-t-sm px-5 py-2.5 font-display text-sm tracking-wide transition-colors ${
              isActive ? "bg-paper/[0.02] text-paper" : "text-paper/50 hover:text-paper/80"
            }`}
          >
            {tab.label}
            {isActive && <span className="absolute inset-x-0 -bottom-px h-[2px] bg-brass" />}
          </button>
        );
      })}
    </div>
  );
}
