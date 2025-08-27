import "./globals.css";
import type { Metadata } from "next";
import SWRProvider from "./_providers/SWRProvider";
import ThemeToggle from "./components/ThemeToggle";

export const metadata: Metadata = { title: "Smart API Playground" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function () {
  try {
    var stored = localStorage.getItem('theme');
    var mql = window.matchMedia('(prefers-color-scheme: dark)');
    var systemDark = mql.matches;
    var wantDark = stored === 'dark' || (stored !== 'light' && systemDark);
    var modeAttr = stored === 'system' ? 'system' : (wantDark ? 'dark' : 'light');
    var root = document.documentElement;
    root.classList.toggle('dark', wantDark);
    root.setAttribute('data-theme', modeAttr);
    root.style.colorScheme = wantDark ? 'dark' : 'light';
  } catch (e) {}
})();
          `,
          }}
        />
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 antialiased">
        <SWRProvider>
          <ThemeToggle />
          {children}
        </SWRProvider>
      </body>
    </html>
  );
}