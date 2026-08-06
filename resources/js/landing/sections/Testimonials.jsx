import { TESTIMONIALS } from '../data/dummy.js';
import Reveal from '../components/Reveal.jsx';

function Card({ t }) {
  return (
    <figure className="surface-hover break-inside-avoid p-6">
      <span aria-hidden className="font-display text-4xl leading-none text-accent/30 dark:text-accent-glow/40">
        “
      </span>
      <blockquote className="mt-2 text-[14.5px] leading-relaxed">{t.quote}</blockquote>
      <figcaption className="mt-5 flex items-center gap-3 border-t border-black/[.05] pt-4 dark:border-white/[.07]">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-accent/25 to-hot/15 font-display text-[12.5px] font-bold text-accent dark:text-accent-glow">
          {t.initials}
        </span>
        <span className="min-w-0 leading-tight">
          <span className="block truncate text-[13.5px] font-semibold">{t.name}</span>
          <span className="block truncate text-[12px] faint">
            {t.role} · {t.company}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

export default function Testimonials() {
  return (
    <section id="customers" className="mx-auto mt-28 max-w-page px-4 sm:mt-36 sm:px-6 lg:px-8">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">
          <span className="h-px w-6 bg-accent/50" /> Customers
        </p>
        <h2 className="section-title mt-4">Why brand teams switch to VVF</h2>
        <p className="mt-5 text-[15.5px] leading-relaxed muted sm:text-base">
          Placeholder quotes for the MVP — swap these for real ones before launch.
        </p>
      </Reveal>

      <div className="mt-12 columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5">
        {TESTIMONIALS.map((t, i) => (
          <Reveal key={t.name} delay={(i % 3) * 80} className="break-inside-avoid">
            <Card t={t} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
