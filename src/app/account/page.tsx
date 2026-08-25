import { AccountClient } from "./AccountClient";
import type { Metadata } from "next";

// Always render dynamically — never cache this page
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Account",
  description: "Manage your AMabaya account — orders, addresses, and profile.",
};

// Server component just renders the shell — all data fetching
// happens client-side inside AccountClient using the browser Supabase client.
// This avoids SSR cookie issues with the deprecated middleware in Next.js 16.3.
export default function AccountPage() {
  return <AccountClient />;
}
