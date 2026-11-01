import * as THREE from 'three'

/* ── Print shop for the CD shelf ──────────────────────────
   Covers, spines, booklets and disc prints, drawn on 2D
   canvases and handed to three.js as textures. Covers are real
   art (app icons, a screenshot of this site) or, for the two
   web tools, a cover set in that site's own type and look.   */

const ACCENT = '#B7372E'
const TEXT = '#EDE8DF'
const BODY = '#C4BFB4'
const MUTED = '#9E998F'

const loadImage = (src) =>
  new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })

function makeCanvas(w, h) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return [c, c.getContext('2d')]
}

function toTexture(c) {
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
}

// Draws an image centred at `scale` of the square, or cropped to fill it
function drawArt(ctx, img, S, scale = 1) {
  if (!img) return
  if (scale === 1) {
    const s = Math.max(S / img.width, S / img.height)
    ctx.drawImage(img, (S - img.width * s) / 2, (S - img.height * s) / 2, img.width * s, img.height * s)
  } else {
    const w = S * scale
    ctx.drawImage(img, (S - w) / 2, (S - w) / 2, w, w)
  }
}

function wrap(ctx, text, maxWidth) {
  const lines = []
  let line = ''
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else line = next
  }
  if (line) lines.push(line)
  return lines
}

/* ── Custom covers ── */

// tools.hyruki.cc: black, monospace, and the "/" key that opens search
function coverDeveloperCore(ctx, S) {
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, S, S)
  ctx.fillStyle = '#fff'
  ctx.font = '700 88px "JetBrains Mono", monospace'
  ctx.fillText('hyruki tools', 76, 168)
  ctx.fillStyle = '#6d6d6d'
  ctx.font = '400 25px "JetBrains Mono", monospace'
  ctx.fillText('browser utilities. no data leaves your device.', 78, 214)

  // The keycap
  const k = 270
  const kx = (S - k) / 2
  const ky = 330
  ctx.fillStyle = '#0d0d0d'
  roundRect(ctx, kx, ky, k, k, 34)
  ctx.fill()
  ctx.strokeStyle = '#2b2b2b'
  ctx.lineWidth = 4
  ctx.stroke()
  ctx.fillStyle = '#161616'
  roundRect(ctx, kx + 26, ky + 20, k - 52, k - 62, 22)
  ctx.fill()
  ctx.fillStyle = '#f2f2f2'
  ctx.font = '400 150px "JetBrains Mono", monospace'
  ctx.textAlign = 'center'
  ctx.fillText('/', S / 2, ky + 168)
  ctx.fillStyle = '#7a7a7a'
  ctx.font = '400 30px "JetBrains Mono", monospace'
  ctx.fillText('search', S / 2, ky + k + 62)

  // The tools, as a track list
  const tools = ['palette', 'password', 'qr code', 'colour', 'json', 'diff', 'markdown', 'units', 'lorem', 'timer', 'stack']
  ctx.textAlign = 'left'
  ctx.font = '400 22px "JetBrains Mono", monospace'
  tools.forEach((t, i) => {
    const col = i % 4
    const row = Math.floor(i / 4)
    ctx.fillStyle = '#4a4a4a'
    ctx.fillText(String(i + 1).padStart(2, '0'), 78 + col * 222, 812 + row * 44)
    ctx.fillStyle = '#9a9a9a'
    ctx.fillText(t, 122 + col * 222, 812 + row * 44)
  })
}

