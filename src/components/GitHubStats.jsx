import React from 'react'
import { GitBranch, Star, GitFork, TrendingUp } from 'lucide-react'

export default function GitHubStats() {
  const stats = [
    { icon: GitBranch, label: 'Repositories', value: '15+', color: '#10b981' },
    { icon: Star, label: 'Stars Earned', value: '50+', color: '#fbbf24' },
    { icon: GitFork, label: 'Contributions', value: '500+', color: '#3b82f6' },
    { icon: TrendingUp, label: 'Active Projects', value: '3', color: '#ec4899' },
  ]

  return (
    <section className="py-12 sm:py-16">
      <div
        className="smart-glass p-8 sm:p-12 anim-soft-card"
        style={{ borderRadius: '20px' }}
      >
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <h2 className="text-3xl sm:text-4xl font-black" style={{
            backgroundImage: 'linear-gradient(135deg, rgb(var(--theme-primary)), rgba(var(--theme-primary), 0.6))',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            GitHub Activity
          </h2>
          <a
            href="https://github.com/Mysz0"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 smart-glass font-semibold text-sm transition-all hover:scale-105"
            style={{
              color: 'rgb(var(--theme-primary))',
              borderRadius: '12px',
            }}
          >
            View Profile →
          </a>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="p-5 rounded-xl smart-glass card-accent group"
                style={{
                  ['--card-color']: stat.color,
                  ['--card-color-soft']: `${stat.color}22`,
                  ['--card-shadow']: `${stat.color}99`,
                  background: `linear-gradient(135deg, ${stat.color}08, transparent)`,
                  borderColor: `${stat.color}33`,
                  animation: `fadeInUp 0.6s ease-out ${idx * 0.1}s both`,
                }}
              >
                <div
                  className="mb-3 inline-flex p-3 rounded-lg"
                  style={{
                    backgroundColor: `${stat.color}15`,
                  }}
                >
                  <Icon size={24} style={{ color: stat.color }} />
                </div>
                <div className="text-3xl font-black mb-1 text-[var(--theme-text-title)]">
                  {stat.value}
                </div>
                <div className="text-sm font-semibold text-[var(--theme-text-muted)]">
                  {stat.label}
                </div>
              </div>
            )
          })}
        </div>

        {/* GitHub Contribution Graph Placeholder */}
        <div className="mt-8 p-6 rounded-xl" style={{
          backgroundColor: 'rgba(var(--theme-primary), 0.05)',
          border: '1px solid rgba(var(--theme-primary), 0.1)',
        }}>
          <h3 className="text-lg font-bold mb-4 text-[var(--theme-text-title)]">Contribution Activity</h3>
          <div className="grid grid-cols-52 gap-1">
            {Array.from({ length: 364 }).map((_, i) => {
              const intensity = Math.random()
              const opacity = intensity > 0.7 ? 1 : intensity > 0.4 ? 0.6 : intensity > 0.2 ? 0.3 : 0.1
              return (
                <div
                  key={i}
                  className="w-2 h-2 rounded-sm transition-all duration-300 hover:scale-150"
                  style={{
                    backgroundColor: `rgba(16, 185, 129, ${opacity})`,
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                  }}
                  title={`Day ${i + 1}`}
                />
              )
            })}
          </div>
          <div className="flex items-center justify-end gap-2 mt-4 text-xs text-[var(--theme-text-muted)]">
            <span>Less</span>
            <div className="flex gap-1">
              {[0.1, 0.3, 0.6, 1].map((opacity, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: `rgba(16, 185, 129, ${opacity})` }}
                />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
    </section>
  )
}
