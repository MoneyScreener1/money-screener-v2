export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { getStore, cosineSimilarity } from "@/lib/searchEngine";

export async function POST(req: Request) {
  try {
    console.time("search");

    const { query } = await req.json();

    console.log("Query:", query);

    const store = getStore();

    console.log("STORE SAMPLE:", store?.[0]);

    // simple lightweight vector
    const queryVector = query
      .split("")
      .map((c: string) => c.charCodeAt(0));

    const safeStore = store ?? [];

    const results = safeStore
      .map((item: any) => {
        const itemVector = Array.isArray(item.vector)
          ? item.vector
          : [];

        const minLength = Math.min(
  queryVector.length,
  itemVector.length
);

const safeQueryVector = queryVector.slice(0, minLength);

const safeItemVector = itemVector.slice(0, minLength);

const score = cosineSimilarity(
  safeQueryVector,
  safeItemVector
);

        return {
          ...item,
          score,
          rankScore: score,
        };
      })
      .sort((a: any, b: any) => b.rankScore - a.rankScore)
      .slice(0, 12);

    function assignCluster(score: number) {
      if (score > 0.65) return "core match";
      if (score > 0.5) return "related concept";
      return "weak association";
    }

    const resultsWithClusters = results.map((r: any) => ({
      ...r,
      cluster: assignCluster(r.score),
    }));

    console.timeEnd("search");

    return Response.json({ resultsWithClusters });

  } catch (err) {
    console.error("API CRASH:", err);

    return Response.json(
      { error: "server crash" },
      { status: 500 }
    );
  }
}
