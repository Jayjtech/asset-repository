"use client";

import {
  Add01Icon,
  Cancel01Icon,
  Folder01Icon,
  GlobeIcon,
} from "hugeicons-react";

type CreateProjectModalProps = {
  open: boolean;
  name: string;
  websiteUrl: string;
  loading?: boolean;
  onNameChange: (value: string) => void;
  onUrlChange: (value: string) => void;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export default function CreateProjectModal({
  open,
  name,
  websiteUrl,
  loading = false,
  onNameChange,
  onUrlChange,
  onClose,
  onSubmit,
}: CreateProjectModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0f1722] p-6 shadow-[0_30px_70px_-50px_rgba(0,0,0,0.8)]">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Create Project</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 p-2 text-white/70 hover:bg-white/5"
          >
            <Cancel01Icon size={14} />
          </button>
        </div>
        <form className="mt-5 space-y-4" onSubmit={onSubmit}>
          <div className="">
            <label className="space-y-2 text-xs font-semibold text-white/70">
              Project Name{" "}
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0b141f] px-4 py-3">
              <Folder01Icon size={16} className="text-white/40" />
              <input
                type="text"
                placeholder="JayJ Marketing Site"
                value={name}
                onChange={(event) => onNameChange(event.target.value)}
                className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
              />
            </div>
          </div>

          <div className="">
            <label className="space-y-2 text-xs font-semibold text-white/70">
              Website URL{" "}
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0b141f] px-4 py-3">
              <GlobeIcon size={16} className="text-white/40" />
              <input
                type="url"
                placeholder="https://jayjtech.com"
                value={websiteUrl}
                onChange={(event) => onUrlChange(event.target.value)}
                className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 px-4 py-2 text-xs text-white/70 hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-[#2d8cff] px-4 py-2 text-xs font-semibold text-white shadow-[0_12px_25px_-18px_rgba(45,140,255,0.8)]"
            >
              <Add01Icon size={14} />
              {loading ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
