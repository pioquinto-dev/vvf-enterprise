import { BRANDS } from '../data/dummy.js';

function BrandChip({ brand }) {
  return (
    <div className="group flex shrink-0 items-center gap-3 rounded-2xl border border-black/[.06] bg-white/70 px-4 py-3 backdrop-blur-xl transition-colors duration-300 hover:border-accent/30 dark:border-white/[.08] dark:bg-white/[.035]">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-accent/20 to-hot/10 font-display text-[12.5px] font-bold text-accent dark:text-accent-glow">
        {brand.name.slice(0, 2).toUpperCase()}
      </span>
      <div className="leading-tight">
        <p className="text-[13.5px] font-semibold">{brand.name}</p>
        <p className="text-[11.5px] faint">
          {brand.category} · {brand.reach} tracked
        </p>
      </div>
    </div>
  );
}

export default function BrandMarquee() {
  const rowA = [...BRANDS.slice(0, 6), ...BRANDS.slice(0, 6)];
  const rowB = [...BRANDS.slice(6), ...BRANDS.slice(6)];

  return (
    <section className="mt-20 sm:mt-28">
      <p className="text-center font-display text-[11px] font-semibold tracking-[.2em] uppercase faint">
        Tracking the TikTok footprint of 11,000+ brands
      </p>

      <div className="mask-fade-x mt-7 space-y-3 overflow-hidden">
        <div className="animate-marquee flex w-max gap-3">
          {rowA.map((b, i) => (
            <BrandChip key={`a${i}`} brand={b} />
          ))}
        </div>
        <div className="animate-marquee-reverse flex w-max gap-3">
          {rowB.map((b, i) => (
            <BrandChip key={`b${i}`} brand={b} />
          ))}
        </div>
      </div>
    </section>
  );
}
