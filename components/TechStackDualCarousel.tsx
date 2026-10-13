// Keycap Wall — Originkit

"use client"

import * as React from "react"
import { useEffect, useRef } from "react"

const MAX_DPR = 2

const CYCLE = 32
const BODY_LIGHT = 8
const BODY_DARK = 16
const TALL_LIGHT = 3
const TALL_DARK = 5

const REF_SECONDS = 4.5
const RATE_MIN = 0.62
const RATE_SPAN = 0.76

const PRESS_PER_SEC = 3
const PRESS_DOWN = 90
const PRESS_HOLD = 70
const PRESS_UP = 170
const PRESS_SCALE = 0.93
const PRESS_DARK = 0.26

const SKIRT = 0.6
const FACE_INSET = 0.055
const GREY_CHANCE = 0.06
const GREY_LIFT = 5.2

const SPOT_CELLS = 3.2
const SPOT_ALPHA = 0.13
const POINTER_EASE = 9

const VIGNETTE_ALPHA = 0.45
const VIGNETTE_START = 0.35

const LEGEND_NUDGE = -0.03
const TALL_NUDGE = -0.12
const WORD_RATIO = 0.36
const PAIR_RATIO = 0.52
const BAR_W = 0.4
const BAR_H = 0.055
const BAR_Y = 0.46

type RGB = [number, number, number]

function mod(a: number, n: number): number {
  return ((a % n) + n) % n
}
function clamp255(v: number): number {
  return v < 0 ? 0 : v > 255 ? 255 : v
}
function css(c: RGB): string {
  return `rgb(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])})`
}

