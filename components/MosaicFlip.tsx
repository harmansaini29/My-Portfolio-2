"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { CSSProperties, PointerEvent, ReactElement } from "react"

type ImageInput = string | { src?: string } | null | undefined

export interface MosaicImage {
    image?: ImageInput

    offsetY?: number
}

export type MosaicOrigin = "center" | "edges" | "start" | "random"

export interface MosaicFlipProps {
    images?: (MosaicImage | ImageInput)[]
    background?: string
    columns?: number
    rows?: number
    autoCover?: boolean
    gap?: number
    speed?: number
    stagger?: number
    origin?: MosaicOrigin
    float?: number
    hover?: number
    size?: number
    style?: CSSProperties
    onSlideChange?: (index: number) => void
}

const DEFAULTS = {
    background: "#000000",
    columns: 12,
    rows: 8,
    gap: 0,
    speed: 7,
    stagger: 5,
    origin: "center",
    float: 5,
    hover: 10,
    size: 77,
}

const FACES = [
    { key: "front", transform: (half: number) => `translateZ(${half}px)` },
    {
        key: "rear",
        transform: (half: number) => `rotateY(180deg) translateZ(${half}px)`,
    },
    {
        key: "right",
        transform: (half: number) => `rotateY(90deg) translateZ(${half}px)`,
    },
    {
        key: "left",
        transform: (half: number) => `rotateY(-90deg) translateZ(${half}px)`,
    },
    {
        key: "top",
        transform: (half: number) => `rotateX(90deg) translateZ(${half}px)`,
    },
    {
        key: "bottom",
        transform: (half: number) => `rotateX(-90deg) translateZ(${half}px)`,
    },
] as const

const PERSPECTIVE = 800

const DRIFT_MIN = 0.6
const DRIFT_MAX = 1.4

const FLOAT_STAGGER = 0.015

const FALLBACK_FRAME = { width: 1200, height: 700 }

const PLACEHOLDER_COUNT = 6

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value))
}

const easeInOutQuart = (t: number): number =>
    t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2

const easeInOutCubic = (t: number): number =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

const easeInOutSine = (t: number): number => -(Math.cos(Math.PI * t) - 1) / 2

const randomBetween = (min: number, max: number): number =>
    min + Math.random() * (max - min)

function resolveSrc(image: ImageInput): string | null {
    if (!image) return null
    if (typeof image === "string") return image || null
    const src = image.src
    return typeof src === "string" && src ? src : null
}

function resolveEntry(entry: MosaicImage | ImageInput): {
    src: string | null
    offsetY: number
} {
    if (entry && typeof entry === "object" && "image" in entry) {
        return {
            src: resolveSrc(entry.image),
            offsetY: typeof entry.offsetY === "number" ? entry.offsetY : 0,
        }
    }
    return { src: resolveSrc(entry as ImageInput), offsetY: 0 }
}

function placeholderFill(index: number): string {
    const hue = (index * 47 + 200) % 360
    return `linear-gradient(140deg, hsl(${hue} 42% 44%), hsl(${
        (hue + 50) % 360
    } 58% 9%))`
}

function computeDelays(
    columns: number,
    rows: number,
    origin: MosaicOrigin,
    span: number
): number[] {
    const total = columns * rows
    const distances = new Array<number>(total)
    const originX = origin === "start" ? 0 : columns / 2 - 0.5
    const originY = origin === "start" ? 0 : rows / 2 - 0.5

    let max = -Infinity
    let min = Infinity
    for (let i = 0; i < total; i += 1) {
        const x = (i % columns) - originX
        const y = originY - Math.floor(i / columns)
        const distance = Math.sqrt(x * x + y * y)
        distances[i] = distance
        if (distance > max) max = distance
        if (distance < min) min = distance
    }

    const range = max - min || 1
    const delays = distances.map((distance) => {
        const ratio = (distance - min) / range
        return (origin === "edges" ? 1 - ratio : ratio) * span
    })

    if (origin === "random") {
        for (let i = delays.length - 1; i > 0; i -= 1) {
            const j = Math.floor(Math.random() * (i + 1))
            const swap = delays[i]
            delays[i] = delays[j]
            delays[j] = swap
        }
    }

    return delays
}

interface Drift {
    from: number
    to: number
    start: number
    duration: number
}

interface Scene {
    rotation: number

    flip: { from: number; to: number; start: number; duration: number } | null
    drifts: Drift[]
}

interface Frame {
    tiles: number
    amplitude: number
    hover: number
    columns: number
    rows: number
}

interface Slide {
    css: string
    url: string | null
    width: number
    height: number
    x: number
    y: number
}

