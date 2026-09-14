import { Brain } from "lucide-react";

export default function Logo({ collapsed = false }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
        <div className="absolute inset-1 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400" />

        <Brain
          size={20}
          className="relative z-10 text-white"
        />
      </div>

      {!collapsed && (
        <div>
          <div className="text-base font-bold tracking-tight">
            Edu<span className="text-violet-400">Genie</span>
          </div>

          <div className="text-[9px] uppercase tracking-[0.2em] text-slate-600">
            Intelligent Learning
          </div>
        </div>
      )}
    </div>
  );
}