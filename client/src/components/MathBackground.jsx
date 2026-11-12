const symbols = ['π', '∑', '√', '÷', '×', '∞', '½', '%', '+', '=', 'x²', '△', '∠', '≠', '7', '3'];

export default function MathBackground({ count = 18 }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="graph-paper absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      {Array.from({ length: count }).map((_, i) => {
        const s = symbols[i % symbols.length];
        const left = (i * 53) % 100;
        const top = (i * 37) % 100;
        return (
          <span
            key={i}
            className="absolute animate-float font-display font-bold text-brand/15"
            style={{ left: `${left}%`, top: `${top}%`, fontSize: `${18 + ((i * 7) % 34)}px`, animationDelay: `${(i % 7) * -1}s` }}
          >
            {s}
          </span>
        );
      })}
    </div>
  );
}