// tech.hyruki.cc: dotted night grid, a bold serif title, the stack itself
function coverStackConfig(ctx, S) {
  const g = ctx.createLinearGradient(0, 0, 0, S)
  g.addColorStop(0, '#08090f')
  g.addColorStop(1, '#0b0b12')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, S, S)
  const glow = (x, y, r, c) => {
    const rg = ctx.createRadialGradient(x, y, 0, x, y, r)
    rg.addColorStop(0, c)
    rg.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = rg
    ctx.fillRect(0, 0, S, S)
  }
  glow(160, 180, 520, 'rgba(40,62,150,0.35)')
  glow(900, 880, 560, 'rgba(96,40,130,0.28)')
  ctx.fillStyle = 'rgba(255,255,255,0.07)'
  for (let y = 16; y < S; y += 32) for (let x = 16; x < S; x += 32) ctx.fillRect(x, y, 2, 2)

  ctx.textAlign = 'center'
  ctx.fillStyle = '#ecebf0'
  ctx.font = '700 104px "Playfair Display", Georgia, serif'
  ctx.fillText('Tech Stack', S / 2, 196)
  ctx.fillText('Architect', S / 2, 300)
  ctx.fillStyle = '#8b8b96'
  ctx.font = '400 24px Sora, system-ui, sans-serif'
  ctx.fillText('Select your technologies. Get the commands. Ship it.', S / 2, 356, S - 120)

  // Four layers, seen from above at an angle
  const layers = ['BACKEND', 'STYLING', 'FRONTEND', 'RUNTIME']
  const cx = S / 2
  const w = 330
  const h = 150
  layers.forEach((label, i) => {
    const y = 860 - i * 100
    ctx.beginPath()
    ctx.moveTo(cx, y - h / 2)
    ctx.lineTo(cx + w, y)
    ctx.lineTo(cx, y + h / 2)
    ctx.lineTo(cx - w, y)
    ctx.closePath()
    ctx.fillStyle = i === 3 ? '#1b1c27' : '#12131b'
    ctx.fill()
    ctx.strokeStyle = i === 3 ? 'rgba(255,255,255,0.32)' : 'rgba(255,255,255,0.14)'
    ctx.lineWidth = 3
    ctx.stroke()
    ctx.fillStyle = i === 3 ? '#d8d8e2' : '#6f7080'
    ctx.font = '600 26px Sora, system-ui, sans-serif'
    ctx.fillText(label, cx, y + 8)
  })
  ctx.textAlign = 'left'
}

const CUSTOM = { developerCore: coverDeveloperCore, stackConfig: coverStackConfig }

/* ── Builders ── */

function buildCover(p, img) {
  const S = 1024
  const [c, ctx] = makeCanvas(S, S)
  if (p.cover.draw) {
    CUSTOM[p.cover.draw](ctx, S)
  } else {
    ctx.fillStyle = p.cover.bg ?? '#000'
    ctx.fillRect(0, 0, S, S)
    drawArt(ctx, img, S, p.cover.scale ?? 1)
  }
  return c
}

// The inner page you see once the lid is open: title and the tracks
function buildBooklet(p) {
  const S = 1024
  const [c, ctx] = makeCanvas(S, S)
  ctx.fillStyle = '#1a1917'
  ctx.fillRect(0, 0, S, S)
  ctx.fillStyle = TEXT
  ctx.font = 'italic 400 92px "Cormorant Garamond", Georgia, serif'
  ctx.fillText(p.title, 84, 190)
  ctx.fillStyle = MUTED
  ctx.font = '400 28px Sora, system-ui, sans-serif'
  ctx.fillText(p.year, 88, 246)
  let y = 360
  p.tracks.forEach((t, i) => {
    ctx.fillStyle = ACCENT
    ctx.font = '400 26px "JetBrains Mono", monospace'
    ctx.fillText(String(i + 1).padStart(2, '0'), 88, y)
    ctx.fillStyle = BODY
    ctx.font = '400 34px Sora, system-ui, sans-serif'
    for (const line of wrap(ctx, t, 760)) {
      ctx.fillText(line, 160, y)
      y += 50
    }
    y += 34
  })
  ctx.fillStyle = MUTED
  ctx.font = '400 28px Sora, system-ui, sans-serif'
  ctx.fillText(p.tech.join(' · '), 88, S - 90)
  return c
}

