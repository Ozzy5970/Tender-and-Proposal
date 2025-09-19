import { supabaseAdmin } from "../../lib/adminSupabase";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { title, description, userId, fileName, fileBase64 } = req.body;

  try {
    let filePath = null;

    // 1️⃣ Upload file if provided
    if (fileName && fileBase64) {
      const buffer = Buffer.from(fileBase64, "base64");
      filePath = `uploads/${Date.now()}_${fileName}`;

      const { data: storageData, error: storageError } = await supabaseAdmin.storage
        .from("uploads")
        .upload(filePath, buffer);

      if (storageError) throw storageError;

      filePath = storageData.path; // store the final path
    }

    // 2️⃣ Create a new proposal record
    const { data: proposalData, error: proposalError } = await supabaseAdmin
      .from("proposals")
      .insert([{
        title,
        description,
        user_id: userId,
        file_path: filePath || null
      }])
      .select()
      .single(); // return the newly created record

    if (proposalError) throw proposalError;

    res.status(200).json({ message: "Proposal created successfully", proposal: proposalData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
