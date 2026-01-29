"use client";

type AuthHeaderProps = {
  title: string;
  subtitle: string;
};

export default function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME?.trim() || "";
  const siteName = companyName ? `${companyName} Asset Repo` : "Asset Repo";

  return (
    <div className="text-center">
      <p className="text-2xl font-semibold uppercase text-white">
        {siteName}
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h1>
      <p className="mt-3 text-sm text-white/60 sm:text-base">{subtitle}</p>
    </div>
  );
}
