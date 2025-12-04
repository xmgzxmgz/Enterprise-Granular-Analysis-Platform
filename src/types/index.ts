export interface EnterpriseRow {
  name: string
  category: string
  region: string
  risk: string
  origin?: 'existing' | 'model'
  isNew?: boolean
  tags?: string[]
  manualTags?: string[]
  modelTags?: string[]
  tagsManual?: string[]
  tagsModel?: string[]
}

export interface TagItem {
  name: string
  desc?: string
  color: 'grey' | 'blue'
  source: 'manual' | 'model' | 'mixed'
  creator?: string
  createdAt?: number
  createdAtText?: string
}

export interface ApiResponse<T> {
  rows: T[]
  total?: number
}

export interface ModelPressure {
  cpu?: number
  memory?: number
  latency?: number
  qps?: number[]
  time?: number[]
}

export interface ModelTraining {
  progress?: number
  epoch?: number
  loss?: number | number[]
  auc?: number[]
}
