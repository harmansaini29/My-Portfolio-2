'use client'
import React, { useEffect, useRef, useState, useId } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import imagesLoaded from 'imagesloaded'
import { cn } from '@/lib/utils'
import { FaGithub, FaTwitter, FaLinkedin, FaEnvelope } from 'react-icons/fa'
import { SOCIAL_LINKS } from '@/lib/portfolio-data'

gsap.registerPlugin(ScrollTrigger)

export interface BentoItem {
  id: number | string
  title: string
  subtitle: string
  description: string
  icon: React.ReactNode
  content?: React.ReactNode
  image?: string
  href?: string
}

export interface StaggeredGridProps {
  images?: string[]
  bentoItems?: BentoItem[]
  centerText?: string
  credits?: {
    madeBy: { text: string; href: string }
    moreDemos: { text: string; href: string }
  }
  className?: string
  showFooter?: boolean
  scroller?: string | Element | Window | null
}

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1555099962-4199c345e5dd?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800",
];

const DEFAULT_BENTO_ITEMS: BentoItem[] = [
  {
    id: 1,
    title: SOCIAL_LINKS.email.label || "Let's talk",
    subtitle: 'Contact me',
    description: 'Get in touch for opportunities',
    icon: <FaEnvelope />,
    href: SOCIAL_LINKS.email.url,
  },
  {
    id: 2,
    title: SOCIAL_LINKS.linkedin.label || "LinkedIn",
    subtitle: SOCIAL_LINKS.linkedin.handle,
    description: 'Professional network & collaborations',
    icon: <FaLinkedin />,
    href: SOCIAL_LINKS.linkedin.url,
  },
  {
    id: 3,
    title: SOCIAL_LINKS.twitter.label || "Socials",
    subtitle: SOCIAL_LINKS.twitter.handle,
    description: 'Stay updated with my work',
    icon: <FaTwitter />,
    href: SOCIAL_LINKS.twitter.url,
  },
  {
    id: 4,
    title: SOCIAL_LINKS.github.label || "GitHub",
    subtitle: 'Open Source',
    description: 'Check out my code',
    icon: <FaGithub />,
    href: SOCIAL_LINKS.github.url,
  }
];

