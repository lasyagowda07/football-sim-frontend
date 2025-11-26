// ---- Simulation types ----

export type SimulationRequest = {
    teams: string[]
    n_runs: number
  }
  
  export type TeamProbability = {
    team: string
    win_prob: number
    final_prob?: number
    semi_prob?: number
    wins?: number
    finals?: number
    semis?: number
  }
  
  export type SimulationResponse = {
    simulation_id: string
    results: TeamProbability[]
  }
  
  // ---- Admin / pipeline status types ----
  
  export type IngestionStatus = {
    status: string
    files: string[]
    timestamp: string
  }
  
  export type ProcessingStatus = {
    status: string
    records: number
    teams: number
    timestamp: string
  }
  
  export type TrainingStatus = {
    status: string
    model_run_id: string
    model_s3_path: string
    metrics: Record<string, number>
    timestamp: string
  }
  
  // ---- Model registry types ----
  
  export type ModelRunOut = {
    id: string
    created_at: string
    model_s3_path: string
    status: string
    metrics?: Record<string, number>
    notes?: string
  }