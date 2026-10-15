import { useEffect, useRef, useState } from 'react'
import Hero from './Hero.jsx'
import { Olist, EduTrack, Pomodoro } from './Projects.jsx'
import Experience from './Experience.jsx'
import { skills, EMAIL } from './data.js'

const links = [['proyek', 'Proyek'], ['pengalaman', 'Pengalaman'], ['keahlian', 'Keahlian'], ['kontak', 'Kontak']]
const h2 = 'font-display text-4xl font-extrabold leading-none tracking-[-0.03em] md:text-6xl'

function Nav() {
  const bar = useRef(null)
  const [active, setActive] = useState('')
  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const d = document.documentElement
        const r = d.scrollTop / Math.max(1, d.scrollHeight - d.clientHeight)
        if (bar.current) bar.current.style.transform = `scaleX(${Math.min(1, r)})`
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll()
    const io = new IntersectionObserver((en) => en.forEach((x) => x.isIntersecting && setActive(x.target.id)), { rootMargin: '-40% 0px -55% 0px' })
    links.forEach(([id]) => { const el = document.getElementById(id); el && io.observe(el) })
    return () => { window.removeEventListener('scroll', onScroll); io.disconnect(); cancelAnimationFrame(raf) }
  }, [])
  return (
    <header className="sticky top-0 z-50 bg-paper">
      <nav className="font-display mx-auto flex max-w-[1240px] items-center justify-between gap-4 px-5 py-3 md:px-8" aria-label="Navigasi utama">
        <a href="#top" className="text-lg font-extrabold tracking-tight">Naila</a>
        <ul className="flex gap-4 text-[15px] font-semibold md:gap-8">
          {links.map(([id, t]) => (
            <li key={id}>
              <a href={`#${id}`} aria-current={active === id ? 'true' : undefined}
                className={`border-b-[3px] pb-0.5 ${active === id ? 'border-cobalt' : 'border-transparent hover:border-sun'}`}>{t}</a>
            </li>
          ))}
        </ul>
      </nav>
      <div ref={bar} className="h-[3px] origin-left scale-x-0 bg-cobalt" aria-hidden="true" />
    </header>
  )
}

function Contact() {
  const [ok, setOk] = useState(false)
  const copy = async () => {
    try { await navigator.clipboard.writeText(EMAIL) }
    catch { const t = document.createElement('textarea'); t.value = EMAIL; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove() }
    setOk(true); setTimeout(() => setOk(false), 2200)
  }
  return (
    <section id="kontak" className="on-sun scroll-mt-16 bg-sun">
      <div className="mx-auto max-w-[1240px] px-5 py-20 md:px-8 md:py-28">
        <h2 className={h2}>Kontak</h2>
        <p className="prose-line mt-5 text-xl">Terbuka untuk magang dan posisi entry-level. Email atau WhatsApp, mana yang lebih nyaman.</p>
        <p className="font-display mt-8 break-all text-[clamp(1.4rem,4.4vw,3rem)] font-bold leading-tight tracking-tight">
          <a className="ulink" href={`mailto:${EMAIL}`}>{EMAIL}</a>
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button className="btn btn-solid" onClick={copy}>{ok ? 'Tersalin' : 'Salin email'}</button>
          <a className="btn" href="https://wa.me/6287876128379" target="_blank" rel="noreferrer">WhatsApp 087876128379</a>
          <a className="btn" href="/CV_Naila_Shabrina.pdf" download>Unduh CV</a>
          <span className="sr-only" aria-live="polite">{ok ? 'Email tersalin ke clipboard' : ''}</span>
        </div>
        <p className="mt-10 text-ink">Cibinong, Bogor, Indonesia</p>
      </div>
    </section>
  )
}

export default function App() {
  return (
    <div id="top">
      <a href="#proyek" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[60] focus:bg-sun focus:px-3 focus:py-2">Lewati ke proyek</a>
      <Nav />
      <main>
        <Hero />

        <section id="proyek" className="scroll-mt-16 pt-20 md:pt-28">
          <div className="mx-auto max-w-[1240px] space-y-24 px-5 pb-24 md:space-y-32 md:px-8 md:pb-32">
            <h2 className={h2}>Proyek terpilih</h2>
            <Olist />
            <EduTrack />
          </div>
          <Pomodoro />
        </section>

        <section id="pengalaman" className="scroll-mt-16 bg-butter"><div className="mx-auto grid max-w-[1240px] gap-10 px-5 py-24 md:px-8 md:py-32 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <h2 className={h2}>Pengalaman</h2>
              <p className="mt-4 text-mute">Klik tiap peran untuk membuka atau menutup daftar tugasnya.</p>
            </div>
          </div>
          <div className="lg:col-span-8"><Experience /></div>
        </div></section>

        <section id="keahlian" className="scroll-mt-16 mx-auto grid max-w-[1240px] gap-10 px-5 py-24 md:px-8 md:py-32 lg:grid-cols-12">
          <h2 className={`${h2} lg:col-span-4`}>Keahlian</h2>
          <dl className="lg:col-span-8">
            {skills.map(([k, v]) => (
              <div key={k} className="grid gap-1 py-4 first:pt-0 md:grid-cols-[13rem_1fr] md:gap-6">
                <dt className="font-display text-lg font-bold">{k}</dt>
                <dd className="prose-line">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <Contact />
      </main>
      <footer className="bg-ink px-5 py-6 text-center text-sm text-paper">© 2026 Naila Shabrina</footer>
    </div>
  )
}