function tone(c: RGB, k: number): RGB {
  return [clamp255(c[0] * k), clamp255(c[1] * k), clamp255(c[2] * k)]
}
function mix(a: RGB, b: RGB, t: number): RGB {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}
function lum(c: RGB): number {
  return (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255
}
function smooth(t: number): number {
  return t * t * (3 - 2 * t)
}

function makeRng(seed: number): () => number {
  let a = seed >>> 0 || 1
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function ihash(x: number, y: number, s: number): number {
  let n = Math.imul(Math.floor(x) | 0, 374761393) + Math.imul(Math.floor(y) | 0, 668265263)
  n = (n + Math.imul(s | 0, 1274126177)) | 0
  n = (n ^ (n >>> 13)) | 0
  n = Math.imul(n, 1274126177)
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296
}

function resolveColor(host: HTMLElement, value: string, fallback: RGB): RGB {
  try {
    const probe = document.createElement("span")
    probe.style.color = value
    probe.style.display = "none"
    host.appendChild(probe)
    const computed = getComputedStyle(probe).color
    probe.remove()
    const m = computed.match(/-?[\d.]+/g)
    if (!m || m.length < 3) return fallback
    return [Math.round(+m[0]), Math.round(+m[1]), Math.round(+m[2])]
  } catch {
    return fallback
  }
}

interface FontLike {
  fontFamily?: string
  fontSize?: string | number
  fontWeight?: string | number
  fontStyle?: string
  letterSpacing?: string | number
}
function fontPx(f: FontLike | undefined): number {
  const raw = f?.fontSize
  const n = typeof raw === "number" ? raw : parseFloat(String(raw ?? ""))
  return Number.isFinite(n) && n > 0 ? Math.min(200, n) : 52
}
function fontShorthand(f: FontLike | undefined, px: number): string {
  const style = f?.fontStyle ?? "normal"
  const weight = f?.fontWeight ?? 500
  const family = f?.fontFamily ?? "Inter, system-ui, sans-serif"
  const quoted = /[\s,]/.test(family) && !/["']/.test(family) ? `"${family}"` : family
  return `${style} ${weight} ${px}px ${quoted}, system-ui, sans-serif`
}

type Legend =
  | { kind: "char"; text: string; bar?: boolean }
  | { kind: "pair"; top: string; bottom: string }
  | { kind: "word"; text: string }
  | { kind: "icon"; icon: string }

// Tech stack logo symbols
const TECH_ICONS = [
  "react", "nextjs", "typescript", "python", "nodejs", "docker",
  "kubernetes", "aws", "database", "java", "git", "threejs",
  "redis", "terminal", "cpp", "ai"
]

function drawTechIcon(
  g: CanvasRenderingContext2D,
  icon: string,
  cx: number,
  cy: number,
  size: number,
  color: string
) {
  g.save()
  g.strokeStyle = color
  g.fillStyle = color
  g.lineWidth = Math.max(1.5, size * 0.07)
  g.lineCap = "round"
  g.lineJoin = "round"

  switch (icon) {
    case "react": {
      const rx = size * 0.44
      const ry = size * 0.17
      for (let i = 0; i < 3; i++) {
        g.save()
        g.translate(cx, cy)
        g.rotate((i * Math.PI) / 3)
        g.beginPath()
        g.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2)
        g.stroke()
        g.restore()
      }
      g.beginPath()
      g.arc(cx, cy, size * 0.09, 0, Math.PI * 2)
      g.fill()
      break
    }
    case "nextjs": {
      const r = size * 0.42
      g.beginPath()
      g.arc(cx, cy, r, 0, Math.PI * 2)
      g.stroke()
      g.beginPath()
      g.moveTo(cx - r * 0.45, cy + r * 0.5)
      g.lineTo(cx - r * 0.45, cy - r * 0.5)
      g.stroke()
      g.beginPath()
      g.moveTo(cx - r * 0.45, cy - r * 0.5)
      g.lineTo(cx + r * 0.35, cy + r * 0.48)
      g.stroke()
      g.beginPath()
      g.moveTo(cx + r * 0.35, cy - r * 0.1)
      g.lineTo(cx + r * 0.35, cy - r * 0.5)
      g.stroke()
      break
    }
    case "typescript": {
      const s = size * 0.8
      roundRectPath(g, cx - s / 2, cy - s / 2, s, s, s * 0.18)
      g.stroke()
      g.font = `bold ${Math.round(size * 0.42)}px ui-sans-serif, system-ui, sans-serif`
      g.textAlign = "center"
      g.textBaseline = "middle"
      g.fillText("TS", cx, cy)
      break
    }
    case "python": {
      const r = size * 0.22
      g.beginPath()
      g.arc(cx - r * 0.3, cy - r * 0.4, r, Math.PI * 0.8, Math.PI * 2)
      g.lineTo(cx + r * 0.7, cy)
      g.arc(cx + r * 0.3, cy - r * 0.4, r * 0.5, 0, Math.PI)
      g.stroke()
      g.beginPath()
      g.arc(cx - r * 0.3, cy - r * 0.6, size * 0.04, 0, Math.PI * 2)
      g.fill()
      g.beginPath()
      g.arc(cx + r * 0.3, cy + r * 0.4, r, 0, Math.PI * 1.2)
      g.lineTo(cx - r * 0.7, cy)
      g.arc(cx - r * 0.3, cy + r * 0.4, r * 0.5, Math.PI, 0)
      g.stroke()
      g.beginPath()
      g.arc(cx + r * 0.3, cy + r * 0.6, size * 0.04, 0, Math.PI * 2)
      g.fill()
      break
    }
    case "nodejs": {
      const r = size * 0.42
      g.beginPath()
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3 - Math.PI / 6
        const x = cx + r * Math.cos(a)
        const y = cy + r * Math.sin(a)
        if (i === 0) g.moveTo(x, y)
        else g.lineTo(x, y)
      }
      g.closePath()
      g.stroke()
      g.font = `bold ${Math.round(size * 0.32)}px ui-sans-serif, system-ui, sans-serif`
      g.textAlign = "center"
      g.textBaseline = "middle"
      g.fillText("JS", cx, cy)
      break
    }
    case "docker": {
      const bs = size * 0.09
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 3; col++) {
          const bx = cx - size * 0.28 + col * (bs * 1.3)
          const by = cy - size * 0.22 + row * (bs * 1.3)
          g.strokeRect(bx, by, bs, bs)
        }
      }
      g.beginPath()
      g.moveTo(cx - size * 0.44, cy + size * 0.08)
      g.bezierCurveTo(
        cx - size * 0.4, cy + size * 0.38,
        cx + size * 0.3, cy + size * 0.38,
        cx + size * 0.42, cy + size * 0.06
      )
      g.bezierCurveTo(
        cx + size * 0.46, cy - size * 0.08,
        cx + size * 0.36, cy + size * 0.02,
        cx + size * 0.3, cy + size * 0.08
      )
      g.closePath()
      g.stroke()
      break
    }
    case "kubernetes": {
      const r = size * 0.38
      g.beginPath()
      g.arc(cx, cy, r * 0.35, 0, Math.PI * 2)
      g.stroke()
      for (let i = 0; i < 7; i++) {
        const a = (i * Math.PI * 2) / 7 - Math.PI / 2
        g.beginPath()
        g.moveTo(cx + r * 0.35 * Math.cos(a), cy + r * 0.35 * Math.sin(a))
        g.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a))
        g.stroke()
        g.beginPath()
        g.arc(cx + r * Math.cos(a), cy + r * Math.sin(a), size * 0.05, 0, Math.PI * 2)
        g.fill()
      }
      break
    }
    case "aws": {
      const cw = size * 0.6
      const ch = size * 0.32
      g.beginPath()
      g.arc(cx - cw * 0.22, cy - ch * 0.1, ch * 0.45, Math.PI * 0.8, Math.PI * 1.9)
      g.arc(cx + cw * 0.05, cy - ch * 0.35, ch * 0.6, Math.PI * 1.2, Math.PI * 2.1)
      g.arc(cx + cw * 0.28, cy - ch * 0.05, ch * 0.48, Math.PI * 1.4, Math.PI * 0.4)
      g.lineTo(cx - cw * 0.35, cy + ch * 0.4)
      g.closePath()
      g.stroke()
      g.beginPath()
      g.arc(cx, cy + size * 0.14, size * 0.24, Math.PI * 0.2, Math.PI * 0.8)
      g.stroke()
      break
    }
    case "database": {
      const rx = size * 0.36
      const ry = size * 0.12
      g.beginPath()
      g.ellipse(cx, cy - size * 0.24, rx, ry, 0, 0, Math.PI * 2)
      g.stroke()
      g.beginPath()
      g.ellipse(cx, cy - size * 0.02, rx, ry, 0, 0, Math.PI)
      g.stroke()
      g.beginPath()
      g.ellipse(cx, cy + size * 0.22, rx, ry, 0, 0, Math.PI)
      g.stroke()
      g.beginPath()
      g.moveTo(cx - rx, cy - size * 0.24)
      g.lineTo(cx - rx, cy + size * 0.22)
      g.moveTo(cx + rx, cy - size * 0.24)
      g.lineTo(cx + rx, cy + size * 0.22)
      g.stroke()
      break
    }
    case "java": {
      const cw = size * 0.3
      g.beginPath()
      g.arc(cx - size * 0.04, cy + size * 0.08, cw, 0, Math.PI)
      g.stroke()
      g.beginPath()
      g.moveTo(cx - size * 0.04 - cw, cy + size * 0.08)
      g.lineTo(cx - size * 0.04 + cw, cy + size * 0.08)
      g.stroke()
      g.beginPath()
      g.arc(cx + size * 0.28, cy + size * 0.14, size * 0.11, -Math.PI * 0.6, Math.PI * 0.6)
      g.stroke()
      g.beginPath()
      g.moveTo(cx - size * 0.12, cy - size * 0.02)
      g.bezierCurveTo(cx - size * 0.06, cy - size * 0.14, cx - size * 0.18, cy - size * 0.26, cx - size * 0.1, cy - size * 0.38)
      g.moveTo(cx + size * 0.06, cy - size * 0.02)
      g.bezierCurveTo(cx + size * 0.12, cy - size * 0.14, cx, cy - size * 0.26, cx + size * 0.08, cy - size * 0.38)
      g.stroke()
      break
    }
    case "git": {
      g.save()
      g.translate(cx, cy)
      g.rotate(-Math.PI / 4)
      const r = size * 0.09
      g.beginPath()
      g.moveTo(0, -size * 0.3)
      g.lineTo(0, size * 0.3)
      g.stroke()
      g.beginPath()
      g.moveTo(0, 0)
      g.bezierCurveTo(size * 0.18, 0, size * 0.26, size * 0.1, size * 0.26, size * 0.22)
      g.stroke()
      g.beginPath(); g.arc(0, -size * 0.3, r, 0, Math.PI * 2); g.fill()
      g.beginPath(); g.arc(0, size * 0.3, r, 0, Math.PI * 2); g.fill()
      g.beginPath(); g.arc(size * 0.26, size * 0.22, r, 0, Math.PI * 2); g.fill()
      g.restore()
      break
    }
    case "threejs": {
      const r = size * 0.42
      const p1 = { x: cx, y: cy - r }
      const p2 = { x: cx - r * 0.86, y: cy + r * 0.65 }
      const p3 = { x: cx + r * 0.86, y: cy + r * 0.65 }
      const pc = { x: cx, y: cy + r * 0.15 }
      g.beginPath()
      g.moveTo(p1.x, p1.y); g.lineTo(p2.x, p2.y); g.lineTo(p3.x, p3.y); g.closePath()
      g.stroke()
      g.beginPath()
      g.moveTo(pc.x, pc.y); g.lineTo(p1.x, p1.y)
      g.moveTo(pc.x, pc.y); g.lineTo(p2.x, p2.y)
      g.moveTo(pc.x, pc.y); g.lineTo(p3.x, p3.y)
      g.stroke()
      break
    }
    case "redis": {
      const rx = size * 0.36
      const ry = size * 0.14
      for (let i = 0; i < 3; i++) {
        const yOff = cy - size * 0.22 + i * size * 0.2
        g.beginPath()
        g.moveTo(cx, yOff - ry)
        g.lineTo(cx + rx, yOff)
        g.lineTo(cx, yOff + ry)
        g.lineTo(cx - rx, yOff)
        g.closePath()
        g.stroke()
      }
      break
    }
    case "terminal": {
      const w = size * 0.8
      const h = size * 0.58
      roundRectPath(g, cx - w / 2, cy - h / 2, w, h, size * 0.1)
      g.stroke()
      g.beginPath()
      g.moveTo(cx - w / 2, cy - h * 0.18)
      g.lineTo(cx + w / 2, cy - h * 0.18)
      g.stroke()
      g.beginPath()
      g.arc(cx - w * 0.32, cy - h * 0.32, size * 0.035, 0, Math.PI * 2)
      g.fill()
      g.beginPath()
      g.moveTo(cx - w * 0.28, cy)
      g.lineTo(cx - w * 0.12, cy + h * 0.14)
      g.lineTo(cx - w * 0.28, cy + h * 0.28)
      g.stroke()
      g.beginPath()
      g.moveTo(cx - w * 0.04, cy + h * 0.28)
      g.lineTo(cx + w * 0.18, cy + h * 0.28)
      g.stroke()
      break
    }
    case "cpp": {
      g.font = `bold ${Math.round(size * 0.44)}px ui-sans-serif, system-ui, sans-serif`
      g.textAlign = "center"
      g.textBaseline = "middle"
      g.fillText("C++", cx, cy)
      break
    }
    case "ai": {
      const r = size * 0.07
      const inX = cx - size * 0.32
      const hidX = cx
      const outX = cx + size * 0.32
      const inY = [cy - size * 0.26, cy, cy + size * 0.26]
      const hidY = [cy - size * 0.16, cy + size * 0.16]
      const outY = [cy]

      inY.forEach((y1) => {
        hidY.forEach((y2) => {
          g.beginPath(); g.moveTo(inX, y1); g.lineTo(hidX, y2); g.stroke()
        })
      })
      hidY.forEach((y1) => {
        outY.forEach((y2) => {
          g.beginPath(); g.moveTo(hidX, y1); g.lineTo(outX, y2); g.stroke()
        })
      })
      inY.forEach((y) => { g.beginPath(); g.arc(inX, y, r, 0, Math.PI * 2); g.fill() })
      hidY.forEach((y) => { g.beginPath(); g.arc(hidX, y, r, 0, Math.PI * 2); g.fill() })
      outY.forEach((y) => { g.beginPath(); g.arc(outX, y, r, 0, Math.PI * 2); g.fill() })
      break
    }
    default: {
      g.font = `bold ${Math.round(size * 0.4)}px ui-sans-serif, system-ui, sans-serif`
      g.textAlign = "center"
      g.textBaseline = "middle"
      g.fillText(icon.toUpperCase(), cx, cy)
    }
  }
  g.restore()
}

