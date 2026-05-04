// components/OverlayViewer.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { GalleryItem } from '@/lib/gallery-items'
import './overlay.css'

interface Props {
  items: GalleryItem[]
  open: boolean
  currentIndex: number
  onClose: () => void
  onNavigate: (index: number) => void
}

export default function OverlayViewer({ items, open, currentIndex, onClose, onNavigate }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const mediaRef = useRef<HTMLElement | null>(null)
  const [displayIndex, setDisplayIndex] = useState(currentIndex)

  // Sync displayIndex when overlay opens or parent changes currentIndex
  useEffect(() => {
    if (open) setDisplayIndex(currentIndex)
  }, [open, currentIndex])

  // Open/close animation — only reacts to `open`, never re-triggers on navigation
  useEffect(() => {
    const el = overlayRef.current
    if (!el) return
    if (open) {
      gsap.to(el, { opacity: 1, duration: 0.4, ease: 'power2.out' })
      gsap.fromTo(mediaRef.current, { scale: 0.95, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'power2.out' })
      document.body.style.overflow = 'hidden'
    } else {
      gsap.to(el, { opacity: 0, duration: 0.3, ease: 'power2.in' })
      document.body.style.overflow = ''
      // Pause video when closing
      if (mediaRef.current instanceof HTMLVideoElement) mediaRef.current.pause()
    }
  }, [open])

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!open) return
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') navigate(-1)
      if (e.key === 'ArrowRight') navigate(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  function navigate(dir: number) {
    // Pause current video before navigating away
    if (mediaRef.current instanceof HTMLVideoElement) mediaRef.current.pause()

    const next = (displayIndex + dir + items.length) % items.length
    const sign = dir > 0 ? 1 : -1
    gsap.to(mediaRef.current, {
      opacity: 0, x: sign * -40, duration: 0.2, ease: 'power2.in',
      onComplete: () => {
        setDisplayIndex(next)
        onNavigate(next)
        gsap.fromTo(mediaRef.current, { opacity: 0, x: sign * 40 }, { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' })
      },
    })
  }

  const item = items[displayIndex]

  return (
    <div ref={overlayRef} className={`overlay${open ? ' overlay--open' : ''}`}>
      <button className="overlay-close" onClick={onClose}>✕ Close</button>
      <button className="overlay-arrow overlay-arrow--prev" onClick={() => navigate(-1)}>←</button>

      {item?.type === 'video' ? (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video
          ref={mediaRef as React.RefObject<HTMLVideoElement>}
          key={item.src}
          className="overlay-video"
          src={item.src}
          controls
          autoPlay
          playsInline
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={mediaRef as React.RefObject<HTMLImageElement>}
          className="overlay-img"
          src={item?.src ?? ''}
          alt={item?.alt ?? ''}
        />
      )}

      <button className="overlay-arrow overlay-arrow--next" onClick={() => navigate(1)}>→</button>
      <span className="overlay-counter">{displayIndex + 1} / {items.length}</span>
    </div>
  )
}
