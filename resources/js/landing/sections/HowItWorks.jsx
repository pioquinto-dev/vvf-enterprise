import { Arrow } from '../components/Icons.jsx';
import { STEPS } from '../data/dummy.js';

function StepMockup({ step }) {
  const mockup = step.mockup ?? {};

  if (mockup.type === 'search') {
    return (
      <div className="step__mock step__mock--search" aria-hidden="true">
        <div className="step__mockbar">{mockup.label}</div>
        <div className="step__searchbox">
          <span>{mockup.lines?.[0]}</span>
          <i />
        </div>
        <div className="step__stack">
          {mockup.lines?.slice(1).map((line) => (
            <span key={line}>{line}</span>
          ))}
        </div>
      </div>
    );
  }

  if (mockup.type === 'keywords') {
    return (
      <div className="step__mock step__mock--keywords" aria-hidden="true">
        <div className="step__mockbar">{mockup.label}</div>
        <div className="step__chips">
          {mockup.chips?.map((chip, index) => (
            <span key={chip} className={index < 2 ? 'is-on' : ''}>{chip}</span>
          ))}
        </div>
      </div>
    );
  }

  if (mockup.type === 'results') {
    return (
      <div className="step__mock step__mock--results" aria-hidden="true">
        <div className="step__mockbar">{mockup.label}</div>
        <div className="step__thumbs">
          <span />
          <span />
          <span />
        </div>
        <div className="step__metrics">
          {mockup.stats?.map((stat) => (
            <b key={stat}>{stat}</b>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="step__mock step__mock--alerts" aria-hidden="true">
      <div className="step__mockbar">{mockup.label}</div>
      <div className="step__notice">
        <strong>{mockup.lines?.[0]}</strong>
        <span>{mockup.lines?.[1]}</span>
      </div>
      <div className="step__pulse" />
    </div>
  );
}

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
              <StepMockup step={step} />
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
