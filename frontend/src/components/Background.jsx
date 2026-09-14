export default function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="grid-background absolute inset-0 opacity-50" />

      <div className="glow-orb glow-orb-one" />
      <div className="glow-orb glow-orb-two" />
      <div className="glow-orb glow-orb-three" />

      <div className="absolute left-1/2 top-[-300px] h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[150px]" />
    </div>
  );
}