// lib/api.js
export async function getSignedUrl(filePath) {
  try {
    const response = await fetch("/api/get-signed-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filePath, expiresIn: 300 }) // 5 min
    });

    const data = await response.json();

    if (data.signedUrl) return data.signedUrl;
    throw new Error("Failed to get signed URL");
  } catch (err) {
    console.error(err);
  }
}
