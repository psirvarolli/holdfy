import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { RoleProvider } from "@/lib/role-context";
import { ThemeProvider } from "@/lib/theme-context";
import { LocaleProvider } from "@/lib/locale-context";
import { OrdersProvider } from "@/lib/orders-context";
import { NotificationsProvider } from "@/lib/notifications-context";
import { PollarProvider } from "@/lib/pollar-provider";
import "@pollar/react/styles.css";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Holdfy — Pagamentos PIX protegidos",
  description: "Pague e receba com segurança: seu dinheiro fica em custódia até a confirmação do pedido.",
};

// Aplica o tema salvo antes da primeira pintura, evitando flash do tema errado.
const THEME_INIT_SCRIPT = `
  try {
    var theme = localStorage.getItem("holdfy-theme");
    if (theme === "light") document.documentElement.classList.add("light");
  } catch (e) {}
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${plusJakartaSans.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="bg-background text-on-background font-sans">
        <ThemeProvider>
          <LocaleProvider>
            <PollarProvider>
              <RoleProvider>
                <OrdersProvider>
                  <NotificationsProvider>{children}</NotificationsProvider>
                </OrdersProvider>
              </RoleProvider>
            </PollarProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
