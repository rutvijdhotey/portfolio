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
  const imgRef = useRef<HTMLImageElement>(null)
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
      gsap.fromTo(imgRef.current, { scale: 0.95, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'power2.out' })
      document.body.style.overflow = 'hidden'
    } else {
      gsap.to(el, { opacity: 0, duration: 0.3, ease: 'power2.in' })
      document.body.style.overflow = ''
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
    const next = (displayIndex + dir + items.length) % items.length
    const sign = dir > 0 ? 1 : -1
    gsap.to(imgRef.current, {
      opacity: 0, x: sign * -40, duration: 0.2, ease: 'power2.in',
      onComplete: () => {
        setDisplayIndex(next)
        onNavigate(next)
        gsap.fromTo(imgRef.current, { opacity: 0, x: sign * 40 }, { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' })
      },
    })
  }

  const item = items[displayIndex]

  return (
    <div ref={overlayRef} className={`overlay${open ? ' overlay--open' : ''}`}>
      <button className="overlay-close" onClick={onClose}>✕ Close</button>
      <button className="overlay-arrow overlay-arrow--prev" onClick={() => navigate(-1)}>←</button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={imgRef} className="overlay-img" src={item?.src ?? ''} alt={item?.alt ?? ''} />
      <button className="overlay-arrow overlay-arrow--next" onClick={() => navigate(1)}>→</button>
      <span className="overlay-counter">{displayIndex + 1} / {items.length}</span>
    </div>
  )
}
