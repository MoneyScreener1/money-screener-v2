import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { pipeline } from "@xenova/transformers";

// local embedding model (runs on your machine)
const embedder = await pipeline(
  "feature-extraction",
  "Xenova/all-MiniLM-L6-v2"
);

// simple in-memory vector store (no Supabase needed)
const store = [];

async function extractText(filePath) {
  const data = new Uint8Array(fs.readFileSync(filePath));
  const pdf = await pdfjsLib.getDocument({ data }).promise;

  let text = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((i) => i.str).join(" ") + "\n";
  }

  return text;
}

function chunk(text, size = 800) {
  const out = [];
  for (let i = 0; i < text.length; i += size) {
    out.push(text.slice(i, i + size));
  }
  return out;
}

async function embed(text) {
  const output = await embedder(text, {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(output.data);
}

async function run() {
  const text = await extractText("./dissertation.pdf");
  const chunks = chunk(text);

  for (const c of chunks) {
    const vector = await embed(c);

    store.push({
      text: c,
      vector,
    });
  }

  fs.writeFileSync(
    "./vector-store.json",
    JSON.stringify(store, null, 2)
  );

  console.log("✅ Local ingestion complete");
}

run();
