'use client'

import { useEffect, useRef } from 'react'
import { gazeOffset } from '@/lib/gaze'

/* Line portrait for /engineering, drawn from Rutvij's photograph in the
   flat sticker style of poulo.site: swept-up hair, thick brows, stubble,
   round glasses and a plain collared shirt, cut off flat at the chest.

   It is monochrome on purpose. The face and shirt are white and the lines
   near-black in both themes; only the sticker edge follows the theme,
   through currentColor, so the parent sets it with `color` and no theme
   reader is needed.

   The only motion is two pupils. Everything is drawn in the markup and stays
   drawn with JS off, so there is no reveal that can get stuck. */

/* Where the eyes sit inside the viewBox, as a fraction of its height, so the
   gaze is aimed from the eyes rather than the middle of the drawing. */
const EYE_LINE = (96 - 12) / 220

const FACE = 'M52 98C52 58 74 40 100 40S148 58 148 98C148 140 126 168 100 168S52 140 52 98Z'
const HAIR_TOP = 'M54 86C50 64 56 46 70 36C82 27 94 24 106 23C122 20 138 22 146 32C153 42 151 56 149 66C149 74 148 80 146 86'

export default function Portrait({ className }: { className?: string }) {
  const svg = useRef<SVGSVGElement>(null)
  const pupils = useRef<SVGGElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let frame = 0
    let x = 0
    let y = 0
    const aim = () => {
      frame = 0
      const box = svg.current?.getBoundingClientRect()
      if (!box) return
      const g = gazeOffset(x - (box.left + box.width / 2), y - (box.top + box.height * EYE_LINE))
      pupils.current?.setAttribute('transform', `translate(${g.x.toFixed(1)} ${g.y.toFixed(1)})`)
    }
    const onMove = (e: PointerEvent) => {
      x = e.clientX
      y = e.clientY
      if (!frame) frame = requestAnimationFrame(aim)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <svg
      ref={svg}
      className={className}
      width="200"
      height="220"
      viewBox="0 12 200 220"
      role="img"
      aria-label="Line drawing of Rutvij in round glasses, looking toward your cursor"
    >
      {/* ── sticker edge: the silhouette, stroked wide in the theme colour ── */}
      <g fill="currentColor" stroke="currentColor" strokeWidth="9" strokeLinejoin="round">
        <path d="M14 232C16 196 48 180 86 176V146H114V176C152 180 184 196 186 232Z" />
        <circle cx="52" cy="104" r="10" />
        <circle cx="148" cy="104" r="10" />
        <path d={FACE} />
        <path d={`${HAIR_TOP}Z`} />
      </g>

      <g fill="#fff" stroke="#111" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round">
        {/* neck, shirt, collar, buttons */}
        <path d="M86 146V186L100 196L114 186V146Z" />
        <path d="M14 232C16 196 48 180 86 176L100 194L114 176C152 180 184 196 186 232Z" />
        <path d="M86 175L78 191L97 196ZM114 175L122 191L103 196Z" />
        <path d="M100 196V232" fill="none" strokeWidth="2.2" />
        <circle cx="100" cy="210" r="1.8" fill="#111" stroke="none" />
        <circle cx="100" cy="223" r="1.8" fill="#111" stroke="none" />

        {/* ears */}
        <circle cx="52" cy="104" r="10" />
        <circle cx="148" cy="104" r="10" />
        <path d="M50 100C47 104 49 109 53 109M150 100C153 104 151 109 147 109" fill="none" strokeWidth="2.2" />

        {/* face, then stubble, then the face outline again so the stubble
            does not cover it */}
        <path d={FACE} />
        <path
          d="M54 106C56 142 76 166 100 166S144 142 146 106C142 120 134 127 126 128C120 122 110 119 100 120C90 119 80 122 74 128C66 127 58 120 54 106Z"
          fill="#e2e2e2"
          stroke="none"
        />
        <path d={FACE} fill="none" />

        {/* hair, swept up at the front, with one sweep line */}
        <path
          d={`${HAIR_TOP}C143 78 140 72 136 67C126 62 114 63 104 61C92 58 80 58 71 63C63 68 58 76 56 86Z`}
          fill="#2b2b2b"
        />
        <path d="M70 50C84 37 104 31 128 32" fill="none" stroke="#6a6a6a" strokeWidth="2.2" />

        {/* brows, nose, smile */}
        <path d="M68 81C74 75 84 74 92 77M132 81C126 75 116 74 108 77" fill="none" strokeWidth="4" />
        <path d="M101 98C101 106 104 111 106 114C103 117 97 117 94 115" fill="none" strokeWidth="2.4" />
        <path d="M82 131C90 142 110 142 118 131" fill="none" strokeWidth="3.2" />

        {/* round glasses: rims, bridge, arms back to the ears */}
        <circle cx="80" cy="96" r="12.5" fill="none" />
        <circle cx="120" cy="96" r="12.5" fill="none" />
        <path d="M92.5 95C96 92 104 92 107.5 95M67.5 94L53 98M132.5 94L147 98" fill="none" />
      </g>

      {/* the two moving parts */}
      <g ref={pupils} fill="#111">
        <circle cx="80" cy="96" r="3.6" />
        <circle cx="120" cy="96" r="3.6" />
      </g>
    </svg>
  )
}
