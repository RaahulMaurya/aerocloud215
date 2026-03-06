'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, Loader, Minimize2, Trash2, Plus, LogOut, Crown, Sparkles, Lock } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface AIChatbotDialogProps {
  isOpen: boolean
  onClose: () => void
  onOpen: () => void
}

export function AIChatbotDialog({ isOpen, onClose, onOpen }: AIChatbotDialogProps) {
  const { userData } = useAuth()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isMinimized, setIsMinimized] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [showEndChatConfirm, setShowEndChatConfirm] = useState(false)

  const isPremium = userData?.subscriptionPlan === 'pro' || userData?.subscriptionPlan === 'enterprise'

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || !userData?.uid || !isPremium) return

    const userMessage = input.trim()
    setInput('')
    setError(null)
    setIsLoading(true)

    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }]
    setMessages(newMessages)

    try {
      const res = await fetch('/api/chat/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          userId: userData.uid,
          userContext: isPremium ? {
            displayName: userData?.displayName,
            email: userData?.email,
            subscriptionPlan: userData?.subscriptionPlan || 'pro',
            planExpiry: userData?.planExpiry,
            storageUsed: userData?.storageUsed,
            maxStorage: userData?.maxStorage
          } : undefined
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to get response')
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.text }])
    } catch (err: any) {
      console.error('Chat error:', err)
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewChat = () => {
    setMessages([])
    setError(null)
    setShowConfirmDelete(false)
  }

  const handleDeleteHistory = () => {
    setMessages([])
    setError(null)
    setShowConfirmDelete(false)
  }

  const handleEndChat = () => {
    setShowEndChatConfirm(false)
    onClose()
  }

  // Persistent Floating Icon when closed OR minimized
  if (!isOpen || isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => {
            if (isPremium) {
              if (isOpen) setIsMinimized(false)
              else onOpen()
            }
          }}
          disabled={!isPremium}
          className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${isPremium
            ? 'bg-gradient-to-br from-primary to-accent hover:shadow-primary/40 hover:scale-110 active:scale-95 cursor-pointer'
            : 'bg-gray-400 dark:bg-gray-700 cursor-not-allowed opacity-80'
            }`}
          title={isPremium ? "Open AI Assistant" : "AI Assistant (Locked)"}
        >
          {isPremium ? (
            <Sparkles size={24} className="text-white" />
          ) : (
            <div className="relative">
              <Sparkles size={24} className="text-white/50" />
              <div className="absolute -top-1 -right-1 bg-gray-500 rounded-full p-0.5 border border-gray-300">
                <Lock size={10} className="text-white" />
              </div>
            </div>
          )}
        </button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-slate-950/30 flex items-end z-50 sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl w-full sm:w-[420px] h-[92dvh] sm:h-[80dvh] sm:max-h-[650px] flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden">

        {/* Header */}
        <div className="relative p-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-indigo-50/50 via-white to-purple-50/50 dark:from-indigo-950/20 dark:via-slate-900 dark:to-purple-950/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-xl shadow-indigo-200 dark:shadow-none shadow-lg">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">CloudVault AI</h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`flex h-2 w-2 rounded-full ${isLoading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`} />
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                    {isLoading ? 'Processing' : 'System Ready'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {isPremium ? (
                <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide">
                  <Crown size={12} /> PRO
                </div>
              ) : (
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1 rounded-full text-[11px] font-bold">
                  FREE PLAN
                </div>
              )}
              <button onClick={() => setIsMinimized(true)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400">
                <Minimize2 size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
          <button onClick={() => setShowConfirmDelete(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-red-500 transition-colors">
            <Trash2 size={14} /> Clear
          </button>
          <button onClick={handleNewChat} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors">
            <Plus size={14} /> New Chat
          </button>
          <div className="flex-1" />
          <button onClick={() => setShowEndChatConfirm(true)} className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
            <LogOut size={16} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px]">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-6">
              <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-950/30 rounded-3xl flex items-center justify-center mb-6">
                <Sparkles size={40} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">How can I help today?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                I can help you analyze storage, find specific files, or give you organization tips for your CloudVault.
              </p>
              {!isPremium && (
                <div className="mt-8 p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm w-full">
                  <p className="text-amber-600 dark:text-amber-400 font-bold flex items-center justify-center gap-2 mb-2 text-sm">
                    <Crown size={16} /> UPGRADE REQUIRED
                  </p>
                  <p className="text-slate-500 text-xs mb-5 italic">AI Assistant is exclusive to our Pro and Enterprise partners.</p>
                  <button className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-indigo-200 dark:shadow-none">
                    View Pricing
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              {messages.map((message, idx) => (
                <div key={idx} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                  <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${message.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-none'
                    }`}>
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-3">
                    <Loader size={16} className="animate-spin text-indigo-500" />
                    <span className="text-sm text-slate-500 font-medium">Assistant is thinking...</span>
                  </div>
                </div>
              )}
              {error && (
                <div className="flex justify-start">
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 rounded-2xl rounded-tl-none text-sm text-red-600 dark:text-red-400 max-w-[85%]">
                    ⚠️ {error}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          <form onSubmit={handleSendMessage} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isPremium ? "Ask me anything..." : "Upgrade to Pro to chat"}
              disabled={isLoading || !isPremium}
              className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl pl-4 pr-12 py-3.5 text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim() || !isPremium}
              className="absolute right-2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all disabled:bg-slate-300 dark:disabled:bg-slate-700 shadow-md shadow-indigo-100 dark:shadow-none"
            >
              <Send size={18} />
            </button>
          </form>
          <p className="text-[10px] text-center text-slate-400 mt-3 font-medium uppercase tracking-widest">
            Powered by CloudVault AI Engine
          </p>
        </div>

        {/* Modals */}
        {(showConfirmDelete || showEndChatConfirm) && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-6 text-center">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl w-full max-w-xs border border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold mb-2">Are you sure?</h3>
              <p className="text-sm text-slate-500 mb-6">This action cannot be undone.</p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={showConfirmDelete ? handleDeleteHistory : handleEndChat}
                  className="w-full py-2.5 bg-red-500 text-white text-sm font-bold rounded-xl"
                >
                  Confirm
                </button>
                <button
                  onClick={() => { setShowConfirmDelete(false); setShowEndChatConfirm(false) }}
                  className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-sm font-bold rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}