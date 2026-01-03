import React, { useEffect, useRef, useState } from 'react'
import { Keyboard } from 'lucide-react'

const keyboards = [
	{
		title: 'Zoom65 v2',
		desc: 'Premium 65% custom keyboard with smooth linear switches and stunning wave-inspired keycaps.',
		specs: ['Akko V3 Pro Yellow', 'Durock V2 Stabs', 'Kanagawa Keycaps (XVX)'],
		year: '2026',
		color: '#3b82f6'
	},
	{
		title: 'Magnum65',
		desc: 'Gasket-mount 65% build featuring ultra-smooth linear switches and premium stabilizers.',
		specs: ['Gateron Smoothie', 'Typeplus x YIKB Stabs', 'PBTfans Origami Keycaps'],
		year: '2025',
		color: '#ec4899'
	},
	{
		title: 'Dusk67',
		desc: 'Sleek wooden keyboard with a 67-key layout featuring boutique switches and top-tier stabilizers for a refined typing experience.',
		specs: ['Siliworks x Napworks Nap', 'Typeplus x YIKB Stabs', 'PBTfans Classic Keycaps'],
		year: '2025',
		color: '#a855f7'
	}
]



export default function Keyboards() {
	const [progress, setProgress] = useState(0)
	const sectionRef = useRef(null)
	const [inView, setInView] = useState(false)

	useEffect(() => {
		const handleScroll = () => {
			const el = sectionRef.current
			if (!el) return
			const rect = el.getBoundingClientRect()
			const vh = window.innerHeight
			const total = Math.max(rect.height - vh * 0.6, 1)
			const offset = Math.min(Math.max(vh * 0.5 - rect.top, 0), total)
			setProgress(offset / total)
		}

		handleScroll()
		window.addEventListener('scroll', handleScroll, { passive: true })
		window.addEventListener('resize', handleScroll)
		return () => {
			window.removeEventListener('scroll', handleScroll)
			window.removeEventListener('resize', handleScroll)
		}
	}, [])

	useEffect(() => {
		const el = sectionRef.current
		if (!el) return
		const obs = new IntersectionObserver(
			([entry]) => setInView(entry.isIntersecting),
			{ threshold: 0.2 }
		)
		obs.observe(el)
		return () => obs.disconnect()
	}, [])

	return (
		<section
			id="keyboards"
			className="py-4 sm:py-8 scroll-tell"
			ref={sectionRef}
			style={{ '--scroll-p': progress }}
			data-active={inView}
		>
			<div className="scroll-tell-shell">
				<div className="scroll-tell-stage">
					<div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
						<h2 className="text-3xl sm:text-4xl font-black" style={{
							backgroundImage: 'linear-gradient(135deg, rgb(var(--theme-primary)), rgba(var(--theme-primary), 0.6))',
							backgroundClip: 'text',
							WebkitBackgroundClip: 'text',
							WebkitTextFillColor: 'transparent',
						}}>
							Keyboards
						</h2>
						<div className="inline-flex items-center gap-2 px-3 py-2 smart-glass" style={{ borderRadius: '12px' }}>
							<Keyboard size={16} style={{ color: 'rgb(var(--theme-primary))' }} />
							<span className="text-xs font-black uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Custom Builds</span>
						</div>
					</div>

					<div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
						{keyboards.map((kb, idx) => {
							// Elastic spring easing
							const ease = (t) => {
								const c4 = (2 * Math.PI) / 3
								return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
							}
							
							const start = idx * 0.2
							const end = start + 0.5
							const rawT = Math.min(Math.max((progress - start) / Math.max(end - start, 0.0001), 0), 1)
							const t = ease(rawT)
							
							// Fan out from center
							const fanAngles = [-12, 0, 12]
							const rotate = fanAngles[idx % 3] * (1 - t)
							const translateY = 100 * (1 - t)
							const translateX = (idx - 1) * 40 * (1 - t)
							const scale = 0.75 + 0.25 * t
							const opacity = 0 + 1 * t

							return (
								<article
									key={kb.title}
									className="smart-glass p-6 sm:p-7 flex flex-col card-accent"
									style={{
										['--card-transform']: `translate(${translateX}px, ${translateY}px) scale(${scale}) rotate(${rotate}deg)`,
										opacity,
										transition: 'transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s ease-out',
										borderRadius: '18px',
										borderColor: `${kb.color}33`,
										background: 'var(--theme-card-bg)',
										backgroundImage: `linear-gradient(130deg, ${kb.color}18, ${kb.color}05 45%, transparent 70%)`,
										boxShadow: `0 12px 36px -18px ${kb.color}77`,
										['--card-shadow']: `${kb.color}99`,
										['--card-color']: kb.color,
										['--card-color-soft']: `${kb.color}22`
									}}
								>
									<div className="flex items-start justify-between mb-4">
										<div
											className="px-3 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
											style={{
												backgroundColor: `${kb.color}1a`,
												color: kb.color,
												boxShadow: `0 10px 28px -14px ${kb.color}99`
											}}
										>
											<span className="text-xs font-black whitespace-nowrap">{kb.year}</span>
										</div>
										<Keyboard size={20} style={{ color: kb.color, opacity: 0.7 }} />
									</div>

									<h3 className="text-xl font-black mb-2 text-[var(--theme-text-title)]" style={{ lineHeight: 1.2 }}>
										{kb.title}
									</h3>
									<p className="text-[var(--theme-text-muted)] mb-5 leading-relaxed">
										{kb.desc}
									</p>

									<div className="space-y-2 mt-auto">
										<div className="text-xs font-bold uppercase tracking-wider text-[var(--theme-text-muted)] mb-2">
											Specs
										</div>
										{kb.specs.map((spec) => (
											<div
												key={spec}
												className="text-xs font-semibold px-3 py-2 flex items-start gap-2"
												style={{
													backgroundColor: `${kb.color}08`,
													borderLeft: `2px solid ${kb.color}`,
													borderRadius: '6px',
													color: 'var(--theme-text-body)'
												}}
											>
												<span>•</span>
												<span>{spec}</span>
											</div>
										))}
									</div>
								</article>
							)
						})}
					</div>
				</div>
			</div>
		</section>
	)
}
