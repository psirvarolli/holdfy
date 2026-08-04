import { RoleSwitch } from "@/components/shared/role-switch";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { UserMenu } from "@/components/shared/user-menu";
import { Logo } from "@/components/shared/logo";

export function MobileTopBar() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-outline-variant bg-surface px-4 py-4 md:hidden">
      <Logo />
      <div className="flex items-center gap-2">
        <RoleSwitch />
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
