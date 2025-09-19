import { supabaseAdmin } from "../../lib/adminSupabase";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { fileName, proposalId, userId, fileBase64 } = req.body;

  const buffer = Buffer.from(fileBase64, "base64");
  const filePath = `uploads/${Date.now()}_${fileName}`;

  const { data, error } = await supabaseAdmin.storage
    .from("uploads")
    .upload(filePath, buffer);

  if (error) return res.status(500).json({ error: error.message });

  // Save file metadata to DB
  const { error: dbError } = await supabaseAdmin
    .from("uploads")
    .insert([{ user_id: userId, proposal_id: proposalId, file_path: data.path, file_type: fileName.split('.').pop() }]);

  if (dbError) return res.status(500).json({ error: dbError.message });

  res.status(200).json({ message: "Upload successful", filePath: data.path });
}
