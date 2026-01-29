"use client";

import { useEffect } from "react";
import { Cancel01Icon } from "hugeicons-react";

type NotificationType = "success" | "error" | "warning" | "info";

type NotificationProps = {
  type: NotificationType;
  message: string;
  onClose?: () => void;
  durationMs?: number;
};

const styles: Record<NotificationType, { border: string; bg: string; text: string }> = {
  success: {
    border: "border-[#2dd4bf]/40",
    bg: "bg-[#0b1f1b]",
    text: "text-[#5fd38d]",
  },
  error: {
    border: "border-[#f25c5c]/40",
    bg: "bg-[#1a0f14]",
    text: "text-[#f25c5c]",
  },
  warning: {
    border: "border-[#f59f0b]/40",
    bg: "bg-[#1a140a]",
    text: "text-[#f7b955]",
  },
  info: {
    border: "border-[#2d8cff]/40",
    bg: "bg-[#0f1a2a]",
    text: "text-[#8ec5ff]",
  },
};

export default function Notification({
  type,
  message,
  onClose,
  durationMs = 5000,
}: NotificationProps) {
  useEffect(() => {
    if (!onClose) return;
    const timer = window.setTimeout(() => onClose(), durationMs);
    return () => window.clearTimeout(timer);
  }, [onClose, durationMs]);

  const style = styles[type];

  return (
    <div
      className={`pointer-events-auto flex w-full max-w-sm items-start justify-between gap-4 rounded-2xl border px-4 py-3 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.7)] backdrop-blur ${style.border} ${style.bg}`}
      role="status"
    >
      <div>
        <p className={`text-xs font-semibold uppercase tracking-[0.25em] ${style.text}`}>
          {type}
        </p>
        <p className="mt-2 text-sm text-white/80">{message}</p>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer mt-1 text-xs text-white/50 hover:text-white"
          aria-label="Close notification"
        >
          <Cancel01Icon size={14} />
        </button>
      )}
    </div>
  );
}