// Spine: a thumbnail of the cover at the top, the title running down
function buildSpine(p, cover) {
  const W = 96
  const H = 1152
  const [c, ctx] = makeCanvas(W, H)
  ctx.fillStyle = p.spine.bg
  ctx.fillRect(0, 0, W, H)
  ctx.drawImage(cover, 16, 18, W - 32, W - 32)
  ctx.save()
  ctx.translate(W / 2 + 2, W + 22)
  ctx.rotate(Math.PI / 2)
  ctx.fillStyle = p.spine.ink
  ctx.font = '600 38px Sora, system-ui, sans-serif'
  ctx.textBaseline = 'middle'
  ctx.fillText(p.title.toUpperCase(), 0, 0)
  ctx.fillStyle = p.spine.muted ?? MUTED
  ctx.font = '400 28px Sora, system-ui, sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText(p.year, H - W - 60, 0)
  ctx.restore()
  return c
}

// Disc print: ink colour, faint grooves, small art up top, title round the bottom
function buildDisc(p, img, cover) {
  const S = 1024
  const R = S / 2
  const [c, ctx] = makeCanvas(S, S)
  const d = p.disc
  if (d.full) {
    drawArt(ctx, d.full === 'cover' ? cover : img, S, 1)
  } else {
    ctx.fillStyle = d.bg
    ctx.fillRect(0, 0, S, S)
    ctx.strokeStyle = 'rgba(255,255,255,0.035)'
    ctx.lineWidth = 1
    for (let r = R * 0.32; r < R; r += 7) {
      ctx.beginPath()
      ctx.arc(R, R, r, 0, Math.PI * 2)
      ctx.stroke()
    }
    const art = d.art === 'cover' ? cover : img
    if (art) {
      // Upper half, clear of the hub
      const w = S * (d.artScale ?? 0.26)
      ctx.drawImage(art, R - w / 2, R * 0.42 - w / 2, w, w)
    }
    // Title along the lower rim
    ctx.fillStyle = d.ink
    ctx.font = '600 44px Sora, system-ui, sans-serif'
    const text = p.title.toUpperCase().split('').join(' ')
    const radius = R * 0.74
    const total = ctx.measureText(text).width / radius
    let a = Math.PI / 2 + total / 2
    for (const ch of text) {
      const w = ctx.measureText(ch).width
      a -= w / radius / 2
      ctx.save()
      ctx.translate(R + Math.cos(a) * radius, R + Math.sin(a) * radius)
      ctx.rotate(a - Math.PI / 2)
      ctx.textAlign = 'center'
      ctx.fillText(ch, 0, 0)
      ctx.restore()
      a -= w / radius / 2
    }
  }
  // Clear plastic hub around the spindle hole
  ctx.save()
  ctx.globalCompositeOperation = 'destination-out'
  ctx.beginPath()
  ctx.arc(R, R, R * 0.29, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
  ctx.fillStyle = 'rgba(214,220,226,0.32)'
  ctx.beginPath()
  ctx.arc(R, R, R * 0.29, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.45)'
  ctx.lineWidth = 3
  for (const r of [0.29, 0.22]) {
    ctx.beginPath()
    ctx.arc(R, R, R * r, 0, Math.PI * 2)
    ctx.stroke()
  }
  // Silver rim
  ctx.strokeStyle = 'rgba(210,214,220,0.9)'
  ctx.lineWidth = 10
  ctx.beginPath()
  ctx.arc(R, R, R - 5, 0, Math.PI * 2)
  ctx.stroke()
  return c
}

export async function printArt(projects) {
  await Promise.all([
    '700 88px "JetBrains Mono"', '400 25px "JetBrains Mono"', '600 38px Sora', '400 28px Sora',
    'italic 400 92px "Cormorant Garamond"',
  ].map((f) => document.fonts?.load(f).catch(() => null)))

  return Promise.all(
    projects.map(async (p) => {
      const img = p.cover.src ? await loadImage(p.cover.src) : null
      const cover = buildCover(p, img)
      return {
        cover: toTexture(cover),
        booklet: toTexture(buildBooklet(p)),
        spine: toTexture(buildSpine(p, cover)),
        disc: toTexture(buildDisc(p, img, cover)),
      }
    })
  )
}
