"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft02Icon, File01Icon } from "hugeicons-react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Notification from "../../components/Notification";
import { getErrorMessage, listUserAssets } from "../../lib/api";

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

const isVideoAsset = (asset: AssetItem) => {
  if (asset.resource_type === "video") return true;
  const ext = asset.url?.split(".").pop()?.toLowerCase() ?? "";
  return ["mp4", "mov", "webm", "mkv", "avi", "mpeg", "mpg"].includes(ext);
};

export default function AssetDetailPage() {
  const params = useParams();
  const assetId = useMemo(() => Number(params?.id), [params]);
  const [asset, setAsset] = useState<AssetItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAsset = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await listUserAssets();
        const items = response?.data ?? [];
        const match = items.find(
          (item) => Number((item as { id?: number }).id) === assetId,
        );
        setAsset(match ? (match as AssetItem) : null);
      } catch (err) {
        setError(getErrorMessage(err));
        setAsset(null);
      }
      setLoading(false);
    };
    if (!Number.isNaN(assetId)) {
      loadAsset();
    }
  }, [assetId]);

  return (
    <div className="min-h-screen bg-[#0b121a] text-white">
      <Navbar />
      <div className="relative min-h-screen w-full px-4 py-6 md:px-6">
        <Sidebar active="All Assets" />
        <main className="flex-1 space-y-6 lg:ml-72">
          <div className="flex items-center gap-3 text-xs text-white/50">
            <Link
              href="/assets"
              className="cursor-pointer flex items-center gap-2 rounded-lg border border-white/10 bg-[#0b141f] px-3 py-2 text-xs text-white/70 hover:border-white/20"
            >
              <ArrowLeft02Icon size={14} />
              Back
            </Link>
            <span className="text-white/35">Assets</span>
            <span className="text-white/35">/</span>
            <span className="text-white/80">Details</span>
          </div>

          <section className="rounded-2xl border border-white/5 bg-[#0f1722] p-6 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.7)]">
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-6 w-1/3 rounded-full bg-white/10" />
                <div className="h-72 w-full rounded-2xl bg-white/5" />
              </div>
            ) : !asset ? (
              <div className="grid place-items-center rounded-2xl border border-dashed border-white/10 bg-[#0b141f] px-6 py-12 text-center text-sm text-white/60">
                <div className="grid h-12 w-12 place-items-center rounded-xl border border-white/10 bg-[#0f1722]">
                  <File01Icon size={20} />
                </div>
                <p className="mt-4 text-base font-semibold text-white">
                  Asset not found
                </p>
                <p className="mt-2 text-xs text-white/50">
                  This asset may have been deleted or is unavailable.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-semibold text-white">
                    {asset.original_filename}
                  </p>
                  <p className="text-xs text-white/45">
                    {asset.project?.name || "Unknown project"}
                  </p>
                </div>

                <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                  {asset.url ? (
                    isVideoAsset(asset) ? (
                      <video
                        controls
                        src={asset.url}
                        className="h-full w-full max-h-[55vh] object-contain"
                      />
                    ) : (
                      <img
                        src={asset.url}
                        alt={asset.original_filename}
                        className="h-full w-full max-h-[55vh] object-contain"
                      />
                    )
                  ) : (
                    <div className="grid h-[40vh] place-items-center text-sm text-white/50">
                      Preview unavailable
                    </div>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-[#0b141f] p-4 text-xs text-white/70">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">
                      Asset Details
                    </p>
                    <div className="mt-3 space-y-2">
                      <p>Asset ID: {asset.id}</p>
                      <p>Project ID: {asset.project_id}</p>
                      <p>Uploaded By: {asset.uploaded_by_user_id}</p>
                      <p>Public ID: {asset.public_id}</p>
                      <p>Folder: {asset.folder}</p>
                      <p>Resource Type: {asset.resource_type}</p>
                      <p>Bytes: {asset.bytes}</p>
                      <p>Format: {asset.format}</p>
                      <p>Width: {asset.width ?? "—"}</p>
                      <p>Height: {asset.height ?? "—"}</p>
                      <p>Duration: {asset.duration ?? "—"}</p>
                      <p>Original Filename: {asset.original_filename}</p>
                      <p>Created At: {formatTimestamp(asset.created_at)}</p>
                      <p>URL: {asset.url}</p>
                      <p>Thumbnail URL: {asset.thumbnail_url || "—"}</p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-[#0b141f] p-4 text-xs text-white/70">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">
                      Project Details
                    </p>
                    <div className="mt-3 space-y-2">
                      <p>Project ID: {asset.project?.id ?? "—"}</p>
                      <p>Company ID: {asset.project?.company_id ?? "—"}</p>
                      <p>
                        Created By: {asset.project?.created_by_user_id ?? "—"}
                      </p>
                      <p>Creator Name: {asset.project?.creator_name ?? "—"}</p>
                      <p>Project Name: {asset.project?.name ?? "—"}</p>
                      <p>Website URL: {asset.project?.website_url ?? "—"}</p>
                      <p>Assets Count: {asset.project?.assets_count ?? "—"}</p>
                      <p>
                        Project Created: {formatTimestamp(asset.project?.created_at)}
                      </p>
                      <p>
                        Project Updated: {formatTimestamp(asset.project?.updated_at)}
                      </p>
                      <div>
                        <p>Extra Data:</p>
                        <div className="mt-2 space-y-1">
                          {asset.project?.extra_data &&
                          Object.keys(asset.project.extra_data).length > 0
                            ? Object.entries(asset.project.extra_data).map(
                                ([key, value]) => (
                                  <p key={key}>
                                    {key}: {value}
                                  </p>
                                ),
                              )
                            : "—"}
                        </div>
                      </div>
                    </div>
                  </div>
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