function __OriginkitBase_MosaicFlip({
    images = [{"image":"https://images.unsplash.com/photo-1663076125875-b8454612ed9b?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTB8fHZpYnJhbnQlMjBiYWNrZ3JvdW5kJTIwaW1hZ2V8ZW58MHwwfDB8fHwy","offsetY":0}],
    background = DEFAULTS.background,
    columns = DEFAULTS.columns,
    rows = DEFAULTS.rows,
    autoCover = true,
    gap = DEFAULTS.gap,
    speed = DEFAULTS.speed,
    stagger = DEFAULTS.stagger,
    origin = DEFAULTS.origin as MosaicOrigin,
    float = DEFAULTS.float,
    hover = DEFAULTS.hover,
    size = DEFAULTS.size,
    style,
    onSlideChange,
}: MosaicFlipProps) {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const tileRefs = useRef<(HTMLDivElement | null)[]>([])

    const [frameSize, setFrameSize] = useState({ width: 0, height: 0 })

    const reel = useMemo(() => {
        const entries = (images ?? [])
            .map(resolveEntry)
            .filter((entry) => entry.src)
        if (entries.length) {
            return entries.map((entry) => ({
                css: `url("${entry.src}")`,
                url: entry.src,
                offsetY: entry.offsetY,
            }))
        }
        return Array.from({ length: PLACEHOLDER_COUNT }, (_, i) => ({
            css: placeholderFill(i),
            url: null as string | null,
            offsetY: 0,
        }))
    }, [images])

    const aspects = useRef(new Map<string, number>())
    const [measured, redraw] = useState(0)
    const urlKey = reel.map((slide) => slide.url ?? "").join("|")

    useEffect(() => {
        let cancelled = false
        urlKey
            .split("|")
            .filter(Boolean)
            .forEach((url) => {
                if (aspects.current.has(url)) return
                const probe = new window.Image()
                probe.onload = () => {
                    if (cancelled || !probe.naturalWidth || !probe.naturalHeight)
                        return
                    aspects.current.set(
                        url,
                        probe.naturalWidth / probe.naturalHeight
                    )
                    redraw((tick) => tick + 1)
                }
                probe.src = url
            })
        return () => {
            cancelled = true
        }
    }, [urlKey])

    const [phase, setPhase] = useState({ count: 0, active: 0, previous: 0 })

    const activeRef = useRef(0)
    activeRef.current = phase.active

    const targetRef = useRef(0)

    const revealingRef = useRef(false)
    const queuedRef = useRef<number | null>(null)

    const frameWidth = frameSize.width || FALLBACK_FRAME.width
    const frameHeight = frameSize.height || FALLBACK_FRAME.height

    const isMobile = frameWidth < 640
    const defaultRows = isMobile ? 6 : (rows ? Math.max(1, Math.round(rows)) : 8)
    const rowCount = Math.max(1, defaultRows)

    const frameAspect = frameWidth > 0 && frameHeight > 0 ? frameWidth / frameHeight : 16 / 10
    const columnCount = autoCover
        ? Math.max(4, Math.ceil(rowCount * frameAspect))
        : Math.max(1, Math.round(columns ?? DEFAULTS.columns))
    const tileCount = columnCount * rowCount

    const sizeScale = autoCover ? 1 : clamp(size ?? DEFAULTS.size, 10, 100) / 100

    const tileWidthUnit = (frameWidth - gap * (columnCount - 1)) / columnCount
    const tileHeightUnit = (frameHeight - gap * (rowCount - 1)) / rowCount

    const baseTile = autoCover
        ? Math.max(tileWidthUnit, tileHeightUnit)
        : Math.max(
            1,
            Math.min(
                tileWidthUnit,
                tileHeightUnit
            )
        )
    const tile = Math.max(1, baseTile)
    const half = tile / 2
    const sheetWidth = columnCount * tile
    const sheetHeight = rowCount * tile

    const slides = useMemo<Slide[]>(
        () =>
            reel.map((entry) => {
                const aspect = entry.url ? aspects.current.get(entry.url) : null
                const width =
                    aspect && aspect > 0
                        ? Math.max(sheetWidth, sheetHeight * aspect)
                        : sheetWidth
                const height =
                    aspect && aspect > 0 ? width / aspect : sheetHeight
                return {
                    css: entry.css,
                    url: entry.url,
                    width,
                    height,
                    x: (sheetWidth - width) / 2,
                    y:
                        (sheetHeight - height) / 2 +
                        (clamp(entry.offsetY, -100, 100) / 100) * sheetHeight,
                }
            }),

        [reel, sheetWidth, sheetHeight, urlKey, measured]
    )

    const flipDuration = clamp(1.8 - clamp(speed, 0, 10) * 0.12, 0.4, 2.2)
    const staggerSpan = clamp(stagger, 0, 10) * 0.12

    const amplitude = clamp(float, 0, 10) * 0.13 * tile

    const scene = useRef<Scene>({ rotation: 0, flip: null, drifts: [] })

    const pointerRef = useRef({ x: 0, y: 0, active: false })
    const hoverRef = useRef(0)
    const targetHoverRef = useRef(0)
    const HOVER_RADIUS = 2.8
    const HOVER_LIFT = 0.34
    const HOVER_TILT = 4
    const HOVER_SCALE = 0.035

    const frame = useRef<Frame>({
        tiles: tileCount,
        amplitude,
        hover: 0,
        columns: columnCount,
        rows: rowCount,
    })
    frame.current = {
        tiles: tileCount,
        amplitude,
        hover: clamp(hover, 0, 10) / 10,
        columns: columnCount,
        rows: rowCount,
    }

    const delaysRef = useRef<number[]>([])
    useEffect(() => {
        delaysRef.current = computeDelays(
            columnCount,
            rowCount,
            origin,
            staggerSpan
        )
    }, [columnCount, rowCount, origin, staggerSpan])

    useEffect(() => {
        const node = containerRef.current
        if (!node) return
        const observer = new ResizeObserver((entries) => {
            const rect = entries[0].contentRect
            setFrameSize({ width: rect.width, height: rect.height })
        })
        observer.observe(node)
        setFrameSize({ width: node.clientWidth, height: node.clientHeight })
        return () => observer.disconnect()
    }, [])

    const revealRef = useRef<(index: number) => void>(() => {})
    const reveal = useCallback((index: number) => {
        if (revealingRef.current) {
            queuedRef.current = index
            return
        }
        if (index === activeRef.current) return

        revealingRef.current = true
        queuedRef.current = null
        activeRef.current = index
        if (onSlideChange) onSlideChange(index)
        setPhase((current) => ({
            count: current.count + 1,
            active: index,
            previous: current.active,
        }))
    }, [onSlideChange])
    revealRef.current = reveal

    const advance = useCallback(() => {
        if (slides.length < 2) return
        const next = (targetRef.current + 1) % slides.length
        targetRef.current = next
        revealRef.current(next)
    }, [slides.length])

    useEffect(() => {
        if (phase.active < slides.length) return
        targetRef.current = slides.length - 1
        revealRef.current(slides.length - 1)
    }, [slides.length, phase.active])

    useEffect(() => {
        if (phase.count === 0) return
        scene.current.flip = {
            from: (phase.count - 1) * 180,
            to: phase.count * 180,
            start: -1,
            duration: flipDuration,
        }

    }, [phase.count])

    useEffect(() => {
        let raf = 0

        const paint = (timestamp: number) => {
            const now = timestamp / 1000
            const config = frame.current
            const state = scene.current
            const delays = delaysRef.current

            targetHoverRef.current = pointerRef.current.active
                ? config.hover
                : 0
            hoverRef.current +=
                (targetHoverRef.current - hoverRef.current) *
                (1 - Math.exp(-10 * 1 / 60))

            if (state.drifts.length !== config.tiles) {
                const next: Drift[] = []
                for (let i = 0; i < config.tiles; i += 1) {
                    next.push(
                        state.drifts[i] ?? {
                            from: 0,
                            to: randomBetween(
                                -config.amplitude,
                                config.amplitude
                            ),
                            start: now + i * FLOAT_STAGGER,
                            duration: randomBetween(DRIFT_MIN, DRIFT_MAX),
                        }
                    )
                }
                state.drifts = next
            }

            const flip = state.flip
            if (flip && flip.start < 0) flip.start = now
            let settled = flip !== null

            for (let i = 0; i < config.tiles; i += 1) {
                const column = i % config.columns
                const row = Math.floor(i / config.columns)
                const drift = state.drifts[i]
                if (now >= drift.start + drift.duration) {
                    drift.from = drift.to
                    drift.to = randomBetween(-config.amplitude, config.amplitude)
                    drift.start = now
                    drift.duration = randomBetween(DRIFT_MIN, DRIFT_MAX)
                }
                const driftProgress = clamp(
                    (now - drift.start) / drift.duration,
                    0,
                    1
                )
                const z =
                    drift.from +
                    (drift.to - drift.from) * easeInOutSine(driftProgress)

                let rotation = state.rotation
                if (flip) {
                    const progress = clamp(
                        (now - flip.start - (delays[i] ?? 0)) / flip.duration,
                        0,
                        1
                    )
                    if (progress < 1) settled = false
                    rotation =
                        flip.from +
                        (flip.to - flip.from) * easeInOutCubic(progress)
                }

                const node = tileRefs.current[i]
                if (node) {
                    const px =
                        pointerRef.current.x *
                        (config.columns > 0 ? config.columns - 1 : 0)
                    const py =
                        pointerRef.current.y *
                        (config.rows > 0 ? config.rows - 1 : 0)
                    const dx = column - px
                    const dy = row - py
                    const distance = Math.sqrt(dx * dx + dy * dy)
                    const proximity = pointerRef.current.active
                        ? clamp(1 - distance / HOVER_RADIUS, 0, 1)
                        : 0
                    const hover = proximity * hoverRef.current

                    const hoverZ = hover * HOVER_LIFT * tile
                    const tiltX = (py - row) * hover * HOVER_TILT
                    const tiltY = (column - px) * hover * HOVER_TILT
                    const scale = 1 + hover * HOVER_SCALE

                    node.style.transform =
                        `translateZ(${z + hoverZ}px) ` +
                        `rotateX(${tiltX}deg) ` +
                        `rotateY(${rotation + tiltY}deg) ` +
                        `scale(${scale})`
                }
            }

            if (flip && settled) {
                state.rotation = flip.to
                state.flip = null
                revealingRef.current = false
                const queued = queuedRef.current
                queuedRef.current = null
                if (queued !== null && queued !== activeRef.current) {
                    revealRef.current(queued)
                }
            }

            raf = requestAnimationFrame(paint)
        }

        raf = requestAnimationFrame(paint)
        return () => cancelAnimationFrame(raf)
    }, [])

    const showingFront = phase.count % 2 === 0
    const activeSlide = slides[phase.active] ?? slides[0]
    const previousSlide = slides[phase.previous] ?? slides[0]
    const frontSlide = showingFront ? activeSlide : previousSlide
    const rearSlide = showingFront ? previousSlide : activeSlide

    const faceBase: CSSProperties = {
        position: "absolute",
        width: tile,
        height: tile,
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
    }

    const tiles: ReactElement[] = []
    for (let i = 0; i < tileCount; i += 1) {
        const column = i % columnCount
        const row = Math.floor(i / columnCount)

        tiles.push(
            <div
                key={i}
                ref={(node) => {
                    tileRefs.current[i] = node
                }}
                style={{
                    position: "relative",
                    width: tile,
                    height: tile,
                    transformStyle: "preserve-3d",
                    willChange: "transform",
                }}
            >
                {FACES.map((face) => {
                    const isCap = face.key === "top" || face.key === "bottom"
                    const slide = isCap
                        ? null
                        : face.key === "front"
                          ? frontSlide
                          : face.key === "rear"
                            ? rearSlide
                            : activeSlide

                    return (
                        <div
                            key={face.key}
                            style={{
                                ...faceBase,
                                transform: face.transform(half),
                                backgroundImage: slide ? slide.css : "none",
                                backgroundSize: slide
                                    ? `${slide.width}px ${slide.height}px`
                                    : undefined,
                                backgroundPosition: slide
                                    ? `${slide.x - column * tile}px ${
                                          slide.y - row * tile
                                      }px`
                                    : undefined,
                                backgroundColor: slide ? undefined : background,
                            }}
                        />
                    )
                })}
            </div>
        )
    }

    const handlePointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
        const rect = containerRef.current?.getBoundingClientRect()
        if (!rect || rect.width <= 0 || rect.height <= 0) return

        if (event.pointerType === "touch") return

        pointerRef.current = {
            x: clamp((event.clientX - rect.left) / rect.width, 0, 1),
            y: clamp((event.clientY - rect.top) / rect.height, 0, 1),
            active: true,
        }
    }, [])

    const handlePointerLeave = useCallback(() => {
        pointerRef.current.active = false
    }, [])

    return (
        <div
            ref={containerRef}
            onClick={advance}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background,
                perspective: `${PERSPECTIVE}px`,
                transformStyle: "preserve-3d",
                cursor: slides.length > 1 ? "pointer" : "default",
                touchAction: "manipulation",
                WebkitTapHighlightColor: "transparent",
                userSelect: "none",
                ...style,
            }}
        >
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${columnCount}, ${tile}px)`,
                    gridTemplateRows: `repeat(${rowCount}, ${tile}px)`,
                    gap,
                    transform: `scale(${sizeScale})`,
                    transformStyle: "preserve-3d",
                    pointerEvents: "none",
                }}
            >
                {tiles}
            </div>
        </div>
    )
}

const __originkitPresetProps = {
  "images": [
    {
      "image": "https://images.unsplash.com/photo-1663076125875-b8454612ed9b?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTB8fHZpYnJhbnQlMjBiYWNrZ3JvdW5kJTIwaW1hZ2V8ZW58MHwwfDB8fHwy",
      "offsetY": 0
    },
    {
      "image": "https://images.unsplash.com/photo-1636408807362-a6195d3dd4de?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDF8fHxlbnwwfHx8fHw%3D",
      "offsetY": 0
    }
  ]
};

export default function MosaicFlip(props: Record<string, unknown>) {
  return <__OriginkitBase_MosaicFlip {...(__originkitPresetProps as Record<string, unknown>)} {...props} />;
}
