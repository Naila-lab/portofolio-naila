import { useEffect, useRef, useState } from 'react'

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
let topZ = 20
const INK = '#0F1B3F', SUN = '#FFD84D', BUTTER = '#FFF1BF'
const bodies = new Map()
const pairs = new Map()

function collide(id, onBump) {
  const me = bodies.get(id)
  if (!me) return
  const a = me.el.getBoundingClientRect()
  const ax = a.left + a.width / 2, ay = a.top + a.height / 2
  for (const [oid, o] of bodies) {
    if (oid === id) continue
    const b = o.el.getBoundingClientRect()
    const bx = b.left + b.width / 2, by = b.top + b.height / 2
    const dx = bx - ax, dy = by - ay, dist = Math.hypot(dx, dy) || 1
    if (dist >= (a.width + b.width) * 0.42) continue
    const key = [id, oid].sort().join('|'), now = performance.now()
    if (now - (pairs.get(key) || 0) < 800) continue
    pairs.set(key, now)
    const nx = dx / dist, ny = dy / dist
    const speed = Math.hypot(me.s.vx - o.s.vx, me.s.vy - o.s.vy)
    const power = Math.max(7, Math.min(18, speed * 1.1))
    if (!reduced()) {
      o.kick(nx * power, ny * power)
      if (!me.s.drag) me.kick(-nx * power * 0.6, -ny * power * 0.6)
    }
    me.hit(); o.hit()
    onBump && onBump((ax + bx) / 2, (ay + by) / 2)
  }
}

