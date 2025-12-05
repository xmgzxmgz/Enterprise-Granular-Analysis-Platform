import { ApiResponse, EnterpriseRow, ModelPressure, ModelTraining, TagItem } from '@/types'

const base = (import.meta as any).env?.VITE_API_BASE_URL || '/api'

/**
 * Unified request handler wrapping fetch.
 * @param path API path
 * @param init Request init options
 */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(base + path, init)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

/**
 * Health check.
 */
export async function ping() {
  return request<{ status: string }>('/health')
}

/**
 * Search enterprises by keyword.
 * @param q Search query
 */
export async function search(q: string) {
  return request<ApiResponse<EnterpriseRow>>(`/search?q=${encodeURIComponent(q)}`)
}

/**
 * Retrieve tag list, optionally filtered.
 * @param query Optional search query for tags
 */
export async function getTags(query?: string) {
  const url = query ? `/tags?query=${encodeURIComponent(query)}` : '/tags'
  return request<ApiResponse<TagItem>>(url)
}

/**
 * Get tag distribution statistics.
 */
export async function getTagDistribution() {
  return request<Record<string, number>>('/tags/distribution')
}

/**
 * Get basic info list.
 * @param category Optional category filter
 */
export async function getEnterpriseBasicInfo(category?: string) {
  const url = category
    ? `/enterprise/basic-info?category=${encodeURIComponent(category)}`
    : '/enterprise/basic-info'
  return request<ApiResponse<EnterpriseRow>>(url)
}

/**
 * Get model pressure metrics.
 */
export async function getModelPressure() {
  return request<ModelPressure>('/modeling/pressure')
}

/**
 * Get model training progress/stats.
 */
export async function getModelTraining() {
  return request<ModelTraining>('/modeling/training')
}

/**
 * Update tags for an enterprise.
 * @param payload Tag update payload
 */
export async function updateEnterpriseTags(payload: {
  name: string
  tags: string[]
  source?: 'manual' | 'model'
}) {
  return request<void>('/enterprise/tags', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
}

/**
 * Get policy list.
 */
export async function getPolicies(
  params?: Record<string, string | number | boolean | null | undefined>
) {
  const qs = new URLSearchParams()
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).length) qs.append(k, String(v))
  })
  const suffix = qs.toString() ? `?${qs.toString()}` : ''
  return request<any>(`/policies${suffix}`)
}

/**
 * Get model preparation data.
 */
export async function getModelPrepData() {
  return request<any>('/modeling/prep')
}

/**
 * Search detailed enterprise data with pagination.
 * @param params Query parameters
 */
export async function getDualUseItems(params?: { page?: number; size?: number; q?: string }) {
  const qs = new URLSearchParams()
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).length) qs.append(k, String(v))
  })
  const suffix = qs.toString() ? `?${qs.toString()}` : ''
  return request<any>(`/dual_use_items${suffix}`)
}

export async function getDualUseItemsAll(q?: string) {
  const suffix = q && String(q).length ? `?q=${encodeURIComponent(String(q))}` : ''
  return request<any>(`/dual_use_items/all${suffix}`)
}

export async function createTuningModel(payload: {
  name: string
  creator: string
  createdAt: number
}) {
  return request<any>('/tuning/models', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
}

export async function renameTuningModel(idOrName: string, payload: { name: string }) {
  return request<void>(`/tuning/models/${encodeURIComponent(idOrName)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
}

export async function deleteTuningModel(idOrName: string) {
  return request<void>(`/tuning/models/${encodeURIComponent(idOrName)}`, {
    method: 'DELETE'
  })
}
