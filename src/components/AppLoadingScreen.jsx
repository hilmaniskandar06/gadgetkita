export default function AppLoadingScreen({ progress = 0 }) {
  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900 flex flex-col items-center justify-center select-none overflow-hidden">
      {/* Background subtle glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-lime-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '600ms' }} />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 px-6 max-w-sm w-full">
        {/* Logo / Brand */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-lime-500 text-slate-900 flex items-center justify-center shadow-lg shadow-lime-500/30">
            <span className="font-black text-2xl tracking-tighter">G</span>
          </div>
          <h1 className="font-display text-3xl font-black text-white tracking-tight">
            GADGET<span className="text-lime-400">KITA</span>
          </h1>
        </div>

        {/* Spinner */}
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-slate-700/70" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-lime-400 animate-spin" />
        </div>

        {/* Bar progress */}
        <div className="w-full space-y-2">
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-lime-400 to-emerald-400 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.max(5, Math.min(100, Number(progress) || 0))}%` }}
            />
          </div>
          <p className="text-center text-xs text-slate-400 font-mono">
            Memuat toko... {Math.round(Number(progress) || 0)}%
          </p>
        </div>

        {/* Tips footer */}
        <p className="text-center text-[11px] text-slate-500 leading-relaxed max-w-xs">
          Aksesoris HP terlengkap — Case, Charger, Earphone, Powerbank, dan banyak lagi.
        </p>
      </div>
    </div>
  )
}