function Sticker({ stage, id, rot = 0, label, className = '', style, onTap, onHit, onBump, children }) {
  const cb = useRef({})
  cb.current = { onHit, onBump }
  const el = useRef(null)
  const s = useRef({ x: 0, y: 0, vx: 0, vy: 0, raf: 0, drag: false, px: 0, py: 0, ox: 0, oy: 0, lx: 0, ly: 0, moved: 0 })

  const paint = (tilt = 0) => {
    const p = s.current
    el.current.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`
    el.current.style.rotate = `${rot + tilt}deg`
  }
  const bound = (bounce) => {
    const st = stage.current, e = el.current, p = s.current
    if (!st || !e) return
    const minX = -e.offsetLeft, maxX = st.clientWidth - e.offsetLeft - e.offsetWidth
    const minY = -e.offsetTop, maxY = st.clientHeight - e.offsetTop - e.offsetHeight
    if (p.x < minX) { p.x = minX; if (bounce) p.vx = Math.abs(p.vx) * 0.5 }
    if (p.x > maxX) { p.x = maxX; if (bounce) p.vx = -Math.abs(p.vx) * 0.5 }
    if (p.y < minY) { p.y = minY; if (bounce) p.vy = Math.abs(p.vy) * 0.5 }
    if (p.y > maxY) { p.y = maxY; if (bounce) p.vy = -Math.abs(p.vy) * 0.5 }
  }
  const tick = () => {
    const p = s.current
    p.x += p.vx; p.y += p.vy
    p.vx *= 0.94; p.vy *= 0.94
    bound(true)
    paint(Math.max(-14, Math.min(14, p.vx * 1.6)))
    if (id) collide(id, cb.current.onBump)
    if (Math.abs(p.vx) + Math.abs(p.vy) > 0.2) p.raf = requestAnimationFrame(tick)
    else { p.raf = 0; paint(0) }
  }

  useEffect(() => {
    paint(0)
    const onResize = () => { bound(false); paint(0) }
    window.addEventListener('resize', onResize)
    if (id) {
      bodies.set(id, {
        el: el.current, s: s.current,
        hit: () => cb.current.onHit && cb.current.onHit(),
        kick: (vx, vy) => {
          const p = s.current
          if (p.drag) return
          p.vx = vx; p.vy = vy
          if (!p.raf) p.raf = requestAnimationFrame(tick)
        }
      })
    }
    return () => { window.removeEventListener('resize', onResize); cancelAnimationFrame(s.current.raf); if (id) bodies.delete(id) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const down = (e) => {
    const p = s.current
    e.currentTarget.setPointerCapture(e.pointerId)
    cancelAnimationFrame(p.raf); p.raf = 0
    p.drag = true; p.px = e.clientX; p.py = e.clientY; p.ox = p.x; p.oy = p.y
    p.lx = e.clientX; p.ly = e.clientY; p.vx = 0; p.vy = 0; p.moved = 0
    el.current.style.zIndex = ++topZ
  }
  const move = (e) => {
    const p = s.current
    if (!p.drag) return
    p.moved += Math.abs(e.clientX - p.lx) + Math.abs(e.clientY - p.ly)
    p.x = p.ox + e.clientX - p.px; p.y = p.oy + e.clientY - p.py
    p.vx = (e.clientX - p.lx) * 0.6 + p.vx * 0.4
    p.vy = (e.clientY - p.ly) * 0.6 + p.vy * 0.4
    p.lx = e.clientX; p.ly = e.clientY
    bound(false)
    paint(reduced() ? 0 : Math.max(-14, Math.min(14, p.vx * 1.2)))
    if (id) collide(id, cb.current.onBump)
  }
  const up = () => {
    const p = s.current
    if (!p.drag) return
    p.drag = false
    if (p.moved < 6 && onTap) onTap()
    if (reduced()) { p.vx = 0; p.vy = 0; paint(0) } else tick()
  }
  const key = (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && onTap) { e.preventDefault(); onTap(); return }
    const d = { ArrowLeft: [-20, 0], ArrowRight: [20, 0], ArrowUp: [0, -20], ArrowDown: [0, 20] }[e.key]
    if (!d) return
    e.preventDefault()
    s.current.x += d[0]; s.current.y += d[1]
    bound(false); paint(0)
  }

  return (
    <div
      ref={el}
      role="group"
      tabIndex={0}
      aria-label={`${label}. Bisa digeser dengan mouse, sentuhan, atau tombol panah.`}
      onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onKeyDown={key}
      className={`sticker absolute ${className}`}
      style={{ zIndex: 20, ...style }}
    >
      {children}
    </div>
  )
}


function Eyes({ face, lx, rx, y }) {
  if (face === 'ouch') return (
    <g stroke={INK} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d={`M${lx - 5} ${y - 5} L${lx + 5} ${y} L${lx - 5} ${y + 5}`} />
      <path d={`M${rx + 5} ${y - 5} L${rx - 5} ${y} L${rx + 5} ${y + 5}`} />
    </g>
  )
  if (face === 'happy') return (
    <g stroke={INK} strokeWidth="3.5" strokeLinecap="round" fill="none">
      <path d={`M${lx - 5} ${y + 2} Q${lx} ${y - 6} ${lx + 5} ${y + 2}`} />
      <path d={`M${rx - 5} ${y + 2} Q${rx} ${y - 6} ${rx + 5} ${y + 2}`} />
    </g>
  )
  return (
    <g>
      {[lx, rx].map((x) => (
        <g key={x}><circle cx={x} cy={y} r="4.8" fill={INK} /><circle cx={x + 1.6} cy={y - 1.6} r="1.6" fill="#fff" /></g>
      ))}
    </g>
  )
}

function TeddySvg({ face, svg, eyes }) {
  return (
    <svg ref={svg} viewBox="0 0 120 140" className="block w-full" aria-hidden="true">
      <g stroke={INK} strokeWidth="4" strokeLinejoin="round" fill={SUN}>
        <circle cx="27" cy="34" r="15" /><circle cx="93" cy="34" r="15" />
        <ellipse cx="60" cy="112" rx="28" ry="21" />
        <ellipse cx="30" cy="108" rx="9" ry="14" transform="rotate(20 30 108)" />
        <ellipse cx="90" cy="108" rx="9" ry="14" transform="rotate(-20 90 108)" />
        <ellipse cx="44" cy="132" rx="12" ry="7" /><ellipse cx="76" cy="132" rx="12" ry="7" />
        <circle cx="60" cy="64" r="38" />
      </g>
      <circle cx="27" cy="34" r="7" fill={BUTTER} /><circle cx="93" cy="34" r="7" fill={BUTTER} />
      <ellipse cx="60" cy="74" rx="15" ry="11" fill={BUTTER} stroke={INK} strokeWidth="3" />
      <ellipse cx="60" cy="69" rx="5.5" ry="4" fill={INK} />
      <path d="M60 73v3M60 76q-4 4-8 1M60 76q4 4 8 1" stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M60 94 L47 87 L47 101Z M60 94 L73 87 L73 101Z" fill="#fff" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <circle cx="60" cy="94" r="4" fill={INK} />
      <g ref={eyes}><Eyes face={face} lx={44} rx={76} y={56} /></g>
    </svg>
  )
}

function BunnySvg({ face, svg, eyes }) {
  return (
    <svg ref={svg} viewBox="0 0 120 140" className="block w-full" aria-hidden="true">
      <g stroke={INK} strokeWidth="4" strokeLinejoin="round" fill="#fff">
        <ellipse cx="42" cy="30" rx="12" ry="27" transform="rotate(-8 42 30)" />
        <ellipse cx="78" cy="30" rx="12" ry="27" transform="rotate(8 78 30)" />
        <ellipse cx="60" cy="116" rx="26" ry="20" />
        <ellipse cx="34" cy="112" rx="8" ry="13" transform="rotate(15 34 112)" />
        <ellipse cx="86" cy="112" rx="8" ry="13" transform="rotate(-15 86 112)" />
        <ellipse cx="44" cy="134" rx="12" ry="6" /><ellipse cx="76" cy="134" rx="12" ry="6" />
        <circle cx="60" cy="72" r="36" />
      </g>
      <ellipse cx="42" cy="32" rx="5.5" ry="17" fill={SUN} transform="rotate(-8 42 30)" />
      <ellipse cx="78" cy="32" rx="5.5" ry="17" fill={SUN} transform="rotate(8 78 30)" />
      <ellipse cx="60" cy="78" rx="4" ry="3" fill={INK} />
      <path d="M60 81q-5 6-10 1M60 81q5 6 10 1" stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {face !== 'ouch' && <rect x="56.5" y="85" width="7" height="6" rx="1.5" fill="#fff" stroke={INK} strokeWidth="2.2" />}
      <g ref={eyes}><Eyes face={face} lx={47} rx={73} y={68} /></g>
    </svg>
  )
}

const pick = (a) => a[Math.floor(Math.random() * a.length)]
const talk = {
  teddy: { tap: ['Semangat ngerjain tugasnya!', 'Peluk dulu, baru lanjut.', 'Sudah minum air?'], ouch: ['Aduh!', 'Aduh, pelan-pelan dong!', 'Aw, jidatku!'] },
  bunny: { tap: ['Hop! Satu langkah kecil dulu.', 'Istirahat 5 menit, ya.', 'Tenggatnya sudah dicek?'], ouch: ['Aduh!', 'Kyaa, kaget!', 'Eh, hati-hati!'] }
}

function Doll({ stage, id, kind, rot, className, label, onBump }) {
  const [face, setFace] = useState('idle')
  const [say, setSay] = useState('')
  const svg = useRef(null), eyes = useRef(null), body = useRef(null), timer = useRef(0)

  useEffect(() => {
    let raf = 0
    const look = (e) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        if (!svg.current || !eyes.current) return
        const r = svg.current.getBoundingClientRect()
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height * 0.5)
        const d = Math.hypot(dx, dy) || 1, k = Math.min(3, d / 60)
        eyes.current.setAttribute('transform', `translate(${(dx / d) * k} ${(dy / d) * k})`)
      })
    }
    window.addEventListener('pointermove', look)
    return () => { window.removeEventListener('pointermove', look); cancelAnimationFrame(raf); clearTimeout(timer.current) }
  }, [])

  const react = (f, txt, ms, frames) => {
    setFace(f); setSay(txt)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => { setFace('idle'); setSay('') }, ms)
    if (!reduced() && body.current) body.current.animate(frames, { duration: 500, easing: 'ease-out' })
  }
  const tap = () => react('happy', pick(talk[kind].tap), 2600,
    [{ transform: 'scale(1,1)' }, { transform: 'scale(1.15,.82)' }, { transform: 'scale(.94,1.1)' }, { transform: 'scale(1,1)' }])
  const ouch = () => react('ouch', pick(talk[kind].ouch), 1500,
    [{ transform: 'rotate(0) scale(1)' }, { transform: 'rotate(-10deg) scale(1.15,.82)' }, { transform: 'rotate(8deg) scale(.94,1.08)' }, { transform: 'rotate(0) scale(1)' }])

  return (
    <Sticker stage={stage} id={id} rot={rot} onTap={tap} onHit={ouch} onBump={onBump} label={label} className={className}>
      {say && (
        <p className="font-display absolute bottom-full left-1/2 mb-1 w-max max-w-[11rem] -translate-x-1/2 border-2 border-ink bg-white px-3 py-1.5 text-center text-sm font-semibold leading-snug text-ink">{say}</p>
      )}
      <span className="sr-only" aria-live="polite">{say}</span>
      <div ref={body} className="origin-bottom">
        {kind === 'teddy' ? <TeddySvg face={face} svg={svg} eyes={eyes} /> : <BunnySvg face={face} svg={svg} eyes={eyes} />}
      </div>
    </Sticker>
  )
}

function burst(host, x, y, n) {
  if (!host || reduced()) return
  const r = host.getBoundingClientRect()
  const colors = ['#FFD84D', '#FFFFFF', '#F3F6FB']
  for (let i = 0; i < n; i++) {
    const b = document.createElement('span')
    const size = 8 + Math.random() * 10
    Object.assign(b.style, {
      position: 'absolute', left: `${x - r.left - size / 2}px`, top: `${y - r.top - size / 2}px`,
      width: `${size}px`, height: `${size}px`, borderRadius: i % 3 ? '50%' : '2px',
      background: colors[i % 3], pointerEvents: 'none', zIndex: 5
    })
    host.appendChild(b)
    const a = (Math.PI * 2 * i) / n + Math.random() * 0.5, d = 50 + Math.random() * 60
    b.animate(
      [{ transform: 'translate(0,0) rotate(0)', opacity: 1 }, { transform: `translate(${Math.cos(a) * d}px, ${Math.sin(a) * d + 30}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }],
      { duration: 700, easing: 'cubic-bezier(.2,.7,.3,1)' }
    ).onfinish = () => b.remove()
  }
}

