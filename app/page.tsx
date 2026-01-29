import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f6f1e9] text-[#12100e]">
      <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-[#f5c6a5] blur-[120px]" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-[#9dd9cf] blur-[140px]" />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#12100e] text-sm font-semibold uppercase tracking-[0.2em] text-[#f6f1e9]">
            AA
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#7c6f63]">
              Internal Platform
            </p>
            <h1 className="text-lg font-semibold">Atlas Assets</h1>
          </div>
        </div>
        <nav className="hidden items-center gap-6 text-sm font-medium text-[#4d463f] md:flex">
          <a className="hover:text-[#12100e]" href="#features">
            Features
          </a>
          <a className="hover:text-[#12100e]" href="#workflow">
            Workflow
          </a>
          <a className="hover:text-[#12100e]" href="#portal">
            Portal
          </a>
        </nav>
        <Link
          className="rounded-full bg-[#12100e] px-5 py-2 text-sm font-semibold text-[#f6f1e9] shadow-lg shadow-black/10 transition hover:-translate-y-0.5"
          href="/auth/login"
        >
          Sign in
        </Link>
      </header>

      <main className="relative z-10 mx-auto grid w-full max-w-6xl gap-12 px-6 pb-24 pt-10 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="space-y-8">
          <div className="inline-flex items-center gap-3 rounded-full border border-[#e2d7c7] bg-[#fffaf3] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#7c6f63]">
            Built for product teams
            <span className="rounded-full bg-[#12100e] px-2 py-0.5 text-[10px] text-[#f6f1e9]">
              Private
            </span>
          </div>
          <h2 className="text-4xl font-semibold leading-tight md:text-5xl">
            Upload, organize, and ship website assets with zero friction.
          </h2>
          <p className="max-w-xl text-lg leading-relaxed text-[#4d463f]">
            A clean internal hub where developers can authenticate with their
            work email, drop in media for each website, and instantly grab
            versioned URLs for production.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              className="rounded-full bg-[#e86f2c] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#e86f2c]/30 transition hover:-translate-y-0.5"
              href="/auth/signup"
            >
              Create an account
            </Link>
            <Link
              className="rounded-full border border-[#12100e] px-6 py-3 text-sm font-semibold text-[#12100e] transition hover:-translate-y-0.5"
              href="/dashboard"
            >
              View dashboard
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3" id="features">
            {[
              {
                title: "Work-email auth",
                detail: "Company domain enforcement + invite links.",
              },
              {
                title: "Asset URLs",
                detail: "Auto-versioned links with CDN-ready names.",
              },
              {
                title: "Project buckets",
                detail: "Group uploads by website and environment.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-[#e2d7c7] bg-[#fffaf3] p-4 shadow-sm"
              >
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="mt-2 text-sm text-[#7c6f63]">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section
          className="relative rounded-[32px] border border-[#e2d7c7] bg-[#fffaf3] p-6 shadow-[0_30px_80px_-40px_rgba(18,16,14,0.45)]"
          id="portal"
        >
          <div className="absolute -top-5 right-8 rounded-full bg-[#12100e] px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#f6f1e9]">
            Portal preview
          </div>
          <div className="rounded-3xl border border-[#eadfce] bg-white/70 p-5 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-[#7c6f63]">
                  Atlas Assets
                </p>
                <h3 className="text-xl font-semibold">Team dashboard</h3>
              </div>
              <span className="rounded-full border border-[#eadfce] px-3 py-1 text-xs font-semibold text-[#7c6f63]">
                12 projects
              </span>
            </div>
            <div className="mt-6 grid gap-4">
              {[
                {
                  name: "Aurora Marketing",
                  assets: "324 assets",
                  env: "production",
                },
                {
                  name: "Nimbus Docs",
                  assets: "118 assets",
                  env: "staging",
                },
                {
                  name: "Studio Landing",
                  assets: "79 assets",
                  env: "preview",
                },
              ].map((site) => (
                <div
                  key={site.name}
                  className="flex items-center justify-between rounded-2xl border border-[#e2d7c7] bg-[#fffaf3] px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold">{site.name}</p>
                    <p className="text-xs text-[#7c6f63]">{site.assets}</p>
                  </div>
                  <span className="rounded-full bg-[#1f7a70] px-3 py-1 text-xs font-semibold text-white">
                    {site.env}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-dashed border-[#e2d7c7] bg-white/50 px-4 py-6 text-center text-sm text-[#7c6f63]">
              Drop media here or connect a storage bucket.
            </div>
          </div>
        </section>
      </main>

      <section
        className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-24"
        id="workflow"
      >
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              step: "01",
              title: "Authenticate",
              detail: "SSO or magic link restricted to your work domain.",
            },
            {
              step: "02",
              title: "Upload",
              detail: "Drag assets into the right website bucket.",
            },
            {
              step: "03",
              title: "Ship",
              detail: "Copy CDN URLs and drop them into the codebase.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-[28px] border border-[#e2d7c7] bg-[#fffaf3] p-6 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#7c6f63]">
                {item.step}
              </p>
              <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm text-[#7c6f63]">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
