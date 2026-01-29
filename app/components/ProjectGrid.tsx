"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Delete02Icon,
  Edit02Icon,
  Folder01Icon,
  MoreHorizontalIcon,
} from "hugeicons-react";

type ProjectItem = {
  id: number;
  name: string;
  domain: string;
  websiteUrl: string;
  assets: string;
  updatedAt: string;
  cover: string;
  creatorName?: string;
  createdByUserId?: number;
};

type ProjectGridProps = {
  projects: ProjectItem[];
  onOpen: (projectId: number) => void;
  onEdit: (projectId: number) => void;
  onDelete: (projectId: number) => void;
  currentUserId?: number | null;
};

export default function ProjectGrid({
  projects,
  onOpen,
  onEdit,
  onDelete,
  currentUserId,
}: ProjectGridProps) {
  const ProjectThumbnail = ({
    websiteUrl,
    domain,
  }: {
    websiteUrl: string;
    domain: string;
  }) => {
    const src = useMemo(() => {
      if (websiteUrl) return websiteUrl;
      if (domain) return `https://${domain}`;
      return "";
    }, [websiteUrl, domain]);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
      setFailed(false);
      if (!src) {
        setFailed(true);
        return;
      }
    }, [src]);

    if (!src || failed) {
      return (
        <div className="flex h-28 w-full items-center justify-center rounded-xl border border-white/5 bg-[#101723] text-white/50">
          <Folder01Icon size={22} />
        </div>
      );
    }

    return (
      <div className="h-28 w-full overflow-hidden rounded-xl border border-white/5 bg-[#101723]">
        <iframe
          title="Project preview"
          src={src}
          loading="lazy"
          sandbox="allow-scripts allow-same-origin"
          className="pointer-events-none h-[166%] w-[166%] scale-[0.6] origin-top-left"
          onError={() => setFailed(true)}
        />
      </div>
    );
  };

  return (
    <div className="mt-4 grid gap-4 md:grid-cols-3 xl:grid-cols-4">
      {projects.map((project) => (
        <div
          key={project.id}
          role="button"
          tabIndex={0}
          onClick={() => onOpen(project.id)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onOpen(project.id);
            }
          }}
          className="cursor-pointer rounded-2xl border border-white/5 bg-[#0b141f] p-3 transition hover:border-white/15"
        >
          <ProjectThumbnail
            websiteUrl={project.websiteUrl}
            domain={project.domain}
          />
          <div className="mt-3 flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold">{project.name}</p>
              <p className="text-xs text-white/40">{project.domain}</p>
              {project.createdByUserId &&
                currentUserId &&
                project.createdByUserId !== currentUserId &&
                project.creatorName && (
                  <p className="mt-2 text-[11px] text-white/50">
                    Added by {project.creatorName}
                  </p>
                )}
            </div>
            <div className="flex items-center gap-2 text-white/40">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit(project.id);
                }}
                className="cursor-pointer rounded-lg border text-blue-400 border-white/10 p-1 hover:border-white/20"
                aria-label="Edit project"
              >
                <Edit02Icon size={14} />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(project.id);
                }}
                className="cursor-pointer rounded-lg border border-white/10 p-1 text-red-500 hover:border-white/20"
                aria-label="Delete project"
              >
                <Delete02Icon size={14} />
              </button>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-white/45">
            <div className="flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-lg border border-white/10 bg-[#0f1722] text-[10px]">
                <Folder01Icon size={12} />
              </span>
              <span>{project.assets}</span>
            </div>
            <span>{project.updatedAt}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
