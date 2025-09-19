import { useState } from "react";
import { getSignedUrl } from "../lib/api"; // import the helper function

export default function DownloadFile({ filePath }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    const signedUrl = await getSignedUrl(filePath);
    if (signedUrl) {
      window.open(signedUrl, "_blank");
    } else {
      alert("Failed to get download link");
    }
    setLoading(false);
  };

  return (
    <div>
      <button onClick={handleDownload} disabled={loading}>
        {loading ? "Loading..." : "Download File"}
      </button>
    </div>
  );
}
