'use client'

import Photo from './Photo'
import { printSizes } from '@/lib/print-room'
import { frameAsItem, type Frame } from '@/lib/trips'

interface Props {
  frames: Frame[]
  onFrameClick?: (index: number) => void
}

export default function PrintRoom({ frames, onFrameClick }: Props) {
  return (
    <div className="print-room">
      {frames.map((f, i) => (
        <figure key={f.id} className="print-frame" data-orient={f.orientation}>
          <Photo
            item={frameAsItem(f)}
            sizes={printSizes(f.orientation)}
            priority={i === 0}
            onClick={onFrameClick ? () => onFrameClick(i) : undefined}
          />
          <figcaption className="print-cap">
            <span>{f.tripTitle}</span>
            <span className="print-cap__n">{String(i + 1).padStart(2, '0')}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  )
}
