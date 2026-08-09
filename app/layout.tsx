import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Big_Shoulders, IBM_Plex_Mono } from "next/font/google";
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

// Display face reserved for the hero and section headers — see globals.css
// "Aço-cofre" palette comment for the vault/carimbo rationale behind the pairing.
// Google ships "Big Shoulders Display" as one variable family selected via
// an opsz (optical size) axis, not a separate "_Display" export. Requesting
// `axes: ["opsz"]` compiles (matches the type signature and the bundled
// font-data.json) but crashes Turbopack's font resolver on this Next.js
// 16.3.0 build with a generic "Unknown font" error — so this uses the
// static default weight cut instead of the true wide-opsz display cut.
// Revisit if a future Next.js release fixes the axes option.
const bigShouldersDisplay = Big_Shoulders({
  variable: "--font-big-shoulders",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

// Utility face for money, order ids, contract hashes and timestamps.
const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
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
      className={`${plusJakartaSans.variable} ${bigShouldersDisplay.variable} ${ibmPlexMono.variable} antialiased`}
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
