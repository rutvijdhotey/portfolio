// components/engineering/CaseMedia.tsx
// Server components for the case studies' images and video. A self-hosted
// copy (listed in lib/case-assets.json) is served as AVIF/WebP with its real
// size, so the layout never jumps; until it exists the Supabase original is
// used, lazily, as before.

import manifest from '@/lib/case-assets.json'
import {
  findImage, findVideo, imagePaths, posterPath, sourceOf, srcSet, videoPath, type Manifest,
} from '@/lib/case-assets'

const M = manifest as Manifest

export function CaseImage({
  assetKey, alt, sizes, className, priority = false,
}: { assetKey: string; alt: string; sizes: string; className?: string; priority?: boolean }) {
  const loading = priority ? 'eager' : 'lazy'
  const e = findImage(M, assetKey)
  if (!e) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className={className} src={sourceOf(assetKey)} alt={alt} loading={loading} decoding="async" />
  }
  const fallback = imagePaths(assetKey, e.widths, 'webp').at(-1)
  return (
    <picture>
      <source type="image/avif" srcSet={srcSet(assetKey, e.widths, 'avif')} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(assetKey, e.widths, 'webp')} sizes={sizes} />
      <img className={className} src={fallback} alt={alt} width={e.w} height={e.h} loading={loading} decoding="async" />
    </picture>
  )
}

/** The largest available version, for a "view full size" link. */
export function fullSizeHref(assetKey: string): string {
  const e = findImage(M, assetKey)
  return e ? imagePaths(assetKey, e.widths, 'webp').at(-1)! : sourceOf(assetKey)
}

export function CaseVideo({ assetKey, label, className }: { assetKey: string; label: string; className?: string }) {
  const e = findVideo(M, assetKey)
  const src = e ? videoPath(assetKey) : sourceOf(assetKey)
  return (
    <video
      className={className}
      controls
      playsInline
      preload="none"
      aria-label={label}
      {...(e ? { poster: posterPath(assetKey), width: e.w, height: e.h } : {})}
    >
      <source src={src} type="video/mp4" />
      <a href={src}>Download the demo video</a>
    </video>
  )
}
