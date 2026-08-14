import { Chevron } from '../components/Icons.jsx';
import { FAQS } from '../data/dummy.js';

export default function Faq() {
  return (
    <section className="sec wrap" id="faq">
      <div className="faq__grid">
        <div className="faq__aside">
          <p className="eyebrow">FAQ</p>
          <h2 style={{ marginTop: 16 }}>Questions? Answers.</h2>
          <p>
            Still stuck? Email <a href="mailto:hello@brandbeacon.com">hello@brandbeacon.com</a> and a human replies same
            day.
          </p>
        </div>

        <div className="faq__list">
          {FAQS.map((item) => (
            <details className="qa" key={item.q}>
              <summary>
                {item.q}
                <span className="qa__c">
                  <Chevron className="h-3 w-3" />
                </span>
              </summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
