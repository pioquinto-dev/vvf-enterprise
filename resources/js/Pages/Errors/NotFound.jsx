import { Head } from '@inertiajs/react';

export default function NotFound() {
  return (
    <div className="bb-not-found">
      <Head title="Page not found · Brand Beacon">
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <header>
        <a className="bb-not-found__brand" href="/" aria-label="Brand Beacon home">
          <img src="/brand-beacon-logo.svg" width="32" height="32" alt="" />
          <span>Brand Beacon</span>
        </a>
      </header>
      <main>
        <section aria-labelledby="not-found-title">
          <div className="bb-not-found__number" aria-hidden="true">404<span /></div>
          <p className="bb-not-found__label">PAGE NOT FOUND</p>
          <h1 id="not-found-title">This page is off the radar.</h1>
          <p>The link may have changed, or the page is no longer available. Let’s get you back to discovering what’s next.</p>
          <a className="bb-not-found__button" href="/">Back to homepage <span aria-hidden="true">→</span></a>
        </section>
      </main>
      <footer>TikTok intelligence. A clearer signal.</footer>
      <style>{`
        .bb-not-found{min-height:100svh;display:flex;flex-direction:column;background:#f7f6f2;color:#171714;font-family:Figtree,Arial,sans-serif}
        .bb-not-found header{padding:28px clamp(24px,5vw,72px)}
        .bb-not-found__brand{display:inline-flex;align-items:center;gap:10px;font-weight:800;text-decoration:none;color:inherit}
        .bb-not-found main{flex:1;display:grid;place-items:center;padding:40px 24px 64px}
        .bb-not-found section{width:100%;max-width:560px;text-align:center}
        .bb-not-found__number{position:relative;display:inline-block;font-size:clamp(100px,20vw,160px);font-weight:900;letter-spacing:-.07em;line-height:1.1;isolation:isolate}
        .bb-not-found__number span{position:absolute;bottom:12px;left:0;right:-8px;height:28px;background:#ffcd29;z-index:-1;border-radius:4px}
        .bb-not-found__label{font-size:11px!important;font-weight:800;letter-spacing:.18em;margin:24px 0 14px!important;color:#78766e!important}
        .bb-not-found h1{font-size:clamp(26px,5vw,36px);font-weight:800;line-height:1.2;letter-spacing:-.035em;margin:0 0 16px}
        .bb-not-found section>p{max-width:420px;margin:0 auto;color:#67665d;font-size:16px;line-height:1.7}
        .bb-not-found__button{display:inline-flex;align-items:center;justify-content:center;gap:24px;min-height:48px;margin-top:30px;padding:12px 24px;border-radius:999px;background:#ffcd29;color:#171714;font-size:14px;font-weight:700;text-decoration:none;box-shadow:0 4px 12px #d5a40020}
        .bb-not-found__button:hover{background:#f4bf13}
        .bb-not-found a:focus-visible{outline:3px solid #171714;outline-offset:5px}
        .bb-not-found footer{text-align:center;padding:24px;color:#78766e;font-size:12px}
      `}</style>
    </div>
  );
}
