// pages/api/generate-section.js
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { userPrompt } = req.body; // e.g. "Write safety plan"
  if (!userPrompt) return res.status(400).json({ error: 'Missing userPrompt' });

  try {
    // 1. retrieve relevant docs by calling the search endpoint (server-side call)
    const searchResp = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: userPrompt, k: 4 })
    });
    const searchJson = await searchResp.json();
    const contexts = (searchJson.results || []).map(r => `---\nSource: ${r.tender_title}\n${r.document_text}\n`);

    // 2. prepare the final prompt
    const system = `You are an expert South African tender writer. Use the provided context documents to write a high-quality section. Cite sources by title if relevant.`;
    const userMessage = `User task: ${userPrompt}\n\nContext:\n${contexts.join('\n')}\n\nWrite the requested section in clear, professional SA English.`;

    // 3. call OpenAI chat/completions
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',   // or 'gpt-4o' depending on your access; use cheaper model if needed
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 900,
      temperature: 0.2
    });

    const text = completion.choices[0].message.content;
    res.status(200).json({ text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || err });
  }
}
