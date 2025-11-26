// app/layout.tsx
import "./globals.css"
import { Inter } from "next/font/google"
import Link from "next/link"
import { InfoSheet } from "@/components/info-sheet"
import { Button } from "@/components/ui/button"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Football Tournament Simulator",
  description: "A cloud-backed football simulation platform powered by FastAPI + ML",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={
          inter.className +
          " bg-slate-950 text-slate-50 antialiased"
        }
      >
        <div className="min-h-screen flex flex-col">
          {/* NAVBAR */}
          <nav className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
              {/* Left: brand + links */}
              <div className="flex items-center gap-6">
                <Link href="/" className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/40">
                    FT
                  </div>
                  <span className="hidden sm:inline text-lg font-semibold tracking-tight">
                    Football Tournament Simulator
                  </span>
                  <span className="sm:hidden text-lg font-semibold tracking-tight">
                    FT Simulator
                  </span>
                </Link>

                <div className="hidden md:flex items-center gap-2 text-sm">
                  <NavLink href="/">Home</NavLink>
                  <NavLink href="/simulate">Simulator</NavLink>
                  <NavLink href="/admin">Admin</NavLink>
                </div>
              </div>

              {/* Right: info sheet trigger */}
              <div className="flex items-center gap-2">
                <InfoSheet>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-700 bg-slate-900/60 hover:bg-slate-800 hover:border-emerald-400/60 text-slate-100"
                  >
                    What&apos;s going on?
                  </Button>
                </InfoSheet>
              </div>
            </div>
          </nav>

          {/* MAIN CONTENT */}
          <main className="flex-1">
            <div className="max-w-6xl mx-auto px-4 py-8">
              {/* subtle card-ish background behind everything */}
              <div className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/80 to-slate-950/90 shadow-xl shadow-black/40 p-4 sm:p-6 lg:p-8">
                {children}
              </div>
            </div>
          </main>

          {/* FOOTER (small, subtle) */}
          <footer className="border-t border-slate-900 bg-slate-950/80">
            <div className="max-w-6xl mx-auto px-4 py-3 text-xs text-slate-500 flex items-center justify-between">
              <span>Built with Next.js · shadcn/ui · FastAPI · SQLite/S3</span>
              <span className="hidden sm:inline text-slate-600">
                Data: International football matches 1872–2025
              </span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}

type NavLinkProps = {
  href: string
  children: React.ReactNode
}

function NavLink({ href, children }: NavLinkProps) {
  return (
    <Link
      href={href}
      className="rounded-full px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900/60 border border-slate-800 hover:border-emerald-400/60 hover:bg-slate-800 transition-colors"
    >
      {children}
    </Link>
  )
}