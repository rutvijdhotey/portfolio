// app/page.tsx
'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import './home.css'

export default function Home() {
  const engRef = useRef<HTMLDivElement>(null)
  const creativeRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.panel__content', {
        opacity: 0,
        duration: 1.4,
        ease: 'power3.out',
        stagger: 0.2,
        delay: 0.3,
      })
      gsap.from('.site-name', {
        opacity: 0,
        y: -10,
        duration: 1.2,
        ease: 'power3.out',
        delay: 0.6,
      })
      gsap.from('.divider', {
        scaleY: 0,
        transformOrigin: 'top center',
        duration: 1.4,
        ease: 'power3.inOut',
        delay: 0.2,
      })
    })
    return () => ctx.revert()
  }, [])

  function navigate(dest: 'engineering' | 'creative') {
    const panel = dest === 'engineering' ? engRef.current : creativeRef.current
    const other = dest === 'engineering' ? creativeRef.current : engRef.current
    gsap.to(other, { opacity: 0, duration: 0.4, ease: 'power2.in' })
    gsap.to(panel, {
      width: '100vw',
      duration: 0.7,
      ease: 'power3.inOut',
      onComplete: () => router.push(`/${dest}`),
    })
  }

  return (
    <>
      <div className="site-name">Rutvij Dhotey</div>
      <div className="divider" />
      <div className="split">
        <div ref={engRef} className="panel panel--eng" onClick={() => navigate('engineering')}>
          <div className="bg-img" />
          <div className="panel-overlay" />
          <div className="panel__content">
            <h2 className="panel__heading">Engineering</h2>
            <p className="panel__sub">Work experience &amp; projects</p>
          </div>
          <div className="panel__enter">Enter →</div>
        </div>

        <div ref={creativeRef} className="panel panel--creative" onClick={() => navigate('creative')}>
          <div className="bg-img" />
          <div className="panel-overlay" />
          <div className="panel__content">
            <h2 className="panel__heading">Creative</h2>
            <p className="panel__sub">Travel &amp; photography</p>
          </div>
          <div className="panel__enter">Enter →</div>
        </div>
      </div>
    </>
  )
}
