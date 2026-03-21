import { motion } from 'framer-motion'
import { useMemo } from 'react'

export default function Particles({ count = 20 }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2.5 + 0.5,
        duration: Math.random() * 6 + 5,
        delay: Math.random() * 5,
        driftX: (Math.random() - 0.5) * 25,
        driftY: -(Math.random() * 35 + 8),
      })),
    [count]
  )

  return (
    <div className="fixed inset-0 z-[2] pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            backgroundColor: `rgba(var(--particle-color), 0.25)`,
          }}
          initial={{ opacity: 0.15 }}
          animate={{
            y: [0, p.driftY, 0],
            x: [0, p.driftX, 0],
            opacity: [0.1, 0.4, 0.1],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}
