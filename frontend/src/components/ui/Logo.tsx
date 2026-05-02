interface LogoProps {
  compact?: boolean;
}

export function Logo({ compact = false }: LogoProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-card bg-brand">
        <span className="text-xs font-bold text-white">CV</span>
      </div>
      {!compact && <span className="text-sm font-medium text-ink">CV Canvas</span>}
    </div>
  );
}
