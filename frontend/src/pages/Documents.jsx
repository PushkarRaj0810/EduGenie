import { useEffect, useRef, useState } from "react";
import {
  FileText,
  Upload,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import GlassCard from "../components/GlassCard";

const API_URL = "http://127.0.0.1:5000";

export default function Documents() {
  const fileInputRef = useRef(null);

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "null");

  // Fetch documents
  const fetchDocuments = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setError("");

      const response = await fetch(`${API_URL}/api/documents`, {
        headers: {
          "X-User-ID": String(user.id),
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch documents.");
      }

      setDocuments(data.documents || []);
    } catch (err) {
      console.error("FETCH DOCUMENTS ERROR:", err);
      setError(err.message || "Unable to load documents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Open file picker
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Upload PDF
  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Please select a PDF file.");
      return;
    }

    if (!user?.id) {
      setError("User session not found. Please login again.");
      return;
    }

    try {
      setUploading(true);
      setMessage("");
      setError("");

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_URL}/api/documents/upload`, {
        method: "POST",
        headers: {
          "X-User-ID": String(user.id),
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Upload failed.");
      }

      setMessage(`${file.name} uploaded successfully.`);

      await fetchDocuments();
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      setError(err.message || "Something went wrong while uploading.");
    } finally {
      setUploading(false);
    }
  };

  // Delete document
  const handleDelete = async (documentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this document?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/api/documents/${documentId}`,
        {
          method: "DELETE",
          headers: {
            "X-User-ID": String(user.id),
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to delete document.");
      }

      setMessage("Document deleted successfully.");

      await fetchDocuments();
    } catch (err) {
      console.error("DELETE ERROR:", err);
      setError(err.message || "Unable to delete document.");
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Recently uploaded";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "Recently uploaded";
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <GlassCard className="min-h-[500px]">
      <div className="p-6 sm:p-8">

        {/* HEADER */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-500/10 p-3 text-violet-300">
              <FileText size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-semibold text-white">
                Documents
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Upload and manage your learning materials.
              </p>
            </div>
          </div>

          {/* SINGLE UPLOAD BUTTON */}
          <button
            onClick={handleUploadClick}
            disabled={uploading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload size={18} />
                Upload PDF
              </>
            )}
          </button>

          {/* HIDDEN FILE INPUT */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* SUCCESS MESSAGE */}
        {message && (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-400/10 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-300">
            <CheckCircle2 size={18} />
            {message}
          </div>
        )}

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-red-400/10 bg-red-500/5 px-4 py-3 text-sm text-red-300">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* DOCUMENTS */}
        <div className="mt-10">

          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Your Documents
            </h2>

            <span className="rounded-full border border-white/5 bg-white/[0.03] px-3 py-1 text-xs text-slate-500">
              {documents.length}{" "}
              {documents.length === 1 ? "document" : "documents"}
            </span>
          </div>

          {/* LOADING */}
          {loading && (
            <div className="flex items-center justify-center py-12 text-slate-500">
              <Loader2 size={20} className="mr-2 animate-spin" />
              Loading documents...
            </div>
          )}

          {/* EMPTY STATE */}
          {!loading && documents.length === 0 && (
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] px-6 py-16 text-center">
              <FileText
                size={35}
                className="mx-auto text-slate-700"
              />

              <p className="mt-4 text-sm text-slate-500">
                No documents uploaded yet.
              </p>

              <p className="mt-1 text-xs text-slate-600">
                Click Upload PDF to add your study material.
              </p>
            </div>
          )}

          {/* DOCUMENT LIST */}
          {!loading && documents.length > 0 && (
            <div className="space-y-3">
              {documents.map((document) => (
                <div
                  key={document.id}
                  className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition hover:border-violet-400/10 hover:bg-white/[0.035] sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                      <FileText size={20} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        {document.filename}
                      </p>

                      <p className="mt-1 text-xs text-slate-600">
                        Uploaded {formatDate(document.uploaded_at)}
                      </p>
                    </div>

                  </div>

                  <button
                    onClick={() => handleDelete(document.id)}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-red-400/10 bg-red-500/5 px-3 py-2 text-xs text-red-300 transition hover:bg-red-500/10"
                  >
                    <Trash2 size={15} />
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </GlassCard>
  );
}