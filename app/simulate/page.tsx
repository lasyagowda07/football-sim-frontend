"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  ChevronDown,
  Loader2,
  RefreshCw,
  Trophy,
} from "lucide-react"

import {
  getTeams,
  simulateTournament,
  SimulationResponse,
  TeamProbability,
} from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"

function isPowerOfTwo(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0
}

export default function SimulatorPage() {
  const { toast } = useToast()

  const [allTeams, setAllTeams] = useState<string[]>([])
  const [teamsLoading, setTeamsLoading] = useState(false)
  const [teamsError, setTeamsError] = useState<string | null>(null)

  const [search, setSearch] = useState("")
  const [selectedTeams, setSelectedTeams] = useState<string[]>([])
  const [nRuns, setNRuns] = useState<number>(200)

  const [simLoading, setSimLoading] = useState(false)
  const [simulation, setSimulation] = useState<SimulationResponse | null>(null)

  // Load teams on mount
  useEffect(() => {
    let isMounted = true

    async function loadTeams() {
      setTeamsLoading(true)
      setTeamsError(null)
      try {
        const teams = await getTeams()
        if (!isMounted) return
        setAllTeams(teams)
      } catch (err) {
        console.error(err)
        if (!isMounted) return
        setTeamsError((err as Error).message || "Failed to load teams")
        toast({
          variant: "destructive",
          title: "Failed to load teams",
          description: (err as Error).message,
        })
      } finally {
        if (isMounted) setTeamsLoading(false)
      }
    }

    loadTeams()
    return () => {
      isMounted = false
    }
  }, [toast])

  // Filtered teams based on search and not already selected
  const filteredTeams = useMemo(() => {
    const q = search.toLowerCase()
    return allTeams.filter(
      (t) =>
        !selectedTeams.includes(t) &&
        (q === "" || t.toLowerCase().includes(q))
    )
  }, [allTeams, selectedTeams, search])

  const topTeams = useMemo(() => {
    if (!simulation) return []
    const sorted = [...simulation.results].sort(
      (a, b) => b.win_prob - a.win_prob
    )
    return sorted.slice(0, 3)
  }, [simulation])

  const handleToggleTeam = (team: string) => {
    setSelectedTeams((prev) =>
      prev.includes(team) ? prev.filter((t) => t !== team) : [...prev, team]
    )
  }

  const handleRunSimulation = async () => {
    if (selectedTeams.length < 2) {
      toast({
        variant: "destructive",
        title: "Select more teams",
        description: "You need at least 2 teams for a tournament.",
      })
      return
    }

    if (!isPowerOfTwo(selectedTeams.length)) {
      toast({
        variant: "destructive",
        title: "Team count must be a power of 2",
        description:
          "Please select 4, 8, 16, 32, ... teams to form a knockout bracket.",
      })
      return
    }

    if (nRuns <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid number of runs",
        description: "Please use a positive number of simulation runs.",
      })
      return
    }

    setSimLoading(true)
    try {
      const result = await simulateTournament({
        teams: selectedTeams,
        n_runs: nRuns,
      })
      setSimulation(result)
      toast({
        title: "Simulation complete",
        description: `Simulation ${result.simulation_id} finished with ${nRuns} runs.`,
      })
    } catch (err) {
      console.error(err)
      toast({
        variant: "destructive",
        title: "Simulation failed",
        description: (err as Error).message,
      })
    } finally {
      setSimLoading(false)
    }
  }

  const handleClear = () => {
    setSelectedTeams([])
    setSimulation(null)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-50">
              Tournament simulator
            </h1>
            <p className="text-sm text-slate-300">
              Pick teams, choose how many runs to simulate, and let the model
              estimate each team&apos;s chances of winning a knockout tournament.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <Trophy className="h-4 w-4 text-amber-300" />
            <span>Powered by historical matches + ML</span>
          </div>
        </div>
      </section>

      {/* Config + selection card */}
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        {/* Left card: selection + run */}
        <Card className="border-slate-800 bg-slate-900/80 shadow-lg shadow-black/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-slate-50">
              Configure simulation
            </CardTitle>
            <CardDescription className="text-slate-400">
              Select a set of national teams (4, 8, 16, ...) and choose how many
              Monte Carlo runs to execute.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-sm">
            {/* Team selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col">
                  <span className="font-medium text-slate-100">
                    Teams selected
                  </span>
                  <span className="text-xs text-slate-400">
                    Choose a power-of-two count (4, 8, 16, 32, ...)
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className="border-emerald-500/60 text-emerald-300 bg-emerald-500/10"
                >
                  {selectedTeams.length} selected
                </Badge>
              </div>

              {/* Selected teams as chips */}
              <div className="min-h-[44px] rounded-lg border border-slate-800 bg-slate-950/60 px-2 py-2 flex flex-wrap gap-1.5">
                {selectedTeams.length === 0 ? (
                  <span className="text-xs text-slate-500">
                    No teams selected yet. Use the list below to add some.
                  </span>
                ) : (
                  selectedTeams.map((team) => (
                    <button
                      key={team}
                      type="button"
                      onClick={() => handleToggleTeam(team)}
                      className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-100 hover:bg-slate-700 border border-slate-700"
                    >
                      <span>{team}</span>
                      <span className="text-slate-400">×</span>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Available teams list */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-slate-100">
                  Available teams
                </span>
                <span className="text-[10px] uppercase tracking-wide text-slate-500 flex items-center gap-1">
                  <ChevronDown className="h-3 w-3" />
                  Click to add / remove
                </span>
              </div>

              {/* Search box */}
              <Input
                placeholder="Search teams..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-slate-700 bg-slate-950/60 text-slate-100 placeholder:text-slate-500"
              />

              <div className="h-56 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950/60">
                {teamsLoading ? (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading teams...
                  </div>
                ) : teamsError ? (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs px-4 text-center">
                    Failed to load teams: {teamsError}
                  </div>
                ) : filteredTeams.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-500 text-xs px-4 text-center">
                    No teams match this search.
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-800 text-xs">
                    {filteredTeams.map((team) => (
                      <li key={team}>
                        <button
                          type="button"
                          onClick={() => handleToggleTeam(team)}
                          className="w-full text-left px-3 py-2 hover:bg-slate-800/60 flex items-center justify-between"
                        >
                          <span className="text-slate-100">{team}</span>
                          <span className="text-[10px] text-emerald-300">
                            add
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* n_runs + buttons */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="flex-1 space-y-1">
                <label className="text-xs font-medium text-slate-200">
                  Number of simulation runs
                </label>
                <Input
                  type="number"
                  min={10}
                  max={5000}
                  value={nRuns}
                  onChange={(e) => setNRuns(Number(e.target.value) || 0)}
                  className="border-slate-700 bg-slate-950/60 text-slate-100"
                />
                <p className="text-[11px] text-slate-500">
                  More runs = smoother probabilities, but takes longer to compute.
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClear}
                  className="border-slate-700 bg-slate-900/70 text-slate-100 hover:bg-slate-800 hover:border-slate-500"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button
                  type="button"
                  onClick={handleRunSimulation}
                  disabled={simLoading}
                  className="bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                >
                  {simLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      Run simulation
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right card: Top favourites + meta */}
        <Card className="border-slate-800 bg-slate-900/80 shadow-lg shadow-black/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-slate-50 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-300" />
              Top favourites
            </CardTitle>
            <CardDescription className="text-slate-400">
              Based on the latest simulation results.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {simulation ? (
              <>
                {topTeams.length === 0 ? (
                  <p className="text-slate-400 text-xs">
                    No favourites calculated.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {topTeams.map((team, idx) => (
                      <div
                        key={team.team}
                        className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">
                            #{idx + 1}
                          </span>
                          <span className="text-sm font-medium text-slate-100">
                            {team.team}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-emerald-300 font-semibold">
                            {(team.win_prob * 100).toFixed(1)}%
                          </span>
                          <Badge
                            variant="outline"
                            className="border-emerald-500/60 text-emerald-300 bg-emerald-500/10"
                          >
                            Win probability
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="text-xs text-slate-400 pt-1">
                  Simulation ID:&nbsp;
                  <Link
                    href={`/simulation/${simulation.simulation_id}`}
                    className="text-emerald-300 hover:underline break-all"
                  >
                    {simulation.simulation_id}
                  </Link>
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-400">
                Run a simulation to see the top favourites based on the model
                output.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Results table */}
      <section>
        <Card className="border-slate-800 bg-slate-900/80 shadow-lg shadow-black/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-slate-50">
              Simulation results
            </CardTitle>
            <CardDescription className="text-slate-400">
              Probabilities are based on {nRuns} simulated tournaments for the
              currently selected teams.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!simulation ? (
              <div className="text-xs text-slate-400">
                No simulation yet. Configure your tournament above and click{" "}
                <span className="font-semibold text-slate-200">
                  Run simulation
                </span>
                .
              </div>
            ) : (
              <ResultsTable results={simulation.results} />
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function ResultsTable({ results }: { results: TeamProbability[] }) {
  const sorted = [...results].sort((a, b) => b.win_prob - a.win_prob)

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
            <TableCell className="text-xs text-slate-400">{idx + 1}</TableCell>
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