import { Link, router } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { bookmarks as bookmarksApi } from '../../landing/flow/api.js';
import { playerUrlFor, postTikTokMessage } from '../SavedSearches/detail/tiktokPlayer.js';
import { withReturnTo } from '../utils/navigation.js';

/**
 * The signed-in "My Feed" home. A stream of the user's strongest breakout
 * videos beside a rail of three cards — the searches feeding the stream, the
 * hashtags those breakouts lean on, and what is climbing across Brand Beacon.
 *
 * Everything in the stream comes from the user's own searches; a user with no
 * searches yet borrows the global feed instead of seeing an empty column.
 *
 * Layout follows the feed mockup: a post is a wide card (thumb beside copy) on
 * desktop and a full-bleed portrait card on phones. The rail drops to two
 * columns under the stream at tablet width, and to one column on phones.
 */

const FIRST_BATCH = 5;
const BATCH = 8;

const Icons = {
  play: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>,
  spark: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z" /></svg>,
  heart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M12 20s-7-4.5-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.5-7 9-7 9z" /></svg>,
  comment: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
  share: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13" /><path d="M22 2l-7 20-4-9-9-4z" /></svg>,
  trend: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l6-6 4 4 8-8" /><path d="M21 3h-5m5 0v5" /></svg>,
  bookmark: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 3h12v18l-6-4.5L6 21z" /></svg>,
  bookmarkO: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M6 3h12v18l-6-4.5L6 21z" /></svg>,
  ext: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M8 7h9v9" /></svg>,
  arrow: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>,
};

const tiktokTagUrl = (tag) => `https://www.tiktok.com/tag/${encodeURIComponent(String(tag).replace(/^#/, ''))}`;

/**
 * The caption with every #hashtag and @mention linked. Captions arrive as plain
 * text from TikTok, so the tags are found by pattern rather than markup.
 */
function Caption({ text }) {
  if (!text) return null;

  const parts = String(text).split(/([#@][\p{L}\p{N}_.]+)/gu);

  return (
    <p className="bbf-cap">
      {parts.map((part, i) => {
        if (/^#[\p{L}\p{N}_.]+$/u.test(part)) {
          return <a className="bbf-tag" key={i} href={tiktokTagUrl(part)} target="_blank" rel="noopener noreferrer">{part}</a>;
        }
        if (/^@[\p{L}\p{N}_.]+$/u.test(part)) {
          return <a className="bbf-tag" key={i} href={`https://www.tiktok.com/${part}`} target="_blank" rel="noopener noreferrer">{part}</a>;
        }
        return part;
      })}
    </p>
  );
}

function PostMedia({ video }) {
  const [playing, setPlaying] = useState(false);
  const iframeRef = useRef(null);
  // Playback goes through TikTok's embed like every other surface; the raw
  // video_url is a signed CDN address that expires and 403s from the browser.
  const playerUrl = playerUrlFor(video, true);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!playing || !iframe || !video?.video_id) return undefined;

    const unmuteAndPlay = () => {
      postTikTokMessage(iframe, 'unMute');
      postTikTokMessage(iframe, 'play');
    };

    const handleReady = (event) => {
      const payload = event?.data;
      if (!payload || payload['x-tiktok-player'] !== true || payload.type !== 'onPlayerReady') return;
      if (event.source !== iframe.contentWindow) return;
      unmuteAndPlay();
    };

    iframe.addEventListener('load', unmuteAndPlay);
    window.addEventListener('message', handleReady);

    return () => {
      iframe.removeEventListener('load', unmuteAndPlay);
      window.removeEventListener('message', handleReady);
    };
  }, [playing, video?.video_id]);

  return (
    <div className={`bbf-media${playing ? ' playing' : ''}`}>
      {playing && playerUrl ? (
        <>
          <iframe
            ref={iframeRef}
            src={playerUrl}
            title={video.caption || 'TikTok video'}
            loading="lazy"
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
          />
          <button type="button" className="bbf-close" aria-label="Close player" onClick={() => setPlaying(false)}>&times;</button>
        </>
      ) : (
        <>
          {video.thumbnail
            ? <img src={video.thumbnail} alt="" loading="lazy" />
            : <span className="bbf-media__ph" style={{ background: video.gradient }} />}
          <span className="bbf-scrim" />
          {video.brand && video.search_url && (
            <Link className={`bbf-vtag${video.search_type === 'product' ? ' p' : ''}`} href={video.search_url}>
              <i />{video.brand}
            </Link>
          )}
          {video.duration && <span className="bbf-dur">{video.duration}</span>}
          <span className="bbf-ovstats">
            <span className="bbf-ovchip bbf-ovchip--score">
              <span className="lab"><i />Breakout score</span>
              <span className="num">{video.score || '—'}</span>
            </span>
            <span className="bbf-ovchip bbf-ovchip--views">
              <span className="lab"><i />Views</span>
              <span className="num">{video.views || '—'}</span>
            </span>
          </span>
          {playerUrl
            ? <button type="button" className="bbf-play" aria-label={`Play video by ${video.handle || 'this creator'}`} onClick={() => setPlaying(true)}>{Icons.play}</button>
            : <span className="bbf-play-error" role="status">Video unavailable.</span>}
        </>
      )}
    </div>
  );
}

