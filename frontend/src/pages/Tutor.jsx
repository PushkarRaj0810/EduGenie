import {
  Bot,
  FileText,
  Loader2,
  Send,
  User,
} from "lucide-react";

import { useEffect, useState } from "react";
import GlassCard from "../components/GlassCard";
import { getPreferences } from "../utils/preferences";

const API_URL = "https://edugenie-73vn.onrender.com/api";

export default function Tutor() {
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState("");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState("");

  // ==================================================
  // GET USER
  // ==================================================

  const getUser = () => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  };

  // ==================================================
  // LOAD DOCUMENTS
  // ==================================================

  const loadDocuments = async () => {
    const user = getUser();

    if (!user?.id) {
      setError("Please login again.");
      setLoadingDocuments(false);
      return;
    }

    try {
      setLoadingDocuments(true);
      setError("");

      const response = await fetch(`${API_URL}/documents`, {
        headers: {
          "X-User-ID": String(user.id),
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load documents."
        );
      }

      /*
       * The backend already returns documents that have
       * successfully completed the upload/processing flow.
       *
       * Do NOT filter using document.status because the
       * current backend response does not provide that field.
       */
      const availableDocuments = data.documents || [];

      setDocuments(availableDocuments);

      // Automatically select the first document
      if (availableDocuments.length > 0) {
        setSelectedDocument(
          String(availableDocuments[0].id)
        );
      } else {
        setSelectedDocument("");
      }
    } catch (err) {
      console.error(err);

      setError(
        err.message || "Unable to load documents."
      );

      setDocuments([]);
      setSelectedDocument("");
    } finally {
      setLoadingDocuments(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  // ==================================================
  // CHANGE DOCUMENT
  // ==================================================

  const handleDocumentChange = (event) => {
    const documentId = event.target.value;

    setSelectedDocument(documentId);

    // Start a fresh conversation when switching documents
    setMessages([]);
    setError("");
  };

  // ==================================================
  // ASK QUESTION
  // ==================================================

  const handleAsk = async (event) => {
    event?.preventDefault();

    const cleanQuestion = question.trim();

    if (!cleanQuestion) {
      return;
    }

    if (!selectedDocument) {
      setError(
        "Please upload and select a document first."
      );
      return;
    }

    const user = getUser();

    if (!user?.id) {
      setError("Please login again.");
      return;
    }

    setError("");

    // Add user message immediately
    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        content: cleanQuestion,
      },
    ]);

    setQuestion("");
    setAsking(true);

    try {
      const response = await fetch(
        `${API_URL}/tutor/ask`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            "X-User-ID": String(user.id),
          },

          body: JSON.stringify({
            question: cleanQuestion,
            document_id: Number(selectedDocument),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to generate answer."
        );
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: data.answer,
          sources: data.sources_used,
          document: data.document?.filename,
        },
      ]);
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to connect to AI Tutor."
      );
    } finally {
      setAsking(false);
    }
  };

  // ==================================================
  // ENTER KEY
  // ==================================================

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      handleAsk();
    }
  };

  // ==================================================
  // SELECTED DOCUMENT
  // ==================================================

  const selectedDocumentData = documents.find(
    (document) =>
      String(document.id) ===
      String(selectedDocument)
  );

  // ==================================================
  // UI
  // ==================================================

  return (
    <div className="space-y-6">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div>
        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
            <Bot size={21} />
          </div>

          <div>
            <h1 className="text-2xl font-semibold">
              AI Tutor
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Ask questions and learn directly from
              your study material.
            </p>
          </div>

        </div>
      </div>


      {/* ==================================================
          DOCUMENT SELECTOR
      ================================================== */}

      <GlassCard>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">

            <FileText
              size={15}
              className="text-violet-400"
            />

            Study from
          </div>


          <select
            value={selectedDocument}
            onChange={handleDocumentChange}
            disabled={
              loadingDocuments ||
              documents.length === 0
            }
            className="flex-1 rounded-xl border border-white/[0.07] bg-[#0a1020] px-3 py-2.5 text-xs text-slate-300 outline-none focus:border-violet-400/30"
          >

            {loadingDocuments ? (

              <option value="">
                Loading documents...
              </option>

            ) : documents.length === 0 ? (

              <option value="">
                No documents available
              </option>

            ) : (

              documents.map((document) => (

                <option
                  key={document.id}
                  value={document.id}
                >
                  {document.filename}
                </option>

              ))

            )}

          </select>

        </div>


        {selectedDocumentData && (

          <p className="mt-3 text-[10px] text-slate-600">

            EduGenie will answer using the knowledge
            retrieved from{" "}

            <span className="text-violet-400">
              {selectedDocumentData.filename}
            </span>

            .

          </p>

        )}

      </GlassCard>


      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (

        <div className="rounded-xl border border-red-400/10 bg-red-500/[0.06] px-4 py-3 text-xs text-red-300">
          {error}
        </div>

      )}


      {/* ==================================================
          CHAT
      ================================================== */}

      <GlassCard className="overflow-hidden">

        <div className="flex min-h-[500px] flex-col">

          {/* Messages */}

          <div className="flex-1 space-y-5 overflow-y-auto p-2">

            {messages.length === 0 ? (

              <div className="flex min-h-[400px] flex-col items-center justify-center text-center">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-300">

                  <Bot size={25} />

                </div>


                <h2 className="mt-5 text-lg font-semibold text-slate-200">
                  Your AI Tutor is ready
                </h2>


                <p className="mt-2 max-w-md text-xs leading-5 text-slate-600">

                  {documents.length === 0
                    ? "Upload a PDF from the Documents page first."
                    : "Select your document above and ask questions. EduGenie will retrieve relevant information from your document before generating the answer."}

                </p>

              </div>

            ) : (

              messages.map((message, index) => (

                <div
                  key={index}
                  className={`flex gap-3 ${
                    message.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >

                  {message.role === "assistant" && (

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">

                      <Bot size={15} />

                    </div>

                  )}


                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                      message.role === "user"
                        ? "bg-violet-500/10 text-slate-200"
                        : "border border-white/[0.06] bg-white/[0.025] text-slate-300"
                    }`}
                  >

                    <div className="whitespace-pre-wrap">
                      {message.content}
                    </div>


                    {message.role === "assistant" && (

                      <div className="mt-3 border-t border-white/[0.05] pt-2 text-[10px] text-slate-600">

                        Answer generated from{" "}

                        {message.sources || 0}{" "}

                        relevant document sections.

                      </div>

                    )}

                  </div>


                  {message.role === "user" && (

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300">

                      <User size={15} />

                    </div>

                  )}

                </div>

              ))

            )}


            {asking && (

              <div className="flex gap-3">

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">

                  <Bot size={15} />

                </div>


                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] px-4 py-3">

                  <div className="flex items-center gap-2 text-xs text-slate-500">

                    <Loader2
                      size={14}
                      className="animate-spin"
                    />

                    EduGenie is thinking...

                  </div>

                </div>

              </div>

            )}

          </div>


          {/* Input */}

          <form
            onSubmit={handleAsk}
            className="mt-4 flex items-end gap-2 border-t border-white/[0.06] pt-4"
          >

            <textarea
              value={question}
              onChange={(event) =>
                setQuestion(event.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder={
                documents.length === 0
                  ? "Upload a PDF first..."
                  : "Ask something about your document..."
              }
              disabled={
                asking ||
                documents.length === 0
              }
              rows={2}
              className="min-h-[48px] flex-1 resize-none rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-400/30 disabled:cursor-not-allowed disabled:opacity-50"
            />


            <button
              type="submit"
              disabled={
                asking ||
                !question.trim() ||
                !selectedDocument
              }
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-slate-950 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
            >

              {asking ? (

                <Loader2
                  size={17}
                  className="animate-spin"
                />

              ) : (

                <Send size={17} />

              )}

            </button>

          </form>

        </div>

      </GlassCard>

    </div>
  );
}