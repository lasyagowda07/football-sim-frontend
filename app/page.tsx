import Link from "next/link"
import { ArrowRight, Settings2, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Hero section */}
      <section className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Cloud-backed football tournament simulator
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-slate-50">
          Explore historical football data with a{" "}
          <span className="text-emerald-300">cloud-style ML pipeline</span>.
        </h1>

        <p className="max-w-2xl text-sm sm:text-base text-slate-300">
          This project ingests over{" "}
          <span className="font-semibold text-emerald-200">48,000+</span>{" "}
          international matches (1872–2025), processes them through a data
          pipeline, trains a match-outcome model, and lets you simulate
          knockout tournaments – all through a FastAPI backend and this
          Next.js UI.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link href="/simulate">
            <Button className="bg-emerald-500 text-slate-950 hover:bg-emerald-400">
              Open Tournament Simulator
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/admin">
            <Button
              variant="outline"
              className="border-slate-700 bg-slate-900/70 text-slate-100 hover:bg-slate-800 hover:border-emerald-400/60"
            >
              View Admin Pipeline
            </Button>
          </Link>
        </div>
      </section>

      {/* Two main feature cards */}
      <section className="grid gap-6 md:grid-cols-2">
        {/* Admin pipeline card */}
        <Card className="border-slate-800 bg-slate-900/80 shadow-lg shadow-black/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-base font-semibold text-slate-50">
                Admin pipeline
              </CardTitle>
              <CardDescription className="text-slate-400">
                Control the ingest → process → train steps that power the model.
              </CardDescription>
            </div>
            <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center text-emerald-300">
              <Settings2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-300">
            <ul className="list-disc ml-4 space-y-1.5">
              <li>Ingest raw Kaggle CSVs into a mock S3 bucket.</li>
              <li>Process and clean match data into feature-rich tables.</li>
              <li>Train and register new ML models with stored metrics.</li>
              <li>Switch which model is ACTIVE for simulations.</li>
            </ul>
            <Link href="/admin">
              <Button
                variant="outline"
                size="sm"
                className="mt-1 border-slate-700 bg-slate-900/70 text-slate-100 hover:border-emerald-400/60 hover:bg-slate-800"
              >
                Go to Admin
                <ArrowRight className="ml-2 h-3 w-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Tournament simulator card */}
        <Card className="border-slate-800 bg-slate-900/80 shadow-lg shadow-black/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-base font-semibold text-slate-50">
                Tournament simulator
              </CardTitle>
              <CardDescription className="text-slate-400">
                Pick teams, run Monte Carlo tournaments, and see who comes out on top.
              </CardDescription>
            </div>
            <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center text-amber-300">
              <Trophy className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-300">
            <ul className="list-disc ml-4 space-y-1.5">
              <li>Select a set of national teams (power-of-two bracket).</li>
              <li>Run the model-driven knockout simulation N times.</li>
              <li>Get win, final, and semi-final probabilities per team.</li>
              <li>Drill into saved simulations via their IDs.</li>
            </ul>
            <Link href="/simulate">
              <Button
                size="sm"
                className="mt-1 bg-emerald-500 text-slate-950 hover:bg-emerald-400"
              >
                Open Simulator
                <ArrowRight className="ml-2 h-3 w-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Optional small info strip (can extend later with metrics) */}
      <section className="mt-2 grid gap-4 md:grid-cols-3 text-xs text-slate-400">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3">
          <div className="font-semibold text-slate-200 mb-1">Dataset</div>
          <p>48k+ international matches, 1872–2025 (men&apos;s full internationals).</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3">
          <div className="font-semibold text-slate-200 mb-1">Tech stack</div>
          <p>FastAPI · SQLite · S3 abstraction · Next.js · shadcn/ui · TypeScript.</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3">
          <div className="font-semibold text-slate-200 mb-1">Cloud story</div>
          <p>Designed to swap mock S3 + local DB to real AWS services for deployment.</p>
        </div>
      </section>
    </div>
  )
}