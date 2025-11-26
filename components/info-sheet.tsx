"use client"

import { ReactNode } from "react"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"

interface InfoSheetProps {
  children: ReactNode
}

export function InfoSheet({ children }: InfoSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>

      <SheetContent
        side="right"
        className="w-full sm:w-[420px] bg-slate-950 border-l border-slate-800 text-slate-100"
      >
        <SheetHeader>
          <SheetTitle className="text-lg font-semibold text-slate-100">
            What is this platform doing?
          </SheetTitle>
          <SheetDescription className="text-slate-300">
            A quick explainer of the backend pipeline this UI is driving.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-5 text-sm leading-relaxed text-slate-200">
          {/* High-level overview */}
          <section className="space-y-2">
            <p className="text-slate-200">
              This app uses historical{" "}
              <span className="font-medium text-emerald-300">
                international football match data
              </span>{" "}
              (1872–2025) plus an ML model to simulate knockout tournaments.
              The backend is structured like a small cloud data pipeline.
            </p>
          </section>

          {/* Pipeline section */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Data & ML Pipeline
            </h3>

            <PipelineStep
              label="Ingest"
              description="Loads Kaggle CSVs from ./data and pushes them into mock S3 under raw/."
            />
            <PipelineStep
              label="Process"
              description="Cleans & normalizes data, computes match_result and goal_diff, writes processed/ tables."
            />
            <PipelineStep
              label="Train"
              description="Trains a RandomForest classifier to predict match outcomes. Model artifacts saved into S3."
            />
            <PipelineStep
              label="Simulate"
              description="Runs Monte Carlo knockout tournaments using the ACTIVE model in the registry."
            />
          </section>

          {/* Cloud components */}
          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Cloud-style components used
            </h3>
            <ul className="list-disc ml-5 space-y-1 text-slate-200">
              <li>
                <span className="font-medium text-emerald-300">Mock S3</span>{" "}
                – local folder acting like S3 for raw, processed data and models.
              </li>
              <li>
                <span className="font-medium text-emerald-300">SQLite</span>{" "}
                – small relational database storing ModelRun + SimulationRun.
              </li>
              <li>
                <span className="font-medium text-emerald-300">FastAPI</span>{" "}
                – backend API exposing admin & public endpoints.
              </li>
              <li>
                <span className="font-medium text-emerald-300">S3 Abstraction</span>{" "}
                – easily switched from local to real AWS S3 using ENV=cloud.
              </li>
            </ul>
          </section>

          {/* What happens when clicking simulate */}
          <section className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-xs sm:text-sm text-slate-200">
            <p className="font-semibold text-emerald-300 mb-2">
              What happens when you click “Run Simulation”?
            </p>
            <ol className="list-decimal ml-5 space-y-1.5">
              <li>The frontend sends your selected teams + n_runs to FastAPI.</li>
              <li>The backend loads the <span className="font-medium">ACTIVE model</span> from S3.</li>
              <li>The model predicts probabilities for each match.</li>
              <li>
                A full knockout bracket is simulated{" "}
                <span className="font-medium">N times</span> using Monte Carlo.
              </li>
              <li>Team win/final/semi probabilities are computed and saved in DB.</li>
            </ol>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function PipelineStep({
  label,
  description,
}: {
  label: string
  description: string
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 h-6 w-6 flex items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-400/40 text-[10px] font-semibold text-emerald-200">
        {label[0]}
      </div>
      <div className="space-y-1">
        <div className="text-xs font-semibold text-slate-100">{label}</div>
        <p classnName="text-slate-300 text-xs sm:text-[13px]">{description}</p>
      </div>
    </div>
  )
}