// 1. Pure Developer Code Syntax & Operator Symbols
const SYNTAX_SYMBOLS = [
  "{}", "</>", "//", "=>", "&&", "||", "!=", "::", "->", "~",
  "0x", "#!", "$", "@", "λ", "π", "42", "∞", "≠", "≈",
  "&", "*", "%", "^", ";", "?:", "++", "--", "<<", ">>",
  "===", "!==", "[]", "()", "|>", "<=", ">=", "+=", "-="
]

// 2. Core Architecture & Hardware Glyphs
const GLYPH_SYMBOLS = [
  "⌘", "⌥", "⌃", "⇧", "↵", "⎋", "◈", "◆", "▲", "●", "■", "⚡", "⚙",
  "TS", "JS", "PY", "GO", "RS", "C++", "K8S", "AI", "DB", "UI", "GL",
  "AWS", "GCP", "SQL", "GIT", "ML", "API", "CSS", "SH", "V8", "IO"
]

const ALL_SYMBOLS = [...SYNTAX_SYMBOLS, ...GLYPH_SYMBOLS]

// 3. Tactile Homing Keys (with line bar indicator)
const HOMING_SYMBOLS = ["</>", "{}", "=>", "TS", "PY", "AI", "C++", "0x"]

// 4. Paired Operator & Syntax Symbols (Top & Bottom on single key)
const SYMBOL_PAIRS: [string, string][] = [
  ["< >", "/"],
  ["{ }", "=>"],
  ["[ ]", ":"],
  ["/*", "*/"],
  ["#", "!"],
  ["0x", "FF"],
  ["$", "_"],
  ["&", "|"],
  ["+", "-"],
  ["*", "/"],
  ["==", "!="],
  [">=", "<="],
  ["&&", "||"],
  ["<<", ">>"],
  ["TS", "JS"],
  ["PY", "GO"],
  ["AI", "ML"],
  ["DB", "SQL"],
  ["AWS", "GL"],
  ["K8S", "SH"],
]

