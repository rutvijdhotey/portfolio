// components/ThemeScript.tsx
// Stamps data-theme on <html> before first paint, so a light-mode visitor
// never sees a black flash. Must stay inline and synchronous. The logic is
// a hand-inlined copy of resolveTheme in lib/theme.ts — keep them in step.

const SCRIPT = `(function(){try{
var s=localStorage.getItem('theme');
var l=window.matchMedia('(prefers-color-scheme: light)').matches;
document.documentElement.dataset.theme=(s==='dark'||s==='light')?s:(l?'light':'dark');
}catch(e){}})();`

export default function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />
}
