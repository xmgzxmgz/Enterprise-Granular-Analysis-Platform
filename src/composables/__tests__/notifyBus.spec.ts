import { describe, it, expect, beforeEach, vi } from 'vitest'
import { notify, notifications, clearNotifications } from '@/composables/notifyBus'
import { ElNotification } from 'element-plus'

// Mock Element Plus notification
vi.mock('element-plus', () => ({
  ElNotification: vi.fn(),
}))

describe('NotifyBus', () => {
  beforeEach(() => {
    clearNotifications()
    vi.clearAllMocks()
  })

  it('should add notification to list', () => {
    notify('success', 'Test Title', 'Test Message')
    expect(notifications.value).toHaveLength(1)
    expect(notifications.value[0]).toMatchObject({
      type: 'success',
      title: 'Test Title',
      message: 'Test Message',
    })
  })

  it('should call ElNotification', () => {
    notify('error', 'Error Title')
    expect(ElNotification).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Error Title',
      type: 'error',
    }))
  })

  it('should clear notifications', () => {
    notify('info', 'Info')
    clearNotifications()
    expect(notifications.value).toHaveLength(0)
  })
})
