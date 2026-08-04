import type { ReactNode } from "react";
import { Sidebar } from "@/components/shared/sidebar";
import { BottomNav } from "@/components/shared/bottom-nav";
import { MobileTopBar } from "@/components/shared/mobile-top-bar";
import { DesktopTopBar } from "@/components/shared/desktop-top-bar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileTopBar />
        <DesktopTopBar />
        <main className="flex-1 pb-24 md:pb-0">
          <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-8 md:py-10">
            {children}
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
