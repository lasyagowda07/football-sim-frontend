"use client"

import { useEffect, useState } from "react"
import { Settings2, Database, PlayCircle, RefreshCw, Zap } from "lucide-react"

import {
  ingestData,
  processData,
  trainModel,
  listModelRuns,
  getActiveModel,
  activateModelRun,
  IngestionStatus,
  ProcessingStatus,
  TrainingStatus,
  ModelRunOut,
} from "@/lib/api"

import { Button } from "@/components/ui/button"
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
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"

type PipelineAction = "ingest" | "process" | "train" | null

export default function AdminPage() {
  const { toast } = useToast()

  const [pipelineLoading, setPipelineLoading] = useState<PipelineAction>(null)
  const [lastIngestion, setLastIngestion] = useState<IngestionStatus | null>(
    null
  )
  const [lastProcessing, setLastProcessing] =
    useState<ProcessingStatus | null>(null)
  const [lastTraining, setLastTraining] = useState<TrainingStatus | null>(null)

  const [modelRuns, setModelRuns] = useState<ModelRunOut[]>([])
  const [activeModel, setActiveModel] = useState<ModelRunOut | null>(null)
  const [modelsLoading, setModelsLoading] = useState(false)
  const [modelsError, setModelsError] = useState<string | null>(null)

  // Load model runs + active model on mount
  useEffect(() => {
    refreshModels()
  }, [])

  async function refreshModels() {
    setModelsLoading(true)
    setModelsError(null)
    try {
      const [runs, active] = await Promise.all([
        listModelRuns(),
        getActiveModel(),
      ])
      setModelRuns(runs)
      setActiveModel(active)
    } catch (err) {
      console.error(err)
      setModelsError((err as Error).message || "Failed to load model runs")
      toast({
        variant: "destructive",
        title: "Failed to load model runs",
        description: (err as Error).message,
      })
    } finally {
      setModelsLoading(false)
    }
  }

  // ---- Pipeline actions ----

  async function handleIngest() {
    setPipelineLoading("ingest")
    try {
      const res = await ingestData()
      setLastIngestion(res)
      toast({
        title: "Ingestion complete",
        description: `Uploaded ${res.files.length} files at ${res.timestamp}.`,
      })
    } catch (err) {
      console.error(err)
      toast({
        variant: "destructive",
        title: "Ingestion failed",
        description: (err as Error).message,
      })
    } finally {
      setPipelineLoading(null)
    }
  }

  async function handleProcess() {
    setPipelineLoading("process")
    try {
      const res = await processData()
      setLastProcessing(res)
      toast({
        title: "Processing complete",
        description: `Processed ${res.records} records for ${res.teams} teams.`,
      })
    } catch (err) {
      console.error(err)
      toast({
        variant: "destructive",
        title: "Processing failed",
        description: (err as Error).message,
      })
    } finally {
      setPipelineLoading(null)
    }
  }

  async function handleTrain() {
    setPipelineLoading("train")
    try {
      const res = await trainModel()
      setLastTraining(res)
      toast({
        title: "Training complete",
        description: `New model trained with ID ${res.model_run_id}.`,
      })
      await refreshModels()
    } catch (err) {
      console.error(err)
      toast({
        variant: "destructive",
        title: "Training failed",
        description: (err as Error).message,
      })
    } finally {
      setPipelineLoading(null)
    }
  }

  async function handleActivate(id: string) {
    try {
      const res = await activateModelRun(id)
      toast({
        title: "Model activated",
        description: `Active model set to ${res.active_model_run_id}.`,
      })
      await refreshModels()
    } catch (err) {
      console.error(err)
      toast({
        variant: "destructive",
        title: "Activation failed",
        description: (err as Error).message,
      })
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-50 flex items-center gap-2">
              <Settings2 className="h-6 w-6 text-emerald-300" />
              Admin pipeline
            </h1>
            <p className="text-sm text-slate-300">
              Drive the ingest → process → train pipeline and manage the model
              registry that powers the tournament simulator.
            </p>
          </div>
        </div>
      </section>

      {/* Section 1: Data Pipeline */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <PlayCircle className="h-4 w-4 text-emerald-300" />
          Data pipeline
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Ingest card */}
          <Card className="border-slate-800 bg-slate-900/80 shadow-lg shadow-black/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-50">
                Ingest data
              </CardTitle>
              <CardDescription className="text-slate-400">
                Load raw Kaggle CSVs into the mock S3 bucket under <code>raw/</code>.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs sm:text-sm text-slate-300">
              <Button
                type="button"
                onClick={handleIngest}
                disabled={pipelineLoading === "ingest"}
                className="w-full bg-slate-100 text-slate-900 hover:bg-slate-200"
              >
                {pipelineLoading === "ingest" ? (
                  "Ingesting…"
                ) : (
                  <>
                    Run ingestion
                  </>
                )}
              </Button>
              {lastIngestion ? (
                <div className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 space-y-1">
                  <p className="text-[11px] text-slate-400 uppercase tracking-wide">
                    Last ingestion
                  </p>
                  <p className="text-xs text-slate-200">
                    {lastIngestion.files.length} files ·{" "}
                    <span className="font-mono text-[11px]">
                      {lastIngestion.timestamp}
                    </span>
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  No ingestion run yet in this session.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Process card */}
          <Card className="border-slate-800 bg-slate-900/80 shadow-lg shadow-black/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-50">
                Process data
              </CardTitle>
              <CardDescription className="text-slate-400">
                Clean & normalize raw data into feature-rich processed tables.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs sm:text-sm text-slate-300">
              <Button
                type="button"
                onClick={handleProcess}
                disabled={pipelineLoading === "process"}
                className="w-full bg-slate-100 text-slate-900 hover:bg-slate-200"
              >
                {pipelineLoading === "process" ? "Processing…" : "Run processing"}
              </Button>
              {lastProcessing ? (
                <div className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 space-y-1">
                  <p className="text-[11px] text-slate-400 uppercase tracking-wide">
                    Last processing
                  </p>
                  <p className="text-xs text-slate-200">
                    {lastProcessing.records} matches · {lastProcessing.teams} teams
                  </p>
                  <p className="text-[11px] font-mono text-slate-400">
                    {lastProcessing.timestamp}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  No processing run yet in this session.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Train card */}
          <Card className="border-slate-800 bg-slate-900/80 shadow-lg shadow-black/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-50">
                Train model
              </CardTitle>
              <CardDescription className="text-slate-400">
                Train a new RandomForest model and register it in the model registry.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs sm:text-sm text-slate-300">
              <Button
                type="button"
                onClick={handleTrain}
                disabled={pipelineLoading === "train"}
                className="w-full bg-emerald-500 text-slate-950 hover:bg-emerald-400"
              >
                {pipelineLoading === "train" ? "Training…" : "Train new model"}
              </Button>
              {lastTraining ? (
                <div className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 space-y-1">
                  <p className="text-[11px] text-slate-400 uppercase tracking-wide">
                    Last training
                  </p>
                  <p className="text-xs text-slate-200">
                    ID:{" "}
                    <span className="font-mono text-[11px]">
                      {lastTraining.model_run_id}
                    </span>
                  </p>
                  <p className="text-[11px] font-mono text-slate-400">
                    {lastTraining.timestamp}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  No training run yet in this session.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Section 2: Model runs */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Database className="h-4 w-4 text-emerald-300" />
            Model runs
          </h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={refreshModels}
            disabled={modelsLoading}
            className="border-slate-700 bg-slate-900/70 text-slate-100 hover:bg-slate-800 hover:border-slate-500 text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
        </div>

        <Card className="border-slate-800 bg-slate-900/80 shadow-lg shadow-black/30">
          <CardContent className="pt-4">
            {modelsLoading ? (
              <p className="text-xs text-slate-400">
                Loading model runs…
              </p>
            ) : modelsError ? (
              <p className="text-xs text-red-400">
                {modelsError}
              </p>
            ) : modelRuns.length === 0 ? (
              <p className="text-xs text-slate-400">
                No model runs found. Train a model to see it here.
              </p>
            ) : (
              <ModelRunsTable
                runs={modelRuns}
                activeId={activeModel?.id ?? null}
                onActivate={handleActivate}
              />
            )}
          </CardContent>
        </Card>
      </section>

      {/* Section 3: Active model */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Zap className="h-4 w-4 text-emerald-300" />
          Active model
        </h2>

        <Card className="border-slate-800 bg-slate-900/80 shadow-lg shadow-black/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-slate-50">
              Currently used for simulations
            </CardTitle>
            <CardDescription className="text-slate-400">
              This is the model the tournament simulator uses for predictions.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs sm:text-sm text-slate-300 space-y-2">
            {activeModel ? (
              <>
                <p>
                  <span className="text-slate-400">ID:</span>{" "}
                  <span className="font-mono text-[11px] sm:text-xs text-slate-100 break-all">
                    {activeModel.id}
                  </span>
                </p>
                <p>
                  <span className="text-slate-400">Path:</span>{" "}
                  <span className="font-mono text-[11px] sm:text-xs text-slate-200 break-all">
                    {activeModel.model_s3_path}
                  </span>
                </p>
                <p>
                  <span className="text-slate-400">Created:</span>{" "}
                  <span className="text-slate-200">
                    {new Date(activeModel.created_at).toLocaleString()}
                  </span>
                </p>
                {activeModel.metrics && (
                  <div className="space-y-1">
                    <p className="text-slate-400 text-[11px] uppercase tracking-wide">
                      Metrics
                    </p>
                    <ul className="text-xs text-slate-200 space-y-0.5">
                      {Object.entries(activeModel.metrics).map(
                        ([key, value]) => (
                          <li key={key}>
                            <span className="text-slate-400">{key}:</span>{" "}
                            <span className="font-mono">
                              {typeof value === "number"
                                ? value.toFixed(4)
                                : String(value)}
                            </span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
                {activeModel.notes && (
                  <p className="text-xs text-slate-300">
                    <span className="text-slate-400">Notes:</span>{" "}
                    {activeModel.notes}
                  </p>
                )}
              </>
            ) : (
              <p className="text-xs text-slate-400">
                No active model set. Train a model and mark it as ACTIVE to use
                it in the simulator.
              </p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function ModelRunsTable({
  runs,
  activeId,
  onActivate,
}: {
  runs: ModelRunOut[]
  activeId: string | null
  onActivate: (id: string) => void
}) {
  const hasMetrics = runs.some((r) => r.metrics && Object.keys(r.metrics).length)

  return (
    <Table>
      <TableCaption className="text-slate-500 text-xs">
        Recent model training runs. ACTIVE model is highlighted.
      </TableCaption>
      <TableHeader>
        <TableRow className="border-slate-800">
          <TableHead className="text-slate-300 text-xs">Created</TableHead>
          <TableHead className="text-slate-300 text-xs">Status</TableHead>
          <TableHead className="text-slate-300 text-xs">
            Accuracy
          </TableHead>
          <TableHead className="text-slate-300 text-xs">
            Log loss
          </TableHead>
          <TableHead className="text-slate-300 text-xs">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {runs.map((run) => {
          const isActive = run.id === activeId
          const accuracy =
            run.metrics && typeof run.metrics["accuracy"] === "number"
              ? run.metrics["accuracy"]
              : null
          const logLoss =
            run.metrics && typeof run.metrics["log_loss"] === "number"
              ? run.metrics["log_loss"]
              : null

          return (
            <TableRow
              key={run.id}
              className={`border-slate-800 ${
                isActive ? "bg-slate-900" : ""
              }`}
            >
              <TableCell className="text-xs text-slate-200">
                {new Date(run.created_at).toLocaleString()}
              </TableCell>
              <TableCell className="text-xs">
                <Badge
                  variant={isActive ? "default" : "outline"}
                  className={
                    isActive
                      ? "bg-emerald-500 text-slate-950 border-emerald-500"
                      : "border-slate-700 bg-slate-900 text-slate-100"
                  }
                >
                  {run.status}
                </Badge>
              </TableCell>
              <TableCell className="text-xs text-slate-200">
                {accuracy != null ? accuracy.toFixed(4) : hasMetrics ? "-" : "—"}
              </TableCell>
              <TableCell className="text-xs text-slate-200">
                {logLoss != null ? logLoss.toFixed(4) : hasMetrics ? "-" : "—"}
              </TableCell>
              <TableCell className="text-xs text-slate-200">
                {!isActive && run.status !== "FAILED" ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800 hover:border-emerald-400"
                    onClick={() => onActivate(run.id)}
                  >
                    Activate
                  </Button>
                ) : isActive ? (
                  <span className="text-[11px] text-emerald-300">
                    Active
                  </span>
                ) : (
                  <span className="text-[11px] text-red-400">
                    Cannot activate
                  </span>
                )}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}