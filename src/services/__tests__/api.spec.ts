import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ping, search } from '@/services/api'

// Mock fetch globally
const fetchMock = vi.fn()
vi.stubGlobal('fetch', fetchMock)

describe('API Service', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('ping should return status', async () => {
    const mockResponse = { status: 'ok' }
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    })

    const res = await ping()
    expect(res).toEqual(mockResponse)
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/health'), undefined)
  })

  it('search should encode query', async () => {
    const mockResponse = { rows: [] }
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    })

    await search('test company')
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('q=test%20company'), undefined)
  })

  it('should throw error on non-ok response', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500
    })

    await expect(ping()).rejects.toThrow('HTTP 500')
  })
})
