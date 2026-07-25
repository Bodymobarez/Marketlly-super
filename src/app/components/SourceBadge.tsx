type Props = {
  name: string;
  className?: string;
};

/** Source attribution badge for aggregated search hits */
export function SourceBadge({ name, className = "" }: Props) {
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide bg-slate-900/80 text-white backdrop-blur-sm ${className}`}
    >
      {name}
    </span>
  );
}
