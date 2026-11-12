const colors = {
  4: 'from-emerald-400 to-teal-500',
  5: 'from-sky-400 to-indigo-500',
  6: 'from-violet-400 to-fuchsia-500',
  7: 'from-amber-400 to-orange-500',
  8: 'from-rose-400 to-red-500',
};

export default function GradeBadge({ grade, size = 'md' }) {
  const s = size === 'lg' ? 'h-16 w-16 text-2xl' : 'h-11 w-11 text-lg';
  return (
    <span className={`grid ${s} place-items-center rounded-2xl bg-gradient-to-br ${colors[grade]} font-display font-bold text-white shadow-lg`}>
      {grade}
    </span>
  );
}
export { colors as gradeColors };
