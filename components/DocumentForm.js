"use client";
import { useState } from "react";

export default function DocumentForm() {
  const [form, setForm] = useState({
    tender_title: "",
    tender_type: "",
    issuing_authority: "",
    document_text: ""
  });

  async function handleSubmit(e) {
    e.preventDefault();
    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    alert("Inserted: " + JSON.stringify(data));
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded">
      <input
        type="text"
        placeholder="Tender Title"
        value={form.tender_title}
        onChange={(e) => setForm({ ...form, tender_title: e.target.value })}
        className="block mb-2 p-2 border"
      />
      <input
        type="text"
        placeholder="Tender Type (RFP/RFQ)"
        value={form.tender_type}
        onChange={(e) => setForm({ ...form, tender_type: e.target.value })}
        className="block mb-2 p-2 border"
      />
      <input
        type="text"
        placeholder="Issuing Authority"
        value={form.issuing_authority}
        onChange={(e) => setForm({ ...form, issuing_authority: e.target.value })}
        className="block mb-2 p-2 border"
      />
      <textarea
        placeholder="Document Text"
        value={form.document_text}
        onChange={(e) => setForm({ ...form, document_text: e.target.value })}
        className="block mb-2 p-2 border w-full h-40"
      />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Save Document
      </button>
    </form>
  );
}
