export interface RoutineDetail {
  label: string;
  value: string;
}

interface RoutineBreakdownProps {
  details: RoutineDetail[];
  heading: string;
}

export function RoutineBreakdown({ details, heading }: RoutineBreakdownProps) {
  return (
    <section aria-labelledby="routine-breakdown-heading">
      <h2
        id="routine-breakdown-heading"
        className="mb-2 font-display text-2xl font-bold text-white"
      >
        {heading}
      </h2>
      <dl className="border-t border-frame-border">
        {details.map((detail) => (
          <div
            key={detail.label}
            className="grid grid-cols-[120px_1fr] gap-6 border-b border-frame-border py-4 sm:grid-cols-[160px_1fr]"
          >
            <dt className="text-sm text-frame-muted">{detail.label}</dt>
            <dd className="font-display text-lg text-white">{detail.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
