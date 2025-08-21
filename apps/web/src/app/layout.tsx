import "./globals.css";
import type { Metadata } from "next";
import ThemeToggle from "./components/ThemeToggle";


export const metadata: Metadata = { title: "Smart API Playground" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Set theme before React renders to avoid flashes */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function () {
  try {
    var stored = localStorage.getItem('theme'); // 'light' | 'dark' | 'system' | null
    var mql = window.matchMedia('(prefers-color-scheme: dark)');
    var systemDark = mql.matches;
    // If stored is 'dark' => dark; if 'light' => light; otherwise follow system
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
        {/* Helps native UI reflect both schemes */}
        <meta name="color-scheme" content="light dark" />
      </head>
      
      <body className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 antialiased">
         <ThemeToggle />
        {children}
      </body>
    </html>
  );
}