import {
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle2,
  ChevronRight,
  FileText,
  Flame,
  Layers3,
  Play,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import GlassCard from "../components/GlassCard";

export default function Landing() {
  const navigate = useNavigate();
  const chartData = [35, 50, 42, 72, 55, 88, 67, 94, 76];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070b16] text-white">

      {/* BACKGROUND */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="absolute left-[10%] top-[8%] h-72 w-72 rounded-full bg-violet-600/20 blur-[120px]" />

        <div className="absolute right-[5%] top-[20%] h-80 w-80 rounded-full bg-cyan-500/10 blur-[130px]" />

        <div className="absolute bottom-[10%] left-[35%] h-72 w-72 rounded-full bg-fuchsia-500/10 blur-[130px]" />

        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "70px 70px",
            maskImage:
              "linear-gradient(to bottom, black, transparent 75%)",
          }}
        />

        <div className="absolute left-[7%] top-[30%] h-20 w-20 rotate-12 rounded-2xl border border-violet-400/20 bg-violet-500/5 shadow-[0_0_80px_rgba(139,92,246,0.15)] backdrop-blur-sm" />

        <div className="absolute right-[10%] top-[40%] h-28 w-28 rotate-45 rounded-full border border-cyan-400/10 bg-cyan-400/[0.02] shadow-[0_0_100px_rgba(34,211,238,0.12)]" />

        <div className="absolute bottom-[20%] left-[20%] h-16 w-16 rotate-45 rounded-xl border border-fuchsia-400/10 bg-fuchsia-400/[0.03]" />

      </div>


      {/* NAVBAR */}

      <header className="relative z-20 border-b border-white/[0.05] bg-[#070b16]/60 backdrop-blur-xl">

        <div className="mx-auto flex h-20 max-w-[1400px] items-center justify-between px-5 sm:px-8 lg:px-10">

          <div className="flex items-center gap-3">

            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 shadow-[0_0_30px_rgba(139,92,246,0.25)]">
              <Brain size={21} />
            </div>

            <div>

              <div className="text-sm font-bold tracking-tight">
                EduGenie
              </div>

              <div className="text-[9px] uppercase tracking-[0.2em] text-slate-600">
                AI Learning
              </div>

            </div>

          </div>


          <nav className="hidden items-center gap-8 md:flex">

            <a
              href="#features"
              className="text-xs text-slate-500 transition hover:text-white"
            >
              Features
            </a>

            <a
              href="#how"
              className="text-xs text-slate-500 transition hover:text-white"
            >
              How it works
            </a>

            <a
              href="#stats"
              className="text-xs text-slate-500 transition hover:text-white"
            >
              Why EduGenie
            </a>

          </nav>


          <div className="flex items-center gap-2">

            <button
              onClick={() => navigate("/login")}
              className="hidden rounded-xl px-4 py-2 text-xs text-slate-400 transition hover:text-white sm:block"
            >
              Log in
            </button>

            <button
              onClick={() => navigate("/signup")}
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-black transition hover:bg-slate-200"
            >
              Get started
              <ArrowRight size={13} />
            </button>

          </div>

        </div>

      </header>


      {/* HERO */}

      <main className="relative z-10">

        <section className="mx-auto max-w-[1400px] px-5 pb-20 pt-20 sm:px-8 sm:pt-28 lg:px-10 lg:pb-28">

          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">

            {/* LEFT */}

            <div>

              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-violet-400/15 bg-violet-500/[0.07] px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-violet-300">

                <Sparkles size={12} />

                The future of learning

                <ChevronRight size={11} />

              </div>


              <h1 className="max-w-4xl text-5xl font-semibold leading-[1.03] tracking-[-0.04em] sm:text-6xl lg:text-7xl">

                Learn smarter.

                <span className="block bg-gradient-to-r from-violet-400 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
                  Not harder.
                </span>

              </h1>


              <p className="mt-7 max-w-xl text-base leading-7 text-slate-500 sm:text-lg">

                EduGenie is your intelligent learning companion.
                Turn your notes into knowledge, practice with AI,
                track your progress and build better study habits.

              </p>


              <div className="mt-9 flex flex-col gap-3 sm:flex-row">

                <button
                  onClick={() => navigate("/signup")}
                  className="group flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-violet-500 to-violet-600 px-6 py-3.5 text-sm font-semibold shadow-[0_0_40px_rgba(139,92,246,0.22)] transition hover:-translate-y-0.5"
                >

                  Start learning free

                  <ArrowRight
                    size={16}
                    className="transition group-hover:translate-x-1"
                  />

                </button>


                <button className="flex items-center justify-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.025] px-6 py-3.5 text-sm font-medium text-slate-300 backdrop-blur-xl transition hover:bg-white/[0.05]">

                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.07]">
                    <Play size={12} fill="currentColor" />
                  </span>

                  See how it works

                </button>

              </div>


              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-[10px] text-slate-600">

                <div className="flex items-center gap-2">
                  <CheckCircle2
                    size={13}
                    className="text-emerald-400"
                  />
                  AI-powered
                </div>

                <div className="flex items-center gap-2">
                  <CheckCircle2
                    size={13}
                    className="text-emerald-400"
                  />
                  Personalized
                </div>

                <div className="flex items-center gap-2">
                  <CheckCircle2
                    size={13}
                    className="text-emerald-400"
                  />
                  Built for students
                </div>

              </div>

            </div>


            {/* RIGHT DASHBOARD */}

            <div className="relative mx-auto w-full max-w-[620px]">

              <div className="absolute inset-10 rounded-full bg-violet-500/20 blur-[100px]" />


              <div className="relative rotate-[2deg] rounded-[28px] border border-white/[0.1] bg-[#0d1324]/90 p-3 shadow-[0_40px_120px_rgba(0,0,0,0.5)] backdrop-blur-2xl">

                <div className="rounded-[22px] border border-white/[0.05] bg-[#090e1c] p-5">

                  <div className="mb-6 flex items-center gap-2">

                    <div className="h-2.5 w-2.5 rounded-full bg-red-400/50" />
                    <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/50" />
                    <div className="h-2.5 w-2.5 rounded-full bg-green-400/50" />

                    <div className="ml-3 h-6 flex-1 rounded-lg bg-white/[0.03]" />

                  </div>


                  <div className="flex items-center justify-between">

                    <div>

                      <div className="text-[9px] uppercase tracking-[0.15em] text-slate-700">
                        Welcome back
                      </div>

                      <div className="mt-1 text-lg font-semibold">
                        Your learning cockpit
                      </div>

                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                      <Sparkles size={16} />
                    </div>

                  </div>


                  <div className="mt-6 grid grid-cols-3 gap-3">

                    <PreviewStat
                      value="82%"
                      label="Score"
                    />

                    <PreviewStat
                      value="12"
                      label="Streak"
                    />

                    <PreviewStat
                      value="27"
                      label="Mastered"
                    />

                  </div>


                  {/* CHART */}

                  <div className="mt-4 rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4">

                    <div className="flex items-center justify-between">

                      <span className="text-[10px] text-slate-500">
                        Study activity
                      </span>

                      <span className="text-[9px] text-emerald-400">
                        +12.5%
                      </span>

                    </div>


                    <div className="mt-5 flex h-28 items-end gap-2">

                      {chartData.map((height, index) => (

                        <div
                          key={index}
                          className="flex-1 rounded-t-lg bg-gradient-to-t from-violet-600/60 to-cyan-400/70"
                          style={{
                            height: height + "%",
                          }}
                        />

                      ))}

                    </div>

                  </div>


                  {/* AI CARD */}

                  <div className="mt-4 flex items-center gap-3 rounded-2xl border border-violet-400/10 bg-violet-500/[0.06] p-4">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                      <Brain size={16} />
                    </div>

                    <div className="min-w-0">

                      <div className="text-[10px] font-semibold text-violet-300">
                        AI Recommendation
                      </div>

                      <div className="mt-1 truncate text-[9px] text-slate-600">
                        Review Computer Networks next
                      </div>

                    </div>

                  </div>

                </div>

              </div>


              {/* FLOATING CARD */}

              <div className="absolute -left-7 top-16 hidden w-44 rounded-2xl border border-white/[0.08] bg-[#101629]/90 p-4 shadow-2xl backdrop-blur-xl sm:block">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
                    <Flame size={16} />
                  </div>

                  <div>

                    <div className="text-xs font-semibold">
                      12 day streak
                    </div>

                    <div className="mt-1 text-[9px] text-slate-600">
                      Keep going!
                    </div>

                  </div>

                </div>

              </div>


              {/* FLOATING GOAL */}

              <div className="absolute -bottom-7 -right-5 hidden w-48 rounded-2xl border border-white/[0.08] bg-[#101629]/90 p-4 shadow-2xl backdrop-blur-xl sm:block">

                <div className="flex items-center justify-between">

                  <div>

                    <div className="text-[9px] text-slate-600">
                      Weekly goal
                    </div>

                    <div className="mt-1 text-lg font-semibold">
                      80%
                    </div>

                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-full border-4 border-violet-500/40 text-[9px] font-semibold">
                    24h
                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* STATS */}

        <section
          id="stats"
          className="border-y border-white/[0.05] bg-white/[0.015]"
        >

          <div className="mx-auto grid max-w-[1400px] grid-cols-2 divide-x divide-white/[0.05] sm:grid-cols-4">

            <HeroStat
              value="10x"
              label="Faster revision"
            />

            <HeroStat
              value="24/7"
              label="AI tutor available"
            />

            <HeroStat
              value="100%"
              label="Personalized learning"
            />

            <HeroStat
              value="∞"
              label="Questions to practice"
            />

          </div>

        </section>


        {/* FEATURES */}

        <section
          id="features"
          className="mx-auto max-w-[1400px] px-5 py-24 sm:px-8 lg:px-10"
        >

          <div className="mx-auto max-w-2xl text-center">

            <div className="mb-4 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-violet-400">

              <Sparkles size={12} />

              Everything you need

            </div>


            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">

              Your entire learning journey.

              <span className="block text-slate-600">
                One intelligent workspace.
              </span>

            </h2>


            <p className="mt-4 text-sm leading-6 text-slate-600">

              Stop switching between disconnected tools.
              EduGenie brings your learning workflow into one place.

            </p>

          </div>


          <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">

            <Feature
              icon={<Brain />}
              title="AI Tutor"
              text="Get personalized explanations, examples and guidance whenever you're stuck."
            />

            <Feature
              icon={<FileText />}
              title="Smart Documents"
              text="Turn your notes and study material into an interactive knowledge base."
            />

            <Feature
              icon={<Zap />}
              title="AI Quizzes"
              text="Generate adaptive quizzes based on exactly what you're learning."
            />

            <Feature
              icon={<Layers3 />}
              title="Flashcards"
              text="Use intelligent spaced repetition to remember concepts longer."
            />

            <Feature
              icon={<BarChart3 />}
              title="Analytics"
              text="See exactly where you're improving and where you need more practice."
            />

            <Feature
              icon={<Target />}
              title="Personal Goals"
              text="Build consistent study habits with goals, streaks and progress tracking."
            />

          </div>

        </section>


        {/* HOW IT WORKS */}

        <section
          id="how"
          className="border-y border-white/[0.05] bg-white/[0.015]"
        >

          <div className="mx-auto max-w-[1400px] px-5 py-24 sm:px-8 lg:px-10">

            <div className="grid gap-14 lg:grid-cols-[0.7fr_1.3fr]">

              <div>

                <div className="mb-4 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-cyan-400">

                  <Zap size={12} />

                  Simple workflow

                </div>


                <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">

                  From confused

                  <span className="block text-slate-600">
                    to confident.
                  </span>

                </h2>


                <p className="mt-5 max-w-md text-sm leading-6 text-slate-600">

                  EduGenie turns your study process into a guided,
                  intelligent experience.

                </p>

              </div>


              <div className="space-y-4">

                <Step
                  number="01"
                  title="Bring your learning material"
                  text="Upload notes, documents or simply tell EduGenie what you're studying."
                />

                <Step
                  number="02"
                  title="Learn with your AI tutor"
                  text="Ask questions and receive explanations adapted to your current understanding."
                />

                <Step
                  number="03"
                  title="Practice and reinforce"
                  text="Test yourself with AI quizzes and intelligent flashcards."
                />

                <Step
                  number="04"
                  title="Track your growth"
                  text="Use analytics to discover patterns and continuously improve."
                />

              </div>

            </div>

          </div>

        </section>


        {/* CTA */}

        <section className="mx-auto max-w-[1400px] px-5 py-24 sm:px-8 lg:px-10">

          <div className="relative overflow-hidden rounded-[32px] border border-violet-400/10 bg-gradient-to-br from-violet-500/[0.12] via-[#0c1223] to-cyan-500/[0.07] px-6 py-16 text-center sm:px-10">

            <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-violet-500/10 blur-[100px]" />

            <div className="relative">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 shadow-[0_0_50px_rgba(139,92,246,0.3)]">

                <Brain size={25} />

              </div>


              <h2 className="mt-7 text-3xl font-semibold tracking-tight sm:text-4xl">

                Ready to learn differently?

              </h2>


              <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-600">

                Build better study habits, understand difficult
                concepts and make every hour of learning count.

              </p>


              <button
                onClick={() => navigate("/signup")}
                className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-white px-7 py-3.5 text-sm font-semibold text-black transition hover:bg-slate-200"
              >

                Start learning with EduGenie

                <ArrowRight size={16} />

              </button>

            </div>

          </div>

        </section>

      </main>


      {/* FOOTER */}

      <footer className="border-t border-white/[0.05]">

        <div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-5 px-5 py-8 sm:px-8 md:flex-row md:items-center lg:px-10">

          <div className="flex items-center gap-3">

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400">
              <Brain size={16} />
            </div>

            <div>

              <div className="text-xs font-semibold">
                EduGenie
              </div>

              <div className="text-[9px] text-slate-700">
                Intelligent learning, reimagined.
              </div>

            </div>

          </div>


          <div className="text-[10px] text-slate-700">

            © 2026 EduGenie. Built for the next generation of learners.

          </div>

        </div>

      </footer>

    </div>
  );
}


