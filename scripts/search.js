import fs from "fs";
import { pipeline } from "@xenova/transformers";

const embedder = await pipeline(
  "feature-extraction",
  "Xenova/all-MiniLM-L6-v2"
);

function cosineSimilarity(a, b) {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function embed(text) {
  const output = await embedder(text, {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(output.data);
}

async function search(query) {
  const store = JSON.parse(fs.readFileSync("./vector-store.json"));

  const queryVector = await embed(query);

  const ranked = store
    .map((item) => ({
      text: item.text,
      score: cosineSimilarity(queryVector, item.vector),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  console.log("\n🔍 Top Matches:\n");
  for (const r of ranked) {
    console.log("Score:", r.score.toFixed(3));
    console.log(r.text);
    console.log("------\n");
  }
}

const query = process.argv.slice(2).join(" ");

if (!query) {
  console.log("Usage: node scripts/search.js 'your question'");
  process.exit(1);
}

search(query);
