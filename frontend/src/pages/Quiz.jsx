import {
  Brain,
  CheckCircle2,
  FileText,
  Loader2,
  RotateCcw,
  Trophy,
  ChevronRight,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import GlassCard from "../components/GlassCard";

const API_URL = "https://edugenie-73vn.onrender.com/api";

export default function Quiz() {
  const navigate = useNavigate();

  // ==================================================
  // STATE
  // ==================================================

  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState("");

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});

  const [loadingDocuments, setLoadingDocuments] =
    useState(true);

  const [generating, setGenerating] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [submitted, setSubmitted] =
    useState(false);

  const [score, setScore] =
    useState(null);

  const [error, setError] = useState("");

  // ==================================================
  // GET USER
  // ==================================================

  const getUser = () => {
    const storedUser =
      localStorage.getItem("user");

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

      const response = await fetch(
        `${API_URL}/documents`,
        {
          headers: {
            "X-User-ID": String(user.id),
          },
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to load documents."
        );
      }

      /*
       * IMPORTANT:
       *
       * Do NOT filter by document.status.
       *
       * The current backend returns the user's
       * uploaded documents without a status field.
       */

      const availableDocuments =
        data.documents || [];

      setDocuments(
        availableDocuments
      );

      // Automatically select first document
      if (
        availableDocuments.length > 0
      ) {
        setSelectedDocument(
          String(
            availableDocuments[0].id
          )
        );
      } else {
        setSelectedDocument("");
      }

    } catch (err) {
      console.error(
        "Document loading error:",
        err
      );

      setError(
        err.message ||
          "Unable to load documents."
      );

      setDocuments([]);
      setSelectedDocument("");

    } finally {
      setLoadingDocuments(false);
    }
  };

  // ==================================================
  // LOAD DOCUMENTS ON PAGE LOAD
  // ==================================================

  useEffect(() => {
    loadDocuments();
  }, []);

  // ==================================================
  // CHANGE DOCUMENT
  // ==================================================

  const handleDocumentChange = (
    event
  ) => {
    const documentId =
      event.target.value;

    setSelectedDocument(
      documentId
    );

    // Clear previous quiz
    setQuestions([]);
    setAnswers({});
    setScore(null);
    setSubmitted(false);
    setError("");
  };

  // ==================================================
  // GENERATE QUIZ
  // ==================================================

  const handleGenerateQuiz =
    async () => {
      const user = getUser();

      if (!user?.id) {
        setError(
          "Please login again."
        );
        return;
      }

      if (!selectedDocument) {
        setError(
          "Please select a document first."
        );
        return;
      }

      setGenerating(true);
      setError("");
      setQuestions([]);
      setAnswers({});
      setScore(null);
      setSubmitted(false);

      try {
        const response =
          await fetch(
            `${API_URL}/quiz/generate`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                "X-User-ID":
                  String(user.id),
              },

              body: JSON.stringify({
                document_id:
                  Number(
                    selectedDocument
                  ),
              }),
            }
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Unable to generate quiz."
          );
        }

        /*
         * Support the different response
         * names used during development.
         */

        const generatedQuiz =
          data.quiz ||
          data.questions ||
          data.quiz_data ||
          [];

        if (
          !Array.isArray(
            generatedQuiz
          ) ||
          generatedQuiz.length === 0
        ) {
          throw new Error(
            "The AI did not return any quiz questions."
          );
        }

        // Normalize questions
        const normalizedQuestions =
          generatedQuiz
            .map(
              (
                question,
                index
              ) => {
                const options =
                  Array.isArray(
                    question.options
                  )
                    ? question.options
                    : [];

                let correctAnswer =
                  question.answer;

                /*
                 * Some versions of the
                 * Gemini response may use
                 * correct_answer instead.
                 */

                if (
                  correctAnswer ===
                    undefined ||
                  correctAnswer === null
                ) {
                  correctAnswer =
                    question.correct_answer;
                }

                /*
                 * Convert a string answer
                 * into an option index if
                 * necessary.
                 */

                if (
                  typeof correctAnswer ===
                  "string"
                ) {
                  const answerIndex =
                    options.findIndex(
                      (option) =>
                        String(
                          option
                        ).trim() ===
                        String(
                          correctAnswer
                        ).trim()
                    );

                  if (
                    answerIndex !== -1
                  ) {
                    correctAnswer =
                      answerIndex;
                  }
                }

                return {
                  id:
                    question.id ||
                    `question-${index}`,

                  question:
                    question.question ||
                    `Question ${
                      index + 1
                    }`,

                  options,

                  answer:
                    Number(
                      correctAnswer
                    ),

                  topic:
                    question.topic ||
                    "General",
                };
              }
            )
            .filter(
              (question) =>
                question.options.length >=
                2
            );

        if (
          normalizedQuestions.length ===
          0
        ) {
          throw new Error(
            "The generated quiz contains no valid questions."
          );
        }

        setQuestions(
          normalizedQuestions
        );

        // Scroll down to quiz
        setTimeout(() => {
          document
            .getElementById(
              "quiz-section"
            )
            ?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
        }, 100);

      } catch (err) {
        console.error(
          "Quiz generation error:",
          err
        );

        setError(
          err.message ||
            "Unable to generate quiz."
        );
      } finally {
        setGenerating(false);
      }
    };

  // ==================================================
  // SELECT ANSWER
  // ==================================================

  const handleAnswerChange = (
    questionIndex,
    optionIndex
  ) => {
    if (submitted) {
      return;
    }

    setAnswers(
      (previous) => ({
        ...previous,
        [questionIndex]:
          optionIndex,
      })
    );
  };

  // ==================================================
  // SUBMIT QUIZ
  // ==================================================

  const handleSubmitQuiz =
    async () => {
      const user = getUser();

      if (!user?.id) {
        setError(
          "Please login again."
        );
        return;
      }

      if (
        questions.length === 0
      ) {
        return;
      }

      // Check all questions answered
      const unanswered =
        questions.findIndex(
          (_, index) =>
            answers[index] ===
            undefined
        );

      if (
        unanswered !== -1
      ) {
        setError(
          `Please answer Question ${
            unanswered + 1
          } before submitting.`
        );

        document
          .getElementById(
            `question-${unanswered}`
          )
          ?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });

        return;
      }

      setSubmitting(true);
      setError("");

      // ==================================================
      // CALCULATE SCORE
      // ==================================================

      let calculatedScore = 0;

      const answerResults =
        questions.map(
          (
            question,
            index
          ) => {
            const selectedAnswer =
              Number(
                answers[index]
              );

            const correctAnswer =
              Number(
                question.answer
              );

            const isCorrect =
              selectedAnswer ===
              correctAnswer;

            if (isCorrect) {
              calculatedScore++;
            }

            return {
              question_index:
                index,

              topic:
                question.topic ||
                "General",

              selected_answer:
                selectedAnswer,

              correct_answer:
                correctAnswer,

              is_correct:
                isCorrect,
            };
          }
        );

      const totalQuestions =
        questions.length;

      setScore(
        calculatedScore
      );

      // ==================================================
      // SAVE RESULT TO DATABASE
      // ==================================================

      try {
        const response =
          await fetch(
            `${API_URL}/quiz/submit`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                "X-User-ID":
                  String(user.id),
              },

              body: JSON.stringify({
                document_id:
                  Number(
                    selectedDocument
                  ),

                quiz:
                  questions,

                answers:
                  questions.map(
                    (question, index) => {
                      const selectedIndex =
                        Number(
                          answers[index]
                        );

                      return (
                        question.options?.[
                          selectedIndex
                        ] ?? null
                      );
                    }
                  ),
              }),
            }
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Quiz result could not be saved."
          );
        }

        setSubmitted(true);

      } catch (err) {
        console.error(
          "Quiz submission error:",
          err
        );

        /*
         * The score is still shown,
         * but tell the user if database
         * saving failed.
         */

        setError(
          err.message ||
            "Unable to save quiz result."
        );

      } finally {
        setSubmitting(false);
      }
    };

  // ==================================================
  // RESET QUIZ
  // ==================================================

  const handleResetQuiz =
    () => {
      setQuestions([]);
      setAnswers({});
      setScore(null);
      setSubmitted(false);
      setError("");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };

  // ==================================================
  // SELECTED DOCUMENT
  // ==================================================

  const selectedDocumentData =
    documents.find(
      (document) =>
        String(
          document.id
        ) ===
        String(
          selectedDocument
        )
    );

  // ==================================================
  // LOADING DOCUMENTS
  // ==================================================

  if (
    loadingDocuments
  ) {
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

  // ==================================================
  // RENDER
  // ==================================================

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div>

        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">

            <Brain size={22} />

          </div>

          <div>

            <h1 className="text-2xl font-semibold">
              Quiz
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Test your understanding with AI-generated questions.
            </p>

          </div>

        </div>

      </div>


      {/* ==================================================
          QUIZ CONTROLS
      ================================================== */}

      <GlassCard>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">

          {/* Label */}

          <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">

            <FileText
              size={17}
              className="text-violet-400"
            />

            Quiz from

          </div>


          {/* Document Select */}

          <select
            value={
              selectedDocument
            }
            onChange={
              handleDocumentChange
            }
            disabled={
              documents.length ===
              0 ||
              generating
            }
            className="min-w-0 flex-1 rounded-xl border border-white/[0.07] bg-[#0a1020] px-4 py-3 text-sm text-slate-300 outline-none transition focus:border-violet-400/30 disabled:cursor-not-allowed disabled:opacity-60"
          >

            {documents.length ===
            0 ? (

              <option value="">
                No documents available
              </option>

            ) : (

              documents.map(
                (document) => (

                  <option
                    key={
                      document.id
                    }
                    value={
                      document.id
                    }
                  >
                    {
                      document.filename
                    }
                  </option>

                )
              )

            )}

          </select>


          {/* Generate Button */}

          <button
            type="button"
            onClick={
              handleGenerateQuiz
            }
            disabled={
              !selectedDocument ||
              generating ||
              documents.length ===
                0
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_0_25px_rgba(139,92,246,0.25)] transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:bg-slate-500 disabled:shadow-none"
          >

            {generating ? (

              <>
                <Loader2
                  size={17}
                  className="animate-spin"
                />

                Generating...

              </>

            ) : (

              <>
                Generate Quiz

                <ChevronRight
                  size={17}
                />

              </>

            )}

          </button>

        </div>


        {/* Selected document */}

        {selectedDocumentData && (

          <p className="mt-3 text-[11px] text-slate-600">

            Questions will be generated from{" "}

            <span className="text-violet-400">
              {
                selectedDocumentData.filename
              }
            </span>

            .

          </p>

        )}

      </GlassCard>


      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (

        <div className="rounded-xl border border-red-400/10 bg-red-500/[0.06] px-4 py-3 text-sm text-red-300">

          {error}

        </div>

      )}


      {/* ==================================================
          NO DOCUMENTS
      ================================================== */}

      {documents.length ===
        0 && (

        <GlassCard>

          <div className="flex min-h-[420px] flex-col items-center justify-center text-center">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-300">

              <FileText size={25} />

            </div>


            <h2 className="mt-5 text-lg font-semibold text-slate-200">
              No study material found
            </h2>


            <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
              Upload a PDF first, then come back here to generate a personalized quiz from your study material.
            </p>


            <button
              type="button"
              onClick={() =>
                navigate(
                  "/documents"
                )
              }
              className="mt-6 rounded-xl bg-violet-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-400"
            >
              Upload Document
            </button>

          </div>

        </GlassCard>

      )}


      {/* ==================================================
          EMPTY QUIZ STATE
      ================================================== */}

      {documents.length >
        0 &&
        questions.length ===
          0 && (

        <GlassCard>

          <div className="flex min-h-[430px] flex-col items-center justify-center text-center">

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-300">

              <Brain size={30} />

            </div>


            <h2 className="mt-6 text-xl font-semibold text-slate-200">
              Generate your quiz
            </h2>


            <p className="mt-2 max-w-lg text-sm leading-6 text-slate-600">
              Select one of your study documents above and let EduGenie create a personalized 5-question quiz from your study material.
            </p>


            <button
              type="button"
              onClick={
                handleGenerateQuiz
              }
              disabled={
                !selectedDocument ||
                generating
              }
              className="mt-6 inline-flex items-center gap-2 rounded-xl border border-violet-400/20 bg-violet-500/10 px-5 py-2.5 text-sm font-semibold text-violet-300 transition hover:bg-violet-500/15 disabled:cursor-not-allowed disabled:opacity-50"
            >

              {generating ? (

                <>
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />

                  Generating...

                </>

              ) : (

                <>
                  Generate Quiz

                  <ChevronRight
                    size={16}
                  />

                </>

              )}

            </button>

          </div>

        </GlassCard>

      )}


      {/* ==================================================
          QUIZ QUESTIONS
      ================================================== */}

      {questions.length >
        0 && (

        <div
          id="quiz-section"
          className="space-y-5"
        >

          {/* Quiz header */}

          <GlassCard>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p className="text-xs uppercase tracking-[0.14em] text-violet-400">
                  AI Generated Quiz
                </p>

                <h2 className="mt-1 text-lg font-semibold text-slate-200">
                  {
                    selectedDocumentData?.filename ||
                    "Study Material"
                  }
                </h2>

              </div>


              <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-2 text-xs text-slate-500">

                {questions.length} Questions

              </div>

            </div>

          </GlassCard>


          {/* Questions */}

          {questions.map(
            (
              question,
              questionIndex
            ) => (

              <GlassCard
                key={
                  question.id
                }
                id={`question-${questionIndex}`}
              >

                <div>

                  {/* Question number */}

                  <div className="flex items-start gap-3">

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-xs font-semibold text-violet-300">

                      {questionIndex +
                        1}

                    </div>


                    <div className="min-w-0 flex-1">

                      <p className="text-[10px] uppercase tracking-[0.12em] text-slate-600">
                        Question{" "}
                        {questionIndex +
                          1}
                      </p>


                      <h3 className="mt-2 text-base font-medium leading-7 text-slate-200">
                        {
                          question.question
                        }
                      </h3>

                    </div>

                  </div>


                  {/* Options */}

                  <div className="mt-5 space-y-3">

                    {question.options.map(
                      (
                        option,
                        optionIndex
                      ) => {

                        const selected =
                          answers[
                            questionIndex
                          ] ===
                          optionIndex;

                        const correct =
                          Number(
                            question.answer
                          ) ===
                          optionIndex;

                        let optionClass =
                          "border-white/[0.07] bg-white/[0.02] hover:border-violet-400/20 hover:bg-violet-500/[0.04]";

                        if (
                          !submitted &&
                          selected
                        ) {
                          optionClass =
                            "border-violet-400/40 bg-violet-500/10";
                        }

                        if (
                          submitted &&
                          correct
                        ) {
                          optionClass =
                            "border-emerald-400/30 bg-emerald-500/10";
                        }

                        if (
                          submitted &&
                          selected &&
                          !correct
                        ) {
                          optionClass =
                            "border-red-400/30 bg-red-500/10";
                        }

                        return (

                          <button
                            key={
                              optionIndex
                            }
                            type="button"
                            disabled={
                              submitted
                            }
                            onClick={() =>
                              handleAnswerChange(
                                questionIndex,
                                optionIndex
                              )
                            }
                            className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${optionClass} ${
                              submitted
                                ? "cursor-default"
                                : "cursor-pointer"
                            }`}
                          >

                            {/* Radio */}

                            <div
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                                selected
                                  ? "border-violet-400"
                                  : "border-slate-600"
                              }`}
                            >

                              {selected && (
                                <div className="h-2.5 w-2.5 rounded-full bg-violet-400" />
                              )}

                            </div>


                            {/* Option label */}

                            <span className="text-sm leading-6 text-slate-300">

                              {option}

                            </span>


                            {/* Result */}

                            {submitted &&
                              correct && (

                                <CheckCircle2
                                  size={17}
                                  className="ml-auto shrink-0 text-emerald-400"
                                />

                              )}

                          </button>

                        );
                      }
                    )}

                  </div>


                  {/* Topic */}

                  {question.topic && (

                    <p className="mt-4 text-[10px] text-slate-600">

                      Topic:{" "}

                      <span className="text-violet-400">
                        {
                          question.topic
                        }
                      </span>

                    </p>

                  )}

                </div>

              </GlassCard>

            )
          )}


          {/* ==================================================
              SUBMIT / RESULT
          ================================================== */}

          {!submitted ? (

            <GlassCard>

              <div className="flex flex-col items-center justify-center py-6 text-center">

                <p className="text-xs text-slate-600">
                  Answer all questions before submitting.
                </p>


                <button
                  type="button"
                  onClick={
                    handleSubmitQuiz
                  }
                  disabled={
                    submitting
                  }
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-violet-500 px-7 py-3 text-sm font-semibold text-white shadow-[0_0_25px_rgba(139,92,246,0.2)] transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {submitting ? (

                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />

                      Saving Result...

                    </>

                  ) : (

                    <>
                      Submit Quiz

                      <ChevronRight
                        size={17}
                      />

                    </>

                  )}

                </button>

              </div>

            </GlassCard>

          ) : (

            <GlassCard>

              <div className="flex flex-col items-center justify-center py-8 text-center">

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-300">

                  <Trophy size={30} />

                </div>


                <p className="mt-5 text-xs uppercase tracking-[0.14em] text-violet-400">
                  Quiz Completed
                </p>


                <h2 className="mt-2 text-3xl font-semibold text-white">

                  {score}

                  <span className="text-slate-600">
                    /
                    {
                      questions.length
                    }
                  </span>

                </h2>


                <p className="mt-2 text-sm text-slate-500">

                  {Math.round(
                    (score /
                      questions.length) *
                      100
                  )}
                  % accuracy

                </p>


                <div className="mt-6 flex flex-wrap justify-center gap-3">

                  <button
                    type="button"
                    onClick={
                      handleResetQuiz
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.06]"
                  >

                    <RotateCcw
                      size={16}
                    />

                    New Quiz

                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        "/dashboard"
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-400"
                  >

                    View Dashboard

                    <ChevronRight
                      size={16}
                    />

                  </button>

                </div>

              </div>

            </GlassCard>

          )}

        </div>

      )}

    </div>
  );
}