import { useEffect, useRef, useState } from 'react'
import { slides } from './data.js'

const pad = (n) => String(n).padStart(2, '0')

export function Olist() {
  const pts = [
    ['96,9% pelanggan hanya membeli sekali.', 'Dari 96.096 pelanggan, hanya 2.997 yang kembali membeli. Retensi adalah peluang pertumbuhan terbesar.'],
    ['Pengiriman lambat terbaca di skor review.', 'Order dengan review 1 tiba rata-rata 21,3 hari, sedangkan review 5 hanya 10,7 hari.'],
    ['Revenue puncak terjadi pada November 2017.', 'Sekitar R$ 1,19 juta dari 7.544 order dalam satu bulan.']
  ]
  return (
    <article className="grid gap-8 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-4">
        <h3 className="font-display text-3xl font-bold leading-tight tracking-tight">Dashboard Revenue E-commerce Olist</h3>
        <p className="mt-3 text-mute">Data e-commerce Brasil 2017–2018, dianalisis dengan SQL dan Excel, lalu divisualisasikan dengan Chart.js. Filter periodenya bisa dicoba langsung di samping.</p>
        <ul className="mt-6 space-y-5">
          {pts.map(([h, b]) => (
            <li key={h}>
              <p className="font-display text-lg font-bold leading-snug">{h}</p>
              <p className="mt-1 text-[1rem]">{b}</p>
            </li>
          ))}
        </ul>
      </div>
      <div className="lg:col-span-8">
        <div className="border-2 border-ink bg-white shadow-[8px_8px_0_0_var(--color-cobalt)]">
          <div className="font-display flex items-center justify-between gap-4 bg-ink px-4 py-2 text-sm text-paper">
            <span>olist-dashboard.html</span>
            <a className="ulink !decoration-sun" href="/olist-dashboard.html" target="_blank" rel="noreferrer">Buka layar penuh</a>
          </div>
          <iframe src="/olist-dashboard.html" title="Dashboard Revenue E-commerce Olist, interaktif" loading="lazy" className="block h-[560px] w-full bg-white md:h-[680px]" />
        </div>
      </div>
    </article>
  )
}

