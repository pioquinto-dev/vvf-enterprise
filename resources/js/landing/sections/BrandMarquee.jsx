import { BRANDS } from '../data/dummy.js';

function Chip({ brand }) {
  return (
    <div className="chip">
      <span className="chip__i">
        <img src={brand.logo} alt={`${brand.name} logo`} loading="lazy" />
      </span>
      <span>
        <span className="chip__n">{brand.name}</span>
        <span className="chip__m">
          {brand.category} · {brand.reach}
        </span>
      </span>
    </div>
  );
}

function Row({ brands, variant }) {
  // Doubled so the -50% translate loops seamlessly.
  const loop = [...brands, ...brands];
  return (
    <div className={`mq__row mq__row--${variant}`}>
      {loop.map((brand, i) => (
        <Chip key={`${brand.name}-${i}`} brand={brand} />
      ))}
    </div>
  );
}

export default function BrandMarquee() {
  const half = Math.ceil(BRANDS.length / 2);

  return (
    <section className="mq">
      <p className="mq__t">Tracking the TikTok footprint of 11,000+ brands</p>
      <div className="mq__mask">
        <Row brands={BRANDS.slice(0, half)} variant="a" />
        <Row brands={BRANDS.slice(half)} variant="b" />
      </div>
    </section>
  );
}
