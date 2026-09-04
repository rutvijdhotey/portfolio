import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import './home.css'

/* The Shinjuku walkway frame, already on Supabase as a purpose-built AVIF poster. */
const HERO = 'https://knlwzjvuqipjrjpgnovc.supabase.co/storage/v1/object/public/portfolio/optimized/covers/creative-hero-poster.avif'

export default function Home() {
  return (
    <main className="landing">
      <div className="landing__bg" style={{ backgroundImage: `url(${HERO})` }} />

      <div className="landing__top">
        <span className="landing__name">Rutvij Dhotey</span>
        <ThemeToggle />
      </div>

      <div className="landing__mid">
        <h1 className="landing__statement">
          I&rsquo;m a software engineer at YouTube.
          I photograph my travels so I can <em>look back on them in fifty years</em>.
        </h1>
        <div className="landing__doors">
          <Link href="/photography" className="landing__door">Photography →</Link>
          <Link href="/about" className="landing__door">About &amp; engineering →</Link>
        </div>
      </div>

      <div className="landing__bottom">
        <div className="landing__meta">
          <span>Japan</span><span>Copenhagen</span><span>Paris</span>
          <a href="https://instagram.com/intoyourstories" target="_blank" rel="noopener">@intoyourstories</a>
        </div>
      </div>
    </main>
  )
}
