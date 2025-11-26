"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Trophy } from "lucide-react"

import {
  getSimulation,
  SimulationResponse,
  TeamProbability,
} from "@/lib/api"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function SimulationDetailPage() {
  const params = useParams()
  const id = params?.id as string | undefined

  const [simulation, setSimulation] = useState<SimulationResponse | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    if (!id) {
      setErrorMessage("No simulation ID provided.")
      setLoading(false)
      return
    }

    let cancelled = false

    async function fetchSimulation() {
      setLoading(true)
      setErrorMessage(null)
      try {
        const data = await getSimulation(id)
        if (!cancelled) {
          setSimulation(data)
        }
      } catch (err) {
        if (!cancelled) {
          setSimulation(null)
          setErrorMessage((err as Error).message || "Simulation not found")
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchSimulation()

    return () => {
      cancelled = true
    }
  }, [id])

  // ---- Loading state ----
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Link
              href="/simulate"
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-100"
            >
              <ArrowLeft className="h-3 w-3" />
              Back to simulator
            </Link>
          </div>
        </div>

        <Card className="border-slate-800 bg-slate-900/80 shadow-lg shadow-black/30">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-50">
              Loading simulation…
            </CardTitle>
            <CardDescription className="text-slate-400">
              Fetching simulation data from the backend.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-slate-300">
            Please wait a moment while we load the saved results.
          </CardContent>
        </Card>
      </div>
    )
  }

  // ---- Not found / error state ----
  if (!simulation) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Link
              href="/simulate"
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-100"
            >
              <ArrowLeft className="h-3 w-3" />
              Back to simulator
            </Link>
          </div>
        </div>

        <Card className="border-slate-800 bg-slate-900/80 shadow-lg shadow-black/30">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-50">
              Simulation not found
            </CardTitle>
            <CardDescription className="text-slate-400">
              We couldn&apos;t find a simulation with ID:
              <span className="ml-1 font-mono text-xs text-slate-200 break-all">
                {id || "(missing id)"}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-slate-300 space-y-2">
            <p>
              It may have been deleted, the ID might be incorrect, or the
              backend returned an error.
            </p>
            {errorMessage && (
              <p className="text-xs text-slate-500">
                Error detail: {errorMessage}
              </p>
            )}
            <p className="text-xs text-slate-400">
              Try running a new tournament from the simulator page and then
              click the simulation ID link in the results card.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ---- Success state ----
  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Link
                href="/simulate"
                className="inline-flex items-center gap-1 hover:text-slate-100"
              >
                <ArrowLeft className="h-3 w-3" />
                Back to simulator
              </Link>
            </div>

            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-50 flex items-center gap-2">
              <Trophy className="h-6 w-6 text-amber-300" />
              Simulation result
            </h1>

            <p className="text-xs sm:text-sm text-slate-300">
              Loaded from the database using a saved{" "}
              <span className="font-semibold text-emerald-300">
                SimulationRun
              </span>{" "}
              entry.
            </p>
          </div>
        </div>
      </section>

      {/* Meta card + top favourites */}
      <section className="grid gap-4 md:grid-cols-2">
        <Card className="border-slate-800 bg-slate-900/80 shadow-lg shadow-black/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-slate-50">
              Simulation metadata
            </CardTitle>
            <CardDescription className="text-slate-400">
              Basic info about this saved simulation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs sm:text-sm text-slate-300">
            <div className="space-y-1">
              <div className="text-slate-400 text-[11px] uppercase tracking-wide">
                Simulation ID
              </div>
              <div className="font-mono text-[11px] sm:text-xs break-all text-slate-100">
                {simulation.simulation_id}
              </div>
            </div>
            <p className="text-slate-400 text-xs">
              The probabilities below were generated using the ACTIVE model at
              the time this simulation was run.
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/80 shadow-lg shadow-black/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-slate-50">
              Top favourites
            </CardTitle>
            <CardDescription className="text-slate-400">
              Highest win probabilities in this simulation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-300">
            <TopFavourites results={simulation.results} />
          </CardContent>
        </Card>
      </section>

      {/* Results table */}
      <section>
        <Card className="border-slate-800 bg-slate-900/80 shadow-lg shadow-black/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-slate-50">
              Team probabilities
            </CardTitle>
            <CardDescription className="text-slate-400">
              Win, final, and semi-final probabilities for each team in this
              saved simulation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResultsTable results={simulation.results} />
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function TopFavourites({ results }: { results: TeamProbability[] }) {
  if (!results || results.length === 0) {
    return (
      <p className="text-xs text-slate-400">
        No data available for this simulation.
      </p>
    )
  }

  const sorted = [...results].sort((a, b) => b.win_prob - a.win_prob)
  const top = sorted.slice(0, 3)

  return (
    <div className="space-y-2">
      {top.map((team, idx) => (
        <div
          key={team.team}
          className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">#{idx + 1}</span>
            <span className="text-sm font-medium text-slate-100">
              {team.team}
            </span>
          </div>
          <div className="text-xs text-emerald-300 font-semibold">
            {(team.win_prob * 100).toFixed(1)}%
          </div>
        </div>
      ))}
    </div>
  )
}

function ResultsTable({ results }: { results: TeamProbability[] }) {
  const sorted = useMemo(
    () => [...results].sort((a, b) => b.win_prob - a.win_prob),
    [results]
  )

  return (
    <Table>
      <TableCaption className="text-slate-500 text-xs">
        Sorted by win probability (highest to lowest).
      </TableCaption>
      <TableHeader>
        <TableRow className="border-slate-800">
          <TableHead className="w-[40px] text-slate-300">#</TableHead>
          <TableHead className="text-slate-300">Team</TableHead>
          <TableHead className="text-right text-slate-300">
            Win prob
          </TableHead>
          <TableHead className="text-right text-slate-300">
            Final prob
          </TableHead>
          <TableHead className="text-right text-slate-300">
            Semi prob
          </TableHead>
          <TableHead className="text-right text-slate-300">
            Wins
          </TableHead>
          <TableHead className="text-right text-slate-300">
            Finals
          </TableHead>
          <TableHead className="text-right text-slate-300">
            Semis
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((team, idx) => (
          <TableRow key={team.team} className="border-slate-800">
            <TableCell className="text-xs text-slate-400">
              {idx + 1}
            </TableCell>
            <TableCell className="text-sm text-slate-100 font-medium">
              {team.team}
            </TableCell>
            <TableCell className="text-right text-emerald-300 text-xs">
              {(team.win_prob * 100).toFixed(1)}%
            </TableCell>
            <TableCell className="text-right text-slate-200 text-xs">
              {team.final_prob != null
                ? `${(team.final_prob * 100).toFixed(1)}%`
                : "-"}
            </TableCell>
            <TableCell className="text-right text-slate-200 text-xs">
              {team.semi_prob != null
                ? `${(team.semi_prob * 100).toFixed(1)}%`
                : "-"}
            </TableCell>
            <TableCell className="text-right text-slate-200 text-xs">
              {team.wins ?? "-"}
            </TableCell>
            <TableCell className="text-right text-slate-200 text-xs">
              {team.finals ?? "-"}
            </TableCell>
            <TableCell className="text-right text-slate-200 text-xs">
              {team.semis ?? "-"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}