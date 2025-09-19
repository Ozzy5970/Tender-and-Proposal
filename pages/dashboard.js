import DownloadFile from "../components/DownloadFile";

export default function Dashboard() {
  const files = [
    { id: 1, name: "Tender 1", path: "uploads/169523_tender.pdf" },
    { id: 2, name: "Tender 2", path: "uploads/169524_tender.pdf" }
  ];

  return (
    <div>
      <h1>Uploaded Tenders</h1>
      {files.map(file => (
        <div key={file.id}>
          <p>{file.name}</p>
          <DownloadFile filePath={file.path} />
        </div>
      ))}
    </div>
  );
}
