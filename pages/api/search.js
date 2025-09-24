// pages/api/search.js
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// helper: cosine similarity
function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) + 1e-12);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { query, k = 5 } = req.body;
  if (!query) return res.status(400).json({ error: 'Missing query' });

  try {
    // 1) embed the query
    const embResp = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query
    });
    const qEmb = embResp.data[0].embedding;

    // 2) fetch all docs with embeddings (small dataset assumption)
    const { data: docs, error } = await supabaseAdmin
      .from('training_documents')
      .select('id, tender_title, document_text, embedding')
      .not('embedding', 'is', null)
      .limit(1000);

    if (error) throw error;
    if (!docs || docs.length === 0) return res.json({ results: [] });

    // 3) compute similarities
    const scored = docs.map(d => {
      const emb = d.embedding;
      // ensure emb is array
      const score = cosineSimilarity(qEmb, emb);
      return { ...d, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const top = scored.slice(0, k);

    // return top results
    res.status(200).json({ results: top });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || err });
  }
}
