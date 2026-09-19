import {
  BarChart3,
  Brain,
  CheckCircle2,
  FileText,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import GlassCard from "../components/GlassCard";

const API_URL = "https://edugenie-73vn.onrender.com/api";

export default function Analytics() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getUser = () => {
    const stored = localStorage.getItem("user");
    if (!stored) return null;

    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  };

  const loadAnalytics = async () => {
    const user = getUser();

    if (!user?.id) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/dashboard/${user.id}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load analytics.");
      }

      setData(result);
    } catch (err) {
      console.error("Analytics error:", err);
      setError(err.message || "Unable to load analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();

    const handleFocus = () => {
      loadAnalytics();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadAnalytics();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, []);

  const stats = data?.stats || {};
  const topics = data?.topics || [];
  const weakTopics = data?.weak_topics || [];
  const recentAttempts = data?.recent_attempts || [];

  const strongestTopic = useMemo(() => {
    if (!topics.length) return null;
    return [...topics].sort((a, b) => Number(b.accuracy) - Number(a.accuracy))[0];
  }, [topics]);

  const weakestTopic = useMemo(() => {
    if (!topics.length) return null;
    return [...topics].sort((a, b) => Number(a.accuracy) - Number(b.accuracy))[0];
  }, [topics]);

  const topicQuestions = useMemo(
    () => topics.reduce((sum, topic) => sum + Number(topic.attempted || 0), 0),
    [topics]
  );

  const topicCorrect = useMemo(
    () => topics.reduce((sum, topic) => sum + Number(topic.correct || 0), 0),
    [topics]
  );

  const topicAccuracy = topicQuestions
    ? (topicCorrect / topicQuestions) * 100
    : 0;

  const recentTrend = useMemo(() => {
    if (recentAttempts.length < 2) return null;

    const newest = scorePercent(recentAttempts[0]);
    const oldest = scorePercent(recentAttempts[recentAttempts.length - 1]);

    return newest - oldest;
  }, [recentAttempts]);

  const recentAverage = useMemo(() => {
    if (!recentAttempts.length) return 0;

    const values = recentAttempts.map(scorePercent);
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }, [recentAttempts]);

  const masteredTopics = topics.filter(
    (topic) => Number(topic.accuracy) >= 80
  ).length;

  const achievements = [
    stats.quiz_attempts >= 1
      ? {
          icon: <CheckCircle2 size={16} />,
          title: "First quiz completed",
          text: "You have started building your learning profile.",
        }
      : null,
    stats.best_score >= 80
      ? {
          icon: <Trophy size={16} />,
          title: "High score",
          text: `Best quiz score: ${Number(stats.best_score).toFixed(1)}%.`,
        }
      : null,
    masteredTopics >= 1
      ? {
          icon: <Brain size={16} />,
          title: `${masteredTopics} strong topic${masteredTopics > 1 ? "s" : ""}`,
          text: "Topic accuracy is at least 80%.",
        }
      : null,
  ].filter(Boolean);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-slate-500">
        Loading your analytics...
      </div>
    );
  }

  if (error) {
    return (
      <GlassCard>
        <div className="py-12 text-center">
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={loadAnalytics}
            className="mt-4 rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-400"
          >
            Try again
          </button>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-br from-violet-500/[0.09] via-[#080d1d] to-cyan-500/[0.04] p-7 sm:p-9">
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-violet-500/10 blur-[90px]" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-cyan-300">
              <BarChart3 size={14} />
              Performance intelligence
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Your Learning Analytics
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              A clear view of your actual quiz performance, topic accuracy,
              progress, and areas that need more attention.
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-3 text-right">
            <p className="text-[10px] uppercase tracking-wider text-slate-600">
              Current profile
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-300">
              {stats.quiz_attempts || 0} quiz attempts
            </p>
          </div>
        </div>
      </section>

      {/* Real KPI cards moved from Dashboard */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          icon={<Target size={19} />}
          label="Quiz attempts"
          value={stats.quiz_attempts ?? 0}
          helper="All saved attempts"
        />
        <Metric
          icon={<TrendingUp size={19} />}
          label="Average score"
          value={`${Number(stats.average_score || 0).toFixed(1)}%`}
          helper="Across all quizzes"
        />
        <Metric
          icon={<Trophy size={19} />}
          label="Best score"
          value={`${Number(stats.best_score || 0).toFixed(1)}%`}
          helper="Personal best"
        />
        <Metric
          icon={<FileText size={19} />}
          label="Documents"
          value={stats.documents ?? 0}
          helper="Uploaded study material"
        />
      </section>

      {/* Performance overview */}
      <section className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <GlassCard>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold">Quiz performance</h2>
              <p className="mt-1 text-xs text-slate-600">
                Recent scores from your saved quiz attempts.
              </p>
            </div>

            {recentTrend !== null && (
              <div
                className={`flex items-center gap-1 text-xs font-semibold ${
                  recentTrend >= 0 ? "text-emerald-400" : "text-orange-400"
                }`}
              >
                {recentTrend >= 0 ? (
                  <TrendingUp size={14} />
                ) : (
                  <TrendingDown size={14} />
                )}
                {recentTrend >= 0 ? "+" : ""}
                {recentTrend.toFixed(1)} pts
              </div>
            )}
          </div>

          {recentAttempts.length === 0 ? (
            <EmptyState text="Complete a quiz to see your performance here." />
          ) : (
            <>
              <div className="mt-7 flex h-48 items-end gap-3 border-b border-white/[0.05] px-2">
                {[...recentAttempts].reverse().map((attempt, index) => {
                  const percentage = scorePercent(attempt);

                  return (
                    <div
                      key={attempt.id ?? index}
                      className="group flex h-full flex-1 flex-col items-center justify-end gap-2"
                    >
                      <span className="text-[10px] text-slate-600 opacity-0 transition group-hover:opacity-100">
                        {percentage.toFixed(0)}%
                      </span>

                      <div
                        className="w-full max-w-12 rounded-t-xl bg-gradient-to-t from-violet-600 to-cyan-400 transition group-hover:opacity-80"
                        style={{
                          height: `${Math.max(8, Math.min(100, percentage))}%`,
                        }}
                        title={`${percentage.toFixed(1)}%`}
                      />

                      <span className="text-[10px] text-slate-700">
                        #{index + 1}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs">
                <span className="text-slate-600">
                  Recent average{" "}
                  <strong className="text-slate-400">
                    {recentAverage.toFixed(1)}%
                  </strong>
                </span>

                <span className="text-slate-600">
                  Attempts shown{" "}
                  <strong className="text-slate-400">
                    {recentAttempts.length}
                  </strong>
                </span>
              </div>
            </>
          )}
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-2">
            <Target size={18} className="text-cyan-300" />
            <h2 className="text-base font-semibold">Overall accuracy</h2>
          </div>

          <div className="mt-7 flex items-center justify-center">
            <div className="relative flex h-40 w-40 items-center justify-center rounded-full border-[14px] border-white/[0.05]">
              <div
                className="absolute inset-[-14px] rounded-full"
                style={{
                  background: `conic-gradient(#8b5cf6 ${topicAccuracy}%, transparent ${topicAccuracy}% 100%)`,
                  WebkitMask:
                    "radial-gradient(farthest-side, transparent calc(100% - 14px), #000 calc(100% - 13px))",
                  mask:
                    "radial-gradient(farthest-side, transparent calc(100% - 14px), #000 calc(100% - 13px))",
                }}
              />
              <div className="text-center">
                <p className="text-3xl font-semibold">
                  {topicAccuracy.toFixed(1)}%
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-600">
                  Topic accuracy
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <MiniStat label="Questions" value={topicQuestions} />
            <MiniStat label="Correct" value={topicCorrect} />
          </div>
        </GlassCard>
      </section>

      {/* Topic performance + insights */}
      <section className="grid gap-6 lg:grid-cols-1 xl:grid-cols-2">
        <GlassCard>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-semibold">Subject performance</h2>
              <p className="mt-1 text-xs text-slate-600">
                Accuracy calculated from question-wise quiz answers.
              </p>
            </div>
            <Brain size={19} className="text-violet-300" />
          </div>

          {topics.length === 0 ? (
            <EmptyState text="Topic analytics will appear after you complete a quiz." />
          ) : (
            <div className="mt-6 space-y-5">
              {topics.map((topic) => {
                const accuracy = Number(topic.accuracy || 0);

                return (
                  <div key={topic.topic}>
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-300">
                          {topic.topic}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-600">
                          {topic.correct} of {topic.attempted} correct
                        </p>
                      </div>

                      <span
                        className={`shrink-0 text-sm font-semibold ${
                          accuracy < 60
                            ? "text-orange-400"
                            : "text-emerald-400"
                        }`}
                      >
                        {accuracy.toFixed(1)}%
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400"
                        style={{
                          width: `${Math.max(0, Math.min(100, accuracy))}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-2">
            <Brain size={18} className="text-violet-300" />
            <h2 className="text-base font-semibold">Personalized insight</h2>
          </div>

          {topics.length === 0 ? (
            <EmptyState text="More quiz data is needed for personalized insights." />
          ) : (
            <div className="mt-6 space-y-3">
              {weakestTopic && (
                <Insight
                  type="focus"
                  title="Focus opportunity"
                  text={`${weakestTopic.topic} is currently your lowest-scoring topic at ${Number(
                    weakestTopic.accuracy
                  ).toFixed(1)}%.`}
                />
              )}

              {strongestTopic && (
                <Insight
                  type="strong"
                  title="Strongest topic"
                  text={`${strongestTopic.topic} is currently your strongest topic at ${Number(
                    strongestTopic.accuracy
                  ).toFixed(1)}%.`}
                />
              )}

              {weakTopics.length > 0 && (
                <Insight
                  type="next"
                  title="Recommended next step"
                  text={`Review ${weakTopics[0].topic}, then take another quiz to measure improvement.`}
                />
              )}

              {recentTrend !== null && (
                <Insight
                  type={recentTrend >= 0 ? "strong" : "focus"}
                  title="Recent trend"
                  text={`Your newest recent score is ${Math.abs(
                    recentTrend
                  ).toFixed(1)} percentage points ${
                    recentTrend >= 0 ? "higher" : "lower"
                  } than the oldest score shown.`}
                />
              )}
            </div>
          )}
        </GlassCard>
      </section>

      {/* Learning activity + recent attempts */}
      <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <GlassCard>
          <div className="flex items-center gap-2">
            <BarChart3 size={18} className="text-cyan-300" />
            <div>
              <h2 className="text-base font-semibold">Learning activity</h2>
              <p className="mt-1 text-xs text-slate-600">
                Quiz activity recorded by EduGenie.
              </p>
            </div>
          </div>

          {recentAttempts.length === 0 ? (
            <EmptyState text="Your quiz activity will appear here." />
          ) : (
            <div className="mt-6 space-y-3">
              {recentAttempts.map((attempt, index) => (
                <div
                  key={attempt.id ?? index}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-3"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-300">
                    <CheckCircle2 size={15} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-slate-300">
                      Quiz attempt #{index + 1}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-600">
                      {formatDate(attempt.attempted_at)}
                    </p>
                  </div>

                  <span className="text-xs font-semibold text-slate-400">
                    {attempt.score}/{attempt.total_questions}
                  </span>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Recent quiz attempts</h2>
              <p className="mt-1 text-xs text-slate-600">
                Latest attempts saved in PostgreSQL.
              </p>
            </div>
            <Trophy size={18} className="text-yellow-300" />
          </div>

          {recentAttempts.length === 0 ? (
            <EmptyState text="No quiz attempts yet." />
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[500px] text-left">
                <thead>
                  <tr className="border-b border-white/[0.06] text-[10px] uppercase tracking-wider text-slate-600">
                    <th className="px-3 py-3 font-medium">Attempt</th>
                    <th className="px-3 py-3 font-medium">Score</th>
                    <th className="px-3 py-3 font-medium">Accuracy</th>
                    <th className="px-3 py-3 font-medium">Date</th>
                  </tr>
                </thead>

                <tbody>
                  {recentAttempts.map((attempt, index) => {
                    const accuracy = scorePercent(attempt);

                    return (
                      <tr
                        key={attempt.id ?? index}
                        className="border-b border-white/[0.04] last:border-0"
                      >
                        <td className="px-3 py-3.5 text-sm text-slate-300">
                          #{index + 1}
                        </td>
                        <td className="px-3 py-3.5 text-sm text-slate-500">
                          {attempt.score}/{attempt.total_questions}
                        </td>
                        <td className="px-3 py-3.5 text-sm font-medium text-emerald-400">
                          {accuracy.toFixed(1)}%
                        </td>
                        <td className="px-3 py-3.5 text-xs text-slate-600">
                          {formatDate(attempt.attempted_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      </section>

    </div>
  );
}

function Metric({ icon, label, value, helper }) {
  return (
    <GlassCard>
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
          {icon}
        </div>
      </div>

      <p className="mt-5 text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-[10px] text-slate-700">{helper}</p>
    </GlassCard>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 text-center">
      <p className="text-lg font-semibold text-slate-300">{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-700">
        {label}
      </p>
    </div>
  );
}

function Insight({ type, title, text }) {
  const icon =
    type === "strong" ? (
      <TrendingUp size={15} />
    ) : type === "focus" ? (
      <TrendingDown size={15} />
    ) : (
      <Target size={15} />
    );

  return (
    <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
      <div className="flex items-center gap-2 text-violet-300">
        {icon}
        <p className="text-xs font-semibold text-slate-300">{title}</p>
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-600">{text}</p>
    </div>
  );
}

function EmptyState({ text }) {
  return <p className="mt-6 text-sm text-slate-600">{text}</p>;
}

function scorePercent(attempt) {
  const score = Number(attempt?.score || 0);
  const total = Number(attempt?.total_questions || 0);
  return total > 0 ? (score / total) * 100 : 0;
}

function formatDate(value) {
  if (!value) return "—";

  let raw = String(value).trim();

  // PostgreSQL timestamps can arrive without a timezone.
  // The backend stores the quiz timestamp in UTC, so explicitly mark
  // timezone-less values as UTC before converting them to India time.
  if (!/[zZ]|[+-]\\d{2}:?\\d{2}$/.test(raw)) {
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
