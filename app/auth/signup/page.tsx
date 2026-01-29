"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  Building01Icon,
  CircleLock01Icon,
  EyeIcon,
  GlobeIcon,
  Mail02Icon,
  RepeatIcon,
  UserIcon,
  ViewOffIcon,
} from "hugeicons-react";
import AuthHeader from "../../components/AuthHeader";
import Navbar from "../../components/Navbar";
import Notification from "../../components/Notification";
import { getErrorMessage, register, setToken } from "../../lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [companyName, setCompanyName] = useState(
    process.env.NEXT_PUBLIC_COMPANY_NAME,
  );
  const [companyDomain, setCompanyDomain] = useState(
    process.env.NEXT_PUBLIC_COMPANY_DOMAIN,
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await register({
        name,
        email,
        password,
        password_confirmation: confirm,
        company_domain: companyDomain || undefined,
        company_name: companyName || undefined,
      });
      if (response?.token) {
        setToken(response.token);
      }
      router.push("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b121a] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(35,64,92,0.45),_transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_30%,_rgba(34,78,124,0.35),_transparent_45%)]" />

      <header className="relative z-10 border-b border-white/5 bg-[#0d151f]/80 backdrop-blur">
        <Navbar />
      </header>

      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-72px)] w-full max-w-6xl items-center justify-center px-6 py-14">
        <div className="w-full max-w-140">
          <AuthHeader
            title="Sign up"
            subtitle="Join the team and upload your asset files to this repo in one secure workspace."
          />

          <div className="mt-10 rounded-2xl border border-white/10 bg-[#151d27]/80 p-6 shadow-[0_30px_60px_-40px_rgba(0,0,0,0.7)] backdrop-blur">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="">
                  <label className="space-y-2 text-xs font-semibold text-white/70">
                    Full Name
                  </label>
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#101720] px-4 py-3">
                    <UserIcon size={16} className="text-white/40" />
                    <input
                      type="text"
                      placeholder="e.g. Alex Rivera"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="">
                  <label className="space-y-2 text-xs font-semibold text-white/70">
                    Company Email
                  </label>
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#101720] px-4 py-3">
                    <Mail02Icon size={16} className="text-white/40" />
                    <input
                      type="email"
                      placeholder="alex@company.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="">
                  <label className="space-y-2 text-xs font-semibold text-white/70">
                    Password
                  </label>
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#101720] px-4 py-3">
                    <CircleLock01Icon size={16} className="text-white/40" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="text-white/40 hover:text-white"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <ViewOffIcon size={16} />
                      ) : (
                        <EyeIcon size={16} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="">
                  <label className="space-y-2 text-xs font-semibold text-white/70">
                    Confirm Password
                  </label>
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#101720] px-4 py-3">
                    <RepeatIcon size={16} className="text-white/40" />
                    <input
                      type={showConfirm ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirm}
                      onChange={(event) => setConfirm(event.target.value)}
                      className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((prev) => !prev)}
                      className="text-white/40 hover:text-white"
                      aria-label={
                        showConfirm ? "Hide password" : "Show password"
                      }
                    >
                      {showConfirm ? (
                        <ViewOffIcon size={16} />
                      ) : (
                        <EyeIcon size={16} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">
                  Organization Details
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className=" text-xs font-semibold text-white/70">
                      Company Name
                    </label>
                    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#101720] px-4 py-3">
                      <Building01Icon size={16} className="text-white/40" />
                      <input
                        type="text"
                        readOnly
                        placeholder="TechCorp Inc."
                        value={companyName}
                        onChange={(event) => setCompanyName(event.target.value)}
                        className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className=" text-xs font-semibold text-white/70">
                      Company Domain
                    </label>
                    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#101720] px-4 py-3">
                      <GlobeIcon size={16} className="text-white/40" />
                      <input
                        type="text"
                        readOnly
                        placeholder="techcorp.io"
                        value={companyDomain}
                        onChange={(event) =>
                          setCompanyDomain(event.target.value)
                        }
                        className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#2d8cff] py-3 text-sm font-semibold text-white shadow-[0_18px_30px_-20px_rgba(45,140,255,0.7)]"
              >
                {loading ? "Creating account..." : "Create Developer Account"}
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
          </div>
        </div>
      </main>

      <div className="pointer-events-none absolute left-6 top-40 hidden max-w-xs text-[10px] leading-5 text-[#2b4d6b]/60 lg:block">
        <pre>{`"api_version": "v2.1",
"endpoint": "/auth/register",
"method": "POST",
"secure": true`}</pre>
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