/* =========================================================
   PREVIEW STAT
========================================================= */

function PreviewStat({ value, label }) {
  return (
    <div className="rounded-xl border border-white/[0.05] bg-white/[0.025] p-3">

      <div className="text-lg font-semibold">
        {value}
      </div>

      <div className="mt-1 text-[8px] text-slate-700">
        {label}
      </div>

    </div>
  );
}


/* =========================================================
   HERO STAT
========================================================= */

function HeroStat({ value, label }) {
  return (
    <div className="px-4 py-8 text-center sm:px-8">

      <div className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {value}
      </div>

      <div className="mt-2 text-[9px] uppercase tracking-[0.15em] text-slate-700">
        {label}
      </div>

    </div>
  );
}


/* =========================================================
   FEATURE
========================================================= */

function Feature({
  icon,
  title,
  text,
}) {
  return (
    <GlassCard className="group relative overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-violet-400/10">

      <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-violet-500/5 blur-3xl transition group-hover:bg-violet-500/10" />

      <div className="relative">

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
          {icon}
        </div>


        <h3 className="mt-6 text-sm font-semibold">
          {title}
        </h3>


        <p className="mt-3 text-xs leading-6 text-slate-600">
          {text}
        </p>


        <div className="mt-6 flex items-center gap-2 text-[10px] text-violet-400 opacity-0 transition group-hover:opacity-100">

          Explore feature

          <ArrowRight size={11} />

        </div>

      </div>

    </GlassCard>
  );
}


/* =========================================================
   STEP
========================================================= */

function Step({
  number,
  title,
  text,
}) {
  return (
    <div className="group flex gap-5 rounded-2xl border border-white/[0.05] bg-white/[0.02] p-5 transition hover:border-violet-400/10 hover:bg-violet-500/[0.03]">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] text-[10px] font-semibold text-violet-300">

        {number}

      </div>


      <div>

        <h3 className="text-sm font-semibold">
          {title}
        </h3>

        <p className="mt-2 text-xs leading-5 text-slate-600">
          {text}
        </p>

      </div>

    </div>
  );
}