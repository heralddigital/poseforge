'use client';
import { useStore } from '@/lib/store';

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

export function download(filename: string, content: string, mime: string): void {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function Toasts() {
  const toasts = useStore((s) => s.toasts);
  const dismiss = useStore((s) => s.dismissToast);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto flex items-center gap-3 border border-line bg-raised px-4 py-2 text-sm">
          <span>{t.message}</span>
          {t.undo && (
            <button className="mono text-[11px] underline" onClick={() => { t.undo?.(); dismiss(t.id); }}>
              Undo
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export function Chip({ on, children, onClick, title }: { on?: boolean; children: React.ReactNode; onClick?: () => void; title?: string }) {
  return (
    <button type="button" title={title} onClick={onClick} className={`chip ${on ? 'chip-on' : ''} ${onClick ? 'cursor-pointer hover:border-accent/60' : ''}`}>
      {children}
    </button>
  );
}

export const STATUS_STYLE: Record<string, string> = {
  unused: 'text-mute border-line',
  generated: 'text-ink border-ink',
  posted: 'bg-signal text-on-signal border-signal',
  rejected: 'text-mute border-line line-through'
};
