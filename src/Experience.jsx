import { useState } from 'react'
import { experience } from './data.js'

export default function Experience() {
  const [open, setOpen] = useState(new Set([0]))
  const toggle = (n) => setOpen((o) => { const x = new Set(o); x.has(n) ? x.delete(n) : x.add(n); return x })
  return (
    <ol className="border-l-2 border-ink/25">
      {experience.map((e, n) => {
        const on = open.has(n)
        return (
          <li key={e.role} className="relative pl-6 pb-8 last:pb-0 md:pl-8">
            <span aria-hidden="true" className={`absolute -left-[9px] top-2 h-4 w-4 rounded-full border-2 border-ink ${n === 0 ? 'bg-sun' : 'bg-paper'}`} />
            <button onClick={() => toggle(n)} aria-expanded={on} aria-controls={`exp-${n}`} className="group block w-full text-left">
              <span className="font-display block text-sm font-semibold text-mute">{e.period}</span>
              <span className="font-display mt-0.5 block text-xl font-bold leading-snug md:text-2xl group-hover:underline decoration-cobalt decoration-2 underline-offset-4">{e.role}</span>
              <span className="mt-0.5 block text-[1rem] text-mute">{e.org}</span>
              <span className="font-display mt-2 inline-block text-sm font-semibold text-cobalt">{on ? 'Tutup detail' : 'Lihat tugas'}</span>
            </button>
            <div id={`exp-${n}`} className={`grid transition-[grid-template-rows] duration-300 ${on ? 'grid-rows-[1fr]' : 'invisible grid-rows-[0fr]'}`}>
              <div className="overflow-hidden">
                <p className="mt-3 font-semibold">{e.summary}</p>
                <ul className="mt-2 list-disc space-y-1.5 pl-5 prose-line marker:text-cobalt">
                  {e.tasks.map((t) => <li key={t}>{t}</li>)}
                </ul>
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