/** Matches the results page's analyze CTA wording, so the states read the same. */
function analyzeLabel(status) {
  if (status === 'processing') return 'Analyzing video…';
  if (status === 'complete') return 'View analysis';
  if (status === 'failed') return 'Retry analysis';
  return 'Analyze video';
}

function Post({ video, onAnalyze, onToggleSave, saving }) {
  const status = video.analysis?.status;
  const busy = status === 'processing';

  return (
    <article className="bbf-post">
      <div className="bbf-post__b">
        <PostMedia video={video} />

        <div className="bbf-side">
          <div className="bbf-who">
            <span className="bbf-av" style={{ background: video.gradient }} />
            <span className="bbf-who__t">
              <span className="n">{video.handle || 'on TikTok'}</span>
              {video.followers && <span className="s">{video.followers} followers</span>}
            </span>
            {video.uploaded_date && <time className="bbf-who__d" dateTime={video.uploaded_at}>{video.uploaded_date}</time>}
          </div>

          <Caption text={video.caption} />

          <div className="bbf-eng">
            <span>{Icons.heart}{video.likes}</span>
            <span>{Icons.comment}{video.comments}</span>
            <span>{Icons.share}{video.shares}</span>
            {video.engagement && <span>{Icons.trend}{video.engagement}</span>}
          </div>

          <div className="bbf-acts">
            <button
              type="button"
              className={`bbf-act bbf-act--an${status === 'complete' ? ' done' : ''}`}
              onClick={() => onAnalyze(video)}
              aria-busy={busy}
              disabled={busy}
            >
              {busy ? <span className="bbf-spin" aria-hidden /> : Icons.spark}
              <span>{analyzeLabel(status)}</span>
            </button>
            {video.post_url && (
              <a className="bbf-act bbf-act--ic" href={video.post_url} target="_blank" rel="noopener noreferrer" title="Open in TikTok" aria-label="Open in TikTok">{Icons.ext}</a>
            )}
            <button
              type="button"
              className={`bbf-act bbf-act--ic${video.bookmarked ? ' on' : ''}`}
              title={video.bookmarked ? 'Remove from saved' : 'Save video'}
              aria-label={video.bookmarked ? 'Remove from saved' : 'Save video'}
              aria-pressed={Boolean(video.bookmarked)}
              disabled={saving}
              onClick={() => onToggleSave(video)}
            >
              {video.bookmarked ? Icons.bookmark : Icons.bookmarkO}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function SearchesCard({ searches, searchesCount }) {
  if (searches.length === 0) return null;

  return (
    <section className="bbf-rcard">
      <div className="bbf-rhead">
        <h3>Your searches</h3>
        <Link className="bbf-chip bbf-chip--plain" href="/library">Manage</Link>
      </div>
      <div className="bbf-rlist">
        {searches.map((search) => (
          <Link className="bbf-rrow" key={search.id} href={search.url}>
            <span className={`bbf-src${search.type === 'product' ? ' p' : ''}`}>{search.initials}</span>
            <span className="t">
              <b>{search.name}</b>
              <span>{search.breakouts} breakout{search.breakouts === 1 ? '' : 's'}</span>
            </span>
            {search.score && <span className="g">{search.score}</span>}
          </Link>
        ))}
      </div>
      {searchesCount > searches.length && (
        <Link className="bbf-rlink" href="/library">See all {searchesCount} searches {Icons.arrow}</Link>
      )}
    </section>
  );
}

function HashtagsCard({ hashtags, hashtagsCount }) {
  if (hashtags.length === 0) return null;

  const top = Math.max(...hashtags.map((h) => h.count), 1);

  return (
    <section className="bbf-rcard">
      <div className="bbf-rhead">
        <h3>Hashtags in your breakouts</h3>
        <span className="bbf-chip bbf-chip--yours">Yours</span>
      </div>
      {hashtags.map((h) => (
        <a className="bbf-hrow" key={h.tag} href={tiktokTagUrl(h.tag)} target="_blank" rel="noopener noreferrer">
          <b>#{h.tag}</b>
          <span className="bar"><i style={{ width: `${Math.round((h.count / top) * 100)}%` }} /></span>
          <span className="c">{h.count}</span>
        </a>
      ))}
      {hashtagsCount > hashtags.length && (
        <p className="bbf-rfoot">{hashtagsCount} hashtags appear across your breakout videos.</p>
      )}
    </section>
  );
}

function ClimbingCard({ climbing }) {
  return (
    <section className="bbf-rcard">
      <div className="bbf-rhead">
        <h3>Climbing this week</h3>
        <span className="bbf-chip">All brands</span>
      </div>
      {climbing.length > 0
        ? climbing.map((row) => (
          <a className="bbf-hrow" key={row.tag} href={tiktokTagUrl(row.tag)} target="_blank" rel="noopener noreferrer">
            <b>#{row.tag}</b>
            <span className="g">{row.growth === null ? 'New' : `+${row.growth}%`}</span>
          </a>
        ))
        : <p className="bbf-rempty">No rising hashtags recorded yet.</p>}
      <p className="bbf-rfoot">
        Growth is week over week across every indexed video, not just your searches. &ldquo;New&rdquo;
        means the hashtag was absent from the previous week.
      </p>
    </section>
  );
}

/* Shown above the stream, so borrowed videos never read as the user's own. */
function DiscoveryPrompt() {
  return (
    <div className="bbf-prompt">
      <span className="bbf-prompt__i">{Icons.spark}</span>
      <div>
        <h2>Run your first search to make this yours</h2>
        <p>
          Until then, here is what is breaking out across Brand Beacon. Search a brand or product
          above to swap it for your own.
        </p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bbf-empty">
      <span className="bbf-empty__i">{Icons.spark}</span>
      <h2>Your feed is waiting on your first search</h2>
      <p>
        Search a brand or product above and we&rsquo;ll start filling this in — your breakout videos,
        the hashtags they lean on, and the searches behind them.
      </p>
    </div>
  );
}

export default function MyFeed({ feed = {}, currentPath = '/home', onAnalyze, analysisById = {} }) {
  const {
    videos = [],
    totalCount = videos.length,
    searches = [],
    searchesCount = 0,
    hashtags = [],
    hashtagsCount = 0,
    climbing = [],
    isDiscoveryFeed = false,
  } = feed;

  const [shown, setShown] = useState(FIRST_BATCH);
  const [saved, setSaved] = useState({});
  const [savingId, setSavingId] = useState(null);

  // The payload ships more cards than the stream shows, so "Load more" is a
  // client-side reveal rather than another round trip.
  const cards = useMemo(
    () => videos.slice(0, shown).map((v) => ({
      ...v,
      ...(v.id in saved ? { bookmarked: saved[v.id] } : {}),
      analysis: analysisById[v.id] ?? v.analysis ?? null,
    })),
    [videos, shown, saved, analysisById],
  );

  const remaining = Math.max(0, videos.length - shown);

  const toggleSave = async (video) => {
    const next = !video.bookmarked;
    setSavingId(video.id);
    try {
      await (next ? bookmarksApi.save(video.id) : bookmarksApi.remove(video.id));
      setSaved((cur) => ({ ...cur, [video.id]: next }));
    } catch {
      /* the button simply stays as it was */
    } finally {
      setSavingId(null);
    }
  };

  const analyze = (video) => {
    if (typeof onAnalyze === 'function') return onAnalyze(video);
    // No modal host on this page — fall through to the search that surfaced the
    // video, where analysis lives.
    return video.search_url ? router.visit(withReturnTo(video.search_url, currentPath)) : undefined;
  };

  const styles = <style>{scopedCss}</style>;

  // No searches yet and nothing global to borrow either — a brand new install.
  if (videos.length === 0) {
    return (
      <>
        {styles}
        <EmptyState />
      </>
    );
  }

  return (
    <>
      {styles}
      {isDiscoveryFeed && <DiscoveryPrompt />}

      <div className="bbf-sbar">
        <h2>{isDiscoveryFeed ? 'Breaking out now' : 'Your top breakout videos'}</h2>
        <p>
          {isDiscoveryFeed
            ? 'The strongest videos across Brand Beacon this week, while your own feed fills up.'
            : `Curated list of the top breakout videos from your searches and categories.${totalCount > videos.length ? ` ${totalCount} broke out for you this week.` : ''}`}
        </p>
      </div>

      <div className="bbf-grid">
        <section className="bbf-stream" aria-label={isDiscoveryFeed ? 'Breakout videos across Brand Beacon' : 'Your breakout videos'}>
          {cards.map((video, i) => (
            <Post
              key={`${video.id}-${i}`}
              video={video}
              onAnalyze={analyze}
              onToggleSave={toggleSave}
              saving={savingId === video.id}
            />
          ))}
          {remaining > 0 && (
            <div className="bbf-more">
              <button type="button" className="bbf-btn" onClick={() => setShown((n) => n + BATCH)}>
                Load {Math.min(BATCH, remaining)} more
              </button>
            </div>
          )}
        </section>

        <aside className="bbf-rail" aria-label="Your searches and hashtag trends">
          <SearchesCard searches={searches} searchesCount={searchesCount} />
          <HashtagsCard hashtags={hashtags} hashtagsCount={hashtagsCount} />
          <ClimbingCard climbing={climbing} />
        </aside>
      </div>
    </>
  );
}

/*
 * Feed styles. Scoped to this page under the bbf- prefix so they never collide
 * with app.css, and shipped with the component so the feed is self-contained.
 * The tokens (--yellow, --line, --ink…) come from app.css.
 */
const scopedCss = `
.bbf-sbar{margin:0 0 14px}
.bbf-sbar h2{position:relative;margin:0;padding-left:13px;font-size:1.1rem;font-weight:800;letter-spacing:-.026em;color:var(--ink)}
.bbf-sbar h2::before{content:'';position:absolute;left:0;top:.2em;bottom:.2em;width:3px;border-radius:2px;background:var(--yellow)}
.bbf-sbar p{margin:4px 0 0;padding-left:13px;font-size:.88rem;line-height:1.5;color:var(--muted)}

.bbf-grid{display:grid;grid-template-columns:minmax(0,1fr) 312px;gap:22px;align-items:start}
.bbf-stream{display:flex;flex-direction:column;gap:14px;min-width:0}

.bbf-post{background:var(--white);border:1px solid var(--line);border-radius:16px;overflow:hidden;transition:border-color .16s}
.bbf-post:hover{border-color:var(--line-2,#D9D6CF)}
.bbf-post__b{display:grid;grid-template-columns:262px minmax(0,1fr);gap:18px;padding:16px}

.bbf-media{position:relative;aspect-ratio:9/13;border-radius:14px;overflow:hidden;background:var(--paper,#FAF9F6)}
.bbf-media img,.bbf-media__ph{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.bbf-media iframe{position:absolute;inset:0;width:100%;height:100%;border:0;background:#000;display:block}
.bbf-scrim{position:absolute;left:0;right:0;bottom:0;height:44%;z-index:4;pointer-events:none;background:linear-gradient(180deg,transparent,rgba(11,11,11,.34) 45%,rgba(11,11,11,.62))}
.bbf-vtag{position:absolute;top:9px;left:9px;z-index:6;display:inline-flex;align-items:center;gap:6px;max-width:calc(100% - 76px);padding:5px 10px;border-radius:8px;background:rgba(255,255,255,.94);backdrop-filter:blur(6px);font-size:.74rem;font-weight:800;color:var(--ink);letter-spacing:-.01em;text-decoration:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;transition:.16s}
.bbf-vtag i{width:5px;height:5px;border-radius:50%;background:var(--yellow);flex:none}
.bbf-vtag.p i{background:#C2410C}
.bbf-vtag:hover{background:#fff;color:var(--amber-ink)}
.bbf-dur{position:absolute;top:9px;right:9px;z-index:5;padding:3px 8px;border-radius:7px;background:rgba(11,11,11,.55);color:#fff;font-size:.68rem;font-weight:700;font-variant-numeric:tabular-nums}
.bbf-play{position:absolute;inset:0;margin:auto;z-index:6;width:42px;height:42px;display:grid;place-items:center;border:0;border-radius:50%;background:rgba(255,255,255,.92);box-shadow:0 3px 12px rgba(0,0,0,.25);cursor:pointer;opacity:0;transition:opacity .2s}
.bbf-media:hover .bbf-play,.bbf-play:focus-visible{opacity:1}
.bbf-play svg{width:15px;height:15px;margin-left:2px;color:#1A1400}
.bbf-close{position:absolute;top:9px;right:9px;z-index:7;width:28px;height:28px;border:0;border-radius:50%;background:rgba(0,0,0,.65);color:#fff;font-size:1.25rem;line-height:1;cursor:pointer}
.bbf-play-error{position:absolute;inset:auto 12px 12px;z-index:6;padding:10px;border-radius:8px;background:rgba(0,0,0,.8);color:#fff;text-align:center;font-size:.78rem}
.bbf-ovstats{position:absolute;left:9px;right:9px;bottom:9px;z-index:5;display:grid;grid-template-columns:1fr 1fr;gap:6px}
.bbf-ovchip{border-radius:10px;padding:7px 8px 8px;border:1px solid rgba(255,255,255,.35);box-shadow:0 4px 14px rgba(0,0,0,.28)}
.bbf-ovchip .lab{display:flex;align-items:center;gap:5px;font-size:.56rem;font-weight:800;letter-spacing:.07em;text-transform:uppercase;white-space:nowrap}
.bbf-ovchip .lab i{width:4px;height:4px;border-radius:50%;background:currentColor;flex:none}
.bbf-ovchip .num{display:block;margin-top:3px;font-size:1.02rem;font-weight:800;line-height:1;letter-spacing:-.02em;color:var(--ink);font-variant-numeric:tabular-nums}
.bbf-ovchip--score{background:#FFF3CF}
.bbf-ovchip--score .lab{color:var(--amber-ink)}
.bbf-ovchip--views{background:#FEF0E7}
.bbf-ovchip--views .lab{color:#C2410C}

.bbf-side{min-width:0;display:flex;flex-direction:column;gap:12px}
.bbf-who{display:flex;align-items:flex-start;gap:9px}
.bbf-av{width:32px;height:32px;border-radius:50%;flex:none;margin-top:1px;background:linear-gradient(150deg,#ffd27a,#ff9a5a 55%,#c0607a)}
.bbf-who__t{min-width:0}
.bbf-who__t .n{display:block;font-size:.88rem;font-weight:700;color:var(--ink);line-height:1.3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bbf-who__t .s{display:block;font-size:.76rem;color:var(--faint,#74716A);line-height:1.3}
.bbf-who__d{margin-left:auto;padding-top:2px;flex:none;font-size:.76rem;color:var(--faint,#74716A);white-space:nowrap;font-variant-numeric:tabular-nums}
.bbf-cap{margin:0;font-size:.9rem;line-height:1.5;color:var(--ink);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.bbf-tag{color:var(--amber-ink);font-weight:700;text-decoration:none}
.bbf-tag:hover{text-decoration:underline;text-underline-offset:2px}
.bbf-eng{display:flex;justify-content:space-between;gap:6px;margin-top:auto;padding-top:12px;border-top:1px solid var(--line);font-size:.8rem;font-weight:600;color:var(--muted);font-variant-numeric:tabular-nums}
.bbf-eng span{display:inline-flex;align-items:center;gap:5px;white-space:nowrap}
.bbf-eng svg{width:13px;height:13px;flex:none;color:var(--faint,#74716A)}
.bbf-acts{display:flex;gap:8px;margin-top:2px}
.bbf-act{display:inline-flex;align-items:center;justify-content:center;gap:7px;height:38px;border:0;border-radius:10px;font:inherit;font-size:.84rem;font-weight:700;text-decoration:none;cursor:pointer;transition:.16s}
.bbf-act svg{width:14px;height:14px;flex:none}
.bbf-act--an{flex:1;background:var(--yellow);color:#1A1400}
.bbf-act--an:hover{background:var(--yellow-hot,#FFD84D)}
.bbf-act--ic{width:38px;border:1px solid var(--line);background:var(--white);color:var(--muted)}
.bbf-act--ic:hover{color:var(--ink);border-color:var(--line-2,#D9D6CF)}
.bbf-act--ic.on{color:var(--amber-ink);border-color:#FFF3CF;background:var(--wash)}
.bbf-act--an.done{background:var(--white);border:1px solid var(--yellow);color:var(--ink)}
.bbf-act[disabled]{opacity:.55;cursor:not-allowed}
.bbf-act--an[aria-busy="true"]{opacity:1}
.bbf-spin{width:14px;height:14px;flex:none;border-radius:50%;border:2px solid rgba(26,20,0,.28);border-top-color:#1A1400;animation:bbf-sp .8s linear infinite}
@keyframes bbf-sp{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.bbf-spin{animation:none}}
.bbf-act:focus-visible,.bbf-play:focus-visible,.bbf-vtag:focus-visible{outline:2px solid var(--ink);outline-offset:2px}

.bbf-more{display:flex;justify-content:center;padding:6px 0 4px}
.bbf-btn{display:inline-flex;align-items:center;justify-content:center;height:38px;padding:0 18px;border:1px solid var(--line-2,#D9D6CF);border-radius:10px;background:var(--white);font:inherit;font-size:.85rem;font-weight:700;color:var(--ink);cursor:pointer;transition:.16s}
.bbf-btn:hover{background:var(--paper,#FAF9F6);border-color:#BDBAB2}

.bbf-rail{position:sticky;top:24px;display:flex;flex-direction:column;gap:14px;min-width:0}
.bbf-rcard{background:var(--white);border:1px solid var(--line);border-radius:16px;padding:15px 16px;min-width:0}
.bbf-rhead{display:flex;align-items:center;gap:8px;margin-bottom:11px}
.bbf-rhead h3{margin:0;font-size:.92rem;font-weight:800;letter-spacing:-.02em;color:var(--ink)}
.bbf-chip{margin-left:auto;flex:none;padding:2px 6px;border:1px solid var(--line);border-radius:5px;font-size:.62rem;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:var(--faint,#74716A);text-decoration:none}
.bbf-chip--plain{text-transform:none;letter-spacing:0;font-size:.72rem}
.bbf-chip--plain:hover{color:var(--ink);border-color:var(--line-2,#D9D6CF)}
.bbf-chip--yours{border-color:transparent;padding:3px 7px;color:var(--amber-ink);background:var(--wash)}
.bbf-rlist{display:flex;flex-direction:column}
.bbf-rrow{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--line);color:inherit;text-decoration:none}
.bbf-rrow:first-child{padding-top:0}
.bbf-rrow:last-child{border-bottom:0;padding-bottom:0}
.bbf-src{width:30px;height:30px;flex:none;display:grid;place-items:center;border-radius:8px;background:var(--wash);color:var(--amber-ink);font-size:.72rem;font-weight:800}
.bbf-src.p{background:#FEF0E7;color:#C2410C}
.bbf-rrow .t{flex:1;min-width:0}
.bbf-rrow .t b{display:block;font-size:.82rem;font-weight:700;color:var(--ink);line-height:1.3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bbf-rrow .t span{display:block;font-size:.73rem;color:var(--faint,#74716A);line-height:1.3}
.bbf-rrow:hover .t b{color:var(--amber-ink)}
.bbf-rrow .g,.bbf-hrow .g{flex:none;font-size:.75rem;font-weight:800;color:#1F7A4D;font-variant-numeric:tabular-nums}
.bbf-hrow{display:flex;align-items:center;gap:9px;padding:7px 0;border-bottom:1px solid var(--line);color:inherit;text-decoration:none}
.bbf-hrow:first-of-type{padding-top:0}
.bbf-hrow:last-of-type{border-bottom:0;padding-bottom:0}
.bbf-hrow b{flex:1;min-width:0;font-size:.84rem;font-weight:700;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bbf-hrow:hover b{color:var(--amber-ink)}
.bbf-hrow .bar{width:56px;height:5px;flex:none;border-radius:3px;background:var(--paper,#FAF9F6);overflow:hidden}
.bbf-hrow .bar i{display:block;height:100%;border-radius:3px;background:var(--yellow)}
.bbf-hrow .c{flex:none;min-width:24px;text-align:right;font-size:.75rem;color:var(--faint,#74716A);font-variant-numeric:tabular-nums}
.bbf-rfoot{margin:11px 0 0;padding-top:10px;border-top:1px solid var(--line);font-size:.76rem;line-height:1.45;color:var(--faint,#74716A)}
.bbf-rempty{margin:0;font-size:.8rem;line-height:1.5;color:var(--muted)}
.bbf-rlink{display:inline-flex;align-items:center;gap:5px;margin-top:10px;font-size:.8rem;font-weight:700;color:var(--amber-ink);text-decoration:none}
.bbf-rlink:hover{text-decoration:underline;text-underline-offset:3px}
.bbf-rlink svg{width:12px;height:12px}

.bbf-prompt{display:flex;gap:14px;align-items:flex-start;margin:0 0 18px;padding:16px 18px;border:1px solid #F2E2AE;border-radius:16px;background:var(--wash)}
.bbf-prompt__i{width:34px;height:34px;flex:none;display:grid;place-items:center;border-radius:10px;background:var(--yellow);color:#1A1400}
.bbf-prompt__i svg{width:17px;height:17px}
.bbf-prompt h2{margin:0;font-size:.95rem;font-weight:800;letter-spacing:-.02em;color:var(--ink)}
.bbf-prompt p{margin:5px 0 0;max-width:70ch;font-size:.83rem;line-height:1.55;color:#5B4300}
.bbf-empty{margin-top:8px;padding:40px 26px;border:1px dashed var(--line-2,#D9D6CF);border-radius:20px;background:var(--white);text-align:center}
.bbf-empty__i{width:52px;height:52px;margin:0 auto 16px;display:grid;place-items:center;border-radius:16px;background:var(--wash);color:var(--amber-ink)}
.bbf-empty__i svg{width:24px;height:24px}
.bbf-empty h2{margin:0;font-size:1.12rem;font-weight:800;letter-spacing:-.03em;color:var(--ink)}
.bbf-empty p{margin:10px auto 0;max-width:440px;font-size:.9rem;line-height:1.55;color:var(--muted)}

@media (prefers-reduced-motion:reduce){.bbf-post,.bbf-act,.bbf-play,.bbf-btn,.bbf-vtag{transition:none}}

/* Tablet: the rail moves under the stream as a two-up row. */
@media (max-width:1140px){
  .bbf-grid{grid-template-columns:minmax(0,1fr)}
  .bbf-rail{position:static;display:grid;grid-template-columns:1fr 1fr;gap:14px}
}
@media (max-width:980px){
  .bbf-post__b{grid-template-columns:190px minmax(0,1fr);gap:14px}
}
/* Phone: full-bleed portrait thumb, copy below, single-column rail. */
@media (max-width:680px){
  .bbf-rail{grid-template-columns:1fr}
  .bbf-post__b{display:block;padding:0 0 14px}
  .bbf-media{aspect-ratio:9/16;border-radius:0;margin-bottom:13px}
  .bbf-play{opacity:1}
  .bbf-ovstats{left:12px;right:12px;bottom:12px;gap:8px}
  .bbf-ovchip{padding:9px 12px 10px}
  .bbf-ovchip .lab{font-size:.6rem}
  .bbf-ovchip .num{font-size:1.16rem}
  .bbf-side{padding:0 14px}
  .bbf-cap{-webkit-line-clamp:3}
}
`;
