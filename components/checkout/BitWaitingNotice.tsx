interface BitWaitingNoticeProps {
  title: string;
  body: string;
}

export function BitWaitingNotice({ title, body }: BitWaitingNoticeProps) {
  return (
    <div className="rounded-xl border border-frame-border bg-frame-bg px-4 py-3">
      <p className="text-sm font-medium text-white">{title}</p>
      <p className="mt-1 text-xs text-frame-muted">{body}</p>
    </div>
  );
}
