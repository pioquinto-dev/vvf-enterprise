import Seo from '../components/Seo.jsx';
import Nav from '../landing/sections/Nav.jsx';
import Footer from '../landing/sections/Footer.jsx';

const descriptions = {
  'Privacy Policy': 'Learn how Brand Beacon collects, uses, and protects information when you use our TikTok trend intelligence platform.',
  'Terms of Service': 'Read the terms that govern use of Brand Beacon and its TikTok trend intelligence platform.',
  'Data Processing Addendum': 'Review Brand Beacon\'s Data Processing Addendum for customer personal data processing.',
  Security: 'Learn about the administrative, technical, and operational security practices used by Brand Beacon.',
};

export default function LegalPage({ title, effectiveDate, sections }) {
  return (
    <>
      <Seo title={`${title} | Brand Beacon`} description={descriptions[title] ?? 'Legal information for Brand Beacon.'} />

      <div className="bbh">
        <Nav />

        <main className="legal-page">
          <section className="legal-page__hero wrap">
            <div className="legal-page__heroGrid">
              <div className="legal-page__heroCopy">
                <p className="legal-page__eyebrow">Legal</p>
                <h1>{title}</h1>
                <p className="legal-page__meta">Effective date: {effectiveDate}</p>
                <p className="legal-page__lede">
                  This document applies to Brand Beacon and the related websites, search tools, subscriptions, and
                  analytics features we make available.
                </p>
              </div>
            </div>
          </section>

          <section className="legal-page__body wrap">
            <div className="legal-page__mobileJump">
              <details className="legal-page__mobileJumpCard">
                <summary>
                  <span className="legal-page__mobileJumpCopy">
                    <em>Quick navigation</em>
                    <b>Jump to a section</b>
                  </span>
                  <strong aria-hidden="true" className="legal-page__mobileJumpIcon">⌄</strong>
                </summary>
                <nav className="legal-page__mobileJumpList" aria-label={`${title} mobile sections`}>
                  {sections.map((section, index) => (
                    <a key={`mobile-${section.heading}`} href={`#legal-section-${index + 1}`}>
                      {String(index + 1).padStart(2, '0')} {section.heading.replace(/^\d+\.\s*/, '')}
                    </a>
                  ))}
                </nav>
              </details>
            </div>

            <div className="legal-page__layout">
              <aside className="legal-page__toc">
                <div className="legal-page__tocCard">
                  <p className="legal-page__tocLabel">On this page</p>
                  <nav className="legal-page__tocList" aria-label={`${title} sections`}>
                    {sections.map((section, index) => (
                      <a key={section.heading} href={`#legal-section-${index + 1}`}>
                        <span>{String(index + 1).padStart(2, '0')}</span>
                        <strong>{section.heading.replace(/^\d+\.\s*/, '')}</strong>
                      </a>
                    ))}
                  </nav>
                </div>
              </aside>

              <div className="legal-page__card">
                {sections.map((section, index) => (
                  <section
                    key={section.heading}
                    id={`legal-section-${index + 1}`}
                    className="legal-page__section"
                  >
                    <div className="legal-page__sectionHead">
                      <span className="legal-page__sectionNum">{String(index + 1).padStart(2, '0')}</span>
                      <h2>{section.heading.replace(/^\d+\.\s*/, '')}</h2>
                    </div>
                    {section.paragraphs.map((paragraph, paragraphIndex) => (
                      <p key={`${section.heading}-${paragraphIndex}`}>{paragraph}</p>
                    ))}
                  </section>
                ))}
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>

      <style>{`
        .legal-page{
          background:
            radial-gradient(circle at top left, rgba(255, 217, 108, .22), transparent 28%),
            radial-gradient(circle at top right, rgba(201, 155, 62, .08), transparent 24%),
            linear-gradient(180deg, #fffdf8 0%, #f8f2e8 100%);
          min-height: calc(100vh - 72px);
          padding: 42px 20px 80px;
        }
        .legal-page__hero{max-width: 1120px}
        .legal-page__heroGrid{
          display:grid;
          grid-template-columns:minmax(0,1fr) 300px;
          gap:28px;
          align-items:end;
        }
        .legal-page__heroCopy{min-width:0}
        .legal-page__eyebrow{
          font-size:.72rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#a16d00
        }
        .legal-page__hero h1{
          margin-top:14px;font-size:clamp(2rem,4vw,3.5rem);line-height:1.02;letter-spacing:-.05em;color:#151515
        }
        .legal-page__meta{
          margin-top:14px;font-size:.92rem;font-weight:700;color:#7a6642
        }
        .legal-page__lede{
          max-width: 70ch;
          margin-top: 14px;
          font-size: 1rem;
          line-height: 1.75;
          color: #4f4638;
        }
        .legal-page__summary{
          padding:20px 22px;
          border:1px solid rgba(216, 193, 145, .8);
          border-radius:24px;
          background:linear-gradient(180deg, rgba(255,255,255,.86), rgba(255,247,226,.94));
          box-shadow:0 18px 36px -28px rgba(49,34,11,.25);
        }
        .legal-page__summaryLabel{
          font-size:.7rem;
          font-weight:800;
          letter-spacing:.14em;
          text-transform:uppercase;
          color:#a16d00;
        }
        .legal-page__summaryList{
          margin-top:14px;
          display:grid;
          gap:10px;
          padding:0;
          list-style:none;
        }
        .legal-page__summaryList li{
          font-size:.93rem;
          line-height:1.5;
          color:#4f4638;
          padding-left:16px;
          position:relative;
        }
        .legal-page__summaryList li::before{
          content:'';
          position:absolute;
          left:0;
          top:.62rem;
          width:6px;
          height:6px;
          border-radius:999px;
          background:#d39b22;
        }
        .legal-page__body{max-width: 1120px;margin-top: 30px}
        .legal-page__mobileJump{display:none}
        .legal-page__mobileJumpCard{
          border:1px solid #eadfca;
          border-radius:18px;
          background:rgba(255,255,255,.92);
          box-shadow:0 18px 36px -32px rgba(49,34,11,.28);
          overflow:hidden;
        }
        .legal-page__mobileJumpCard summary{
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:12px;
          padding:16px 16px 15px;
          cursor:pointer;
          list-style:none;
        }
        .legal-page__mobileJumpCard summary::-webkit-details-marker{display:none}
        .legal-page__mobileJumpCopy{
          display:flex;
          flex-direction:column;
          gap:3px;
          min-width:0;
        }
        .legal-page__mobileJumpCopy em{
          font-style:normal;
          font-size:.66rem;
          font-weight:800;
          letter-spacing:.12em;
          text-transform:uppercase;
          color:#a16d00;
        }
        .legal-page__mobileJumpCopy b{
          font-size:.93rem;
          font-weight:800;
          color:#151515;
          letter-spacing:-.02em;
        }
        .legal-page__mobileJumpCard summary strong{
          display:inline-flex;
          align-items:center;
          justify-content:center;
          width:30px;
          height:30px;
          border-radius:999px;
          background:#fff1c8;
          border:1px solid #efd9a1;
          font-size:1rem;
          font-weight:800;
          color:#8f6100;
          white-space:nowrap;
          transition:transform .18s ease, background .18s ease;
        }
        .legal-page__mobileJumpCard[open] .legal-page__mobileJumpIcon{transform:rotate(180deg)}
        .legal-page__mobileJumpList{
          display:grid;
          gap:4px;
          padding:0 10px 12px;
        }
        .legal-page__mobileJumpList a{
          padding:11px 12px;
          border-radius:14px;
          text-decoration:none;
          color:#4f4638;
          font-size:.86rem;
          line-height:1.45;
          font-weight:600;
          background:rgba(255,250,241,.72);
        }
        .legal-page__mobileJumpList a:hover{background:#fff5dc;color:#151515}
        .legal-page__layout{
          display:grid;
          grid-template-columns:260px minmax(0,1fr);
          gap:24px;
          align-items:start;
        }
        .legal-page__toc{
          position:sticky;
          top:96px;
        }
        .legal-page__tocCard{
          padding:18px 16px;
          border:1px solid #eadfca;
          border-radius:24px;
          background:rgba(255,255,255,.78);
          backdrop-filter:blur(8px);
          box-shadow:0 22px 44px -34px rgba(49,34,11,.24);
        }
        .legal-page__tocLabel{
          font-size:.7rem;
          font-weight:800;
          letter-spacing:.14em;
          text-transform:uppercase;
          color:#a16d00;
        }
        .legal-page__tocList{
          display:grid;
          gap:8px;
          margin-top:14px;
        }
        .legal-page__tocList a{
          display:grid;
          grid-template-columns:32px minmax(0,1fr);
          gap:10px;
          align-items:start;
          padding:10px 11px;
          border-radius:14px;
          text-decoration:none;
          color:#4f4638;
          transition:background .16s ease,color .16s ease,transform .16s ease;
        }
        .legal-page__tocList a:hover{
          background:#fff5dc;
          color:#151515;
          transform:translateX(2px);
        }
        .legal-page__tocList a span{
          font-size:.72rem;
          font-weight:800;
          color:#a16d00;
          padding-top:2px;
        }
        .legal-page__tocList a strong{
          font-size:.84rem;
          font-weight:700;
          line-height:1.4;
        }
        .legal-page__card{
          padding: 10px;
          border: 1px solid #eadfca;
          border-radius: 32px;
          background: rgba(255,255,255,.88);
          box-shadow: 0 30px 70px -42px rgba(49, 34, 11, .28);
        }
        .legal-page__section + .legal-page__section{
          margin-top: 12px;
        }
        .legal-page__section{
          padding:24px 22px 26px;
          border-radius:24px;
          background:linear-gradient(180deg, rgba(255,255,255,.96), rgba(255,251,243,.92));
        }
        .legal-page__sectionHead{
          display:flex;
          align-items:flex-start;
          gap:14px;
        }
        .legal-page__sectionNum{
          width:34px;
          height:34px;
          flex:none;
          display:grid;
          place-items:center;
          border-radius:12px;
          background:#fff2ce;
          color:#9a6700;
          font-size:.76rem;
          font-weight:800;
          letter-spacing:.04em;
        }
        .legal-page__section h2{
          font-size: 1.1rem;
          font-weight: 800;
          letter-spacing: -.03em;
          color: #151515;
          padding-top:4px;
        }
        .legal-page__section p{
          margin-top: 12px;
          font-size: .96rem;
          line-height: 1.78;
          color: #4f4638;
        }
        .legal-page__section a{color:#8a5b00;text-decoration:underline}
        html{scroll-behavior:smooth}
        @media (max-width: 980px){
          .legal-page__heroGrid,
          .legal-page__layout{grid-template-columns:minmax(0,1fr)}
          .legal-page__toc{position:static}
        }
        @media (max-width: 640px){
          .legal-page{padding: 20px 12px 48px}
          .legal-page__hero h1{font-size:clamp(1.7rem,8vw,2.4rem)}
          .legal-page__meta{margin-top:10px;font-size:.84rem}
          .legal-page__lede{margin-top:12px;font-size:.9rem;line-height:1.58}
          .legal-page__mobileJump{display:block;margin-bottom:14px}
          .legal-page__toc{display:none}
          .legal-page__mobileJumpCard{border-radius:20px}
          .legal-page__mobileJumpCard summary{padding:15px 14px 14px}
          .legal-page__mobileJumpCopy em{font-size:.62rem}
          .legal-page__mobileJumpCopy b{font-size:.9rem}
          .legal-page__mobileJumpCard summary strong{width:28px;height:28px;font-size:.95rem}
          .legal-page__mobileJumpList{padding:0 8px 10px}
          .legal-page__mobileJumpList a{padding:10px 11px;font-size:.83rem}
          .legal-page__card{padding: 8px;border-radius: 24px}
          .legal-page__section{padding:16px 14px 18px;border-radius:18px}
          .legal-page__section + .legal-page__section{margin-top:8px}
          .legal-page__sectionHead{gap:10px}
          .legal-page__sectionNum{width:30px;height:30px;border-radius:10px;font-size:.7rem}
          .legal-page__section h2{font-size:1rem;line-height:1.2}
          .legal-page__section p{font-size: .89rem;line-height: 1.6;margin-top:10px}
        }
      `}</style>
    </>
  );
}
