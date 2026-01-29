"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Add01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ChartIcon,
  FolderShared02Icon,
  GridViewIcon,
  Image01Icon,
  Menu08Icon,
  Notification01Icon,
  Search02Icon,
} from "hugeicons-react";
import Navbar from "../components/Navbar";
import ConfirmModal from "../components/ConfirmModal";
import CreateProjectModal from "../components/CreateProjectModal";
import ProjectGrid from "../components/ProjectGrid";
import ProjectList from "../components/ProjectList";
import Sidebar from "../components/Sidebar";
import Notification from "../components/Notification";
import {
  createProject,
  deleteProject,
  getErrorMessage,
  getMe,
  getUserStats,
  listProjects,
} from "../lib/api";

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

export default function DashboardPage() {
  const router = useRouter();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createUrl, setCreateUrl] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [deleteProjectId, setDeleteProjectId] = useState<number | null>(null);
  const [deletingProject, setDeletingProject] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState({
    projects: 0,
    assets: 0,
    memberProjects: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredProjects = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return projects;
    return projects.filter((project) =>
      project.name.toLowerCase().includes(query),
    );
  }, [projects, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / 20));
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * 20;
    return filteredProjects.slice(start, start + 20);
  }, [filteredProjects, currentPage]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const me = await getMe();
        if (me?.data?.id) {
          setCurrentUserId(me.data.id);
        }
      } catch {
        setCurrentUserId(null);
      }
    };
    const loadProjects = async () => {
      setLoadingProjects(true);
      try {
        const response = await listProjects();
        const mapped =
          response?.data?.map((project) => ({
            id: project.id,
            name: project.name,
            domain: project.website_url?.replace(/^https?:\/\//, "") || "",
            websiteUrl: project.website_url || "",
            assets: `${project.assets_count ?? 0} Assets`,
            updatedAt: formatTimestamp(
              project.updated_at ?? project.created_at,
            ),
            cover: "bg-[linear-gradient(130deg,#1f2c3a,#0f1824)]",
            creatorName: project.creator_name,
            createdByUserId: project.created_by_user_id,
          })) ?? [];
        setProjects(mapped);
      } catch (err) {
        setProjects([]);
      }
      setLoadingProjects(false);
    };
    const loadStats = async () => {
      setStatsLoading(true);
      try {
        const response = await getUserStats();
        setStats({
          projects: response.projects_count ?? 0,
          assets: response.assets_count ?? 0,
          memberProjects: response.member_projects_count ?? 0,
        });
      } catch {
        setStats({ projects: 0, assets: 0, memberProjects: 0 });
      }
      setStatsLoading(false);
    };
    loadUser();
    loadProjects();
    loadStats();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, projects]);

  const handleCreateProject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreateError(null);
    setCreateSuccess(null);
    if (!createName.trim() || !createUrl.trim()) {
      setCreateError("Project name and website URL are required.");
      return;
    }
    setCreateLoading(true);
    try {
      await createProject({
        name: createName.trim(),
        website_url: createUrl.trim(),
      });
      setCreateSuccess("Project created.");
      setCreateName("");
      setCreateUrl("");
      setShowCreateModal(false);
      const response = await listProjects();
      const mapped =
        response?.data?.map((project) => ({
          id: project.id,
          name: project.name,
          domain: project.website_url?.replace(/^https?:\/\//, "") || "",
          websiteUrl: project.website_url || "",
          assets: `${project.assets_count ?? 0} Assets`,
          updatedAt: formatTimestamp(project.updated_at ?? project.created_at),
          cover: "bg-[linear-gradient(130deg,#1f2c3a,#0f1824)]",
          creatorName: project.creator_name,
          createdByUserId: project.created_by_user_id,
        })) ?? [];
      setProjects(mapped);
    } catch (err) {
      setCreateError(getErrorMessage(err));
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!deleteProjectId) return;
    setDeletingProject(true);
    setDeleteError(null);
    try {
      await deleteProject(deleteProjectId);
      setProjects((prev) =>
        prev.filter((project) => project.id !== deleteProjectId),
      );
      setCreateSuccess("Project deleted.");
    } catch (err) {
      setDeleteError(getErrorMessage(err));
    } finally {
      setDeletingProject(false);
      setDeleteProjectId(null);
    }
  };

  const handleOpenProject = (projectId: number) => {
    router.push(`/projects/${projectId}`);
  };

  const handleEditProject = (projectId: number) => {
    router.push(`/projects/${projectId}/edit`);
  };

  return (
    <div className="min-h-screen bg-[#0b121a] text-white">
      <Navbar />

      <div className="relative min-h-screen w-full px-4 py-6 md:px-6">
        <Sidebar active="Projects" />

        <main className="flex-1 space-y-6 lg:ml-72">
          <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/5 bg-[#0f1722] px-5 py-4 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.7)]">
            <div>
              <p className="text-sm font-semibold">Projects</p>
            </div>
            <div className="flex flex-1 items-center justify-center md:justify-start">
              <div className="h-9" />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setCreateError(null);
                  setCreateSuccess(null);
                  setShowCreateModal(true);
                }}
                className="cursor-pointer flex items-center gap-2 rounded-xl bg-[#2d8cff] px-4 py-2 text-sm font-semibold shadow-[0_12px_25px_-18px_rgba(45,140,255,0.8)]"
              >
                <Add01Icon size={16} />
                New Project
              </button>
              {/* <button className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-[#0b141f] text-sm">
                <Notification01Icon size={16} />
              </button> */}
              {/* <div className="h-9 w-9 rounded-xl border border-white/10 bg-[linear-gradient(130deg,#ffe5b3,#f9c7a5)]" /> */}
            </div>
          </header>

          <section className="mt-5 grid gap-4 md:grid-cols-3">
            {statsLoading
              ? [...Array(3)].map((_, index) => (
                  <div
                    key={`stats-skeleton-${index}`}
                    className="animate-pulse rounded-2xl border border-white/5 bg-[#0f1722] px-5 py-4"
                  >
                    <div className="h-3 w-1/3 rounded-full bg-white/10" />
                    <div className="mt-3 h-6 w-1/2 rounded-full bg-white/10" />
                  </div>
                ))
              : [
                  {
                    label: "Projects",
                    value: `${stats.projects}`,
                    icon: <ChartIcon size={16} />,
                  },
                  {
                    label: "Total Assets",
                    value: `${stats.assets}`,
                    icon: <Image01Icon size={16} />,
                  },
                  {
                    label: "Member Projects",
                    value: `${stats.memberProjects}`,
                    icon: <FolderShared02Icon size={16} />,
                  },
                ].map((card) => (
                  <div
                    key={card.label}
                    className="rounded-2xl border border-white/5 bg-[#0f1722] px-5 py-4 shadow-[0_20px_45px_-35px_rgba(0,0,0,0.7)]"
                  >
                    <div className="flex items-center justify-between text-xs text-white/55">
                      <span>{card.label}</span>
                      <span className="text-green-400">{card.icon}</span>
                    </div>
                    <p className="mt-3 text-2xl font-semibold">{card.value}</p>
                  </div>
                ))}
          </section>

          <section className="mt-6 rounded-2xl border border-white/5 bg-[#0f1722] p-5 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.7)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-semibold">Your Project Folders</h2>
              <div className="flex items-center gap-2 text-white/50">
                <button
                  type="button"
                  aria-pressed={view === "grid"}
                  onClick={() => setView("grid")}
                  className={`cursor-pointer grid h-8 w-8 place-items-center rounded-lg border text-xs transition ${
                    view === "grid"
                      ? "border-[#2d8cff] bg-[#132238] text-white"
                      : "border-white/10 bg-[#0b141f] text-white/60 hover:bg-white/5"
                  }`}
                >
                  <GridViewIcon size={14} />
                </button>
                <button
                  type="button"
                  aria-pressed={view === "list"}
                  onClick={() => setView("list")}
                  className={`cursor-pointer grid h-8 w-8 place-items-center rounded-lg border text-xs transition ${
                    view === "list"
                      ? "border-[#2d8cff] bg-[#132238] text-white"
                      : "border-white/10 bg-[#0b141f] text-white/60 hover:bg-white/5"
                  }`}
                >
                  <Menu08Icon size={14} />
                </button>
              </div>
            </div>
            <div className="mt-4 flex w-full max-w-sm items-center gap-2 rounded-xl border border-white/5 bg-[#0b141f] px-3 py-2 text-xs text-white/50">
              <Search02Icon size={14} />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search projects"
                className="w-full bg-transparent text-xs text-white/80 placeholder:text-white/40 focus:outline-none"
              />
            </div>

            {loadingProjects ? (
              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {[...Array(6)].map((_, index) => (
                  <div
                    key={`skeleton-${index}`}
                    className="animate-pulse rounded-2xl border border-white/5 bg-[#0b141f] p-3"
                  >
                    <div className="h-28 w-full rounded-xl bg-white/5" />
                    <div className="mt-4 space-y-2">
                      <div className="h-3 w-1/2 rounded-full bg-white/10" />
                      <div className="h-3 w-1/3 rounded-full bg-white/10" />
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="h-3 w-24 rounded-full bg-white/10" />
                      <div className="h-3 w-14 rounded-full bg-white/10" />
                    </div>
                  </div>
                ))}
              </div>
            ) : projects.length === 0 ? (
              <div className="mt-6 grid place-items-center rounded-2xl border border-dashed border-white/10 bg-[#0b141f] px-6 py-12 text-center text-sm text-white/60">
                <div className="grid h-12 w-12 place-items-center rounded-xl border border-white/10 bg-[#0f1722]">
                  <Add01Icon size={20} />
                </div>
                <p className="mt-4 text-base font-semibold text-white">
                  No projects yet
                </p>
                <p className="mt-2 text-xs text-white/50">
                  Create your first project to start organizing assets.
                </p>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="mt-6 grid place-items-center rounded-2xl border border-dashed border-white/10 bg-[#0b141f] px-6 py-12 text-center text-sm text-white/60">
                <div className="grid h-12 w-12 place-items-center rounded-xl border border-white/10 bg-[#0f1722]">
                  <Search02Icon size={20} />
                </div>
                <p className="mt-4 text-base font-semibold text-white">
                  No projects match your search
                </p>
                <p className="mt-2 text-xs text-white/50">
                  Try a different project name.
                </p>
              </div>
            ) : view === "grid" ? (
              <ProjectGrid
                projects={paginatedProjects}
                onOpen={handleOpenProject}
                onEdit={handleEditProject}
                onDelete={setDeleteProjectId}
                currentUserId={currentUserId}
              />
            ) : (
              <ProjectList
                projects={paginatedProjects}
                onOpen={handleOpenProject}
                onEdit={handleEditProject}
                onDelete={setDeleteProjectId}
                currentUserId={currentUserId}
              />
            )}
            {!loadingProjects &&
              projects.length > 0 &&
              filteredProjects.length > 0 && (
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-4 text-xs text-white/50">
                  <span>
                    Showing {(currentPage - 1) * 20 + 1}-
                    {Math.min(currentPage * 20, filteredProjects.length)} of{" "}
                    {filteredProjects.length} projects
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

      <CreateProjectModal
        open={showCreateModal}
        name={createName}
        websiteUrl={createUrl}
        loading={createLoading}
        onNameChange={setCreateName}
        onUrlChange={setCreateUrl}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateProject}
      />

      {createSuccess && (
        <div className="pointer-events-none fixed top-6 right-6 z-50 flex w-full max-w-sm justify-end">
          <Notification
            type="success"
            message={createSuccess}
            onClose={() => setCreateSuccess(null)}
          />
        </div>
      )}
      {createError && (
        <div className="pointer-events-none fixed top-6 right-6 z-50 flex w-full max-w-sm justify-end">
          <Notification
            type="error"
            message={createError}
            onClose={() => setCreateError(null)}
          />
        </div>
      )}
      {deleteError && (
        <div className="pointer-events-none fixed top-6 right-6 z-50 flex w-full max-w-sm justify-end">
          <Notification
            type="error"
            message={deleteError}
            onClose={() => setDeleteError(null)}
          />
        </div>
      )}
      <ConfirmModal
        open={deleteProjectId !== null}
        title="Delete project?"
        description="This will permanently delete the project and its assets."
        confirmLabel="Delete project"
        destructive
        loading={deletingProject}
        onConfirm={handleDeleteProject}
        onCancel={() => setDeleteProjectId(null)}
      />
    </div>
  );
}
