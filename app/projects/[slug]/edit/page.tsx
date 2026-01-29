"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Add01Icon,
  ArrowLeft02Icon,
  Delete02Icon,
  Edit02Icon,
  GlobeIcon,
  Search02Icon,
  UserAdd01Icon,
} from "hugeicons-react";
import Navbar from "../../../components/Navbar";
import Sidebar from "../../../components/Sidebar";
import ConfirmModal from "../../../components/ConfirmModal";
import Notification from "../../../components/Notification";
import {
  deleteProject,
  getErrorMessage,
  getProject,
  listUsers,
  updateProject,
} from "../../../lib/api";

type ExtraField = { key: string; value: string };

type UserResult = {
  id: number;
  name: string;
  email: string;
};

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = useMemo(() => params?.slug ?? "", [params]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [name, setName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [extraFields, setExtraFields] = useState<ExtraField[]>([
    { key: "", value: "" },
  ]);

  const [userQuery, setUserQuery] = useState("");
  const [userResults, setUserResults] = useState<UserResult[]>([]);
  const [userLoading, setUserLoading] = useState(false);
  const [addUserEmail, setAddUserEmail] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const normalizeExtraKey = (raw: string) => {
    return raw.trim().replace(/\s+/g, "_").toUpperCase();
  };

  useEffect(() => {
    const loadProject = async () => {
      setLoading(true);
      try {
        const response = await getProject(projectId as string);
        if (response?.data) {
          setName(response.data.name ?? "");
          setWebsiteUrl(response.data.website_url ?? "");
          const extraData = (
            response.data as { extra_data?: Record<string, string> }
          ).extra_data;
          if (extraData && typeof extraData === "object") {
            const entries = Object.entries(extraData).map(([key, value]) => ({
              key: normalizeExtraKey(key),
              value: String(value),
            }));
            setExtraFields(entries.length ? entries : [{ key: "", value: "" }]);
          }
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  useEffect(() => {
    if (!userQuery.trim()) {
      setUserResults([]);
      return;
    }
    const timer = window.setTimeout(async () => {
      setUserLoading(true);
      try {
        const response = await listUsers(userQuery.trim());
        setUserResults(response?.data ?? []);
      } catch (err) {
        setUserResults([]);
      } finally {
        setUserLoading(false);
      }
    }, 400);

    return () => window.clearTimeout(timer);
  }, [userQuery]);

  const handleExtraChange = (
    index: number,
    field: "key" | "value",
    value: string,
  ) => {
    setExtraFields((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? {
              ...item,
              [field]: field === "key" ? normalizeExtraKey(value) : value,
            }
          : item,
      ),
    );
  };

  const handleRemoveExtra = (index: number) => {
    setExtraFields((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleAddExtra = () => {
    setExtraFields((prev) => [...prev, { key: "", value: "" }]);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const extra_data = extraFields.reduce<Record<string, string>>(
      (acc, item) => {
        const key = normalizeExtraKey(item.key);
        if (key) {
          acc[key] = item.value.trim();
        }
        return acc;
      },
      {},
    );

    setSaving(true);
    try {
      await updateProject(projectId as string, {
        name: name.trim() || undefined,
        website_url: websiteUrl.trim() || undefined,
        extra_data: Object.keys(extra_data).length ? extra_data : undefined,
        add_user_email: addUserEmail.trim() || undefined,
      });
      setSuccess("Project updated.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async () => {
    setDeleting(true);
    setError(null);
    setSuccess(null);
    try {
      await deleteProject(projectId as string);
      setSuccess("Project deleted.");
      router.push("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b121a] text-white">
      <Navbar />

      <div className="relative min-h-screen w-full px-4 py-6 md:px-6">
        <Sidebar active="Projects" />

        <main className="flex-1 space-y-6 lg:ml-72">
          <div className="flex items-center gap-3 text-xs text-white/50">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#0b141f] px-3 py-2 text-xs text-white/70 hover:border-white/20"
            >
              <ArrowLeft02Icon size={14} />
              Back to Projects
            </button>
            <span className="text-white/35">/</span>
            <span className="text-white/80">Edit Project</span>
          </div>

          <section className="rounded-2xl border border-white/5 bg-[#0f1722] p-6 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.7)]">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-[#132238]">
                <Edit02Icon size={18} />
              </div>
              <div>
                <h1 className="text-lg font-semibold">Project Settings</h1>
                <p className="text-xs text-white/50">
                  Update metadata, extra fields, and add members.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="mt-6 grid gap-4">
                {[...Array(3)].map((_, index) => (
                  <div key={`skeleton-${index}`} className="space-y-2">
                    <div className="h-3 w-1/3 rounded-full bg-white/10" />
                    <div className="h-10 w-full rounded-xl bg-white/5" />
                  </div>
                ))}
              </div>
            ) : (
              <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 text-xs font-semibold text-white/70">
                    Project Name
                    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0b141f] px-4 py-3">
                      <Edit02Icon size={16} className="text-white/40" />
                      <input
                        type="text"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="JayJ Marketing Website"
                        className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
                      />
                    </div>
                  </label>
                  <label className="space-y-2 text-xs font-semibold text-white/70">
                    Website URL
                    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0b141f] px-4 py-3">
                      <GlobeIcon size={16} className="text-white/40" />
                      <input
                        type="url"
                        value={websiteUrl}
                        onChange={(event) => setWebsiteUrl(event.target.value)}
                        placeholder="https://jayjtech.com"
                        className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
                      />
                    </div>
                  </label>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#0b141f] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
                        Extra Data
                      </p>
                      <p className="mt-2 text-xs text-white/50">
                        Add custom key/value pairs for stack, repo, notes,
                        social media handle etc.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddExtra}
                      className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/70 hover:bg-white/5"
                    >
                      <Add01Icon size={14} />
                      Add field
                    </button>
                  </div>

                  <div className="mt-4 space-y-3">
                    {extraFields.map((field, index) => (
                      <div
                        key={`extra-${index}`}
                        className="flex flex-wrap items-center gap-3"
                      >
                        <input
                          type="text"
                          placeholder="KEY_NAME"
                          value={field.key}
                          onChange={(event) =>
                            handleExtraChange(index, "key", event.target.value)
                          }
                          className="w-full max-w-[220px] rounded-xl border border-white/10 bg-[#0f1722] px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="value"
                          value={field.value}
                          onChange={(event) =>
                            handleExtraChange(
                              index,
                              "value",
                              event.target.value,
                            )
                          }
                          className="flex-1 rounded-xl border border-white/10 bg-[#0f1722] px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveExtra(index)}
                          className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 text-red-500 hover:bg-white/5"
                          aria-label="Remove field"
                        >
                          <Delete02Icon size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#0b141f] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
                    Add Member
                  </p>
                  <div className="mt-3 grid gap-3 md:grid-cols-[1.4fr_1fr]">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0f1722] px-3 py-2 text-xs text-white/50">
                        <Search02Icon size={14} />
                        <input
                          type="text"
                          value={userQuery}
                          onChange={(event) => setUserQuery(event.target.value)}
                          placeholder="Search user by email"
                          className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
                        />
                      </div>
                      <div className="rounded-xl border border-white/10 bg-[#0f1722] p-2">
                        {userLoading ? (
                          <p className="px-2 py-3 text-xs text-white/50">
                            Searching users...
                          </p>
                        ) : userQuery.trim().length === 0 ? (
                          <p className="px-2 py-3 text-xs text-white/50">
                            Type an email to search.
                          </p>
                        ) : userResults.length === 0 ? (
                          <p className="px-2 py-3 text-xs text-white/50">
                            No users found.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {userResults.map((user) => (
                              <button
                                key={user.id}
                                type="button"
                                onClick={() => setAddUserEmail(user.email)}
                                className={`flex w-full items-center justify-between rounded-lg border border-white/10 px-3 py-2 text-xs text-white/70 hover:bg-white/5 ${
                                  user.email === addUserEmail
                                    ? "bg-[#132238]"
                                    : ""
                                }`}
                              >
                                <span className="text-sm text-white">
                                  {user.email}
                                </span>
                                <span className="text-white/40">
                                  {user.name}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <label className="space-y-2 text-xs font-semibold text-white/70">
                      Selected user
                      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0f1722] px-3 py-2">
                        <UserAdd01Icon size={14} className="text-white/40" />
                        <input
                          type="email"
                          value={addUserEmail}
                          onChange={(event) =>
                            setAddUserEmail(event.target.value)
                          }
                          placeholder="newdev@jayjtech.com"
                          className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
                        />
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => router.push("/dashboard")}
                    className="rounded-xl border border-white/10 px-4 py-2 text-xs text-white/70 hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center gap-2 rounded-xl border border-[#f25c5c]/40 px-4 py-2 text-xs text-[#f25c5c] hover:bg-[#1a0f14]"
                  >
                    <Delete02Icon size={14} />
                    Delete Project
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-[#2d8cff] px-4 py-2 text-xs font-semibold text-white shadow-[0_12px_25px_-18px_rgba(45,140,255,0.8)]"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}
          </section>
        </main>
      </div>

      {success && (
        <div className="pointer-events-none fixed top-6 right-6 z-50 flex w-full max-w-sm justify-end">
          <Notification
            type="success"
            message={success}
            onClose={() => setSuccess(null)}
          />
        </div>
      )}
      {error && (
        <div className="pointer-events-none fixed top-6 right-6 z-50 flex w-full max-w-sm justify-end">
          <Notification
            type="error"
            message={error}
            onClose={() => setError(null)}
          />
        </div>
      )}
      <ConfirmModal
        open={showDeleteModal}
        title="Delete project?"
        description="This will permanently delete the project and its assets."
        confirmLabel="Delete project"
        destructive
        loading={deleting}
        onConfirm={handleDeleteProject}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