// 5. Tall Keys — Prominent developer symbols (no names)
const TALL_SYMBOLS = [
  "</>", "{ }", "//", "=>", "0x", "⌘", "⌥", "⚡", "λ", "API",
  "SQL", "GIT", "K8S", "AWS", "C++", "TS", "PY", "GO", "RS", "AI"
]

const ICON_LEGENDS: Legend[] = TECH_ICONS.map((icon) => ({ kind: "icon", icon } as Legend))

const LEGENDS: Legend[] = [
  ...ICON_LEGENDS,
  ...ALL_SYMBOLS.map((text) => ({ kind: "char", text }) as Legend),
  ...HOMING_SYMBOLS.map((text) => ({ kind: "char", text, bar: true }) as Legend),
  ...SYMBOL_PAIRS.map(([top, bottom]) => ({ kind: "pair", top, bottom }) as Legend),
  ...TALL_SYMBOLS.map((text) => ({ kind: "word", text }) as Legend),
]
const I_ICONS = 0
const I_SYMBOLS = ICON_LEGENDS.length
const I_HOMING = I_SYMBOLS + ALL_SYMBOLS.length
const I_PAIRS = I_HOMING + HOMING_SYMBOLS.length
const I_TALL = I_PAIRS + SYMBOL_PAIRS.length
const N_LEGENDS = LEGENDS.length

function pickLegend(r: number, rnd: () => number): number {
  if (r < 0.42) return I_ICONS + Math.floor(rnd() * ICON_LEGENDS.length)
  if (r < 0.68) return I_SYMBOLS + Math.floor(rnd() * ALL_SYMBOLS.length)
  if (r < 0.80) return I_HOMING + Math.floor(rnd() * HOMING_SYMBOLS.length)
  if (r < 0.90) return I_PAIRS + Math.floor(rnd() * SYMBOL_PAIRS.length)
  return I_TALL + Math.floor(rnd() * TALL_SYMBOLS.length)
}

function pickTallLegend(rnd: () => number): number {
  if (rnd() < 0.5) return I_ICONS + Math.floor(rnd() * ICON_LEGENDS.length)
  return I_TALL + Math.floor(rnd() * TALL_SYMBOLS.length)
}

function roundRectPath(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const rr = Math.max(0, Math.min(r, Math.min(w, h) / 2))
  g.beginPath()
  g.moveTo(x + rr, y)
  g.arcTo(x + w, y, x + w, y + h, rr)
  g.arcTo(x + w, y + h, x, y + h, rr)
  g.arcTo(x, y + h, x, y, rr)
  g.arcTo(x, y, x + w, y, rr)
  g.closePath()
}

function coarseGrid(w: number, h: number, cell: number, seed: number) {
  const gw = Math.ceil(w / cell) + 2
  const gh = Math.ceil(h / cell) + 2
  const g = new Float32Array(gw * gh)
  for (let j = 0; j < gh; j++) {
    for (let i = 0; i < gw; i++) g[j * gw + i] = ihash(i, j, seed)
  }
  return { g, gw, gh, cell }
}
function sampleGrid(f: ReturnType<typeof coarseGrid>, x: number, y: number): number {
  const gx = x / f.cell
  const gy = y / f.cell
  const xi = gx | 0
  const yi = gy | 0
  const u = smooth(gx - xi)
  const v = smooth(gy - yi)
  const i0 = yi * f.gw + xi
  const a = f.g[i0]
  const b = f.g[i0 + 1]
  const c = f.g[i0 + f.gw]
  const d = f.g[i0 + f.gw + 1]
  const ab = a + (b - a) * u
  return ab + (c + (d - c) * u - ab) * v
}

function applyTexture(
  g: CanvasRenderingContext2D,
  w: number,
  h: number,
  dpr: number,
  base: RGB,
  texture: number,
  seed: number
) {
  const amp = (texture / 100) * (Math.pow(1 - lum(base), 1.15) * 34 + 3)
  if (amp < 0.25) return
  const img = g.getImageData(0, 0, w, h)
  const d = img.data
  const fine = coarseGrid(w / dpr, h / dpr, 2.2, seed + 7)
  const blot = coarseGrid(w / dpr, h / dpr, 6, seed + 13)
  for (let y = 0; y < h; y++) {
    const ny = y / dpr
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      const a = d[i + 3]
      if (a < 8) continue
      const nx = x / dpr
      const n =
        0.6 * (ihash(nx, ny, seed) - 0.5) +
        0.85 * (sampleGrid(fine, nx, ny) - 0.5) +
        0.55 * (sampleGrid(blot, nx, ny) - 0.5)
      let delta = amp * n
      if (ihash(nx, ny, seed + 31) > 0.9975) delta += amp * 1.3
      const k = (a / 255) * delta
      d[i] = clamp255(d[i] + k)
      d[i + 1] = clamp255(d[i + 1] + k)
      d[i + 2] = clamp255(d[i + 2] + k)
    }
  }
  g.putImageData(img, 0, 0)
}

