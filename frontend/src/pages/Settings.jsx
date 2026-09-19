import { useEffect, useMemo, useState } from "react";
import {
  User, Brain, Bell, Shield, Lock, Save, Check, ChevronRight,
  SlidersHorizontal
} from "lucide-react";
import {
  DEFAULT_PREFERENCES,
  DEFAULT_NOTIFICATIONS,
  getPreferences,
  getNotifications,
  savePreferences,
  saveNotifications,
} from "../utils/preferences";

const API_BASE = "https://edugenie-73vn.onrender.com";

function getUser() {
  try { return JSON.parse(localStorage.getItem("user") || "null"); }
  catch { return null; }
}

function SectionHeader({ icon: Icon, title, subtitle, iconClass }) {
  return (
    <div className="flex items-center gap-4">
      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${iconClass || "bg-violet-500/10 text-violet-300"}`}>
        <Icon size={20} />
      </div>
      <div>
        <h2 className="text-base font-semibold text-slate-100">{title}</h2>
        <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button type="button" aria-pressed={checked} onClick={() => onChange(!checked)}
      className={`relative h-8 w-14 shrink-0 rounded-full transition ${checked ? "bg-violet-500" : "bg-slate-700"}`}>
      <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition ${checked ? "left-7" : "left-1"}`} />
    </button>
  );
}

function PreferenceRow({ title, description, value, options, onChange }) {
  return (
    <div className="flex flex-col gap-3 border-t border-white/[0.06] py-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-slate-200">{title}</p>
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/[0.08] bg-[#0b1020] px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-violet-400/40 sm:w-48">
        {options.map(x => <option key={x}>{x}</option>)}
      </select>
    </div>
  );
}


const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "One uppercase letter (A-Z)", test: (p) => /[A-Z]/.test(p) },
  { label: "One lowercase letter (a-z)", test: (p) => /[a-z]/.test(p) },
  { label: "One number (0-9)", test: (p) => /\d/.test(p) },
  {
    label: "One special character (!@#$%^&*)",
    test: (p) => /[!@#$%^&*(),.?":{}|<>_\-\\[\]';+/=~`]/.test(p),
  },
];

function isStrongPassword(password) {
  return PASSWORD_RULES.every((rule) => rule.test(password));
}

