// components/engineering/Intro.tsx
import IntroSeen from './IntroSeen'

/* Line-art camera that draws itself over a short progress bar, then leaves.
   The overlay is pure CSS and ends itself (its last keyframe is
   visibility:hidden, fill-mode forwards), so it cannot get stuck, even with
   JS dead. It is a ~1.6s timed intro, not a fake load meter.

   The script runs during parsing, before first paint, so a visitor who has
   already seen it this session never does again. Keep the storage key in
   step with IntroSeen.tsx. */
const SCRIPT = `(function(){try{
if(sessionStorage.getItem('eng-intro-seen')){document.documentElement.dataset.intro='seen';}
}catch(e){}})();`

export default function Intro() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />
      <div className="eng-intro" aria-hidden="true">
        <svg viewBox="0 0 240 160" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="20" y="44" width="200" height="100" rx="14" pathLength={1} />
          <path d="M84 44 96 24h48l12 20" pathLength={1} />
          <circle cx="120" cy="94" r="32" pathLength={1} />
          <circle cx="120" cy="94" r="18" pathLength={1} />
          <rect x="40" y="58" width="22" height="12" rx="3" pathLength={1} />
        </svg>
        <div className="eng-intro-bar"><span /></div>
        <p className="eng-intro-label">Loading</p>
      </div>
      <IntroSeen />
    </>
  )
}
