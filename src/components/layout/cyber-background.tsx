// Full-screen decorative cyberpunk gradient and grid background.
export function CyberBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 10% 0%, rgba(0,240,255,0.06), transparent 50%), radial-gradient(ellipse 60% 50% at 90% 100%, rgba(255,42,109,0.05), transparent 50%), radial-gradient(ellipse 50% 40% at 50% 50%, rgba(252,238,10,0.02), transparent 60%)",
        }}
      />
      <div className="absolute inset-0 cyber-grid opacity-50" />
      <div className="absolute inset-0 scanlines opacity-40" />
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(0,240,255,0.5), rgba(255,42,109,0.3), transparent)",
        }}
      />
      <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-neon-cyan/5 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-neon-magenta/5 blur-3xl" />
    </div>
  );
}
