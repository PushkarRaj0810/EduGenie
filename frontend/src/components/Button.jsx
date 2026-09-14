import { Loader2 } from "lucide-react";

export default function Button({
  children,
  variant = "primary",
  loading = false,
  className = "",
  ...props
}) {
  const variants = {
    primary:
      "bg-white text-slate-950 hover:bg-slate-100 shadow-lg shadow-white/5",

    violet:
      "bg-violet-500 text-white hover:bg-violet-400 shadow-lg shadow-violet-500/20",

    secondary:
      "border border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.07]",

    ghost:
      "text-slate-400 hover:bg-white/[0.05] hover:text-white",
  };

  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`button-shine inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}

      {children}
    </button>
  );
}