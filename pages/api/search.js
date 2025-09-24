// /pages/api/search.js (Next.js pages router)
// or /app/api/search/route.js (App router, small changes)

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// ✅ Load environment variables
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { query, k = 3 } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Missing query' });
    }

    // Step 1: Create embedding for user query
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small', // cheaper than large
      input: query,
    });

    const [{ embedding }] = embeddingResponse.data;

    // Step 2: Query Supabase for similar docs
    const { data: matches, error } = await supabase.rpc('match_documents', {
      query_embedding: embedding,
      match_threshold: 0.7, // tweak
      match_count: k,       // how many results
    });

    if (error) throw error;

    // Step 3: Return results
    return res.status(200).json({ results: matches });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