export function StaggeredGrid({
  images = DEFAULT_IMAGES,
  bentoItems = DEFAULT_BENTO_ITEMS,
  centerText = "HARMAN SAINI",
  credits = {
    madeBy: { text: SOCIAL_LINKS.github.name, href: SOCIAL_LINKS.github.url },
    moreDemos: { text: SOCIAL_LINKS.linkedin.name, href: SOCIAL_LINKS.linkedin.url }
  },
  className,
  showFooter = true,
  scroller
}: StaggeredGridProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const gridFullRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  // Bento Grid State
  const [activeBento, setActiveBento] = useState<number>(0);

  const splitText = (text: string) => {
    return text.split('').map((char, i) => (
      <span key={i} className="char inline-block" style={{ willChange: 'transform' }}>{char === ' ' ? '\u00A0' : char}</span>
    ))
  }

  useEffect(() => {
    const handleLoad = () => {
      document.body.classList.remove('loading')
      setIsLoaded(true)
    }

    // Wait for background images to load
    // Note: we target both regular images and bento images if possible
    const imgLoad = imagesLoaded(document.querySelectorAll('.grid__item-img'), { background: true }, handleLoad)

    return () => {
      // Cleanup
    }
  }, [])

  useEffect(() => {
    if (!isLoaded) return

    // Animate Text Element
    if (textRef.current) {
      const chars = textRef.current.querySelectorAll('.char')
      gsap.timeline({
        scrollTrigger: {
          trigger: textRef.current,
          scroller: scroller || undefined,
          start: 'top bottom',
          end: 'center center-=25%',
          scrub: 1,
        }
      })
        .from(chars, {
          ease: 'sine.out',
          yPercent: 300,
          autoAlpha: 0,
          stagger: {
            each: 0.05,
            from: 'center'
          }
        })
    }

    // Animate Full Grid
    if (gridFullRef.current) {
      const gridFullItems = gridFullRef.current.querySelectorAll('.grid__item')
      const numColumns = getComputedStyle(gridFullRef.current).getPropertyValue('grid-template-columns').split(' ').length
      const middleColumnIndex = Math.floor(numColumns / 2)

      const columns: Element[][] = Array.from({ length: numColumns }, () => [])
      gridFullItems.forEach((item: any) => {
        const colAttr = item.getAttribute('data-col');
        // Use data-col if available, fallback to a safe index calculation
        const columnIndex = colAttr !== null ? parseInt(colAttr, 10) : 0;
        if (columns[columnIndex]) {
          columns[columnIndex].push(item)
        }
      })

      columns.forEach((columnItems, columnIndex) => {
        const delayFactor = Math.abs(columnIndex - middleColumnIndex) * 0.2

        gsap.timeline({
          scrollTrigger: {
            trigger: gridFullRef.current,
            scroller: scroller || undefined,
            start: 'top bottom',
            end: 'center center',
            scrub: 1.5,
          }
        })
          .from(columnItems, {
            yPercent: 450,
            autoAlpha: 0,
            delay: delayFactor,
            ease: 'sine.out',
          })
          .from(columnItems.map(item => item.querySelector('.grid__item-img')), {
            transformOrigin: '50% 0%',
            ease: 'sine.out',
          }, 0)
      })

      // Specific animation for Bento Container
      const bentoContainer = gridFullRef.current.querySelector('.bento-container')

      if (bentoContainer) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: gridFullRef.current,
            scroller: scroller || undefined,
            start: 'top top+=15%',
            end: 'bottom center',
            scrub: 1,
            invalidateOnRefresh: true,
          }
        })

        // Animate Bento Container to move down and scale
        tl.to(bentoContainer, {
          y: window.innerHeight * 0.1, // Move down relative to grid
          scale: 1.5, // Scale up the whole group
          zIndex: 1000,
          ease: 'power2.out', // Smooth easing
          duration: 1,
          force3D: true // Force hardware acceleration
        }, 0)
      }
    }
  }, [isLoaded])

  // Prepare grid items: fill up to the end of Row 3 (21 slots)
  // This perfectly balances the 3rd row with 2 cards on each side of the bento container.
  const mixedGridItems: (string | 'BENTO_GROUP')[] = Array.from({ length: 21 }, (_, i) => images[i % images.length]);

  // Replace the slot where we want the bento group
  // Position at index 16 = Row 3 (middle row), spanning columns 3-5 (center)
  mixedGridItems[16] = 'BENTO_GROUP';

  return (
    <div
      className={cn("shadow relative overflow-hidden w-full", className)}
      style={{
        '--grid-item-translate': '0px',
      } as React.CSSProperties}
    >
      <section className="grid place-items-center w-full relative mt-[6vh]">
        <div ref={textRef} className="text font-alt uppercase flex content-center text-[clamp(3rem,14vw,10rem)] leading-[0.7] text-neutral-900 dark:text-white">
          {splitText(centerText)}
        </div>
      </section>

      <section className="grid place-items-center w-full relative">
        <div ref={gridFullRef} className="grid--full relative w-full mt-[4vh] mb-8 pb-4 h-auto aspect-[1.8] max-w-none p-4 grid gap-4 grid-cols-7 grid-rows-3">
          <div className="grid-overlay absolute inset-0 z-[15] pointer-events-none opacity-0 bg-white/80 dark:bg-black/80 rounded-lg transition-opacity duration-500" />
          {mixedGridItems.map((item, i) => {
            if (item === 'BENTO_GROUP') {
              // Render the HoverExpand Group using passed bentoItems
              if (!bentoItems || bentoItems.length === 0) return null;

              return (
                <div key="bento-group" data-col={2} className="grid__item bento-container col-span-3 row-span-1 relative z-20 flex items-center justify-center gap-2 h-full w-full will-change-transform">
                  {bentoItems.map((bentoItem, index) => {
                    const isActive = activeBento === index;
                    return (
                      <div
                        key={bentoItem.id}
                        className={cn(
                          "relative cursor-pointer overflow-hidden rounded-2xl h-full transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]",
                          isActive
                            ? "bg-zinc-900/10 shadow-2xl"
                            : "bg-zinc-950"
                        )}
                        style={{ width: isActive ? (bentoItems.length === 4 ? "52%" : "60%") : (bentoItems.length === 4 ? "16%" : "20%") }}
                        onMouseEnter={() => setActiveBento(index)}
                        onClick={() => {
                          if (isActive && bentoItem.href) {
                            if (bentoItem.href.startsWith('mailto:')) {
                              window.location.href = bentoItem.href;
                            } else {
                              window.open(bentoItem.href, '_blank', 'noopener,noreferrer');
                            }
                          } else {
                            setActiveBento(index);
                          }
                        }}
                      >
                        {/* Border Overlay - Fixes edge artifacts by sitting on top */}
                        <div className={cn(
                          "absolute inset-0 rounded-2xl border z-50 pointer-events-none transition-colors duration-700",
                          isActive
                            ? "border-zinc-500/50"
                            : "border-zinc-800/50 group-hover:border-zinc-700"
                        )} />

                        {/* Content Container */}
                        <div className="relative z-10 w-full h-full flex flex-col p-0">
                          {/* Active State Content */}
                          <div className={cn(
                            "absolute inset-0 flex flex-col transition-all duration-500 ease-in-out",
                            isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
                          )}>
                            {/* Image - Full Coverage */}
                            <div className="absolute inset-0 bg-zinc-900 overflow-hidden z-0 group/img">
                              {bentoItem.image && (
                                <>
                                  <img
                                    src={bentoItem.image}
                                    alt={bentoItem.title}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 opacity-90 group-hover/img:opacity-100"
                                  />
                                  {/* Text Protection Gradient - Shadow peaking from bottom */}
                                  <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none" />
                                </>
                              )}
                            </div>

                            {/* Footer Row - Full Width with Shadow */}
                            <div className="absolute bottom-0 left-0 w-full h-20 flex items-center justify-between px-5 z-20">


                              <div className="flex flex-col relative z-10">
                                <h3 className="text-sm font-bold text-white drop-shadow-md leading-none tracking-tight">{bentoItem.title}</h3>
                              </div>
                              <div className="text-white/90 transition-colors hover:text-white drop-shadow-md relative z-10">
                                {bentoItem.icon}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Inactive State - Icon + Title - Centered */}
                        <div className={cn(
                          "absolute inset-0 flex flex-col items-center justify-center gap-2 transition-all duration-500",
                          isActive ? "opacity-0 scale-90 pointer-events-none" : "opacity-100 scale-100"
                        )}>
                          <div className="text-white/50 group-hover:text-white transition-colors">
                            {bentoItem.icon}
                          </div>
                          <span className="text-[10px] font-medium text-zinc-500 group-hover:text-zinc-300 transition-colors uppercase tracking-wider">{bentoItem.title}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            }

            // Skip rendering for the slots that the group takes up
            // Group starts at 16, takes 17, 18.
            if (i === 17 || i === 18) return null;

            if (typeof item === 'string') {
              const Icon = i % 4 === 0 ? FaGithub : i % 4 === 1 ? FaLinkedin : i % 4 === 2 ? FaTwitter : FaEnvelope;
              const label = i % 4 === 0 ? "Github" : i % 4 === 1 ? "LinkedIn" : i % 4 === 2 ? "Twitter" : "Email";

              return (
                <figure key={`img-${i}`} data-col={i % 7} className="grid__item m-0 relative z-10 [perspective:800px] will-change-[transform,opacity] group cursor-pointer">
                  <div className="grid__item-img w-full h-full [backface-visibility:hidden] will-change-transform rounded-xl overflow-hidden shadow-sm border border-zinc-200 dark:border-zinc-900 bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center transition-all duration-500 ease-out group-hover:scale-105 group-hover:shadow-xl group-hover:border-transparent">

                    {/* Gradient Overlay for Hover */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/80 to-black backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0" />

                    {/* Content Container */}
                    <div className="relative z-10 flex flex-col items-center justify-center gap-3">
                      {/* Icon */}
                      <Icon className="w-8 h-8 text-zinc-400 dark:text-zinc-500 transition-all duration-300 group-hover:text-white group-hover:scale-110" />

                      {/* Text Reveal */}
                      <div className="text-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 delay-75">
                        <span className="block text-[10px] font-medium text-white/90 uppercase tracking-wider mb-0.5">Build with</span>
                        <span className="block text-sm font-bold text-white tracking-tight">{label}</span>
                      </div>
                    </div>
                  </div>
                </figure>
              )
            }
            return null;
          })}
        </div>
      </section >

      {showFooter && (
        <footer className="w-full pt-4 pb-3 sm:pb-4 px-8 flex flex-col sm:flex-row justify-between items-center gap-4 relative z-50 text-neutral-400 text-xs tracking-wider border-t border-white/5">
          <span>&copy; {new Date().getFullYear()} Harman Saini. All Rights Reserved.</span>
          <div className="flex items-center gap-5">
            <a href={SOCIAL_LINKS.github.url} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">GitHub</a>
            <a href={SOCIAL_LINKS.linkedin.url} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">LinkedIn</a>
            <a href={SOCIAL_LINKS.twitter.url} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">Twitter</a>
            <a href={SOCIAL_LINKS.email.url} className="hover:text-cyan-400 transition-colors">Email</a>
          </div>
          <span className="text-cyan-400/80 font-mono">Designed &amp; Developed with Precision</span>
        </footer>
      )}
    </div >
  )
}

export default StaggeredGrid
