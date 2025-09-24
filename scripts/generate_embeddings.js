// scripts/generate_embeddings.js
// Run: node scripts/generate_embeddings.js
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

// Debug: confirm environment variables are loading
console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ Loaded" : "❌ Missing");
console.log("OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "✅ Loaded" : "❌ Missing");

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// set model and chunk settings:
const EMBEDDING_MODEL = 'text-embedding-3-small'; // or "text-embedding-ada-002"
const BATCH_SIZE = 20; // how many docs to embed per batch (tune small to avoid rate limits)

function chunkText(text, maxChars = 1500) {
  // naive chunker that splits long docs into smaller pieces (keep words intact)
  const parts = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(start + maxChars, text.length);
    // try to break on newline or space
    if (end < text.length) {
      const lastNL = text.lastIndexOf('\n', end);
      const lastSpace = text.lastIndexOf(' ', end);
      const cut = Math.max(lastNL, lastSpace);
      if (cut > start) end = cut;
    }
    parts.push(text.slice(start, end));
    start = end;
  }
  return parts;
}

async function fetchDocsToEmbed() {
  // fetch documents where embedding is null or empty
  const { data, error } = await supabaseAdmin
    .from('training_documents')
    .select('id, document_text')
    .is('embedding', null)   // only those not yet embedded
    .limit(1000);
  if (error) throw error;
  return data || [];
}

async function generateAndSaveForDoc(id, text) {
  // optional: chunk long doc and average embeddings (simple approach)
  const chunks = chunkText(text, 1200);
  const chunkEmbeds = [];

  for (let chunk of chunks) {
    const resp = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: chunk
    });
    // embedding vector:
    const emb = resp.data[0].embedding;
    chunkEmbeds.push(emb);
    // small delay to avoid hitting rate limits if needed
    await new Promise(r => setTimeout(r, 150));
  }

  // average chunk vectors into one doc vector
  const dim = chunkEmbeds[0].length;
  const avg = new Array(dim).fill(0);
  for (const vec of chunkEmbeds) {
    for (let i = 0; i < dim; i++) avg[i] += vec[i];
  }
  for (let i = 0; i < dim; i++) avg[i] /= chunkEmbeds.length;

  // Save embedding as JSONB (array)
  const { error } = await supabaseAdmin
    .from('training_documents')
    .update({ embedding: avg })
    .eq('id', id);

  if (error) throw error;
  console.log('Saved embedding for doc', id);
}

async function main() {
  console.log('Fetching docs to embed...');
  const docs = await fetchDocsToEmbed();
  console.log(`Found ${docs.length} docs to embed.`);

  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = docs.slice(i, i + BATCH_SIZE);
    // generate embeddings sequentially per doc (inside could parallelize carefully)
    for (const doc of batch) {
      try {
        await generateAndSaveForDoc(doc.id, doc.document_text || '');
      } catch (err) {
        console.error('Failed for doc', doc.id, err.message || err);
      }
    }
    // optional pause between batches
    await new Promise(r => setTimeout(r, 500));
  }

  console.log('Done generating embeddings.');
}

main().catch(err => {
  console.error('Script error:', err);
  process.exit(1);
});
