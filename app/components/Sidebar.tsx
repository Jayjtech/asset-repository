"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  Cancel01Icon,
  CodeFolderIcon,
  Home12Icon,
  Image01Icon,
  Logout01Icon,
  Menu02Icon,
} from "hugeicons-react";
import Notification from "./Notification";
import { getErrorMessage, logout } from "../lib/api";

type SidebarProps = {
  active?: "Overview" | "Projects" | "All Assets" | "API Keys";
};

const navItems: Array<{
  label: SidebarProps["active"];
  icon: ReactNode;
  href: string;
}> = [
  // { label: "Overview" },
  { label: "Projects", icon: <CodeFolderIcon size={16} />, href: "/dashboard" },
  { label: "All Assets", icon: <Image01Icon size={16} />, href: "/assets" },
  // { label: "API Keys" },
];

export default function Sidebar({ active = "Projects" }: SidebarProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    setError(null);
    setMessage(null);
    try {
      await logout();
      setMessage("Logged out.");
      router.push("/auth/login");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="cursor-pointer fixed left-4 top-20 z-50 grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-[#0f1722] text-white/70 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.8)] lg:hidden"
        aria-label="Open sidebar"
      >
        <Menu02Icon size={18} />
      </button>

      {mobileOpen && (
        <div
          className="cursor-pointer fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-16 z-50 h-[calc(100vh-64px)] w-64 shrink-0 flex-col gap-6 overflow-y-auto border-r border-white/5 bg-[#0f1722] p-5 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.7)] transition-transform duration-200 lg:translate-x-0 lg:flex ${
          mobileOpen ? "flex translate-x-0" : "hidden -translate-x-full lg:flex"
        }`}
      >
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="cursor-pointer ml-auto flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-white/70 hover:bg-white/5 lg:hidden"
          aria-label="Close sidebar"
        >
          <Cancel01Icon size={16} />
        </button>

        <nav className="space-y-2 text-sm">
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                router.push(item.href);
                setMobileOpen(false);
              }}
              className={`cursor-pointer w-full rounded-xl px-3 py-2 text-left transition ${
                item.label === active
                  ? "bg-[#152234] text-white"
                  : "text-white/55 hover:bg-white/5"
              }`}
            >
              <span className="flex items-center gap-3">
                <span className="text-white/60">{item.icon}</span>
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-4">
          {/* <button className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/55 hover:bg-white/5">
          <Settings01Icon size={16} />
          Settings
        </button> */}

          {/* <div className="rounded-2xl border border-white/5 bg-[#0b141f] p-4">
          <div className="flex items-center justify-between text-xs text-white/55">
            <span>Storage</span>
            <span className="text-[#2d8cff]">85%</span>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-white/10">
            <div className="h-2 w-[85%] rounded-full bg-[#2d8cff]" />
          </div>
          <p className="mt-3 text-[11px] text-white/40">
            Repo Integration Active
          </p>
        </div> */}

          <button
            type="button"
            onClick={handleLogout}
            className="cursor-pointer flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-white/70 hover:bg-white/5"
          >
            <Logout01Icon size={16} className="text-red-500" />
            Log out
          </button>
        </div>
        {message && (
          <div className="pointer-events-none fixed top-6 right-6 z-50 flex w-full max-w-sm justify-end">
            <Notification
              type="success"
              message={message}
              onClose={() => setMessage(null)}
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
      </aside>
    </>
  );
}
