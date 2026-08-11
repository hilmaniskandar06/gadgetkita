import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'
import { useChat } from '../context/ChatContext'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [text, setText] = useState('')
  const { chats, sendMessage, markAsRead, getUnreadCount } = useChat()
  const { user } = useAuth()
  const scrollRef = useRef(null)

  // Avoid showing widget for admin (admins have their own chat UI)
  if (user?.role === 'admin') return null

  const unreadCount = user ? getUnreadCount(user.id, 'user') : 0
  const myChat = user ? chats.find(c => c.userId === user.id) : null
  const messages = myChat?.messages || []

  // Auto scroll to bottom when messages change or window opens
  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [isOpen, messages.length])

  // Mark as read when opened
  useEffect(() => {
    if (isOpen && user && unreadCount > 0) {
      markAsRead(user.id, 'user')
    }
  }, [isOpen, user, unreadCount, markAsRead])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!text.trim() || !user) return
    sendMessage(user.id, user.name, text, 'user')
    setText('')
  }

  return (
    <div className="fixed bottom-24 right-5 z-30 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white w-[calc(100vw-2.5rem)] sm:w-96 max-w-full rounded-2xl shadow-2xl border border-gray-200 mb-4 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 max-h-[calc(100vh-8rem)] sm:max-h-[calc(100vh-6rem)]">
          {/* Header */}
          <div className="bg-lime-500 text-white p-3 sm:p-4 flex items-center justify-between shadow-sm shrink-0">
            <div className="flex items-center gap-2">
              <MessageCircle size={20} className="fill-white/20" />
              <h3 className="font-bold">Chat dengan Admin</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-lime-600 p-1.5 rounded-full transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 min-h-[280px] sm:min-h-[320px] max-h-[calc(100vh-14rem)] sm:max-h-[calc(100vh-12rem)] p-3 sm:p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="m-auto text-center text-slate-500 text-sm">
                Belum ada pesan.<br />Ada pertanyaan tentang produk?
              </div>
            ) : (
              messages.map((m) => {
                const isUser = m.sender === 'user'
                return (
                  <div key={m.id} className={`flex flex-col max-w-[85%] ${isUser ? 'self-end items-end' : 'self-start items-start'}`}>
                    <div className={`p-3 rounded-2xl text-sm ${isUser ? 'bg-lime-500 text-white rounded-tr-sm' : 'bg-white border border-gray-200 text-slate-900 rounded-tl-sm shadow-sm'}`}>
                      {m.text}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 px-1">
                      {new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-white border-t border-gray-100">
            {user ? (
              <form onSubmit={handleSubmit} className="flex gap-2 relative">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Ketik pesan Anda..."
                  className="w-full bg-gray-50 border border-transparent rounded-full pl-4 pr-12 py-2.5 text-sm outline-none focus:bg-white focus:border-lime-500 transition-colors"
                />
                <button 
                  type="submit" 
                  disabled={!text.trim()}
                  className="absolute right-1 top-1 w-9 h-9 flex items-center justify-center bg-lime-500 text-white rounded-full hover:bg-lime-600 disabled:opacity-50 disabled:hover:bg-lime-500 transition-colors"
                >
                  <Send size={16} className="-ml-0.5" />
                </button>
              </form>
            ) : (
              <div className="text-center text-sm text-slate-500 py-2">
                Silakan <Link to="/login" className="text-lime-600 font-bold hover:underline">Login</Link> untuk memulai obrolan.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-lime-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-lime-600 hover:scale-105 transition-all relative"
      >
        {isOpen ? <X size={26} /> : <MessageCircle size={26} />}
        
        {/* Unread Badge */}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white text-xs font-bold border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  )
}
