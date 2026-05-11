"use client";

import { useState } from "react";

type Result = {
  text: string;
  score?: number;
  cluster?: string;
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
   
  async function search() {
  if (!query.trim()) return;

  setLoading(true);

  try {
    const res = await fetch("/api/search", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ query }),
});


console.log("STATUS:", res.status);

const data = await res.json();

console.log("DATA:", data);

setResults(data.resultsWithClusters ?? []);

  } catch (err) {
    console.error("SEARCH FAILED:", err);
    setResults([]);
  } finally {
    setLoading(false);
  }
}

  return (
    <main className="min-h-screen bg-black text-white flex flex-col 
items-center px-6 py-12">
      
      {/* Header */}
      <div className="max-w-4xl w-full text-center mb-10">
        <h1 className="text-5xl font-bold tracking-tight mb-4">
          🧠 Money Screener
        </h1>

        <p className="text-zinc-400 text-lg">
          Interactive semantic search over dissertation research on 
monetary salience,
          neuroeconomics, reinforcement learning, and dopaminergic load.
        </p>
      </div>

      {/* Search Box */}
      <div className="w-full max-w-3xl flex gap-3 mb-8">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a question about the research..."
          className="flex-1 rounded-2xl bg-zinc-900 border border-zinc-700 
px-5 py-4 text-white outline-none focus:border-white"
          onKeyDown={(e) => {
            if (e.key === "Enter") search();
          }}
        />

        <button
          onClick={search}
          className="rounded-2xl px-6 py-4 bg-white text-black 
font-semibold hover:opacity-90 transition"
        >
          Search
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-zinc-400 animate-pulse mb-6">
          Searching dissertation...
        </div>
      )}

      {/* Results */}
      <div className="w-full max-w-4xl flex flex-col gap-6">
        {results.map((r, i) => (
          <div
            key={i}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 
shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-zinc-400">Semantic Match</div>

              <div className="text-sm font-mono text-green-400">
                {typeof r.score === "number" ? r.score.toFixed(3) : "—"}
              </div>
            </div>

            <p className="leading-7 text-zinc-100 whitespace-pre-wrap">
              {r.text}
            </p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-16 text-zinc-500 text-sm text-center">
        Center of Neuroclassical Economics • Money Screener Prototype
      </div>
    </main>
  );
}
