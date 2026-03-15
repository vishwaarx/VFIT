import { Bot } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'

interface ChatBubbleProps {
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export function ChatBubble({ role, content, createdAt }: ChatBubbleProps) {
  const isUser = role === 'user'

  return (
    <div className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="bg-accent w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
          <Bot size={18} className="text-white" />
        </div>
      )}
      <div className={`max-w-[80%] ${isUser ? 'order-first' : ''}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-base leading-relaxed whitespace-pre-wrap ${
            isUser
              ? 'bg-accent text-white rounded-br-md'
              : 'bg-card border border-border rounded-bl-md'
          }`}
        >
          {content}
        </div>
        <p className={`text-[10px] text-text-muted mt-1.5 ${isUser ? 'text-right' : 'text-left'}`}>
          {formatRelativeTime(createdAt)}
        </p>
      </div>
    </div>
  )
}
