import { RoleSwitch } from "@/components/shared/role-switch";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { UserMenu } from "@/components/shared/user-menu";
import { NotificationBell } from "@/components/shared/notification-bell";

export function DesktopTopBar() {
  return (
    <header className="sticky top-0 z-30 hidden items-center justify-end gap-3 border-b border-outline-variant bg-surface px-8 py-4 md:flex">
      <RoleSwitch />
      <ThemeToggle />
      <NotificationBell />
      <UserMenu />
    </header>
  );
}
