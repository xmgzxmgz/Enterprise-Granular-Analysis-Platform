import { ref } from 'vue'
import { ElNotification } from 'element-plus'

export type NoticeType = 'success' | 'error' | 'info' | 'warning'
export type NoticeItem = { id: string; type: NoticeType; title: string; message?: string; time: number; context?: Record<string, any> }

export const notifications = ref<NoticeItem[]>([])

export function notify(type: NoticeType, title: string, message?: string, context?: Record<string, any>) {
  const item: NoticeItem = { id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`, type, title, message, time: Date.now(), context }
  notifications.value.unshift(item)
  ElNotification({ title, message, type, position: 'top-right', duration: 4000, showClose: true })
}

export const notifySuccess = (title: string, message?: string, context?: Record<string, any>) => notify('success', title, message, context)
export const notifyError = (title: string, message?: string, context?: Record<string, any>) => notify('error', title, message, context)
export const notifyInfo = (title: string, message?: string, context?: Record<string, any>) => notify('info', title, message, context)
export const notifyWarn = (title: string, message?: string, context?: Record<string, any>) => notify('warning', title, message, context)

export function clearNotifications() { notifications.value = [] }
