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
          <SheetTitle className="text-lg font-semibold">
            What is this platform doing?
          </SheetTitle>
          <SheetDescription className="text-slate-400">
            Quick tour of the backend pipeline this UI is driving.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-5 text-sm leading-relaxed">
          <p className="text-slate-300">
            Behind this UI there&apos;s a cloud-style pipeline built with{" "}
            <span className="font-medium text-emerald-300">FastAPI</span>,{" "}
            <span className="font-medium text-emerald-300">SQLite</span>, and a
            mock <span className="font-medium text-emerald-300">S3 layer</span>.
            It uses 48k+ international football matches (1872–2025) to train a
            match outcome model and run tournament simulations.
          </p>

          <div className="space-y-3">
            <Step
              number={1}
              title="Ingest"
              body="Admin clicks “Ingest Data”. The backend reads Kaggle CSVs from ./data and uploads them into a mock S3 bucket (raw/ folder)."
            />
            <Step
              number={2}
              title="Process"
              body="“Process Data” cleans the raw files, normalizes team names, computes match_result & goal_diff, and writes processed/matches.csv and processed/teams.csv."
            />
            <Step
              number={3}
              title="Train"
              body="“Train Model” trains a RandomForest classifier to predict match_result using team encodings + neutral flag. The model is stored in S3 (models/) and registered in the ModelRun table."
            />
            <Step
              number={4}
              title="Registry"
              body="The model registry tracks every training run. One run is marked ACTIVE and is what the simulator uses for predictions."
            />
            <Step
              number={5}
              title="Simulate"
              body="On the Simulator page, you pick teams and runs. The backend loads the ACTIVE model, simulates a knockout tournament many times, and returns win/final/semi probabilities per team."
            />
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-xs text-slate-300">
            <p className="font-semibold text-emerald-300 mb-1">
              How to read the UI:
            </p>
            <ul className="list-disc ml-4 space-y-1">
              <li>
                <span className="font-medium text-slate-100">Admin</span> tab:
                step-by-step pipeline controls and model history.
              </li>
              <li>
                <span className="font-medium text-slate-100">Simulator</span>{" "}
                tab: main user-facing feature to run tournament simulations.
              </li>
              <li>
                All results and simulations are saved to the DB so you can
                revisit them later.
              </li>
            </ul>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function Step({
  number,
  title,
  body,
}: {
  number: number
  title: string
  body: string
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 h-7 w-7 flex items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-400/40 text-xs font-semibold text-emerald-200">
        {number}
      </div>
      <div className="space-y-1">
        <div className="font-medium text-slate-100">{title}</div>
        <p className="text-slate-400 text-xs sm:text-sm">{body}</p>
      </div>
    </div>
  )
}