import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Check,
  ChevronDown,
  Loader2,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import GlassCard from "../components/GlassCard";
import Button from "../components/Button";
import { getPreferences } from "../utils/preferences";

const API_URL = "http://127.0.0.1:5000/api";

export default function Flashcards() {
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState("");
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [status, setStatus] = useState({});
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const getUser = () => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return null;

    try {
      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const loadDocuments = async () => {
      const user = getUser();

      if (!user?.id) {
        setError("Please login again.");
        setLoadingDocuments(false);
        return;
      }

      try {
        setError("");
        const response = await fetch(`${API_URL}/documents`, {
          headers: {
            "X-User-ID": String(user.id),
          },
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load documents.");
        }

        const availableDocuments = data.documents || [];
        setDocuments(availableDocuments);

        if (availableDocuments.length > 0) {
          setSelectedDocument(String(availableDocuments[0].id));
        }
      } catch (err) {
        console.error("Document loading error:", err);
        setError(err.message || "Unable to load documents.");
      } finally {
        setLoadingDocuments(false);
      }
    };

    loadDocuments();
  }, []);

  const selectedDocumentData = useMemo(
    () =>
      documents.find(
        (document) => String(document.id) === String(selectedDocument)
      ),
    [documents, selectedDocument]
  );

  const generateFlashcards = async () => {
    const user = getUser();

    if (!user?.id) {
      setError("Please login again.");
      return;
    }

    if (!selectedDocument) {
      setError("Please upload and select a document first.");
      return;
    }

    try {
      setGenerating(true);
      setError("");
      setRevealed(false);
      setCurrentIndex(0);
      setStatus({});

      const response = await fetch(`${API_URL}/flashcards/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-ID": String(user.id),
        },
        body: JSON.stringify({
          document_id: Number(selectedDocument),
          ...getPreferences(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to generate flashcards.");
      }

      const generatedCards = (data.flashcards || [])
        .map((card, index) => ({
          id: card.id ?? index + 1,
          question: String(card.question || "").trim(),
          answer: String(card.answer || "").trim(),
          topic: String(card.topic || "General").trim(),
        }))
        .filter((card) => card.question && card.answer);

      if (generatedCards.length === 0) {
        throw new Error("No flashcards were generated from this document.");
      }

      setCards(generatedCards);
    } catch (err) {
      console.error("Flashcard generation error:", err);
      setError(err.message || "Unable to generate flashcards.");
      setCards([]);
    } finally {
      setGenerating(false);
    }
  };

  const moveToCard = (index) => {
    if (!cards.length) return;

    const safeIndex = Math.max(0, Math.min(index, cards.length - 1));
    setCurrentIndex(safeIndex);
    setRevealed(false);
  };

  const handleAgain = () => {
    if (!cards.length) return;

    const currentCard = cards[currentIndex];
    setStatus((previous) => ({
      ...previous,
      [currentCard.id]: "review",
    }));

    moveToCard((currentIndex + 1) % cards.length);
  };

  const handleKnowThis = () => {
    if (!cards.length) return;

    const currentCard = cards[currentIndex];
    setStatus((previous) => ({
      ...previous,
      [currentCard.id]: "mastered",
    }));

    if (currentIndex < cards.length - 1) {
      moveToCard(currentIndex + 1);
    } else {
      setRevealed(false);
    }
  };

  const resetCurrentCard = () => {
    setRevealed(false);
  };

  const resetDeck = () => {
    setStatus({});
    setCurrentIndex(0);
    setRevealed(false);
  };

  const totalCards = cards.length;
  const currentCard = cards[currentIndex];
  const mastered = cards.filter((card) => status[card.id] === "mastered").length;
  const needReview = cards.filter((card) => status[card.id] === "review").length;
  const newCards = totalCards - mastered - needReview;
  const progress = totalCards
    ? Math.round(((currentIndex + 1) / totalCards) * 100)
    : 0;

  const reviewNumbers = cards
    .map((card, index) =>
      status[card.id] === "review" ? index + 1 : null
    )
    .filter(Boolean);

  const recommendation =
    reviewNumbers.length > 0
      ? `Review cards ${reviewNumbers.slice(0, 3).join(", ")} again. These concepts need another pass.`
      : mastered > 0
        ? "Great work. Continue through the remaining new cards to strengthen your recall."
        : "Start with the first card and mark concepts as mastered or needing review.";

  if (loadingDocuments) {
    return (
      <div className="mx-auto max-w-[1600px]">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <Loader2
              size={32}
              className="mx-auto mb-4 animate-spin text-violet-400"
            />
            <p className="text-sm text-slate-500">
              Loading your study materials...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <section>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-400/10 bg-violet-500/[0.06] px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-violet-300">
          <Sparkles size={12} />
          Smart Revision
        </div>

        <h1 className="text-3xl font-semibold tracking-tight">Flashcards</h1>

        <p className="mt-2 text-sm text-slate-500">
          Review concepts using AI-generated intelligent flashcards.
        </p>
      </section>

      <GlassCard>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex-1">
            <label className="mb-2 block text-xs font-medium text-slate-500">
              Study material
            </label>

            <div className="relative">
              <select
                value={selectedDocument}
                onChange={(event) => {
                  setSelectedDocument(event.target.value);
                  setCards([]);
                  setStatus({});
                  setCurrentIndex(0);
                  setRevealed(false);
                  setError("");
                }}
                className="w-full appearance-none rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3 pr-10 text-sm text-slate-200 outline-none focus:border-violet-400/30"
              >
                {documents.length === 0 ? (
                  <option value="">No uploaded PDFs</option>
                ) : (
                  documents.map((document) => (
                    <option key={document.id} value={document.id}>
                      {document.filename}
                    </option>
                  ))
                )}
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-600"
              />
            </div>
          </div>

          <Button
            variant="violet"
            onClick={generateFlashcards}
            disabled={generating || !selectedDocument}
          >
            {generating ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Sparkles size={15} />
            )}
            {generating ? "Generating..." : "Generate Flashcards"}
          </Button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-400/10 bg-red-500/[0.06] px-4 py-3 text-xs text-red-300">
            {error}
          </div>
        )}
      </GlassCard>

      {documents.length === 0 ? (
        <GlassCard>
          <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-300">
              <Brain size={25} />
            </div>
            <h2 className="mt-5 text-lg font-semibold text-slate-200">
              No study material yet
            </h2>
            <p className="mt-2 max-w-md text-xs leading-5 text-slate-600">
              Upload a PDF from the Documents page first, then return here to
              generate AI-powered flashcards.
            </p>
          </div>
        </GlassCard>
      ) : !currentCard ? (
        <GlassCard>
          <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-300">
              <Brain size={25} />
            </div>
            <h2 className="mt-5 text-lg font-semibold text-slate-200">
              Ready for smart revision?
            </h2>
            <p className="mt-2 max-w-md text-xs leading-5 text-slate-600">
              Select your PDF and click Generate Flashcards. EduGenie will use
              your uploaded study material to create the deck.
            </p>
          </div>
        </GlassCard>
      ) : (
        <section className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs text-slate-600">
                {selectedDocumentData?.filename || "Study material"} · {currentIndex + 1} / {totalCards}
              </span>
              <span className="text-xs text-slate-600">{progress}% complete</span>
            </div>

            <div className="mb-6 h-1.5 rounded-full bg-white/[0.05]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="perspective-1000">
              <GlassCard
                onClick={() => setRevealed((previous) => !previous)}
                className="relative flex min-h-[480px] cursor-pointer flex-col items-center justify-center text-center transition hover:border-violet-400/10"
              >
                <div className="absolute right-6 top-6 flex gap-1">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      resetCurrentCard();
                    }}
                    className="rounded-xl p-2 text-slate-600 hover:bg-white/5 hover:text-white"
                    title="Hide answer"
                  >
                    <RotateCcw size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      resetDeck();
                    }}
                    className="rounded-xl px-2 text-[10px] text-slate-600 hover:text-white"
                    title="Reset progress"
                  >
                    Reset
                  </button>
                </div>

                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-300">
                  <Brain size={25} />
                </div>

                <span className="text-[10px] uppercase tracking-[0.2em] text-slate-600">
                  {revealed ? "Answer" : "Question"}
                </span>

                <h2 className="mt-5 max-w-2xl text-2xl font-semibold leading-relaxed sm:text-3xl">
                  {revealed ? currentCard.answer : currentCard.question}
                </h2>

                {currentCard.topic && (
                  <span className="mt-5 rounded-full border border-white/[0.06] bg-white/[0.025] px-3 py-1 text-[10px] text-slate-500">
                    {currentCard.topic}
                  </span>
                )}

                <p className="mt-8 text-xs font-medium text-violet-400">
                  {revealed ? "Click to see question" : "Click to reveal answer"}
                </p>
              </GlassCard>
            </div>

            <div className="mt-5 flex items-center justify-center gap-3">
              <Button variant="secondary" onClick={handleAgain}>
                <X size={15} />
                Again
              </Button>

              <Button variant="violet" onClick={handleKnowThis}>
                <Check size={15} />
                I know this
              </Button>
            </div>

            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => moveToCard(currentIndex - 1)}
                className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-2.5 text-slate-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ArrowLeft size={16} />
              </button>

              <button
                type="button"
                disabled={currentIndex === totalCards - 1}
                onClick={() => moveToCard(currentIndex + 1)}
                className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-2.5 text-slate-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <GlassCard>
              <h3 className="text-sm font-semibold">Deck overview</h3>

              <div className="mt-5 space-y-4">
                <Stat label="Total cards" value={totalCards} />
                <Stat label="Mastered" value={mastered} />
                <Stat label="Need review" value={needReview} />
                <Stat label="New" value={newCards} />
              </div>
            </GlassCard>

            <GlassCard>
              <h3 className="text-sm font-semibold">AI recommendation</h3>

              <p className="mt-3 text-xs leading-5 text-slate-600">
                {recommendation}
              </p>
            </GlassCard>
          </div>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-white/[0.05] pb-3 last:border-0 last:pb-0">
      <span className="text-xs text-slate-600">{label}</span>
      <span className="text-sm font-semibold text-slate-300">{value}</span>
    </div>
  );
}
