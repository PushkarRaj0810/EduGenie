import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  MessageCircle,
  FileText,
  GraduationCap,
  Layers3,
  BarChart3,
  Settings,
  LogOut,
  Sparkles,
  X,
} from "lucide-react";

const navigation = [
  {
    section: "OVERVIEW",
    items: [
      { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    section: "LEARNING",
    items: [
      { label: "AI Tutor", path: "/tutor", icon: MessageCircle },
      { label: "Documents", path: "/documents", icon: FileText },
      { label: "Quiz", path: "/quiz", icon: GraduationCap },
      { label: "Flashcards", path: "/flashcards", icon: Layers3 },
    ],
  },
  {
    section: "INSIGHTS",
    items: [
      { label: "Analytics", path: "/analytics", icon: BarChart3 },
    ],
  },
  {
    section: "SYSTEM",
    items: [
      { label: "Settings", path: "/settings", icon: Settings },
    ],
  },
];

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  const storedUser = localStorage.getItem("user");
  const user = storedUser
    ? JSON.parse(storedUser)
    : { name: "Student", email: "" };

  const name = user.name || "Student";
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const handleNavigation = (path) => {
    navigate(path);
    setMobileOpen?.(false);
  };

  const handleLogout = () => {
    // EduGenie uses localStorage "user" as the current login session.
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
    setMobileOpen?.(false);
  };

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/[0.08] bg-[#050816] transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="flex h-[88px] items-center justify-between px-7">
          <button
            type="button"
            onClick={() => handleNavigation("/dashboard")}
            className="flex items-center gap-4 text-left"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 shadow-lg shadow-violet-500/20">
              <span className="text-xl font-bold">♧</span>
            </div>

            <div>
              <div className="text-[20px] font-bold tracking-tight">
                Edu<span className="text-violet-400">Genie</span>
              </div>
              <div className="mt-0.5 text-[10px] font-medium tracking-[0.22em] text-slate-500">
                INTELLIGENT LEARNING
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* AI Study Mode */}
        <div className="mx-5 mb-7 rounded-2xl border border-violet-500/20 bg-violet-500/[0.07] px-4 py-4">
          <div className="flex items-center gap-3">
            <Sparkles size={19} className="text-violet-400" />
            <span className="text-[15px] font-semibold text-slate-200">
              AI Study Mode
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Your intelligent learning workspace
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-5 pb-4">
          {navigation.map((group) => (
            <div key={group.section} className="mb-7">
              <div className="mb-3 px-4 text-[12px] font-medium tracking-[0.18em] text-slate-600">
                {group.section}
              </div>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active =
                    location.pathname === item.path ||
                    location.pathname.startsWith(`${item.path}/`);

                  return (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => handleNavigation(item.path)}
                      className={`flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left text-[15px] transition ${
                        active
                          ? "bg-violet-500/[0.13] text-white shadow-[inset_0_0_0_1px_rgba(139,92,246,0.18)]"
                          : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-200"
                      }`}
                    >
                      <Icon
                        size={21}
                        strokeWidth={1.7}
                        className={active ? "text-violet-300" : "text-slate-500"}
                      />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Put the major Logout action directly under Settings. */}
              {group.section === "SYSTEM" && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-2 flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left text-[15px] text-slate-400 transition hover:bg-red-500/[0.08] hover:text-red-300"
                >
                  <LogOut size={21} strokeWidth={1.7} />
                  <span>Log out</span>
                </button>
              )}
            </div>
          ))}
        </nav>

        {/* User profile */}
        <div className="border-t border-white/[0.08] p-5">
          <div className="flex items-center gap-4 rounded-xl px-2 py-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400 to-cyan-400 text-sm font-bold text-white">
              {initials || "ST"}
            </div>

            <div className="min-w-0">
              <div className="truncate text-[14px] font-semibold text-slate-200">
                {name}
              </div>
              <div className="mt-0.5 text-xs text-slate-600">Student</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
