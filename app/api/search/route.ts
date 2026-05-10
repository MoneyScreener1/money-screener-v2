export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { pipeline } from 
"@xenova/transformers";
import { getStore, cosineSimilarity } from "@/lib/searchEngine";

let embedderPromise: any = null;

async function getEmbedder() {
  if (!embedderPromise) {
    console.log("Loading embedding model...");
    embedderPromise = pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
  }
  return embedderPromise;
}

async function embed(text: string) {
  const embedder = await getEmbedder();

  const output = await embedder(text, {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(output.data);
}

export async function POST(req: Request) {
  console.time("search");

  const { query } = await req.json();

  console.log("Query:", query);

  const store = getStore();
  const queryVector = (await embed(query)) as number[];

  const safeStore = store ?? [];

const results = safeStore
  .map((item: any) => {
    const score = cosineSimilarity(queryVector, item.vector);

    return {
      ...item,
      score,

      // freeze ranking metadata
      rankScore: score,
    };
  })
  .sort((a, b) => b.rankScore - a.rankScore)
  .slice(0, 12);

function assignCluster(score: number) {
  if (score > 0.65) return "core match";
  if (score > 0.5) return "related concept";
  return "weak association";
}

const resultsWithClusters = results.map(r => ({
  ...r,
  cluster: assignCluster(r.score),
}));

console.timeEnd("search");

return Response.json({ resultsWithClusters });

}
