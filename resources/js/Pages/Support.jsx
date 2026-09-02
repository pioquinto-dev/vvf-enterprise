import { Link } from '@inertiajs/react';
import { useRef, useState } from 'react';

import Seo from '../components/Seo.jsx';
import { Arrow, Chevron, Comment } from '../landing/components/Icons.jsx';
import Nav from '../landing/sections/Nav.jsx';
import Footer from '../landing/sections/Footer.jsx';

const csrfToken = () => document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';

export default function Support({ sessionAvailable, retryAfter = 0, commonQuestions = [] }) {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [quickOpen, setQuickOpen] = useState(false);
  const inputRef = useRef(null);

  const ask = async (rawQuestion) => {
    const cleanQuestion = String(rawQuestion).trim();
    if (!cleanQuestion || sending || !sessionAvailable) return;

    setSending(true);
    setError('');
    setQuestion('');
    setMessages((current) => [...current, { role: 'user', text: cleanQuestion }]);

    try {
      const response = await fetch('/support/chat', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': csrfToken(),
        },
        body: JSON.stringify({ question: cleanQuestion }),
      });
      const payload = await response.json();

      if (!response.ok) throw new Error(payload.message || 'The support assistant could not answer right now.');

      setMessages((current) => [...current, {
        role: 'assistant',
        text: payload.answer,
        needsContact: Boolean(payload.needsContact),
      }]);
    } catch (caught) {
      setError(caught.message || 'The support assistant could not answer right now.');
    } finally {
      setSending(false);
    }
  };

  const submit = (event) => {
    event.preventDefault();
    ask(question);
  };

  const answerCommonQuestion = (entry) => {
    if (sending || !sessionAvailable) return;
    setError('');
    setMessages((current) => [...current,
      { role: 'user', text: entry.question },
      { role: 'assistant', text: entry.answer, needsContact: entry.question.includes('contact') },
    ]);
  };

  return (
    <>
      <Seo title="Product Support | Brand Beacon" description="Get help using Brand Beacon's search, video analysis, bookmarks, and plans." noIndex />

      <div className="bbh support-page">
        <Nav homeHref="/" />
        <main className="support-main wrap">
          <section className="support-hero">
            <div className="support-hero__mark"><Comment className="h-6 w-6" /></div>
            <p className="eyebrow">Brand Beacon support</p>
            <h1>Quick answers for getting the most out of Brand Beacon.</h1>
            <p>Ask about searches, video analysis, bookmarks, plans, or how to use the product. This chat is not saved.</p>
          </section>

          {sessionAvailable ? (
            <section className="support-chat" aria-label="Beacon support assistant">
              <div className="support-chat__head"><span><i /> Beacon</span></div>
              <div className="support-chat__body" aria-live="polite">
                {messages.length === 0 && <div className="support-welcome"><b>Hi, I'm Beacon. What can I help with?</b><p>Choose a common question for an instant answer, or ask your own below.</p></div>}
                {messages.map((message, index) => (
                  <div className={`support-message support-message--${message.role}`} key={`${message.role}-${index}`}>
                    <p>{message.text}</p>
                    {message.needsContact && <Link href="/contact">Contact the Brand Beacon team <Arrow className="h-3.5 w-3.5" /></Link>}
                  </div>
                ))}
                {sending && <div className="support-message support-message--assistant support-message--loading"><span /><span /><span /></div>}
              </div>
              <div className="support-quick-wrap">
                <button
                  type="button"
                  className="support-quick__toggle"
                  aria-expanded={quickOpen}
                  aria-controls="support-quick-list"
                  onClick={() => setQuickOpen((open) => !open)}
                >
                  Common questions
                  <Chevron className="h-4 w-4" />
                </button>
                <div id="support-quick-list" className={`support-quick${quickOpen ? '' : ' support-quick--collapsed'}`} aria-label="Common support questions">
                  {commonQuestions.map((entry) => <button type="button" key={entry.question} onClick={() => answerCommonQuestion(entry)} disabled={sending}>{entry.question}</button>)}
                </div>
              </div>
              <form className="support-chat__form" onSubmit={submit}>
                <label className="sr-only" htmlFor="support-question">Ask a product question</label>
                <input ref={inputRef} id="support-question" maxLength={600} value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask a product question..." disabled={sending} />
                <button type="submit" className="btn btn--primary" disabled={sending || question.trim().length < 2}>Send <Arrow className="h-3.5 w-3.5" /></button>
              </form>
              {error && <p className="support-error" role="status">{error} <Link href="/contact">Contact us instead.</Link></p>}
            </section>
          ) : (
            <section className="support-limit" role="status">
              <p className="eyebrow">Please pause a moment</p>
              <h2>Support chat opens twice per minute.</h2>
              <p>Try again in about {Math.max(1, Math.ceil(retryAfter / 60))} minute{retryAfter > 60 ? 's' : ''}, or contact the Brand Beacon team now.</p>
              <Link href="/contact" className="btn btn--primary">Contact us <Arrow className="h-3.5 w-3.5" /></Link>
            </section>
          )}
        </main>
        <Footer homeHref="/" />
      </div>
    </>
  );
}
