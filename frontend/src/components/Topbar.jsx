import {
  Bell,
  Menu,
  Search,
  Sparkles,
} from "lucide-react";

export default function Topbar({
  setMobileOpen,
}) {

  // --------------------------------------------------
  // Get logged-in user
  // --------------------------------------------------

  const storedUser =
    localStorage.getItem("user");

  let user = null;

  try {
    user = storedUser
      ? JSON.parse(storedUser)
      : null;
  } catch (error) {
    console.error(
      "Unable to read logged-in user:",
      error
    );
  }


  // --------------------------------------------------
  // User name
  // --------------------------------------------------

  const userName =
    user?.name || "Student";


  // --------------------------------------------------
  // Create user initials
  // --------------------------------------------------

  const userInitials =
    userName
      .split(" ")
      .filter(Boolean)
      .map((part) =>
        part.charAt(0).toUpperCase()
      )
      .slice(0, 2)
      .join("") || "ST";


  return (
    <header className="sticky top-0 z-30 flex h-20 items-center border-b border-white/[0.06] bg-[#050816]/75 px-4 backdrop-blur-2xl sm:px-6 lg:px-8">

      {/* Mobile menu */}

      <button
        onClick={() => setMobileOpen(true)}
        className="mr-4 rounded-xl border border-white/10 bg-white/[0.03] p-2 text-slate-400 hover:text-white lg:hidden"
      >
        <Menu size={19} />
      </button>


      {/* Search */}

      <div className="hidden max-w-md flex-1 md:block">

        <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-2.5">

          <Search
            size={16}
            className="text-slate-600"
          />

          <input
            type="text"
            placeholder="Search your learning space..."
            className="w-full bg-transparent text-xs text-white outline-none placeholder:text-slate-600"
          />

          <span className="hidden rounded-md border border-white/[0.06] px-1.5 py-0.5 text-[9px] text-slate-600 sm:block">
            /
          </span>

        </div>

      </div>


      {/* Right side */}

      <div className="ml-auto flex items-center gap-2">

        {/* AI Assistant */}

        <button className="hidden items-center gap-2 rounded-xl border border-violet-400/10 bg-violet-500/[0.07] px-3 py-2 text-xs font-medium text-violet-300 sm:flex">

          <Sparkles size={14} />

          AI Assistant

        </button>


        {/* Notifications */}

        <button className="relative rounded-xl border border-white/[0.06] bg-white/[0.03] p-2.5 text-slate-500 transition hover:text-white">

          <Bell size={17} />

          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-violet-400" />

        </button>


        {/* Dynamic user avatar */}

        <div
          title={userName}
          className="ml-1 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 text-xs font-bold"
        >
          {userInitials}
        </div>

      </div>

    </header>
  );
}