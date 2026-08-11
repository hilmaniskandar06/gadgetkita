import { useState, useRef, useEffect } from 'react'
import AdminShell from './AdminShell'
import { useChat } from '../context/ChatContext'
import { Send, User } from 'lucide-react'

export default function AdminChats() {
  const { chats, sendMessage, markAsRead } = useChat()
  const [activeUserId, setActiveUserId] = useState(null)
  const [text, setText] = useState('')
  const scrollRef = useRef(null)

  // Sort chats by most recent first
  const sortedChats = [...chats].sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
  const activeChat = chats.find(c => c.userId === activeUserId)

  useEffect(() => {
    if (activeUserId && activeChat) {
      markAsRead(activeUserId, 'admin')
    }
  }, [activeUserId, activeChat, markAsRead])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [activeChat?.messages.length])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!text.trim() || !activeUserId || !activeChat) return
    sendMessage(activeUserId, activeChat.userName, text, 'admin')
    setText('')
  }

  return (
    <AdminShell title="Kelola Chat">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex overflow-hidden h-[600px]">
        
        {/* Sidebar */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col bg-white">
          <div className="p-4 border-b border-gray-200 font-bold text-slate-900">
            Daftar Obrolan
          </div>
          <div className="flex-1 overflow-y-auto">
            {sortedChats.length === 0 ? (
              <div className="p-5 text-center text-slate-500 text-sm">Belum ada chat.</div>
            ) : (
              sortedChats.map(chat => {
                const unread = chat.messages.filter(m => m.sender === 'user' && !m.read).length
                const lastMsg = chat.messages[chat.messages.length - 1]
                const isActive = activeUserId === chat.userId

                return (
                  <button 
                    key={chat.id}
                    onClick={() => setActiveUserId(chat.userId)}
                    className={`w-full text-left p-4 border-b border-gray-100 transition-colors flex items-start gap-3 hover:bg-gray-50 ${isActive ? 'bg-gray-100' : ''}`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                      <User size={20} className="text-slate-500" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-900 truncate pr-2">{chat.userName || 'Pelanggan'}</span>
                        {unread > 0 && (
                          <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                            {unread} Baru
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate">{lastMsg?.text}</p>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="w-2/3 flex flex-col bg-gray-50 relative">
          {activeChat ? (
            <>
              {/* Header */}
              <div className="p-4 bg-white border-b border-gray-200 font-bold text-slate-900 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <User size={16} className="text-slate-600" />
                </div>
                {activeChat.userName || 'Pelanggan'}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4" ref={scrollRef}>
                {activeChat.messages.map(m => {
                  const isAdmin = m.sender === 'admin'
                  return (
                    <div key={m.id} className={`flex flex-col max-w-[70%] ${isAdmin ? 'self-end items-end' : 'self-start items-start'}`}>
                      <div className={`p-3 rounded-2xl text-sm ${isAdmin ? 'bg-lime-500 text-white rounded-tr-sm' : 'bg-white border border-gray-200 text-slate-900 rounded-tl-sm shadow-sm'}`}>
                        {m.text}
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 px-1">
                        {new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Input */}
              <div className="p-4 bg-white border-t border-gray-200">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Tulis balasan untuk pelanggan..."
                    className="flex-1 bg-gray-50 border border-transparent rounded-lg px-4 py-2.5 outline-none focus:bg-white focus:border-lime-500 transition-colors"
                  />
                  <button 
                    type="submit"
                    disabled={!text.trim()}
                    className="px-5 bg-lime-500 text-white rounded-lg hover:bg-lime-600 disabled:opacity-50 transition-colors flex items-center justify-center"
                  >
                    <Send size={18} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="m-auto text-slate-500 flex flex-col items-center">
              <User size={48} className="mb-4 opacity-20" />
              <p>Pilih pelanggan di samping untuk mulai membalas chat.</p>
            </div>
          )}
        </div>

      </div>
    </AdminShell>
  )
}
