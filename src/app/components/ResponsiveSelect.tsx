import { cn } from "./ui/utils";

type Option = { value: string; label: string };

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  "aria-label"?: string;
  className?: string;
  id?: string;
};

/**
 * Native select styled for mobile + desktop.
 * Avoids clipped / zero-height dropdowns inside overflow containers.
 */
export function ResponsiveSelect({
  value,
  onChange,
  options,
  className,
  id,
  ...rest
}: Props) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "ui-select min-h-11 w-full max-w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-700",
        "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100",
        "px-3 pe-9 py-2.5 text-sm outline-none",
        "focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20",
        className,
      )}
      {...rest}
    >
      {options.map((o) => (
        <option key={o.value || "__empty"} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
