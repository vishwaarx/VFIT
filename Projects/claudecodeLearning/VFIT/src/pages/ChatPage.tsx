import { useRef, useEffect, useState, useCallback } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { ChatBubble } from '@/components/chat/ChatBubble'
import { ChatInput } from '@/components/chat/ChatInput'
import { WeightCheckinInline } from '@/components/chat/WeightCheckinInline'
import { PhotoCheckinInline } from '@/components/chat/PhotoCheckinInline'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { useChat } from '@/hooks/useChat'
import { Scale, Camera, Circle } from 'lucide-react'

export function ChatPage() {
  const { messages, loading, sending, error, sendMessage, triggerPostWorkoutReview, triggerWeightCheckin } = useChat()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showWeightCheckin, setShowWeightCheckin] = useState(false)
  const [showPhotoCheckin, setShowPhotoCheckin] = useState(false)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, sending])

  useEffect(() => {
    if (loading) return
    const pendingSessionId = sessionStorage.getItem('vfit_pending_review')
    if (pendingSessionId) {
      sessionStorage.removeItem('vfit_pending_review')
      triggerPostWorkoutReview(pendingSessionId)
    }
  }, [loading, triggerPostWorkoutReview])

  const handleWeightSubmit = useCallback(async (weight: number, unit: string) => {
    setShowWeightCheckin(false)
    await triggerWeightCheckin(weight, unit)
  }, [triggerWeightCheckin])

  const handlePhotoComplete = useCallback(async (count: number) => {
    setShowPhotoCheckin(false)
    await sendMessage(`I just uploaded ${count} check-in photo${count > 1 ? 's' : ''}.`)
  }, [sendMessage])

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      <PageHeader
        title="AI Coach"
        action={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-[#32D74B] rounded-[20px] px-3 py-1.5">
              <Circle size={6} fill="white" className="text-white" />
              <span className="text-[11px] font-bold text-white">Online</span>
            </div>
            <button
              onClick={() => setShowWeightCheckin((v) => !v)}
              className="w-10 h-10 rounded-xl glass flex items-center justify-center hover:bg-card-hover transition-colors duration-200 cursor-pointer"
              title="Log weight"
            >
              <Scale size={16} className="text-text-secondary" />
            </button>
            <button
              onClick={() => setShowPhotoCheckin((v) => !v)}
              className="w-10 h-10 rounded-xl glass flex items-center justify-center hover:bg-card-hover transition-colors duration-200 cursor-pointer"
              title="Photo check-in"
            >
              <Camera size={16} className="text-text-secondary" />
            </button>
          </div>
        }
      />

      {/* Chat Messages Area */}
      <div ref={scrollRef} className="flex-1 px-5 py-4 overflow-y-auto flex flex-col gap-4">
        {loading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : (
          <>
            {messages.length === 0 && (
              <ChatBubble
                role="assistant"
                content="Hey! I'm your VFIT coach. I'm here to help you stay on track with your fitness goals. Ask me anything about training, nutrition, or just chat about your progress!"
                createdAt={new Date().toISOString()}
              />
            )}

            {messages.map((msg) => (
              <ChatBubble
                key={msg.id}
                role={msg.role}
                content={msg.content}
                createdAt={msg.created_at}
              />
            ))}

            {showWeightCheckin && (
              <WeightCheckinInline onSubmit={handleWeightSubmit} disabled={sending} />
            )}

            {showPhotoCheckin && (
              <PhotoCheckinInline onComplete={handlePhotoComplete} disabled={sending} />
            )}

            {/* Typing indicator */}
            {sending && (
              <div className="flex gap-2.5 items-center">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center shadow-md shadow-accent/15">
                  <span className="text-xs font-bold text-white">V</span>
                </div>
                <div className="glass rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mx-auto p-3 bg-error-muted border border-error/20 rounded-xl max-w-[80%]">
                <p className="text-sm text-error text-center">{error}</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Quick prompts */}
      {messages.length === 0 && !loading && (
        <div className="px-5 pb-2 flex gap-2 overflow-x-auto">
          {[
            'How much protein do I need?',
            'Review my progress this week',
            "What should I focus on today?",
          ].map((prompt) => (
            <Button
              key={prompt}
              variant="secondary"
              size="sm"
              className="whitespace-nowrap text-xs !rounded-xl"
              onClick={() => sendMessage(prompt)}
              disabled={sending}
            >
              {prompt}
            </Button>
          ))}
        </div>
      )}

      <ChatInput onSend={sendMessage} disabled={sending} />
    </div>
  )
}
