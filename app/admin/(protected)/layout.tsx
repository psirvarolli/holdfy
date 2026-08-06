import type { ReactNode } from "react";
import { AdminTopBar } from "@/components/admin/admin-top-bar";

export default function AdminProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <AdminTopBar />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-8 md:py-10">{children}</div>
      </main>
    </div>
  );
}
