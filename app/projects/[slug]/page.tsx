"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Add01Icon,
  ArrowLeft02Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Cancel01Icon,
  CodeFolderIcon,
  CopyLinkIcon,
  Delete02Icon,
  FilterIcon,
  GridViewIcon,
  Menu08Icon,
  MoreHorizontalIcon,
  PlayCircleIcon,
  Search02Icon,
  SortDescendingIcon,
  Upload01Icon,
} from "hugeicons-react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import ConfirmModal from "../../components/ConfirmModal";
import Notification from "../../components/Notification";
import {
  getErrorMessage,
  getProject,
  getMe,
  listProjectAssets,
  uploadProjectAsset,
  deleteAsset,
} from "../../lib/api";

const fallbackAssets: Array<{
  id?: string | number;
  name: string;
  type: string;
  size: string;
  detail: string;
  updated: string;
  accent: string;
  url?: string;
  resourceType?: string;
  thumbnailUrl?: string;
  createdByUserId?: number;
}> = [];

export default function ProjectDetailPage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const params = useParams();
  const projectId = useMemo(() => params?.slug ?? "1", [params]);
  const [title, setTitle] = useState("JayJ Marketing Site");
  const [url, setUrl] = useState("https://jayj-marketing.com");
  const [assets, setAssets] = useState(fallbackAssets);
  const [assetsLoading, setAssetsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [assetStats, setAssetStats] = useState({
    total: 0,
    images: 0,
    videos: 0,
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [copyNotice, setCopyNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [deleteAssetId, setDeleteAssetId] = useState<string | number | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<
    (typeof fallbackAssets)[number] | null
  >(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const formatTimestamp = (value?: string) => {
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

  const formatAssetName = (filename?: string) => {
    if (!filename) return "Asset";
    const lastDot = filename.lastIndexOf(".");
    const base = lastDot > 0 ? filename.slice(0, lastDot) : filename;
    if (!base) return "Asset";
    return base.charAt(0).toUpperCase() + base.slice(1);
  };

  const mapAssets = (items: Array<Record<string, unknown>>) => {
    return items.map((asset) => {
      const bytes = Number(asset.bytes ?? 0);
      const size =
        bytes >= 1_000_000
          ? `${(bytes / 1_000_000).toFixed(1)} MB`
          : `${Math.max(bytes / 1_000, 0.1).toFixed(0)} KB`;
      const width = asset.width ? Number(asset.width) : null;
      const height = asset.height ? Number(asset.height) : null;
      const detail =
        width && height
          ? `${width} × ${height}`
          : asset.duration
            ? `${asset.duration}`
            : "Asset";
      const format =
        typeof asset.format === "string" ? asset.format.toUpperCase() : "FILE";
      return {
        id: asset.id as string | number | undefined,
        name: formatAssetName(
          typeof asset.original_filename === "string"
            ? asset.original_filename
            : undefined,
        ),
        type: format,
        size,
        detail,
        updated: asset.created_at
          ? formatTimestamp(String(asset.created_at))
          : "—",
        accent: "bg-[linear-gradient(130deg,#1f2c3a,#0f1824)]",
        url: typeof asset.url === "string" ? asset.url : undefined,
        resourceType:
          typeof asset.resource_type === "string"
            ? asset.resource_type
            : undefined,
        thumbnailUrl:
          typeof asset.thumbnail_url === "string"
            ? asset.thumbnail_url
            : undefined,
        createdByUserId:
          typeof asset.created_by_user_id === "number"
            ? asset.created_by_user_id
            : undefined,
      };
    });
  };

  const computeAssetStats = (items: Array<Record<string, unknown>>) => {
    const imageExts = [
      "png",
      "jpg",
      "jpeg",
      "webp",
      "gif",
      "svg",
      "bmp",
      "tiff",
    ];
    const videoExts = ["mp4", "mov", "webm", "mkv", "avi", "mpeg", "mpg"];
    let images = 0;
    let videos = 0;
    items.forEach((asset) => {
      const url = typeof asset.url === "string" ? asset.url : "";
      const ext = url.split(".").pop()?.toLowerCase() ?? "";
      if (imageExts.includes(ext)) images += 1;
      if (videoExts.includes(ext)) videos += 1;
    });
    setAssetStats({
      total: items.length,
      images,
      videos,
    });
  };

  const detectFileKind = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const imageExts = [
      "png",
      "jpg",
      "jpeg",
      "webp",
      "gif",
      "svg",
      "bmp",
      "tiff",
    ];
    const videoExts = ["mp4", "mov", "webm", "mkv", "avi", "mpeg", "mpg"];
    if (imageExts.includes(ext)) return "image";
    if (videoExts.includes(ext)) return "video";
    return "unknown";
  };

  const isVideoAsset = (asset: (typeof fallbackAssets)[number]) => {
    if (asset.resourceType === "video") return true;
    const url = asset.url ?? "";
    const ext = url.split(".").pop()?.toLowerCase() ?? "";
    return ["mp4", "mov", "webm", "mkv", "avi", "mpeg", "mpg"].includes(ext);
  };

  const handleCopyUrl = async (asset: (typeof fallbackAssets)[number]) => {
    if (!asset.url) {
      setUploadError("No asset URL available to copy.");
      return;
    }
    try {
      await navigator.clipboard.writeText(asset.url);
      setCopyNotice("Asset URL copied.");
    } catch (err) {
      setUploadError("Unable to copy URL. Please try again.");
    }
  };

  const filteredAssets = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return assets;
    return assets.filter((asset) => asset.name.toLowerCase().includes(query));
  }, [assets, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredAssets.length / 20));
  const paginatedAssets = useMemo(() => {
    const start = (currentPage - 1) * 20;
    return filteredAssets.slice(start, start + 20);
  }, [filteredAssets, currentPage]);

  const refreshAssets = async () => {
    const response = await listProjectAssets(projectId as string);
    if (response?.data?.length) {
      setAssets(mapAssets(response.data));
      computeAssetStats(response.data);
    } else {
      setAssets([]);
      setAssetStats({ total: 0, images: 0, videos: 0 });
    }
  };

  const handleUploadMany = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (list.length === 0) return;
    const invalid = list.find((file) => detectFileKind(file) === "unknown");
    if (invalid) {
      setUploadError("Unsupported file type. Upload images or videos only.");
      return;
    }
    setUploadError(null);
    setUploadSuccess(null);
    setUploading(true);
    setUploadProgress(0);
    try {
      for (const [index, file] of list.entries()) {
        await uploadProjectAsset(projectId as string, file, (percent) => {
          const overall = Math.round(
            ((index + percent / 100) / list.length) * 100,
          );
          setUploadProgress(overall);
        });
      }
      setUploadProgress(100);
      setUploadSuccess(
        list.length === 1
          ? "Asset uploaded successfully."
          : `${list.length} assets uploaded successfully.`,
      );
      await refreshAssets();
      setShowUploadModal(false);
    } catch (err) {
      setUploadError(getErrorMessage(err));
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteAsset = async () => {
    if (!deleteAssetId) return;
    setDeleting(true);
    setUploadError(null);
    setUploadSuccess(null);
    try {
      await deleteAsset(deleteAssetId);
      setUploadSuccess("Asset deleted.");
      await refreshAssets();
    } catch (err) {
      setUploadError(getErrorMessage(err));
    } finally {
      setDeleting(false);
      setDeleteAssetId(null);
    }
  };

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const me = await getMe();
        if (me?.data?.id) {
          setCurrentUserId(me.data.id);
        }
      } catch {
        setCurrentUserId(null);
      }
    };
    const loadProject = async () => {
      try {
        const response = await getProject(projectId as string);
        if (response?.data) {
          setTitle(response.data.name);
          if (response.data.website_url) {
            setUrl(response.data.website_url);
          }
        }
      } catch (err) {
        // Keep fallback data.
      }
    };
    const loadAssets = async () => {
      setAssetsLoading(true);
      try {
        const response = await listProjectAssets(projectId as string);
        if (response?.data?.length) {
          setAssets(mapAssets(response.data));
          computeAssetStats(response.data);
        } else {
          setAssets([]);
          setAssetStats({ total: 0, images: 0, videos: 0 });
        }
      } catch (err) {
        setAssets([]);
        setAssetStats({ total: 0, images: 0, videos: 0 });
      }
      setAssetsLoading(false);
    };

    loadCurrentUser();
    loadProject();
    loadAssets();
  }, [projectId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, assets]);

  return (
    <div className="min-h-screen bg-[#0b121a] text-white">
      <Navbar />

      <div className="relative min-h-screen w-full px-4 py-6 md:px-6">
        <Sidebar active="Projects" />

        <main className="flex-1 space-y-6 lg:ml-72">
          <div className="flex items-center gap-3 text-xs text-white/50">
            <Link
              href="/dashboard"
              className="cursor-pointer flex items-center gap-2 rounded-lg border border-white/10 bg-[#0b141f] px-3 py-2 text-xs text-white/70 hover:border-white/20"
            >
              <ArrowLeft02Icon size={14} />
              Back
            </Link>
            <span className="text-white/35">Projects</span>
            <span className="text-white/35">/</span>
            <span className="text-white/80">{title}</span>
          </div>

          <section className="rounded-2xl border border-white/5 bg-[#0f1722] p-5 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.7)]">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-[#142136] text-2xl">
                  <CodeFolderIcon size={24} />
                </div>
                <div>
                  <h1 className="text-lg font-semibold sm:text-xl">{title}</h1>
                  <p className="text-xs text-white/55">{url}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/40"></div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={`/projects/${projectId}/edit`}
                  className="cursor-pointer rounded-xl border border-white/10 bg-[#0b141f] px-4 py-2 text-sm text-white/75"
                >
                  Edit
                </Link>
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="cursor-pointer rounded-xl bg-[#2d8cff] px-4 py-2 text-sm font-semibold shadow-[0_12px_25px_-18px_rgba(45,140,255,0.8)]"
                >
                  Visit Site
                </a>
              </div>
            </div>
          </section>

          <section className="grid gap-4 grid-cols-2 md:grid-cols-3">
            {[
              {
                label: "Total Assets",
                value: `${assetStats.total} file${assetStats.total > 1 ? "s" : ""}`,
              },
              {
                label: "Images",
                value: `${assetStats.images} file${assetStats.images > 1 ? "s" : ""}`,
              },
              {
                label: "Videos",
                value: `${assetStats.videos} file${assetStats.videos > 1 ? "s" : ""}`,
              },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/5 bg-[#0f1722] px-5 py-4 shadow-[0_20px_45px_-35px_rgba(0,0,0,0.7)]"
              >
                <div className="flex items-center justify-between text-xs text-white/55">
                  <span>{stat.label}</span>
                  <span className="text-white/40">
                    {index === 0 ? (
                      <GridViewIcon size={14} />
                    ) : index === 1 ? (
                      <FilterIcon size={14} />
                    ) : (
                      <SortDescendingIcon size={14} />
                    )}
                  </span>
                </div>
                <p className="mt-3 text-2xl font-semibold">{stat.value}</p>
              </div>
            ))}
          </section>

          <section className="rounded-2xl border border-white/5 bg-[#0f1722] p-5 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.7)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-[#0b141f] p-1 text-xs text-white/60 sm:flex-none">
              <button
                type="button"
                aria-pressed={view === "grid"}
                onClick={() => setView("grid")}
                className={`cursor-pointer flex items-center gap-2 rounded-lg px-3 py-2 transition ${
                  view === "grid"
                    ? "bg-[#132238] text-white"
                    : "text-white/50 hover:text-white"
                }`}
              >
                    <GridViewIcon size={14} />
                    Grid
                  </button>
              <button
                type="button"
                aria-pressed={view === "list"}
                onClick={() => setView("list")}
                className={`cursor-pointer flex items-center gap-2 rounded-lg px-3 py-2 transition ${
                  view === "list"
                    ? "bg-[#132238] text-white"
                    : "text-white/50 hover:text-white"
                }`}
              >
                    <Menu08Icon size={14} />
                    List
                  </button>
                </div>
              </div>

              <div className="flex w-full flex-1 flex-wrap items-center gap-3 lg:justify-end">
                <div className="flex w-full flex-1 items-center gap-2 rounded-xl border border-white/10 bg-[#0b141f] px-3 py-2 text-xs text-white/50 lg:max-w-sm">
                  <Search02Icon size={14} />
                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Filter by name..."
                    className="w-full bg-transparent text-xs text-white/80 placeholder:text-white/40 focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(true)}
                  disabled={uploading}
                  className="cursor-pointer flex w-full items-center justify-center rounded-xl bg-[#2d8cff] px-4 py-2 text-sm font-semibold shadow-[0_12px_25px_-18px_rgba(45,140,255,0.8)] disabled:opacity-70 sm:w-auto"
                >
                  <Upload01Icon size={16} />
                  <span className="ml-2">
                    {uploading ? "Uploading..." : "Upload Asset"}
                  </span>
                </button>
              </div>
            </div>

            {view === "grid" ? (
              <div className="mt-5 grid max-h-[calc(100vh-360px)] gap-4 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
                {assetsLoading ? (
                  [...Array(6)].map((_, index) => (
                    <div
                      key={`asset-skeleton-${index}`}
                      className="animate-pulse rounded-2xl border border-white/5 bg-[#0b141f] p-3"
                    >
                      <div className="h-36 w-full rounded-xl bg-white/5" />
                      <div className="mt-4 space-y-2">
                        <div className="h-3 w-1/2 rounded-full bg-white/10" />
                        <div className="h-3 w-1/3 rounded-full bg-white/10" />
                      </div>
                    </div>
                  ))
                ) : assets.length === 0 ? (
                  <div className="col-span-full grid place-items-center rounded-2xl border border-dashed border-white/10 bg-[#0b141f] px-6 py-10 text-center text-sm text-white/60">
                    <div className="grid h-12 w-12 place-items-center rounded-xl border border-white/10 bg-[#0f1722]">
                      <Add01Icon size={20} />
                    </div>
                    <p className="mt-4 text-base font-semibold text-white">
                      No assets uploaded yet
                    </p>
                    <p className="mt-2 text-xs text-white/50">
                      Upload images or videos to populate this project.
                    </p>
                  </div>
                ) : paginatedAssets.length === 0 ? (
                  <div className="col-span-full grid place-items-center rounded-2xl border border-dashed border-white/10 bg-[#0b141f] px-6 py-10 text-center text-sm text-white/60">
                    <div className="grid h-12 w-12 place-items-center rounded-xl border border-white/10 bg-[#0f1722]">
                      <Search02Icon size={20} />
                    </div>
                    <p className="mt-4 text-base font-semibold text-white">
                      No assets match your search
                    </p>
                    <p className="mt-2 text-xs text-white/50">
                      Try a different file name.
                    </p>
                  </div>
                ) : (
                  paginatedAssets.map((asset) => (
                    <div
                      key={asset.id ?? `${asset.name}-${asset.type}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedAsset(asset)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          setSelectedAsset(asset);
                        }
                      }}
                      className="cursor-pointer rounded-2xl border border-white/5 bg-[#0b141f] p-3 transition hover:border-white/20"
                    >
                      <div className="relative h-36 w-full overflow-hidden rounded-xl border border-white/5 bg-[#101723]">
                        {asset.url ? (
                          <img
                            src={
                              isVideoAsset(asset)
                                ? (asset.thumbnailUrl ?? asset.url)
                                : asset.url
                            }
                            alt={asset.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className={`h-full w-full ${asset.accent}`} />
                        )}
                        <span className="absolute left-3 top-3 rounded-md bg-black/40 px-2 py-1 text-[10px] font-semibold">
                          {asset.type}
                        </span>
                        {isVideoAsset(asset) && (
                          <div className="absolute inset-0 grid place-items-center bg-black/25">
                            <PlayCircleIcon size={34} />
                          </div>
                        )}
                      </div>
                      <div className="mt-3 flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">{asset.name}</p>
                          <p className="text-xs text-white/45">
                            {asset.detail} • {asset.size}
                          </p>
                          <p className="mt-2 text-xs text-white/35">
                            {asset.updated}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleCopyUrl(asset);
                            }}
                            className="cursor-pointer grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-white/60 hover:border-white/20"
                            aria-label="Copy asset URL"
                          >
                            <CopyLinkIcon size={14} />
                          </button>
                          {asset.id && (
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                setDeleteAssetId(asset.id!);
                              }}
                              className="cursor-pointer grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-red-500 hover:border-white/20"
                              aria-label="Delete asset"
                            >
                              <Delete02Icon size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="mt-5 max-h-[calc(100vh-360px)] space-y-3 overflow-y-auto pr-1">
                {assetsLoading ? (
                  [...Array(4)].map((_, index) => (
                    <div
                      key={`asset-list-skeleton-${index}`}
                      className="animate-pulse rounded-2xl border border-white/5 bg-[#0b141f] px-4 py-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="h-3 w-1/3 rounded-full bg-white/10" />
                        <div className="h-3 w-16 rounded-full bg-white/10" />
                      </div>
                    </div>
                  ))
                ) : assets.length === 0 ? (
                  <div className="grid place-items-center rounded-2xl border border-dashed border-white/10 bg-[#0b141f] px-6 py-10 text-center text-sm text-white/60">
                    <div className="grid h-12 w-12 place-items-center rounded-xl border border-white/10 bg-[#0f1722]">
                      <Add01Icon size={20} />
                    </div>
                    <p className="mt-4 text-base font-semibold text-white">
                      No assets uploaded yet
                    </p>
                    <p className="mt-2 text-xs text-white/50">
                      Upload images or videos to populate this project.
                    </p>
                  </div>
                ) : paginatedAssets.length === 0 ? (
                  <div className="grid place-items-center rounded-2xl border border-dashed border-white/10 bg-[#0b141f] px-6 py-10 text-center text-sm text-white/60">
                    <div className="grid h-12 w-12 place-items-center rounded-xl border border-white/10 bg-[#0f1722]">
                      <Search02Icon size={20} />
                    </div>
                    <p className="mt-4 text-base font-semibold text-white">
                      No assets match your search
                    </p>
                    <p className="mt-2 text-xs text-white/50">
                      Try a different file name.
                    </p>
                  </div>
                ) : (
                  paginatedAssets.map((asset) => (
                    <div
                      key={asset.id ?? `${asset.name}-${asset.type}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedAsset(asset)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          setSelectedAsset(asset);
                        }
                      }}
                      className="cursor-pointer flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/5 bg-[#0b141f] px-4 py-3 transition hover:border-white/20"
                    >
                      <div className="flex min-w-[220px] items-center gap-3">
                        <div className="relative h-12 w-16 overflow-hidden rounded-lg border border-white/5 bg-[#101723]">
                          {asset.url ? (
                            <img
                              src={
                                isVideoAsset(asset)
                                  ? (asset.thumbnailUrl ?? asset.url)
                                  : asset.url
                              }
                              alt={asset.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className={`h-full w-full ${asset.accent}`} />
                          )}
                          {isVideoAsset(asset) && (
                            <div className="absolute inset-0 grid place-items-center bg-black/25">
                              <PlayCircleIcon size={18} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{asset.name}</p>
                          <p className="text-xs text-white/45">
                            {asset.detail} • {asset.size}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-1 items-center justify-end gap-6 text-xs text-white/45">
                        <span className="rounded-md border border-white/10 px-2 py-1 text-[10px]">
                          {asset.type}
                        </span>
                        <span className="min-w-[70px] text-right">
                          {asset.updated}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleCopyUrl(asset);
                            }}
                            className="cursor-pointer grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-white/60 hover:border-white/20"
                            aria-label="Copy asset URL"
                          >
                            <CopyLinkIcon size={14} />
                          </button>
                          {asset.id && (
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                setDeleteAssetId(asset.id!);
                              }}
                              className="cursor-pointer grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-red-500 hover:border-white/20"
                              aria-label="Delete asset"
                            >
                              <Delete02Icon size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
            {!assetsLoading && assets.length > 0 && (
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

          <footer className="flex items-center justify-between border-t border-white/5 pt-6 text-xs text-white/40">
            <span>Assets stored securely in this repo</span>
            <div className="flex items-center gap-4">
              <Link href="#" className="cursor-pointer">
                Documentation
              </Link>
              <Link href="#" className="cursor-pointer">
                API Explorer
              </Link>
              <Link href="#" className="cursor-pointer">
                Support
              </Link>
            </div>
          </footer>
        </main>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={(event) => {
          if (event.target.files) {
            handleUploadMany(event.target.files);
          }
          event.currentTarget.value = "";
        }}
      />
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0f1722] p-6 shadow-[0_30px_70px_-50px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                Upload Assets
              </h3>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="cursor-pointer rounded-lg border border-white/10 p-2 text-white/70 hover:bg-white/5"
              >
                <Cancel01Icon size={14} />
              </button>
            </div>
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  fileInputRef.current?.click();
                }
              }}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                if (event.dataTransfer.files) {
                  handleUploadMany(event.dataTransfer.files);
                }
              }}
              className="cursor-pointer mt-5 flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#0b141f] px-6 py-10 text-center text-xs text-white/55"
            >
              <div className="grid h-12 w-12 place-items-center rounded-xl border border-white/10 bg-[#0f1722]">
                <Upload01Icon size={20} />
              </div>
              <p className="mt-4 text-sm font-semibold text-white">
                Drag & drop files
              </p>
              <p className="mt-2 text-[11px] text-white/50">
                or click to browse (images or videos)
              </p>
            </div>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="cursor-pointer rounded-xl border border-white/10 px-4 py-2 text-xs text-white/70 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="cursor-pointer flex items-center gap-2 rounded-xl bg-[#2d8cff] px-4 py-2 text-xs font-semibold text-white shadow-[0_12px_25px_-18px_rgba(45,140,255,0.8)] disabled:opacity-70"
              >
                <Upload01Icon size={14} />
                {uploading ? "Uploading..." : "Select files"}
              </button>
            </div>
            {uploading && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-[11px] text-white/60">
                  <span>Uploading assets</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-[#2d8cff] transition-[width] duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-3xl rounded-2xl border border-white/10 bg-[#0f1722] p-6 shadow-[0_30px_70px_-50px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">
                  {selectedAsset.name}
                </p>
                <p className="text-xs text-white/45">
                  {selectedAsset.detail} • {selectedAsset.size}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAsset(null)}
                className="cursor-pointer rounded-lg border border-white/10 p-2 text-white/70 hover:bg-white/5"
              >
                <Cancel01Icon size={14} />
              </button>
            </div>
            <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-black/40">
              {selectedAsset.url ? (
                isVideoAsset(selectedAsset) ? (
                  <video
                    controls
                    src={selectedAsset.url}
                    className="h-full w-full max-h-[60vh] object-contain"
                  />
                ) : (
                  <img
                    src={selectedAsset.url}
                    alt={selectedAsset.name}
                    className="h-full w-full max-h-[60vh] object-contain"
                  />
                )
              ) : (
                <div className="grid h-[40vh] place-items-center text-sm text-white/50">
                  Preview unavailable
                </div>
              )}
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <span className="rounded-md border border-white/10 px-2 py-1 text-[10px] text-white/60">
                {selectedAsset.type}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyUrl(selectedAsset)}
                  className="cursor-pointer flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-xs text-white/70 hover:bg-white/5"
                >
                  <CopyLinkIcon size={14} />
                  Copy URL
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedAsset(null)}
                  className="cursor-pointer rounded-xl bg-[#2d8cff] px-4 py-2 text-xs font-semibold text-white shadow-[0_12px_25px_-18px_rgba(45,140,255,0.8)]"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {uploadSuccess && (
        <div className="pointer-events-none fixed top-6 right-6 z-50 flex w-full max-w-sm justify-end">
          <Notification
            type="success"
            message={uploadSuccess}
            onClose={() => setUploadSuccess(null)}
          />
        </div>
      )}
      {copyNotice && (
        <div className="pointer-events-none fixed top-6 right-6 z-50 flex w-full max-w-sm justify-end">
          <Notification
            type="success"
            message={copyNotice}
            onClose={() => setCopyNotice(null)}
          />
        </div>
      )}
      {uploadError && (
        <div className="pointer-events-none fixed top-6 right-6 z-50 flex w-full max-w-sm justify-end">
          <Notification
            type="error"
            message={uploadError}
            onClose={() => setUploadError(null)}
          />
        </div>
      )}
      <ConfirmModal
        open={deleteAssetId !== null}
        title="Delete asset?"
        description="This will permanently remove the asset from this project."
        confirmLabel="Delete asset"
        destructive
        loading={deleting}
        onConfirm={handleDeleteAsset}
        onCancel={() => setDeleteAssetId(null)}
      />
    </div>
  );
}
