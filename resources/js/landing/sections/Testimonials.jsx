import { TESTIMONIALS } from '../data/dummy.js';

function Card({ t }) {
  return (
    <figure className="tcard">
      <div className="tcard__q">“</div>
      <blockquote>{t.quote}</blockquote>
      <figcaption>
        <img className="tav" src={t.avatar} alt={t.name} loading="lazy" />
        <span>
          <span className="tn">{t.name}</span>
          <span className="tr">
            {t.role} · {t.company}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

export default function Testimonials() {
  const loop = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section className="sec" id="customers">
      <div className="wrap">
        <div className="head head--c">
          <p className="eyebrow">Customers</p>
          <h2>Why brand teams switch to Brand Beacon</h2>
        </div>
      </div>
      <div className="trail">
        <div className="trow">
          {loop.map((t, i) => (
            <Card key={`${t.name}-${i}`} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
