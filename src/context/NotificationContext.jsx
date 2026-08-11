import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import * as notificationService from '../services/notificationService'

const NotificationContext = createContext({})

export function useNotifications() {
  return useContext(NotificationContext)
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])

  const refresh = useCallback(async () => {
    const list = await notificationService.listAllNotifications()
    setNotifications(list)
  }, [])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 8000)
    return () => clearInterval(interval)
  }, [refresh])

  async function addNotification(userId, title, message, link = null) {
    const created = await notificationService.addNotification(userId, title, message, link)
    await refresh()
    return created
  }

  async function markSingleAsRead(id, userId) {
    const updated = await notificationService.markAsRead(id, userId)
    await refresh()
    return updated
  }

  async function markAllAsRead(userId) {
    await notificationService.markAllAsReadForUser(userId)
    await refresh()
  }

  function markAsRead(id) {
    return markSingleAsRead(id, null)
  }

  function getUserNotifications(userId) {
    return notifications
      .filter(n => String(n.userId) === String(userId) || String(n.userId) === 'ALL')
      .map(n => {
        if (String(n.userId) === 'ALL') {
          return { ...n, isRead: (n.readBy || []).includes(String(userId)) }
        }
        return n
      })
  }

  function getAllNotifications() {
    return notifications
  }

  async function deleteNotification(id) {
    await notificationService.deleteNotification(id)
    await refresh()
  }

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      markAsRead,
      markSingleAsRead,
      markAllAsRead,
      getUserNotifications,
      getAllNotifications,
      deleteNotification,
      refresh,
    }}>
      {children}
    </NotificationContext.Provider>
  )
}
