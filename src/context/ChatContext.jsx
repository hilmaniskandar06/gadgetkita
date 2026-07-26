import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import * as chatService from '../services/chatService'

const ChatContext = createContext()

export function ChatProvider({ children }) {
  const [chats, setChats] = useState([])
  const mountedRef = useRef(true)

  const refresh = useCallback(async () => {
    const list = await chatService.listChats()
    if (mountedRef.current) setChats(list)
  }, [])

  useEffect(() => {
    mountedRef.current = true
    refresh()
    const interval = setInterval(refresh, 4000)
    return () => {
      mountedRef.current = false
      clearInterval(interval)
    }
  }, [refresh])

  async function sendMessage(userId, userName, text, sender = 'user') {
    const currentChats = await chatService.listChats()
    let chatSession = currentChats.find(c => String(c.userId) === String(userId))

    const newMessage = {
      id: 'msg-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      sender,
      text,
      time: new Date().toISOString(),
      read: false,
    }

    if (chatSession) {
      chatSession.messages.push(newMessage)
      chatSession.lastUpdated = new Date().toISOString()
      if (sender === 'user') chatSession.userName = userName
    } else {
      chatSession = {
        id: 'chat-' + userId,
        userId,
        userName,
        lastUpdated: new Date().toISOString(),
        messages: [newMessage],
      }
    }

    const saved = await chatService.upsertChat(chatSession)
    await refresh()
    return saved
  }

  async function markAsRead(userId, reader = 'user') {
    const chat = await chatService.getChatByUserId(userId)
    if (!chat) return
    let changed = false
    chat.messages.forEach(m => {
      if (reader === 'user' && m.sender === 'admin' && !m.read) {
        m.read = true
        changed = true
      }
      if (reader === 'admin' && m.sender === 'user' && !m.read) {
        m.read = true
        changed = true
      }
    })
    if (changed) {
      chat.lastUpdated = new Date().toISOString()
      await chatService.upsertChat(chat)
      await refresh()
    }
  }

  function getUnreadCount(userId, role = 'user') {
    if (role === 'admin') {
      return chats.reduce((total, chat) => {
        return total + chat.messages.filter(m => m.sender === 'user' && !m.read).length
      }, 0)
    } else {
      const chatSession = chats.find(c => String(c.userId) === String(userId))
      if (!chatSession) return 0
      return chatSession.messages.filter(m => m.sender === 'admin' && !m.read).length
    }
  }

  return (
    <ChatContext.Provider value={{ chats, sendMessage, markAsRead, getUnreadCount, refresh }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  return useContext(ChatContext)
}
