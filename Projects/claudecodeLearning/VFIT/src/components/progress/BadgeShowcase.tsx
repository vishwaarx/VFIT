import { Card } from '@/components/ui/Card'
import { Award } from 'lucide-react'
import { useBadges } from '@/hooks/useBadges'

export function BadgeShowcase() {
  const { allBadges, loading } = useBadges()

  return (
    <Card>
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
          <Award size={16} className="text-accent" />
        </div>
        <h3 className="font-bold font-[family-name:var(--font-display)] tracking-tight text-base">Achievements</h3>
        <span className="ml-auto text-xs font-bold text-accent bg-accent-soft px-2.5 py-0.5 rounded-full">
          {allBadges.filter((b) => b.earned).length}/{allBadges.length}
        </span>
      </div>

      {loading ? (
        <div className="py-6 text-center"><p className="text-text-muted text-sm">Loading...</p></div>
      ) : (
        <div className="grid grid-cols-4 gap-2.5">
          {allBadges.map((badge) => (
            <div
              key={badge.key}
              className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all duration-200 border ${
                badge.earned ? 'bg-card border-border' : 'opacity-40 grayscale border-transparent'
              }`}
              title={badge.description}
            >
              <span className="text-2xl">{badge.icon}</span>
              <span className="text-[10px] text-text-secondary text-center leading-tight font-medium">{badge.name}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
