import { Arrow } from '../components/Icons.jsx';
import { STEPS } from '../data/dummy.js';

export default function HowItWorks({ onStart }) {
  return (
    <section className="sec--pad" id="how">
      <div className="wrap">
        <div className="head head--c">
          <p className="eyebrow">How it works</p>
          <h2>One subject in, a viral cut out</h2>
          <p>No dashboards to configure and no keyword research to do first. Four steps, most of them optional.</p>
        </div>

        <div className="steps">
          {STEPS.map((step) => (
            <div className="step" key={step.n}>
              <div className="step__n">{step.n}</div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
          ))}
        </div>

        <div className="steps__cta">
          <button type="button" className="btn btn--primary btn--lg" onClick={() => onStart()}>
            Run your free search
            <Arrow className="btn__arrow h-[15px] w-[15px]" />
          </button>
        </div>
      </div>
    </section>
  );
}
