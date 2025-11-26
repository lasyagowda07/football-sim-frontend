import type {
    SimulationRequest,
    SimulationResponse,
    TeamProbability,
    IngestionStatus,
    ProcessingStatus,
    TrainingStatus,
    ModelRunOut,
  } from "@/types/api"

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

// ---------- Shared types ----------

export interface TeamProbability {
  team: string
  win_prob: number
  final_prob?: number
  semi_prob?: number
  wins?: number
  finals?: number
  semis?: number
}

export interface SimulationResponse {
  simulation_id: string
  results: TeamProbability[]
}

export interface SimulationRequest {
  teams: string[]
  n_runs: number
}

export interface IngestionStatus {
  status: string
  files: string[]
  timestamp: string
}

export interface ProcessingStatus {
  status: string
  records: number
  teams: number
  timestamp: string
}

export interface TrainingStatus {
  status: string
  model_run_id: string
  model_s3_path: string
  metrics: Record<string, number>
  timestamp: string
}

export interface ModelRunOut {
  id: string
  created_at: string
  model_s3_path: string
  status: string
  metrics?: Record<string, number>
  notes?: string
}

// ---------- Internal helpers ----------

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.ok) {
    return res.json() as Promise<T>
  }

  // Try to extract error message from JSON { detail: ... }
  let message = `API error: ${res.status} ${res.statusText}`
  try {
    const data = (await res.json()) as any
    if (data?.detail) {
      message = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail)
    }
  } catch {
    // ignore JSON parse error, keep default message
  }

  throw new Error(message)
}

async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${path}`

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    // Ensure we don't cache admin/simulation responses accidentally
    cache: "no-store",
  })

  return handleResponse<T>(res)
}

// ---------- Public API functions ----------

// ---- Public: Teams & Simulation ----

export async function getTeams(): Promise<string[]> {
  return apiFetch<string[]>("/teams", {
    method: "GET",
  })
}

export async function simulateTournament(
  payload: SimulationRequest
): Promise<SimulationResponse> {
  return apiFetch<SimulationResponse>("/simulate-tournament", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function getSimulation(id: string): Promise<SimulationResponse> {
  return apiFetch<SimulationResponse>(`/simulation/${id}`, {
    method: "GET",
  })
}

// ---- Admin: Pipeline ----

export async function ingestData(): Promise<IngestionStatus> {
  return apiFetch<IngestionStatus>("/admin/ingest-data", {
    method: "POST",
  })
}

export async function processData(): Promise<ProcessingStatus> {
  return apiFetch<ProcessingStatus>("/admin/process-data", {
    method: "POST",
  })
}

export async function trainModel(): Promise<TrainingStatus> {
  return apiFetch<TrainingStatus>("/admin/train-model", {
    method: "POST",
  })
}

// ---- Admin: Model registry ----

export async function listModelRuns(): Promise<ModelRunOut[]> {
  return apiFetch<ModelRunOut[]>("/admin/model-runs", {
    method: "GET",
  })
}

export async function getActiveModel(): Promise<ModelRunOut | null> {
  // Might return `null` from backend if no active model
  return apiFetch<ModelRunOut | null>("/admin/model/active", {
    method: "GET",
  })
}

export async function activateModelRun(
  modelRunId: string
): Promise<{ status: string; active_model_run_id: string }> {
  return apiFetch<{ status: string; active_model_run_id: string }>(
    `/admin/model-runs/${modelRunId}/activate`,
    {
      method: "POST",
    }
  )
}