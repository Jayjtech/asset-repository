"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  File01Icon,
  Folder01Icon,
  PlayCircleIcon,
  Search02Icon,
} from "hugeicons-react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Notification from "../components/Notification";
import { getErrorMessage, listUserAssets } from "../lib/api";

type ProjectSummary = {
  id: number;
  company_id: number;
  created_by_user_id: number;
  creator_name?: string | null;
  name: string;
  website_url?: string | null;
  extra_data?: Record<string, string> | null;
  assets_count?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type AssetItem = {
  id: number;
  project_id: number;
  uploaded_by_user_id: number;
  public_id: string;
  url: string;
  thumbnail_url?: string | null;
  folder: string;
  resource_type: string;
  bytes: number;
  format: string;
  width?: number | null;
  height?: number | null;
  duration?: number | null;
  original_filename: string;
  created_at?: string | null;
  project?: ProjectSummary | null;
};

const formatTimestamp = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatBytes = (bytes?: number | null) => {
  if (!bytes && bytes !== 0) return "—";
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(2)} MB`;
  return `${Math.max(bytes / 1_000, 0.1).toFixed(0)} KB`;
};

const formatAssetName = (filename?: string | null) => {
  if (!filename) return "Asset";
  const lastDot = filename.lastIndexOf(".");
  const base = lastDot > 0 ? filename.slice(0, lastDot) : filename;
  if (!base) return "Asset";
  return base.charAt(0).toUpperCase() + base.slice(1);
};

const isVideoAsset = (asset: AssetItem) => {
  if (asset.resource_type === "video") return true;
  const ext = asset.url?.split(".").pop()?.toLowerCase() ?? "";
  return ["mp4", "mov", "webm", "mkv", "avi", "mpeg", "mpg"].includes(ext);
};

export default function AllAssetsPage() {
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredAssets = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return assets;
    return assets.filter((asset) => {
      const filename = asset.original_filename?.toLowerCase() ?? "";
      const projectName = asset.project?.name?.toLowerCase() ?? "";
      const projectUrl = asset.project?.website_url?.toLowerCase() ?? "";
      return (
        filename.includes(query) ||
        projectName.includes(query) ||
        projectUrl.includes(query)
      );
    });
  }, [assets, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredAssets.length / 20));
  const paginatedAssets = useMemo(() => {
    const start = (currentPage - 1) * 20;
    return filteredAssets.slice(start, start + 20);
  }, [filteredAssets, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, assets]);

  useEffect(() => {
    const loadAssets = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await listUserAssets();
        const mapped = response?.data?.map((item) => item as AssetItem) ?? [];
        setAssets(mapped);
      } catch (err) {
        setError(getErrorMessage(err));
        setAssets([]);
      }
      setLoading(false);
    };
    loadAssets();
  }, []);

  return (
    <div className="min-h-screen bg-[#0b121a] text-white">
      <Navbar />
      <div className="relative min-h-screen w-full px-4 py-6 md:px-6">
        <Sidebar active="All Assets" />
        <main className="flex-1 space-y-6 lg:ml-72">
          <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/5 bg-[#0f1722] px-5 py-4 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.7)]">
            <div>
              <p className="text-sm font-semibold">All Assets</p>
              <p className="text-xs text-white/45">
                Assets from your projects and shared workspaces.
              </p>
            </div>
            <div className="flex w-full max-w-sm items-center gap-2 rounded-xl border border-white/5 bg-[#0b141f] px-3 py-2 text-xs text-white/50">
              <Search02Icon size={14} />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by filename or project"
                className="w-full bg-transparent text-xs text-white/80 placeholder:text-white/40 focus:outline-none"
              />
            </div>
          </header>

          <section className="rounded-2xl border border-white/5 bg-[#0f1722] p-5 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.7)]">
            {loading ? (
              <div className="space-y-4">
                {[...Array(6)].map((_, index) => (
                  <div
                    key={`asset-skeleton-${index}`}
                    className="animate-pulse rounded-2xl border border-white/5 bg-[#0b141f] p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-24 rounded-xl bg-white/5" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-1/3 rounded-full bg-white/10" />
                        <div className="h-3 w-1/4 rounded-full bg-white/10" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : assets.length === 0 ? (
              <div className="grid place-items-center rounded-2xl border border-dashed border-white/10 bg-[#0b141f] px-6 py-12 text-center text-sm text-white/60">
                <div className="grid h-12 w-12 place-items-center rounded-xl border border-white/10 bg-[#0f1722]">
                  <File01Icon size={20} />
                </div>
                <p className="mt-4 text-base font-semibold text-white">
                  No assets yet
                </p>
                <p className="mt-2 text-xs text-white/50">
                  Upload assets to any project to see them here.
                </p>
              </div>
            ) : filteredAssets.length === 0 ? (
              <div className="grid place-items-center rounded-2xl border border-dashed border-white/10 bg-[#0b141f] px-6 py-12 text-center text-sm text-white/60">
                <div className="grid h-12 w-12 place-items-center rounded-xl border border-white/10 bg-[#0f1722]">
                  <Search02Icon size={20} />
                </div>
                <p className="mt-4 text-base font-semibold text-white">
                  No assets match your search
                </p>
                <p className="mt-2 text-xs text-white/50">
                  Try a different filename or project name.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedAssets.map((asset) => {
                  const isVideo = isVideoAsset(asset);
                  const previewUrl = isVideo
                    ? asset.thumbnail_url || asset.url
                    : asset.url;
                  const dimensions =
                    asset.width && asset.height
                      ? `${asset.width} × ${asset.height}`
                      : "—";
                  return (
                    <div
                      key={asset.id}
                      className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/5 bg-[#0b141f] p-4"
                    >
                      <div className="flex min-w-[260px] items-center gap-4">
                        <div className="relative h-16 w-24 overflow-hidden rounded-xl border border-white/5 bg-[#101723]">
                          {previewUrl ? (
                            <img
                              src={previewUrl}
                              alt={asset.original_filename}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-white/40">
                              <Folder01Icon size={18} />
                            </div>
                          )}
                          {isVideo && (
                            <div className="absolute inset-0 grid place-items-center bg-black/30">
                              <PlayCircleIcon size={20} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">
                            {formatAssetName(asset.original_filename)}
                          </p>
                          <p className="text-xs text-white/45">
                            {asset.project?.name || "Unknown project"}
                          </p>
                          <p className="mt-1 text-[11px] text-white/35">
                            {asset.project?.website_url || "No website URL"}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-1 flex-wrap items-center justify-end gap-6 text-xs text-white/45">
                        <span className="rounded-md border border-white/10 px-2 py-1 text-[10px] uppercase">
                          {asset.format}
                        </span>
                        <span>{formatBytes(asset.bytes)}</span>
                        <span>{dimensions}</span>
                        <span>{asset.resource_type}</span>
                        <span>{formatTimestamp(asset.created_at)}</span>
                        <Link
                          href={`/assets/${asset.id}`}
                          className="cursor-pointer rounded-lg border border-white/10 px-3 py-1 text-[11px] text-white/70 hover:border-white/20"
                        >
                          View details
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!loading && assets.length > 0 && filteredAssets.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-4 text-xs text-white/50">
                <span>
                  Showing {(currentPage - 1) * 20 + 1}-
                  {Math.min(currentPage * 20, filteredAssets.length)} of{" "}
                  {filteredAssets.length} assets
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="cursor-pointer flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1 text-xs text-white/70 disabled:opacity-40"
                  >
                    <ArrowLeft01Icon size={12} />
                    Prev
                  </button>
                  <span>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="cursor-pointer flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1 text-xs text-white/70 disabled:opacity-40"
                  >
                    Next
                    <ArrowRight01Icon size={12} />
                  </button>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>

      {error && (
        <div className="pointer-events-none fixed top-6 right-6 z-50 flex w-full max-w-sm justify-end">
          <Notification
            type="error"
            message={error}
            onClose={() => setError(null)}
          />
        </div>
      )}
    </div>
  );
}
