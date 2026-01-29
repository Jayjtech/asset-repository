import Link from "next/link";
import {
  Building01Icon,
  CircleLock01Icon,
  GlobeIcon,
  Mail02Icon,
  RepeatIcon,
  UserIcon,
} from "hugeicons-react";
import Navbar from "../components/Navbar";

export default function AuthPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b121a] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(35,64,92,0.45),_transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_30%,_rgba(34,78,124,0.35),_transparent_45%)]" />

      <header className="relative z-10 border-b border-white/5 bg-[#0d151f]/80 backdrop-blur">
        <Navbar />
      </header>

      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-72px)] w-full max-w-6xl items-center justify-center px-6 py-14">
        <div className="w-full max-w-140">
          <div className="text-center">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Developer Registration
            </h1>
            <p className="mt-3 text-sm text-white/60 sm:text-base">
              Join the team and upload your asset files to this repo in one
              secure workspace.
            </p>
          </div>

          <div className="mt-10 rounded-2xl border border-white/10 bg-[#151d27]/80 p-6 shadow-[0_30px_60px_-40px_rgba(0,0,0,0.7)] backdrop-blur">
            <form className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-xs font-semibold text-white/70">
                  Full Name
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#101720] px-3 py-2.5">
                    <UserIcon size={16} className="text-white/40" />
                    <input
                      type="text"
                      placeholder="e.g. Alex Rivera"
                      className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
                    />
                  </div>
                </label>
                <label className="space-y-2 text-xs font-semibold text-white/70">
                  Company Email
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#101720] px-3 py-2.5">
                    <Mail02Icon size={16} className="text-white/40" />
                    <input
                      type="email"
                      placeholder="alex@company.com"
                      className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
                    />
                  </div>
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-xs font-semibold text-white/70">
                  Password
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#101720] px-3 py-2.5">
                    <CircleLock01Icon size={16} className="text-white/40" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
                    />
                  </div>
                </label>
                <label className="space-y-2 text-xs font-semibold text-white/70">
                  Confirm Password
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#101720] px-3 py-2.5">
                    <RepeatIcon size={16} className="text-white/40" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
                    />
                  </div>
                </label>
              </div>

              <div className="border-t border-white/10 pt-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">
                  Organization Details
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-xs font-semibold text-white/70">
                    Company Name
                    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#101720] px-3 py-2.5">
                      <Building01Icon size={16} className="text-white/40" />
                      <input
                        type="text"
                        placeholder="TechCorp Inc."
                        className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
                      />
                    </div>
                  </label>
                  <label className="space-y-2 text-xs font-semibold text-white/70">
                    <span className="flex items-center gap-2">
                      Company Domain
                      <span className="rounded-full border border-white/10 px-2 py-0.5 text-[9px] font-semibold uppercase text-white/40">
                        Optional
                      </span>
                    </span>
                    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#101720] px-3 py-2.5">
                      <GlobeIcon size={16} className="text-white/40" />
                      <input
                        type="text"
                        placeholder="techcorp.io"
                        className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
                      />
                    </div>
                  </label>
                </div>
              </div>

              <button
                type="button"
                className="w-full rounded-xl bg-[#2d8cff] py-3 text-sm font-semibold text-white shadow-[0_18px_30px_-20px_rgba(45,140,255,0.7)]"
              >
                Create Developer Account
              </button>
            </form>

            <div className="mt-6 border-t border-white/10 pt-4 text-center text-xs text-white/40">
              <p className="mt-2 text-[11px] text-white/30">
                Join and upload your asset files to this repo
              </p>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-white/50">
            <p>
              Already have a developer account?{" "}
              <Link href="/auth/login" className="font-semibold text-[#2d8cff]">
                Log in here
              </Link>
            </p>
            <div className="mt-3 flex items-center justify-center gap-4 text-[11px] text-white/35">
              <Link href="#">Terms of Service</Link>
              <Link href="#">Security Policy</Link>
              <Link href="#">Privacy</Link>
            </div>
          </div>
        </div>
      </main>

      <div className="pointer-events-none absolute left-6 top-40 hidden max-w-xs text-[10px] leading-5 text-[#2b4d6b]/60 lg:block">
        <pre>{`"api_version": "v2.1",
"endpoint": "/auth/register",
"method": "POST",
"secure": true`}</pre>
      </div>
    </div>
  );
}
