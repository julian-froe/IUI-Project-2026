export function ExerciseHeader({
  title,
  description,
  progress,
}: {
  title: string;
  description: string;
  progress: string;
}) {
  return (
    <header className="absolute top-0 left-0 right-0 z-10 h-36 bg-white border-b border-black/10 px-10 py-6 flex justify-between items-start gap-8">
      <div>
        <p className="font-mono text-[10px] tracking-[0.35em] uppercase text-black/40 mb-2">
          Practice
        </p>
        <h3 className="font-sans font-black text-4xl uppercase tracking-tighter leading-none">
          {title}
        </h3>
        <p className="mt-2 text-sm text-black/55">
          {description}
        </p>
      </div>
      <div className="min-w-28 border border-black bg-white px-5 py-4 text-center">
        <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-black/40 mb-1">
          Done
        </p>
        <p className="font-sans font-black text-2xl">
          {progress}
        </p>
      </div>
    </header>
  );
}
