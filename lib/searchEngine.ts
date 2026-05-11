import fs from "fs";
import path from "path";

let store: any[] | null = null;

export function getStore() {
  if (!store) {
    console.log("Loading vector store...");

    const filePath = path.join(process.cwd(), "lib/vector-store.json");

    store = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  }

  return store;
}

export function cosineSimilarity(a: number[], b: number[]) {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  const len = Math.min(a.length, b.length);

  for (let i = 0; i < len; i++) {
    const av = Number(a[i] ?? 0);
    const bv = Number(b[i] ?? 0);

    dot += av * bv;
    normA += av * av;
    normB += bv * bv;
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB);

  if (!denom || isNaN(denom)) return 0;

  const result = dot / denom;

  if (!isFinite(result)) return 0;

  return result;
}