function PasswordRequirements({ password }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
        Strong password required
      </p>

      <div className="space-y-1.5">
        {PASSWORD_RULES.map((rule) => {
          const valid = rule.test(password);

          return (
            <div
              key={rule.label}
              className={`flex items-center gap-2 text-xs ${
                valid ? "text-emerald-300" : "text-slate-500"
              }`}
            >
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${
                  valid
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "bg-white/[0.05] text-slate-600"
                }`}
              >
                {valid ? "✓" : "•"}
              </span>
              {rule.label}
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-[11px] leading-5 text-slate-600">
        Example: <span className="text-slate-400">EduGenie#2026!</span>{" "}
        Use your own unique password instead of copying this example.
      </p>
    </div>
  );
}

export default function Settings() {
  const initialUser = useMemo(getUser, []);
  const [name, setName] = useState(initialUser?.name || "");
  const [email] = useState(initialUser?.email || "");
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");
  const [preferences, setPreferences] = useState(getPreferences);
  const [notifications, setNotifications] = useState(getNotifications);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => savePreferences(preferences), [preferences]);
  useEffect(() => saveNotifications(notifications), [notifications]);

  const saveProfile = () => {
    const clean = name.trim();
    if (!clean) { setMessage("Name cannot be empty."); return; }
    const user = { ...(getUser() || {}), name: clean, email };
    localStorage.setItem("user", JSON.stringify(user));
    window.dispatchEvent(new Event("edugenie-user-updated"));
    setMessage("");
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };

  const setNotification = async (key, value) => {
    if (value && "Notification" in window && Notification.permission === "default") {
      try { await Notification.requestPermission(); } catch {}
    }
    setNotifications(n => ({ ...n, [key]: value }));
  };

  const changePassword = async e => {
    e.preventDefault();
    setPasswordMessage("");
    if (!passwords.current || !passwords.next || !passwords.confirm)
      return setPasswordMessage("Please fill all password fields.");
    if (!isStrongPassword(passwords.next))
      return setPasswordMessage(
        "New password is too weak. Meet all password requirements below."
      );
    if (passwords.next !== passwords.confirm)
      return setPasswordMessage("New password and confirmation do not match.");

    const user = getUser();
    if (!user?.id) return setPasswordMessage("Please log in again.");

    setPasswordSaving(true);
    try {
      const r = await fetch(`${API_BASE}/api/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-User-ID": String(user.id) },
        body: JSON.stringify({
          current_password: passwords.current,
          new_password: passwords.next,
        }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || !data.success) throw new Error(data.message || "Unable to change password.");
      setPasswordMessage("Password changed successfully.");
      setPasswords({ current: "", next: "", confirm: "" });
      setTimeout(() => { setPasswordOpen(false); setPasswordMessage(""); }, 1200);
    } catch (err) {
      setPasswordMessage(err.message);
    } finally { setPasswordSaving(false); }
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <section className="pb-1">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-400/10 bg-violet-500/[0.06] px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-violet-300">
          <SlidersHorizontal size={12} /> Preferences
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-white">Settings</h1>
        <p className="mt-2 text-sm text-slate-500">Manage your profile and personalize your EduGenie learning experience.</p>
      </section>

      <section className="rounded-2xl border border-white/[0.07] bg-[#091021]/90 p-6">
        <SectionHeader icon={User} title="Profile" subtitle="Your account information" />
        <div className="my-6 border-t border-white/[0.06]" />
        <div className="grid gap-5 md:grid-cols-2">
          <label><span className="mb-2 block text-[10px] uppercase tracking-[0.16em] text-slate-500">Full name</span>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-sm text-slate-200 outline-none focus:border-violet-400/40" />
          </label>
          <label><span className="mb-2 block text-[10px] uppercase tracking-[0.16em] text-slate-500">Email</span>
            <input value={email} readOnly className="w-full cursor-not-allowed rounded-xl border border-white/[0.06] bg-white/[0.015] px-4 py-3 text-sm text-slate-500 outline-none" />
          </label>
        </div>
        <div className="mt-5 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <p className="text-xs text-slate-500">Your email is linked to your login account.</p>
          <button onClick={saveProfile} className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-5 py-3 text-sm font-medium text-white hover:bg-violet-400">
            {saved ? <Check size={16}/> : <Save size={16}/>} {saved ? "Saved" : "Save changes"}
          </button>
        </div>
        {message && <p className="mt-3 text-xs text-amber-300">{message}</p>}
      </section>

      <section className="rounded-2xl border border-white/[0.07] bg-[#091021]/90 p-6">
        <SectionHeader icon={Brain} title="Learning preferences" subtitle="These settings directly affect AI-generated learning content." iconClass="bg-cyan-500/10 text-cyan-300" />
        <div className="mt-5">
          <PreferenceRow title="AI difficulty" description="Controls how simple or challenging AI explanations and questions are." value={preferences.difficulty}
            options={["Beginner","Intermediate","Advanced"]} onChange={v => setPreferences(p => ({...p, difficulty:v}))} />
          <PreferenceRow title="Language" description="Controls the language used by the AI Tutor, quizzes and flashcards." value={preferences.language}
            options={["English","Hindi"]} onChange={v => setPreferences(p => ({...p, language:v}))} />
        </div>
        <div className="mt-2 rounded-xl border border-cyan-400/10 bg-cyan-400/[0.03] px-4 py-3 text-xs text-slate-500">
          Current AI mode: <span className="text-cyan-300">{preferences.difficulty}</span> · <span className="text-cyan-300">{preferences.language}</span>
        </div>
      </section>

      <section className="rounded-2xl border border-white/[0.07] bg-[#091021]/90 p-6">
        <SectionHeader icon={Bell} title="Notifications" subtitle="Control your learning reminders" iconClass="bg-amber-500/10 text-amber-300" />
        <div className="mt-5">
          {[
            ["studyReminders","Study reminders","Browser reminders to keep your study routine active."],
            ["quizReminders","Quiz reminders","Browser reminders to revisit your quiz topics."],
            ["aiRecommendations","AI recommendations","Allow personalized recommendations to appear on the dashboard."],
          ].map(([key,title,desc]) => (
            <div key={key} className="flex items-center justify-between gap-5 border-t border-white/[0.06] py-5">
              <div><p className="text-sm font-medium text-slate-200">{title}</p><p className="mt-1 text-xs text-slate-500">{desc}</p></div>
              <Toggle checked={notifications[key]} onChange={v => setNotification(key,v)} />
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-600">
          Turning a reminder on asks your browser for notification permission when required.
        </p>
      </section>

      <section className="rounded-2xl border border-white/[0.07] bg-[#091021]/90 p-6">
        <SectionHeader icon={Shield} title="Security" subtitle="Protect your EduGenie account" iconClass="bg-emerald-500/10 text-emerald-300" />
        <div className="mt-5 rounded-xl border border-white/[0.07] bg-white/[0.015] p-4">
          <button onClick={() => {setPasswordOpen(true);setPasswordMessage("");}} className="flex w-full items-center justify-between gap-4 text-left">
            <span className="flex items-center gap-3"><Lock size={19} className="text-slate-500"/><span>
              <span className="block text-sm font-medium text-slate-200">Change password</span>
              <span className="mt-1 block text-xs text-slate-500">Update your account password securely</span>
            </span></span>
            <ChevronRight size={18} className="text-slate-600"/>
          </button>
        </div>
      </section>

      {passwordOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
        <form onSubmit={changePassword} className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0b1020] p-6 shadow-2xl">
          <h2 className="text-lg font-semibold text-white">Change password</h2>
          <p className="mt-1 text-xs text-slate-500">Enter your current password and choose a new one.</p>
          <div className="mt-5 space-y-4">
            {[["current","Current password"],["next","New password"],["confirm","Confirm new password"]].map(([k,l]) =>
              <label key={k} className="block"><span className="mb-2 block text-xs text-slate-400">{l}</span>
                <input type="password" value={passwords[k]} onChange={e => setPasswords(p=>({...p,[k]:e.target.value}))}
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-sm text-slate-200 outline-none focus:border-violet-400/40" />
              </label>
            )}

            <PasswordRequirements password={passwords.next} />
          </div>
          {passwordMessage && <p className={`mt-4 text-xs ${passwordMessage.includes("successfully") ? "text-emerald-300":"text-red-300"}`}>{passwordMessage}</p>}
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={()=>setPasswordOpen(false)} className="rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm text-slate-400">Cancel</button>
            <button
              type="submit"
              disabled={
                passwordSaving ||
                !passwords.current ||
                !isStrongPassword(passwords.next) ||
                passwords.next !== passwords.confirm
              }
              className="rounded-xl bg-violet-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {passwordSaving ? "Updating..." : "Update password"}
            </button>
          </div>
        </form>
      </div>}
    </div>
  );
}