export function EduTrack() {
  const [i, setI] = useState(0)
  const go = (n) => setI(Math.max(0, Math.min(slides.length - 1, n)))
  const onKey = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(i + 1) }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(i - 1) }
  }
  return (
    <article className="grid gap-8 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-7 lg:order-1" tabIndex={0} onKeyDown={onKey} aria-label="Penampil slide EduTrack. Gunakan panah kiri dan kanan untuk berpindah slide.">
        <div className="overflow-hidden rounded-lg border-2 border-cobalt bg-white">
          <img key={i} src={`/deck/s-${pad(i + 1)}.jpg`} alt={slides[i][1]} className="block aspect-video w-full object-contain" />
        </div>
        <div className="font-display mt-3 flex flex-wrap items-center gap-3">
          <button className="btn" onClick={() => go(i - 1)} disabled={i === 0} aria-label="Slide sebelumnya">Sebelumnya</button>
          <button className="btn" onClick={() => go(i + 1)} disabled={i === slides.length - 1} aria-label="Slide berikutnya">Berikutnya</button>
          <span className="text-sm text-mute" aria-live="polite">Slide {i + 1} dari {slides.length}: {slides[i][0]}</span>
          <a className="ulink ml-auto text-sm font-semibold" href="/EduTrack_Presentasi.pdf" download>Unduh PDF</a>
        </div>
        <ul className="mt-4 flex gap-2 overflow-x-auto pb-2" aria-label="Thumbnail slide">
          {slides.map((s, n) => (
            <li key={s[0]} className="shrink-0">
              <button onClick={() => go(n)} aria-label={`Slide ${n + 1}: ${s[0]}`} aria-current={n === i} className={`block border-2 ${n === i ? 'border-cobalt' : 'border-rule'}`}>
                <img src={`/deck/t-${pad(n + 1)}.jpg`} alt="" width="120" height="68" loading="lazy" className={`block h-[68px] w-[120px] object-cover ${n === i ? '' : 'opacity-70'}`} />
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="lg:col-span-5 lg:order-2">
        <h3 className="font-display text-3xl font-bold leading-tight tracking-tight">EduTrack</h3>
        <p className="mt-3">Aplikasi Android berbasis Kotlin untuk memantau tugas kuliah. Fiturnya: Tasks, Pomodoro, Streaks, Flashcard, dan Dashboard.</p>
        <p className="mt-3 text-mute">Dibangun dengan Agile Scrum selama 14 minggu oleh tim empat orang, dengan Naila sebagai Scrum Master. Hasilnya 23 kebutuhan fungsional yang terverifikasi dalam enam sprint. Aplikasi ini menyasar sekitar 9,3 juta mahasiswa Indonesia yang produktivitasnya terhambat.</p>
      </div>
    </article>
  )
}

export function Pomodoro() {
  const [mode, setMode] = useState('fokus')
  const [left, setLeft] = useState(1500)
  const [run, setRun] = useState(false)
  const [fast, setFast] = useState(false)
  const [done, setDone] = useState(0)
  const [msg, setMsg] = useState('')
  const total = mode === 'fokus' ? 1500 : 300

  useEffect(() => {
    if (!run) return
    const id = setInterval(() => setLeft((l) => l - 1), fast ? 1000 / 60 : 1000)
    return () => clearInterval(id)
  }, [run, fast])

  useEffect(() => {
    if (left > 0) return
    setRun(false)
    if (mode === 'fokus') {
      setDone((d) => d + 1); setMsg('Sesi fokus selesai. Waktunya istirahat 5 menit.'); setMode('istirahat'); setLeft(300)
    } else {
      setMsg('Istirahat selesai. Siap fokus lagi.'); setMode('fokus'); setLeft(1500)
    }
  }, [left, mode])

  const pick = (m) => { setMode(m); setLeft(m === 'fokus' ? 1500 : 300); setRun(false); setMsg('') }
  const mm = pad(Math.floor(left / 60)), ss = pad(left % 60)

  return (
    <div className="on-cobalt bg-cobalt text-white">
      <div className="mx-auto grid max-w-[1240px] gap-10 px-5 py-14 md:px-8 lg:grid-cols-12 lg:py-20">
        <div className="lg:col-span-5">
          <h3 className="font-display text-3xl font-bold leading-tight tracking-tight">Coba fitur Pomodoro</h3>
          <p className="mt-3 max-w-[46ch]">Pomodoro adalah salah satu fitur inti EduTrack: 25 menit fokus, lalu 5 menit istirahat. Ini versi webnya untuk dicoba. Nyalakan demo cepat kalau tidak mau menunggu 25 menit.</p>
        </div>
        <div className="lg:col-span-7">
          <div className="font-display flex gap-2" role="group" aria-label="Pilih mode">
            {[['fokus', 'Fokus 25 menit'], ['istirahat', 'Istirahat 5 menit']].map(([m, t]) => (
              <button key={m} onClick={() => pick(m)} aria-pressed={mode === m}
                className={`rounded-full border-2 border-white px-4 py-1.5 text-sm font-semibold ${mode === m ? 'bg-white text-cobalt' : 'text-white hover:bg-white/15'}`}>{t}</button>
            ))}
          </div>
          <p className="font-display mt-4 text-[clamp(4.5rem,12vw,8rem)] font-extrabold leading-none tabular-nums tracking-tight" role="timer" aria-label={`Sisa waktu ${mm} menit ${ss} detik`}>{mm}:{ss}</p>
          <div className="mt-3 h-2 w-full bg-white/25"><div className="h-full bg-sun" style={{ width: `${((total - left) / total) * 100}%` }} /></div>
          <div className="font-display mt-5 flex flex-wrap items-center gap-3">
            <button onClick={() => setRun((r) => !r)} className="rounded-full border-2 border-sun bg-sun px-6 py-2 font-semibold text-ink hover:bg-white hover:border-white">{run ? 'Jeda' : 'Mulai'}</button>
            <button onClick={() => pick(mode)} className="rounded-full border-2 border-white px-5 py-2 font-semibold hover:bg-white/15">Atur ulang</button>
            <label className="ml-2 flex items-center gap-2 text-sm"><input type="checkbox" checked={fast} onChange={(e) => setFast(e.target.checked)} className="h-4 w-4 accent-sun" />Demo cepat (1 menit = 1 detik)</label>
          </div>
          <p className="mt-4 text-[1rem]">Sesi fokus selesai: <strong>{done}</strong></p>
          <p className="min-h-6 text-[1rem]" aria-live="polite">{msg}</p>
        </div>
      </div>
    </div>
  )
}