function bakeBody(
  wCss: number,
  hCss: number,
  dpr: number,
  base: RGB,
  roundedPct: number,
  texture: number,
  seed: number
): HTMLCanvasElement {
  const w = Math.max(2, Math.round(wCss * dpr))
  const h = Math.max(2, Math.round(hCss * dpr))
  const c = document.createElement("canvas")
  c.width = w
  c.height = h
  const g = c.getContext("2d")
  if (!g) return c

  const r = (roundedPct / 100) * (Math.min(w, h) / 2)

  g.fillStyle = css(tone(base, SKIRT))
  roundRectPath(g, 0, 0, w, h, r)
  g.fill()

  const inset = Math.max(1, FACE_INSET * Math.min(w, h))
  const fr = Math.max(0, r - inset)
  const fw = w - 2 * inset
  const fh = h - 2 * inset
  const grad = g.createLinearGradient(0, inset, 0, inset + fh)
  grad.addColorStop(0, css(tone(base, 1.14)))
  grad.addColorStop(0.55, css(base))
  grad.addColorStop(1, css(tone(base, 0.84)))
  g.fillStyle = grad
  roundRectPath(g, inset, inset, fw, fh, fr)
  g.fill()

  g.save()
  roundRectPath(g, inset, inset, fw, fh, fr)
  g.clip()
  const lw = Math.max(1, 0.012 * w)
  g.lineWidth = lw * 2
  g.strokeStyle = "rgba(255,255,255,0.16)"
  g.beginPath()
  g.moveTo(inset + fr * 0.6, inset + lw)
  g.lineTo(inset + fw - fr * 0.6, inset + lw)
  g.stroke()
  g.strokeStyle = "rgba(0,0,0,0.3)"
  g.beginPath()
  g.moveTo(inset + fr * 0.6, inset + fh - lw)
  g.lineTo(inset + fw - fr * 0.6, inset + fh - lw)
  g.stroke()
  g.restore()

  applyTexture(g, w, h, dpr, base, texture, seed)
  return c
}

function bakeLegend(
  leg: Legend,
  fsCss: number,
  dpr: number,
  font: FontLike | undefined,
  color: RGB,
  wCss: number,
  hCss: number
): HTMLCanvasElement {
  const w = Math.max(2, Math.round(wCss * dpr))
  const h = Math.max(2, Math.round(hCss * dpr))
  const c = document.createElement("canvas")
  c.width = w
  c.height = h
  const g = c.getContext("2d")
  if (!g) return c
  const fs = fsCss * dpr
  const cx = w / 2
  const cy = h / 2
  g.fillStyle = css(color)
  g.textAlign = "center"
  g.textBaseline = "middle"
  const ls = font?.letterSpacing
  if (ls !== undefined && "letterSpacing" in g) {
    try {
      ; (g as unknown as { letterSpacing: string }).letterSpacing =
        typeof ls === "number" ? `${ls}px` : String(ls)
    } catch {
    }
  }

  const maxW = w * 0.74

  if (leg.kind === "icon") {
    drawTechIcon(g, leg.icon, cx, cy, fs * 0.95, css(color))
  } else if (leg.kind === "word") {
    let s = WORD_RATIO * fs
    g.font = fontShorthand(font, s)
    const metrics = g.measureText(leg.text)
    if (metrics.width > maxW) {
      s = s * (maxW / metrics.width)
      g.font = fontShorthand(font, s)
    }
    g.fillText(leg.text, cx, cy)
  } else if (leg.kind === "pair") {
    let s = PAIR_RATIO * fs
    g.font = fontShorthand(font, s)
    const topW = g.measureText(leg.top).width
    const botW = g.measureText(leg.bottom).width
    const m = Math.max(topW, botW)
    if (m > maxW) {
      s = s * (maxW / m)
      g.font = fontShorthand(font, s)
    }
    g.fillText(leg.top, cx, cy - 0.58 * s)
    g.fillText(leg.bottom, cx, cy + 0.60 * s)
  } else {
    let s = leg.text.length > 2 ? fs * 0.68 : fs
    g.font = fontShorthand(font, s)
    const tw = g.measureText(leg.text).width
    if (tw > maxW) {
      s = s * (maxW / tw)
      g.font = fontShorthand(font, s)
    }
    g.fillText(leg.text, cx, cy)
    if (leg.bar) {
      const bw = BAR_W * s
      const bh = Math.max(1, BAR_H * s)
      g.fillRect(cx - bw / 2, cy + BAR_Y * s, bw, bh)
    }
  }
  return c
}

type Cell = { u: number; light: boolean; body: number; legend: number; top: number }
type Column = { cells: Cell[]; cycleH: number; rate: number; drift: number; wraps: number }
type Bakes = {
  light1: HTMLCanvasElement[]
  dark1: HTMLCanvasElement[]
  light2: HTMLCanvasElement[]
  dark2: HTMLCanvasElement[]
}
type Legends = { onDark: HTMLCanvasElement[]; onLight: HTMLCanvasElement[]; w: number; h: number }
type Press = { col: number; idx: number; k: number; t0: number }
type Vis = { col: number; idx: number; k: number; x: number; y: number; w: number; h: number }

