import React from 'react'
import { Keyboard } from 'lucide-react'

const keyboards = [
	{
		title: 'Zoom65 v2',
		desc: 'Premium 65% custom keyboard with smooth linear switches and stunning wave-inspired keycaps.',
		specs: ['Akko V3 Pro Yellow', 'Durock V2 Stabs', 'Kanagawa Keycaps (XVX)'],
		year: '2024',
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
	return (
		<section id="keyboards" className="py-4 sm:py-8 scroll-tell">
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
				{keyboards.map((kb, idx) => (
					<article
						key={kb.title}
						className="smart-glass p-6 sm:p-7 flex flex-col"
						style={{
							animation: `fadeInUp 0.6s ease-out ${0.02 + idx * 0.04}s backwards`,
							borderRadius: '18px',
							borderColor: `${kb.color}33`
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
				))}
			</div>
				</div>
			</div>
			</section>
	)
}
