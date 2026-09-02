import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account — RIWAYAH Haute Modesty",
  description: "Sign in or create your RIWAYAH account for exclusive access to luxury modest wear.",
};

/**
 * Auth layout — intentionally bare.
 * The navbar, footer and cart drawer are omitted so the
 * login/signup pages can render as a full-screen immersive experience.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