export default function Hero() {
  const stage = useRef(null)
  const [count, setCount] = useState(0)
  const tag = 'font-display font-semibold text-[13px] md:text-[15px] px-3 py-1.5 md:px-4 md:py-2 rounded-full border-2 border-ink'
  const pop = (e) => { if (e.target === e.currentTarget) burst(e.currentTarget, e.clientX, e.clientY, 9) }
  const onBump = (x, y) => { setCount((c) => c + 1); burst(stage.current, x, y, 14) }

  return (
    <section className="bg-tint">
      <div className="mx-auto grid max-w-[1240px] gap-10 px-5 pt-12 pb-20 md:px-8 lg:grid-cols-12 lg:pt-20 lg:pb-28">
        <div className="lg:col-span-7">
          <h1 className="font-display font-extrabold leading-[0.9] tracking-[-0.04em] text-[clamp(3.6rem,10vw,8rem)]">
            Naila<br />Shabrina
          </h1>
          <p className="prose-line mt-8 text-xl leading-relaxed">
            Mahasiswi S1 Sistem dan Teknologi Informasi di Universitas Negeri Jakarta, angkatan 2024, tinggal di Bogor.
            Teliti, terstruktur, dan cepat belajar. Pengalaman terbaru saya: merapikan dan merekap data dan keuangan selama magang di BNI.
          </p>
          <p className="mt-6 text-[1.0625rem]">
            <mark className="bg-sun px-1.5 py-0.5 text-ink">Terbuka untuk magang dan posisi entry-level.</mark>
          </p>
          <p className="font-display mt-5 flex flex-wrap gap-x-6 gap-y-2 text-base font-semibold">
            <a className="ulink" href="#proyek">Lihat proyek</a>
            <a className="ulink" href="/CV_Naila_Shabrina.pdf" download>Unduh CV</a>
            <a className="ulink" href="#kontak">Hubungi saya</a>
          </p>
        </div>

        <div
          ref={stage} onPointerDown={pop}
          className="relative h-[470px] overflow-hidden rounded-[2rem] bg-cobalt lg:col-span-5 lg:h-[580px]"
          aria-label="Area bermain: geser stiker, klik boneka, atau tabrakkan Teddy dan Bunny"
        >
          <Sticker stage={stage} rot={-3} label="Foto Naila Shabrina" className="left-[8%] top-[4%] w-[180px] lg:w-[230px]">
            <img
              src="/naila.png" alt="Foto Naila Shabrina" width="523" height="705" draggable="false"
              className="aspect-[3/4] w-full rounded-t-full border-[5px] border-paper object-cover object-[50%_25%]"
            />
          </Sticker>
          <Sticker stage={stage} rot={7} label="Stiker keahlian: Figma" className="left-[64%] top-[5%]">
            <span className={`${tag} block bg-ink text-paper`}>Figma</span>
          </Sticker>
          <Doll stage={stage} id="teddy" kind="teddy" rot={4} onBump={onBump}
            label="Teddy, boneka beruang. Klik untuk menyapa, tabrakkan dengan Bunny untuk efek aduh"
            className="left-[66%] top-[27%] w-[88px] lg:w-[120px]" />
          <Doll stage={stage} id="bunny" kind="bunny" rot={-4} onBump={onBump}
            label="Bunny, boneka kelinci putih. Klik untuk menyapa, tabrakkan dengan Teddy untuk efek aduh"
            className="left-[40%] top-[50%] w-[88px] lg:w-[120px]" />
          <Sticker stage={stage} rot={-6} label="Stiker keahlian: Excel" className="left-[3%] top-[66%]">
            <span className={`${tag} block bg-sun text-ink`}>Excel</span>
          </Sticker>
          <Sticker stage={stage} rot={5} label="Stiker keahlian: HTML dan CSS" className="left-[66%] top-[60%]">
            <span className={`${tag} block bg-sun text-ink`}>HTML &amp; CSS</span>
          </Sticker>
          <Sticker stage={stage} rot={4} label="Stiker keahlian: SQL dasar" className="left-[62%] top-[76%]">
            <span className={`${tag} block bg-paper text-ink`}>SQL dasar</span>
          </Sticker>
          <Sticker stage={stage} rot={-3} label="Stiker keahlian: Agile Scrum" className="left-[4%] top-[80%]">
            <span className={`${tag} block bg-paper text-ink`}>Agile Scrum</span>
          </Sticker>
          <p className="font-display pointer-events-none absolute bottom-3 left-5 right-5 text-[13px] font-medium text-white">
            Tabrakin Teddy dan Bunny, atau geser apa saja.{count > 0 && ` Sudah ${count}× aduh.`}
          </p>
        </div>
      </div>
    </section>
  )
}
