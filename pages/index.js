import DocumentForm from "../components/DocumentForm";

export default function Home() {
  return (
    <main className="p-6">
      <h1 className="text-xl font-bold mb-4">Upload Tender Document</h1>
      <DocumentForm />
    </main>
  );
}