function buildColumn(col: number, tallPct: number, lightPct: number, pitch: number): Column {
  const rnd = makeRng((col * 2654435761) >>> 0 || 17)
  const cells: Cell[] = []
  let top = 0
  for (let i = 0; i < CYCLE; i++) {
    const u = rnd() < tallPct / 100 ? 2 : 1
    const light = rnd() < lightPct / 100
    const pool = u === 2 ? (light ? TALL_LIGHT : TALL_DARK) : light ? BODY_LIGHT : BODY_DARK
    const body = Math.floor(rnd() * pool)
    const legend = u === 2 ? pickTallLegend(rnd) : pickLegend(rnd(), rnd)
    cells.push({ u, light, body, legend, top })
    top += u * pitch
  }
  return {
    cells,
    cycleH: top,
    rate: RATE_MIN + makeRng((col * 40503 + 7) >>> 0)() * RATE_SPAN,
    drift: 0,
    wraps: 0,
  }
}

type KeysProps = { tall?: number; texture?: number; presses?: number }
const KEYS_DEFAULTS: Required<KeysProps> = { tall: 4, texture: 100, presses: 40 }

export interface KeycapWallProps {
  background?: string
  baseColor?: string
  accentColor?: string
  lightKeys?: number
  font?: FontLike
  size?: number
  gap?: number
  rounded?: number
  speed?: number
  hover?: number
  keys?: KeysProps
  width?: number
  height?: number
  style?: React.CSSProperties
}

const D = {
  background: "#050505",
  baseColor: "#141414",
  accentColor: "#E2E2E0",
  lightKeys: 34,
  size: 106,
  gap: 10,
  rounded: 20,
  speed: 50,
  hover: 49,
}

