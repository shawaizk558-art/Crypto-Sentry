export function CyberBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 cyber-grid opacity-60" />
      <div
        className="absolute top-0 left-1/2 h-[1px] w-[80%] -translate-x-1/2"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(0,232,255,0.4), transparent)",
        }}
      />
      <div className="absolute -top-32 right-0 h-64 w-64 rounded-full bg-neon-magenta/5 blur-3xl" />
      <div className="absolute bottom-0 -left-32 h-96 w-96 rounded-full bg-neon-cyan/5 blur-3xl" />
    </div>
  );
}
