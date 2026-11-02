import type { Metadata } from 'next'

/*
 * rutvijdhotey.com/ sends visitors to /engineering.
 * The site is a static export on GitHub Pages, so next.config redirects and
 * server 3xx responses are not available. A zero-delay meta refresh does the
 * work without JavaScript; the inline script covers browsers that ignore it,
 * and the link is there if both fail. The old landing page lives at /home.
 */
const TARGET = '/engineering'

export const metadata: Metadata = {
  title: { absolute: 'Rutvij Dhotey' },
  alternates: { canonical: TARGET },
  robots: { index: false, follow: true },
}

export default function RootRedirect() {
  return (
    <>
      <meta httpEquiv="refresh" content={`0;url=${TARGET}`} />
      <script dangerouslySetInnerHTML={{ __html: `location.replace(${JSON.stringify(TARGET)})` }} />
      <p style={{ padding: 16 }}>
        Redirecting to <a href={TARGET}>{TARGET}</a>…
      </p>
    </>
  )
}