export default function KeycapWall(props: KeycapWallProps) {
  const {
    background = D.background,
    baseColor = D.baseColor,
    accentColor = D.accentColor,
    lightKeys = D.lightKeys,
    font,
    size = D.size,
    gap = D.gap,
    rounded = D.rounded,
    speed = D.speed,
    hover = D.hover,
    keys,
    width,
    height,
    style,
  } = props

  const kg = { ...KEYS_DEFAULTS, ...(keys || {}) }

  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const liveRef = useRef({
    speed: D.speed,
    hover: D.hover,
    size: D.size,
    gap: D.gap,
    presses: KEYS_DEFAULTS.presses,
    background: D.background,
    rounded: D.rounded,
  })
  liveRef.current.speed = speed
  liveRef.current.hover = hover
  liveRef.current.size = size
  liveRef.current.gap = gap
  liveRef.current.presses = kg.presses
  liveRef.current.background = background
  liveRef.current.rounded = rounded

  const paintRef = useRef({
    baseColor,
    accentColor,
    rounded,
    size,
    gap,
    texture: kg.texture,
    font,
    lightKeys,
    tall: kg.tall,
  })
  paintRef.current = {
    baseColor,
    accentColor,
    rounded,
    size,
    gap,
    texture: kg.texture,
    font,
    lightKeys,
    tall: kg.tall,
  }

  const fontKey = fontShorthand(font, fontPx(font))
  const bodyKey = `${baseColor}|${accentColor}|${size}|${gap}|${rounded}|${kg.texture}`
  const legendKey = `${fontKey}|${baseColor}|${accentColor}`
  const fieldKey = `${size}|${gap}|${kg.tall}|${lightKeys}`
  const pendingRef = useRef({ body: "", legend: "", field: "" })

  const keyRef = useRef({ body: bodyKey, legend: legendKey, field: fieldKey })
  keyRef.current = { body: bodyKey, legend: legendKey, field: fieldKey }

  useEffect(() => {
    const root = rootRef.current
    const canvas = canvasRef.current
    if (!root || !canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.imageSmoothingQuality = "low"

    const dpr = Math.min(MAX_DPR, window.devicePixelRatio || 1)
    const size2 = { w: 0, h: 0 }
    let bakes: Bakes | null = null
    let legends: Legends | null = null
    let cols: Column[] = []
    let vignette: CanvasGradient | null = null
    let vignetteFor = ""
    const presses: Press[] = []
    let pressAcc = 0
    let visible: Vis[] = []
    const pointer = { x: 0, y: 0, tx: 0, ty: 0, active: false }

    const pressRng = makeRng(0x51ed270b)
    let last = 0
    let raf = 0

    const measure = () => {
      const w = root.offsetWidth || 1200
      const h = root.offsetHeight || 650
      if (w === size2.w && h === size2.h) return
      size2.w = w
      size2.h = h
      canvas.width = Math.max(1, Math.round(w * dpr))
      canvas.height = Math.max(1, Math.round(h * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.imageSmoothingQuality = "low"
      vignetteFor = ""

      // Dynamically scale keycap size on smaller screens so the wall looks dense and crisp
      const responsiveSize = w < 480 ? 68 : w < 768 ? 80 : w < 1024 ? 92 : size
      if (liveRef.current.size !== responsiveSize) {
        liveRef.current.size = responsiveSize
        paintRef.current.size = responsiveSize
        keyRef.current.body = `${paintRef.current.baseColor}|${paintRef.current.accentColor}|${responsiveSize}|${paintRef.current.gap}|${paintRef.current.rounded}|${paintRef.current.texture}`
        keyRef.current.field = `${responsiveSize}|${paintRef.current.gap}|${paintRef.current.tall}|${paintRef.current.lightKeys}`
      }
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(root)

    const bakeBodies = () => {
      const p = paintRef.current
      const base = resolveColor(root, p.baseColor, [20, 20, 20])
      const accent = resolveColor(root, p.accentColor, [226, 226, 224])
      const s = p.size
      const tallH = 2 * s + p.gap
      const out: Bakes = { light1: [], dark1: [], light2: [], dark2: [] }
      let seed = 101
      const dark = (rnd: () => number): RGB => {
        const k = rnd() < GREY_CHANCE ? GREY_LIFT * (0.8 + rnd() * 0.5) : 0.5 + rnd() * 1.7
        return tone(base, k)
      }
      const light = (rnd: () => number): RGB => tone(accent, 0.9 + rnd() * 0.16)
      const rnd = makeRng(0x9e3779b9)
      for (let i = 0; i < BODY_LIGHT; i++)
        out.light1.push(bakeBody(s, s, dpr, light(rnd), p.rounded, p.texture, seed++))
      for (let i = 0; i < BODY_DARK; i++)
        out.dark1.push(bakeBody(s, s, dpr, dark(rnd), p.rounded, p.texture, seed++))
      for (let i = 0; i < TALL_LIGHT; i++)
        out.light2.push(bakeBody(s, tallH, dpr, light(rnd), p.rounded, p.texture, seed++))
      for (let i = 0; i < TALL_DARK; i++)
        out.dark2.push(bakeBody(s, tallH, dpr, dark(rnd), p.rounded, p.texture, seed++))
      bakes = out
    }

    const bakeLegends = () => {
      const p = paintRef.current
      const base = resolveColor(root, p.baseColor, [20, 20, 20])
      const accent = resolveColor(root, p.accentColor, [226, 226, 224])

      const onDark = mix(base, [255, 255, 255], 0.76)
      const onLight = mix(accent, [0, 0, 0], 0.58)
      const fs = fontPx(p.font)

      const lw = 1.6 * fs
      const lh = 1.5 * fs
      const a: HTMLCanvasElement[] = []
      const b: HTMLCanvasElement[] = []
      for (const leg of LEGENDS) {
        a.push(bakeLegend(leg, fs, dpr, p.font, onDark, lw, lh))
        b.push(bakeLegend(leg, fs, dpr, p.font, onLight, lw, lh))
      }
      legends = { onDark: a, onLight: b, w: lw, h: lh }
    }

    const buildField = () => {
      const p = paintRef.current
      const pitch = p.size + p.gap
      const next: Column[] = []
      for (let i = 0; i < cols.length; i++) {
        const c = buildColumn(i, p.tall, p.lightKeys, pitch)
        c.drift = cols[i].drift
        c.wraps = cols[i].wraps
        next.push(c)
      }
      cols = next
    }

    const ensureCols = (n: number) => {
      const p = paintRef.current
      const pitch = p.size + p.gap
      while (cols.length < n) cols.push(buildColumn(cols.length, p.tall, p.lightKeys, pitch))
    }

    let fontsWaited = false
    const waitFonts = () => {
      if (fontsWaited || typeof document === "undefined" || !document.fonts) return
      fontsWaited = true
      document.fonts.ready.then(() => {
        pendingRef.current.legend = ""
      })
    }

    let isVisible = false
    let io: IntersectionObserver | null = null

    const render = (now: number) => {
      if (!isVisible) {
        raf = 0
        return
      }
      const dt = last === 0 ? 0 : Math.min(0.05, (now - last) / 1000)
      last = now
      const live = liveRef.current
      const W = size2.w
      const H = size2.h

      const want = keyRef.current
      if (pendingRef.current.body !== want.body) {
        bakeBodies()
        pendingRef.current.body = want.body
      }
      if (pendingRef.current.legend !== want.legend) {
        bakeLegends()
        pendingRef.current.legend = want.legend
        waitFonts()
      }
      if (pendingRef.current.field !== want.field) {
        buildField()
        pendingRef.current.field = want.field
      }
      if (!bakes || !legends) {
        raf = requestAnimationFrame(render)
        return
      }

      const s = live.size
      const g = live.gap
      const pitch = s + g
      const nCols = Math.ceil(W / pitch) + 1
      ensureCols(nCols)
      const xOff = (W - (nCols * pitch - g)) / 2

      const px = (live.speed / 50) * (pitch / REF_SECONDS)
      for (let i = 0; i < nCols; i++) {
        const c = cols[i]

        const next = c.drift + dt * px * c.rate
        if (next >= c.cycleH) c.wraps += Math.floor(next / c.cycleH)
        else if (next < 0) c.wraps += Math.floor(next / c.cycleH)
        c.drift = mod(next, c.cycleH)
      }

      ctx.fillStyle = live.background
      ctx.fillRect(0, 0, W, H)

      const pressMap = new Map<string, number>()
      for (let i = presses.length - 1; i >= 0; i--) {
        const p = presses[i]
        const age = now - p.t0
        if (age > PRESS_DOWN + PRESS_HOLD + PRESS_UP) {
          presses.splice(i, 1)
          continue
        }
        let v: number
        if (age < PRESS_DOWN) v = smooth(age / PRESS_DOWN)
        else if (age < PRESS_DOWN + PRESS_HOLD) v = 1
        else v = 1 - smooth((age - PRESS_DOWN - PRESS_HOLD) / PRESS_UP)
        pressMap.set(`${p.col}|${p.idx}|${p.k}`, v)
      }

      const legW = legends.w
      const legH = legends.h
      const radius = (live.rounded / 100) * (s / 2)

      let hoverKey = ""
      if (pointer.active && live.hover > 0) {
        const e = 1 - Math.exp(-dt * POINTER_EASE)
        pointer.x += (pointer.tx - pointer.x) * e
        pointer.y += (pointer.ty - pointer.y) * e
        for (let i = visible.length - 1; i >= 0; i--) {
          const v = visible[i]
          if (
            pointer.x >= v.x &&
            pointer.x <= v.x + v.w &&
            pointer.y >= v.y &&
            pointer.y <= v.y + v.h
          ) {
            hoverKey = `${v.col}|${v.idx}|${v.k}`
            break
          }
        }
      }

      visible = []

      for (let ci = 0; ci < nCols; ci++) {
        const col = cols[ci]
        const x = xOff + ci * pitch
        if (x > W || x + s < 0) continue

        let base = -col.drift - col.cycleH
        let k = -1
        while (base < H) {
          for (let i = 0; i < col.cells.length; i++) {
            const cell = col.cells[i]
            const y = base + cell.top
            const ch = cell.u * pitch - g
            if (y + ch < 0 || y > H) continue
            const pool =
              cell.u === 2
                ? cell.light
                  ? bakes.light2
                  : bakes.dark2
                : cell.light
                  ? bakes.light1
                  : bakes.dark1
            const body = pool[cell.body % pool.length]
            const legend = (cell.light ? legends.onLight : legends.onDark)[cell.legend]
            const p = pressMap.get(`${ci}|${i}|${k + col.wraps}`) || 0
            const scale = 1 - (1 - PRESS_SCALE) * p
            const dw = s * scale
            const dh = ch * scale
            const dx = x + (s - dw) / 2
            const dy = y + (ch - dh) / 2
            ctx.drawImage(body, dx, dy, dw, dh)

            const clip = legW > s || legH > ch
            if (clip) {
              ctx.save()
              roundRectPath(ctx, dx, dy, dw, dh, radius * scale)
              ctx.clip()
            }
            ctx.drawImage(
              legend,
              dx + (dw - legW * scale) / 2,
              dy +
              (dh - legH * scale) / 2 +
              (cell.u === 2 ? TALL_NUDGE : LEGEND_NUDGE) * dh,
              legW * scale,
              legH * scale
            )
            if (clip) ctx.restore()
            if (p > 0) {
              ctx.fillStyle = `rgba(0,0,0,${PRESS_DARK * p})`
              roundRectPath(ctx, dx, dy, dw, dh, radius * scale)
              ctx.fill()
            }
            if (`${ci}|${i}|${k + col.wraps}` === hoverKey) {
              const a = SPOT_ALPHA * 3.4 * (live.hover / 100)
              const gr = ctx.createRadialGradient(
                dx + dw / 2,
                dy + dh / 2,
                0,
                dx + dw / 2,
                dy + dh / 2,
                Math.max(dw, dh) * 0.75
              )
              gr.addColorStop(0, `rgba(255,255,255,${a})`)
              gr.addColorStop(1, "rgba(255,255,255,0)")
              ctx.save()
              roundRectPath(ctx, dx, dy, dw, dh, radius * scale)
              ctx.clip()
              ctx.globalCompositeOperation = "lighter"
              ctx.fillStyle = gr
              ctx.fillRect(dx, dy, dw, dh)
              ctx.globalCompositeOperation = "source-over"
              ctx.restore()
            }
            visible.push({ col: ci, idx: i, k: k + col.wraps, x, y, w: s, h: ch })
          }
          base += col.cycleH
          k += 1
        }
      }

      const rate = (live.presses / 100) * PRESS_PER_SEC
      pressAcc += dt * rate
      while (pressAcc >= 1) {
        pressAcc -= 1
        if (visible.length > 0) {
          const v = visible[(pressRng() * visible.length) | 0]
          presses.push({ col: v.col, idx: v.idx, k: v.k, t0: now })
        }
      }

      const vk = `${W}|${H}`
      if (!vignette || vignetteFor !== vk) {
        const r = Math.hypot(W, H) / 2
        const gr = ctx.createRadialGradient(W / 2, H / 2, r * VIGNETTE_START, W / 2, H / 2, r)
        gr.addColorStop(0, "rgba(0,0,0,0)")
        gr.addColorStop(1, `rgba(0,0,0,${VIGNETTE_ALPHA})`)
        vignette = gr
        vignetteFor = vk
      }
      ctx.fillStyle = vignette
      ctx.fillRect(0, 0, W, H)

      raf = requestAnimationFrame(render)
    }

    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        ([entry]) => {
          const was = isVisible
          isVisible = entry.isIntersecting
          if (!was && isVisible) {
            last = performance.now()
            if (!raf) raf = requestAnimationFrame(render)
          }
        },
        { threshold: 0.01 }
      )
      io.observe(root)
    } else {
      isVisible = true
      raf = requestAnimationFrame(render)
    }

    const onMove = (e: PointerEvent) => {
      pointer.tx = e.offsetX
      pointer.ty = e.offsetY
      if (!pointer.active) {
        pointer.x = e.offsetX
        pointer.y = e.offsetY
        pointer.active = true
      }
    }
    const onLeave = () => {
      pointer.active = false
    }

    const onDown = (e: PointerEvent) => {
      const x = e.offsetX
      const y = e.offsetY
      const now = performance.now()
      for (let i = visible.length - 1; i >= 0; i--) {
        const v = visible[i]
        if (x >= v.x && x <= v.x + v.w && y >= v.y && y <= v.y + v.h) {
          presses.push({ col: v.col, idx: v.idx, k: v.k, t0: now })
          break
        }
      }
    }
    root.addEventListener("pointermove", onMove)
    root.addEventListener("pointerleave", onLeave)
    root.addEventListener("pointerdown", onDown)

    return () => {
      if (raf) cancelAnimationFrame(raf)
      if (io) io.disconnect()
      ro.disconnect()
      root.removeEventListener("pointermove", onMove)
      root.removeEventListener("pointerleave", onLeave)
      root.removeEventListener("pointerdown", onDown)
    }

  }, [])

  return (
    <div
      ref={rootRef}
      style={{
        position: "relative",
        overflow: "hidden",
        background,
        width: typeof width === "number" && width > 0 ? width : "100%",
        minHeight: 520,
        height: typeof height === "number" && height > 0 ? height : "min(88vh, 760px)",
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />
      {/* Upper end invisibility gradient fade */}
      <div className="pointer-events-none absolute top-0 inset-x-0 h-28 sm:h-36 bg-gradient-to-b from-black via-black/80 to-transparent z-20" />

      {/* Lower end invisibility gradient fade */}
      <div className="pointer-events-none absolute bottom-0 inset-x-0 h-28 sm:h-36 bg-gradient-to-t from-black via-black/80 to-transparent z-20" />

      {/* Ambient gradient vignette overlay */}
      <div className="pointer-events-none absolute inset-0 z-10 shadow-[inset_0_0_80px_rgba(0,0,0,0.8)]" />
    </div>
  )
}