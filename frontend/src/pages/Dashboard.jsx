import {
  ArrowUpRight,
  BookOpen,
  Bot,
  CheckCircle2,
  Send,
  Sparkles,
  Upload,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import GlassCard from "../components/GlassCard";
import Button from "../components/Button";

const API_URL = "https://edugenie-73vn.onrender.com/api";

export default function Dashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState(0);
  const [asking, setAsking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const getUser = () => {
    const stored = localStorage.getItem("user");
    if (!stored) return null;

    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const user = getUser();

    if (!user?.id) {
      navigate("/login");
      return;
    }

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [dashboardResponse, documentsResponse] = await Promise.all([
          fetch(`${API_URL}/dashboard/${user.id}`),
          fetch(`${API_URL}/documents`, {
            headers: { "X-User-ID": String(user.id) },
          }),
        ]);

        const dashboardData = await dashboardResponse.json();
        const documentsData = await documentsResponse.json();

        if (!dashboardResponse.ok || !dashboardData.success) {
          throw new Error(
            dashboardData.message || "Unable to load dashboard."
          );
        }

        if (!documentsResponse.ok || !documentsData.success) {
          throw new Error(
            documentsData.message || "Unable to load documents."
          );
        }

        const availableDocuments = documentsData.documents || [];

        setDashboard(dashboardData);
        setDocuments(availableDocuments);

        if (availableDocuments.length > 0) {
          setSelectedDocument(String(availableDocuments[0].id));
        }
      } catch (err) {
        console.error("Dashboard error:", err);
        setError(err.message || "Unable to load dashboard.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [navigate]);

  const loadDocuments = async () => {
    const user = getUser();
    if (!user?.id) return [];

    const response = await fetch(`${API_URL}/documents`, {
      headers: { "X-User-ID": String(user.id) },
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Unable to load documents.");
    }

    return data.documents || [];
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    const user = getUser();

    if (!file || !user?.id) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a PDF file.");
      event.target.value = "";
      return;
    }

    try {
      setUploading(true);
      setError("");
      setAnswer("");

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_URL}/documents/upload`, {
        method: "POST",
        headers: {
          "X-User-ID": String(user.id),
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to upload PDF.");
      }

      const updatedDocuments = await loadDocuments();
      setDocuments(updatedDocuments);

      const uploadedDocument = updatedDocuments.find(
        (document) =>
          document.id === data.document_id ||
          document.filename === file.name
      );

      if (uploadedDocument) {
        setSelectedDocument(String(uploadedDocument.id));
      }
    } catch (err) {
      console.error("PDF upload error:", err);
      setError(err.message || "Unable to upload PDF.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleAsk = async (event) => {
    event.preventDefault();

    const cleanQuestion = question.trim();
    const user = getUser();

    if (!cleanQuestion || !selectedDocument || !user?.id) return;

    try {
      setAsking(true);
      setAnswer("");
      setSources(0);
      setError("");

      const response = await fetch(`${API_URL}/tutor/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-ID": String(user.id),
        },
        body: JSON.stringify({
          question: cleanQuestion,
          document_id: Number(selectedDocument),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to get an AI answer.");
      }

      setAnswer(data.answer || "");
      setSources(data.sources || 0);
      setQuestion("");
    } catch (err) {
      console.error("AI Tutor error:", err);
      setError(err.message || "Unable to get an AI answer.");
    } finally {
      setAsking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-slate-500">Loading your dashboard...</p>
      </div>
    );
  }

  if (error && !dashboard) {
    return (
      <GlassCard>
        <div className="py-10 text-center">
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-950"
          >
            Try again
          </button>
        </div>
      </GlassCard>
    );
  }

  const user = dashboard.user;
  const stats = dashboard.stats || {};
  const recentAttempts = dashboard.recent_attempts || [];
  const topics = dashboard.topics || [];

  const hasLearningHistory =
    Number(stats.quiz_attempts || 0) > 0 ||
    Number(stats.documents || 0) > 0;

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      {/* ==================================================
          WELCOME — different greeting for a new profile
      ================================================== */}
      <section className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-br from-violet-500/[0.08] via-white/[0.02] to-cyan-400/[0.03] px-6 py-5 sm:px-8">
        <div className="relative flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-slate-600">
              {hasLearningHistory ? "Learning dashboard" : "Welcome to EduGenie"}
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              {hasLearningHistory ? "Welcome back, " : "Welcome, "}
              <span className="gradient-text">{user.name}.</span>
            </h1>
          </div>

          <p className="max-w-md text-xs leading-5 text-slate-500 sm:text-right">
            {hasLearningHistory
              ? "Continue where you left off and keep your learning momentum going."
              : "Start your personalized learning journey with your study material."}
          </p>
        </div>
      </section>

      {/* ==================================================
          QUICK AI TUTOR — directly on dashboard
      ================================================== */}
      <GlassCard className="relative overflow-hidden border-violet-500/10 p-7 sm:p-8">
        <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-300">
                <Sparkles size={20} />
              </div>

              <div>
                <h2 className="text-lg font-semibold">AI Tutor</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Ask questions directly from your uploaded study material.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/tutor")}
              className="flex items-center gap-1 self-start text-xs text-violet-400 hover:text-violet-300 sm:self-auto"
            >
              Open full AI Tutor
              <ArrowUpRight size={13} />
            </button>
          </div>

          <form className="mt-7" onSubmit={handleAsk}>
            {/* PDF controls: intentionally side-by-side */}
            <div className="grid gap-3 sm:grid-cols-[220px_minmax(0,1fr)]">
              <div>
                <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.14em] text-slate-600">
                  Study material
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handleUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex h-[54px] w-full items-center justify-center gap-2 rounded-xl border border-violet-400/20 bg-violet-500/[0.08] px-5 text-sm font-semibold text-violet-300 transition hover:border-violet-400/35 hover:bg-violet-500/[0.13] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Upload size={17} />
                  {uploading ? "Uploading..." : "Upload PDF"}
                </button>
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.14em] text-slate-600">
                  Select PDF
                </label>

                <select
                  value={selectedDocument}
                  onChange={(event) => {
                    setSelectedDocument(event.target.value);
                    setAnswer("");
                    setError("");
                  }}
                  disabled={documents.length === 0}
                  className="h-[54px] w-full rounded-xl border border-white/[0.07] bg-[#0b1020] px-4 text-sm text-slate-300 outline-none transition focus:border-violet-400/40 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {documents.length > 0 ? (
                    documents.map((document) => (
                      <option key={document.id} value={document.id}>
                        {document.filename}
                      </option>
                    ))
                  ) : (
                    <option value="">Upload a PDF first</option>
                  )}
                </select>
              </div>
            </div>

            {/* Question area: separate full-width row */}
            <div className="mt-4">
              <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.14em] text-slate-600">
                Ask your question
              </label>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder={
                    documents.length > 0
                      ? "Ask something about your study material..."
                      : "Upload a PDF to start asking questions..."
                  }
                  disabled={documents.length === 0}
                  className="h-[54px] min-w-0 flex-1 rounded-xl border border-white/[0.07] bg-[#0b1020] px-4 text-sm text-slate-200 outline-none transition placeholder:text-slate-700 focus:border-violet-400/40 disabled:cursor-not-allowed disabled:opacity-50"
                />

                <button
                  type="submit"
                  disabled={asking || !question.trim() || !selectedDocument}
                  className="flex h-[54px] shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-500 px-8 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-40 sm:w-[110px]"
                >
                  <Send size={15} />
                  {asking ? "Thinking..." : "Ask"}
                </button>
              </div>
            </div>
          </form>

          {documents.length === 0 && !error && (
            <p className="mt-3 text-[11px] text-slate-600">
              Upload your study PDF, select it, then ask EduGenie anything from the material.
            </p>
          )}

          {error && (
            <p className="mt-3 text-xs text-red-400">{error}</p>
          )}

          {asking && (
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
              <Bot size={15} className="text-violet-300" />
              EduGenie is thinking...
            </div>
          )}

          {answer && !asking && (
            <div className="mt-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <Bot size={15} className="text-violet-300" />
                EduGenie
              </div>

              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-400">
                {answer}
              </p>

              <p className="mt-3 border-t border-white/[0.05] pt-3 text-[10px] text-slate-600">
                Answer generated from {sources} relevant document sections.
              </p>
            </div>
          )}
        </div>
      </GlassCard>

      {/* ==================================================
          CONTINUE LEARNING
      ================================================== */}
      <section>
        <div className="mb-4">
          <h2 className="text-sm font-semibold">Continue learning</h2>
          <p className="mt-1 text-xs text-slate-600">
            Your latest quiz topics
          </p>
        </div>

        {topics.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-3">
            {topics.map((topic) => (
              <GlassCard key={topic.topic}>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                    <BookOpen size={17} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {topic.topic}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-600">
                      {topic.correct} of {topic.attempted} correct
                    </p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <GlassCard>
            <div className="py-6 text-center">
              <BookOpen size={25} className="mx-auto mb-3 text-slate-700" />
              <p className="text-sm text-slate-500">No quiz topics yet.</p>
              <p className="mt-1 text-xs text-slate-700">
                Complete a quiz to build your learning profile.
              </p>
            </div>
          </GlassCard>
        )}
      </section>

      {/* ==================================================
          RECENT ACTIVITY
      ================================================== */}
      <GlassCard>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">Recent activity</h2>
            <p className="mt-1 text-xs text-slate-600">
              Your latest saved quiz attempts
            </p>
          </div>
          <CheckCircle2 size={18} className="text-emerald-400" />
        </div>

        {recentAttempts.length > 0 ? (
          <div className="mt-4 divide-y divide-white/[0.05]">
            {recentAttempts.slice(0, 3).map((attempt) => (
              <div key={attempt.id} className="flex items-center gap-3 py-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
                  <CheckCircle2 size={16} />
                </div>

                <div>
                  <p className="text-sm text-slate-300">
                    Completed quiz — {attempt.score}/{attempt.total_questions} correct
                  </p>
                  <p className="mt-1 text-[11px] text-slate-600">
                    {formatDate(attempt.attempted_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-5 text-sm text-slate-600">
            No recent quiz activity yet.
          </p>
        )}
      </GlassCard>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "—";

  let raw = String(value).trim();

  // PostgreSQL timestamps can arrive without a timezone.
  // Treat timezone-less values as UTC before converting to India time.
  if (!/[zZ]|[+-]\d{2}:?\d{2}$/.test(raw)) {
    raw = raw.replace(" ", "T") + "Z";
  }

  const date = new Date(raw);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}
