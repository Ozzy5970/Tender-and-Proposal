import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  try {
    const { data, error } = await supabase.from('proposals').select('*');
    if (error) throw error;
    res.status(200).json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
