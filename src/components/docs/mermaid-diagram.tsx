"use client";

import { useEffect, useRef, useState } from "react";

let mermaidInitialized = false;

export function MermaidDiagram({ chart, id }: { chart: string; id: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      const mermaid = (await import("mermaid")).default;

      if (!mermaidInitialized) {
        mermaid.initialize({
          startOnLoad: false,
          theme: "base",
          securityLevel: "loose",
          fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui",
          themeVariables: {
            primaryColor: "#eff6ff",
            primaryBorderColor: "#1d4ed8",
            primaryTextColor: "#0f172a",
            lineColor: "#64748b",
            fontSize: "15px",
          },
          flowchart: { curve: "basis", padding: 16, useMaxWidth: true },
        });
        mermaidInitialized = true;
      }

      try {
        const { svg } = await mermaid.render(`mmd-${id}`, chart);
        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg;
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to render diagram");
        }
      }
    }

    render();
    return () => {
      cancelled = true;
    };
  }, [chart, id]);

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
        Diagram error: {error}
      </div>
    );
  }

  return <div ref={ref} className="mermaid-container flex w-full justify-center" />;
}
