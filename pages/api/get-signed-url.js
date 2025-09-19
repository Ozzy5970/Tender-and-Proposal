import { supabaseAdmin } from "../../lib/adminSupabase";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { filePath, expiresIn } = req.body; // filePath: e.g. "uploads/1234_tender.pdf"

  try {
    // Generate signed URL
    const { data, error } = await supabaseAdmin.storage
      .from("uploads")
      .createSignedUrl(filePath, expiresIn || 60); // expiresIn in seconds, default 60s

    if (error) throw error;

    res.status(200).json({ signedUrl: data.signedUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
