"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AiChipIcon, Home12Icon, UserCircleIcon } from "hugeicons-react";
import { getMe } from "../lib/api";

type UserSummary = {
  name?: string;
  email?: string;
  created_at?: string;
};

export default function Navbar() {
  const [user, setUser] = useState<UserSummary | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const data = await getMe();
      if (data?.data) {
        setUser({
          name: data.data.name,
          email: data.data.email,
          created_at: data.data.created_at,
        });
      }
    };
    loadUser();
  }, []);

  const joinDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="sticky top-0 z-40 border-b border-white/5 bg-[#0d151f]/90 backdrop-blur">
      <div className="mx-auto flex w-full items-center justify-between px-4 py-4 md:px-6">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#2d8cff] text-white">
            <Home12Icon size={16} />
          </span>
          <div>
            <p className="text-xs text-white/60">
              {process.env.NEXT_PUBLIC_COMPANY_NAME?.slice(0, 10) +
                "Asset Repo"}
            </p>
            <p className="text-xs text-white/40">Developer Console</p>
          </div>
        </div>

        {user?.email ? (
          <div className="flex flex-col items-center gap-3 text-xs text-white/70">
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/80">
                {user.name?.split(" ")[0]}
              </p>
              <p className="text-sm font-semibold text-white">{user.email}</p>
            </div>
          </div>
        ) : (
          <Link
            href="/auth/login"
            className="rounded-lg bg-[#2d8cff] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(45,140,255,0.35)]"
          >
            Login
          </Link>
        )}
      </div>
    </div>
  );
}
