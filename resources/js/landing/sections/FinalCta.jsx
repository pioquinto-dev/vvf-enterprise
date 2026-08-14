import { Arrow, Play } from '../components/Icons.jsx';

export default function FinalCta({ onStart }) {
  return (
    <section className="final">
      <div className="wrap">
        <span className="final__b">
          <i />
          Your first search is free
        </span>
        <h2>See what TikTok is saying about you</h2>
        <p>One free search, no card. Most brands get their first surprise within the top ten results.</p>
        <div className="final__ctas">
          <button type="button" className="btn btn--ink btn--lg" onClick={() => onStart()}>
            Start free
            <Arrow className="btn__arrow h-[15px] w-[15px]" />
          </button>
          <button type="button" className="btn btn--ghost btn--lg">
            <Play className="h-[15px] w-[15px]" />
            Watch demo · 2 min
          </button>
        </div>
        <p className="final__n">No credit card required · cancel any trial in two clicks</p>
      </div>
    </section>
  );
}
