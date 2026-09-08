import { Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

import { playerUrlFor, postTikTokMessage } from '../SavedSearches/detail/tiktokPlayer.js';
import { withReturnTo } from '../utils/navigation.js';

/**
 * The signed-in "My Feed" home (mockup: V5 Home/My Feed). A two-part layout with a
 * column of search highlights beside the user's strongest breakout videos, drawn
 * from those same searches — their top sounds, top hashtags, and saved videos.
 *
 * All content comes from the user's own searches; when they have none the feed
 * shows an encouraging empty state instead. Free-user / global discovery feeds
 * are handled separately, later.
 */

const Icons = {
  play: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.6v14.8L19.5 12z" /></svg>,
  eye: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1.6 12S5.6 5 12 5s10.4 7 10.4 7-4 7-10.4 7S1.6 12 1.6 12z" /><circle cx="12" cy="12" r="3" /></svg>,
  heart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.4 5.6a5 5 0 0 0-7.1 0L12 6.9l-1.3-1.3a5 5 0 1 0-7.1 7.1l8.4 8.4 8.4-8.4a5 5 0 0 0 0-7.1z" /></svg>,
  comment: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9.6 9.6 0 0 1-3-.5L3 21l1.6-4.6A8.4 8.4 0 0 1 3 11.5a8.4 8.4 0 0 1 9-8.4 8.4 8.4 0 0 1 9 8.4z" /></svg>,
  user: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  spark: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" /></svg>,
};

function VideoCard({ video, currentPath }) {
  const href = video.search_url ? withReturnTo(video.search_url, currentPath) : null;
  const [playing, setPlaying] = useState(false);
  const iframeRef = useRef(null);
  const Details = href ? Link : 'div';
  // The feed plays through TikTok's embed like every other surface. The raw
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

  const body = (
    <>
      <div className="mf-vt">
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
            <button type="button" className="mf-close" aria-label="Close player" onClick={() => setPlaying(false)}>×</button>
          </>
        ) : video.thumbnail ? (
          <img src={video.thumbnail} alt="" loading="lazy" />
        ) : (
          <span className="mf-vt__ph" style={{ background: video.gradient }} />
        )}
        {!playing && video.brand && <span className="mf-k">{video.brand}</span>}
        {!playing && video.score && <span className="mf-m">{video.score}</span>}
        {!playing && video.duration && <span className="mf-d">{video.duration}</span>}
        {!playing && playerUrl && <button type="button" className="mf-p" aria-label={`Play video by ${video.handle || 'TikTok creator'}`} onClick={() => setPlaying(true)}>{Icons.play}</button>}
        {!playerUrl && <span className="mf-play-error" role="status">Video unavailable.</span>}
      </div>
      <Details className="mf-vb" {...(href ? { href } : {})}>
        <div className="mf-vb__meta">
          <p className="mf-vb__h">{video.handle || 'on TikTok'}</p>
          {video.uploaded_date && <time className="mf-vb__sub" dateTime={video.uploaded_at}>Uploaded {video.uploaded_date}</time>}
        </div>
        {video.caption && <p className="mf-vb__c">{video.caption}</p>}
        <div className="mf-vb__s">
          <span>{Icons.eye}{video.views}</span>
          <span>{Icons.heart}{video.likes}</span>
          <span>{Icons.comment}{video.comments}</span>
          <span>{Icons.user}{video.followers}</span>
        </div>
      </Details>
    </>
  );

  return <article className="mf-vc">{body}</article>;
}

function SoundsPanel({ sounds }) {
  return (
    <div className="mf-panel">
      <div className="mf-sec"><h2>your top sounds</h2></div>
      {sounds.map((sound, i) => (
        <a className="mf-rk" key={sound.label} href={`https://www.tiktok.com/search/sound?q=${encodeURIComponent(sound.label)}`} target="_blank" rel="noopener noreferrer" aria-label={`${sound.label} — open on TikTok`}>
          <span className="mf-rk__p">{String(i + 1).padStart(2, '0')}</span>
          <span className="mf-rk__bd">
            <strong>{sound.label}</strong>
            <span>in {sound.count} of your breakout{sound.count === 1 ? '' : 's'}</span>
          </span>
        </a>
      ))}
    </div>
  );
}

function HashtagsPanel({ hashtags }) {
  return (
    <div className="mf-panel">
      <div className="mf-sec"><h2>your top hashtags</h2></div>
      <div className="mf-htags">
        {hashtags.map((h) => (
          <a className="mf-hrow" key={h.tag} href={`https://www.tiktok.com/tag/${encodeURIComponent(String(h.tag).replace(/^#/, ''))}`} target="_blank" rel="noopener noreferrer" aria-label={`#${h.tag} — open on TikTok`}>
            <strong>#{h.tag}</strong>
            <span>{h.count} video{h.count === 1 ? '' : 's'}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

function SavedPanel({ saved, savedCount }) {
  return (
    <div className="mf-panel">
      <div className="mf-sec"><h2>you saved these</h2></div>
      <p className="mf-fsub">The last videos you saved.</p>
      <div className="mf-savedrow">
        {saved.map((v) => (
          <span className="mf-saved-vc" key={v.id} style={{ background: v.gradient }}>
            {v.thumbnail && <img src={v.thumbnail} alt="" loading="lazy" />}
            {v.score && <span className="mf-score">{v.score}</span>}
          </span>
        ))}
      </div>
      <Link href="/library" className="mf-link">All {savedCount} saved video{savedCount === 1 ? '' : 's'}</Link>
    </div>
  );
}

function DiscoveryPanel({ kind, discovery }) {
  const titles = { searches: 'most searched', hashtags: 'hashtags climbing', sounds: 'top sounds' };
  const sounds = discovery.topSounds ?? [];
  const hashtags = discovery.climbingHashtags ?? [];
  return <div className="mf-panel">
    <div className="mf-sec"><h2>{titles[kind]}</h2><span className="mf-platform">Brand Beacon</span></div>
    {kind === 'searches' && <>
      {['brand', 'product'].map((type) => <div key={type}>
        <p className="mf-discovery-label">{type === 'brand' ? 'Brands' : 'Products'}</p>
        {(discovery.mostSearched?.[type] ?? []).map((row, i) => <Link className="mf-rk" key={row.phrase} href={`${type === 'product' ? '/products' : '/brands'}?q=${encodeURIComponent(row.phrase)}`}>
          <span className="mf-rk__p">{String(i + 1).padStart(2, '0')}</span><span className="mf-rk__bd"><strong>{row.phrase}</strong><span>{row.count} searches this week</span></span>
        </Link>)}
        {!discovery.mostSearched?.[type]?.length && <p className="mf-fsub">No searches recorded this week.</p>}
      </div>)}
      <p className="mf-discovery-note">New searches across Brand Beacon in the last 7 days. Account identities are never shown.</p>
    </>}
    {kind === 'hashtags' && <>
      <div className="mf-discovery-tags">{hashtags.map((row) => <a key={row.tag} href={`https://www.tiktok.com/tag/${encodeURIComponent(row.tag)}`} target="_blank" rel="noopener noreferrer">#{row.tag} <strong>{row.growth === null ? 'New' : `+${row.growth}%`}</strong></a>)}</div>
      {!hashtags.length && <p className="mf-fsub">No rising hashtags recorded yet.</p>}
      <p className="mf-discovery-note">Occurrences in videos indexed in the last 7 days versus the previous 7. “New” means absent from the previous period; this measures our index, not all of TikTok.</p>
    </>}
    {kind === 'sounds' && <>
      {sounds.map((row, i) => <a className="mf-rk" key={row.label} href={`https://www.tiktok.com/search/sound?q=${encodeURIComponent(row.label)}`} target="_blank" rel="noopener noreferrer">
        <span className="mf-rk__p">{String(i + 1).padStart(2, '0')}</span><span className="mf-rk__bd"><strong>{row.label}</strong><span>In {row.count} indexed videos</span></span>
      </a>)}
      {!sounds.length && <p className="mf-fsub">No sounds recorded this week.</p>}
      <p className="mf-discovery-note">Most common sounds in videos indexed across Brand Beacon in the last 7 days.</p>
    </>}
  </div>;
}

/* Shown above the discovery feed, so borrowed videos never read as their own. */
function DiscoveryPrompt() {
  return (
    <div className="mf-prompt">
      <span className="mf-prompt__i">{Icons.spark}</span>
      <div>
        <h2>Run your first search to make this yours</h2>
        <p>
          Until then, here is what is breaking out across Brand Beacon — the videos, sounds and
          hashtags everyone else is surfacing. Search a brand or product above to swap it for your own.
        </p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mf-empty">
      <span className="mf-empty__i">{Icons.spark}</span>
      <h2>Your feed is waiting on your first search</h2>
      <p>
        Search a brand or product above and we&rsquo;ll start filling this in — your breakout videos,
        the sounds and hashtags they lean on, and the ones you save.
      </p>
    </div>
  );
}

function FeedHead({ shown, totalCount, discoveryFeed }) {
  if (discoveryFeed) {
    return (
      <div className="mf-feedhead">
        <div className="mf-sec"><h2>breaking out now</h2></div>
        <p>The strongest videos across Brand Beacon this week, while your own feed fills up.</p>
      </div>
    );
  }

  const remaining = Math.max(0, totalCount - shown);
  const description = remaining > 0
    ? `${totalCount} video${totalCount === 1 ? '' : 's'} broke out for you this week. ${shown} ${shown === 1 ? 'is' : 'are'} here, and the other ${remaining} come round on your next visit.`
    : `${totalCount} video${totalCount === 1 ? '' : 's'} broke out for you this week.`;

  return (
    <div className="mf-feedhead">
      <div className="mf-sec"><h2>your feed</h2></div>
      <p>{description}</p>
      <span className="mf-feedhead__all">All {totalCount}</span>
    </div>
  );
}

export default function MyFeed({ feed = {}, currentPath = '/home' }) {
  const { videos = [], totalCount = videos.length, sounds = [], hashtags = [], saved = [], savedCount = 0, discovery = {}, isDiscoveryFeed = false } = feed;
  const discoveryPanels = ['searches', 'hashtags', 'sounds'].map((kind) => <DiscoveryPanel key={`discovery-${kind}`} kind={kind} discovery={discovery} />);

  const feedStyles = <style>{scopedCss}</style>;

  // No searches yet and nothing global to borrow either — a brand new install.
  if (videos.length === 0) {
    return (
      <>
        {feedStyles}
        <EmptyState />
        <div className="mf-discovery-empty">{discoveryPanels}</div>
      </>
    );
  }

  const mobilePanels = [];
  if (sounds.length > 0) mobilePanels.push(<SoundsPanel key="sounds" sounds={sounds} />);
  mobilePanels.push(<DiscoveryPanel key="discovery-sounds" kind="sounds" discovery={discovery} />);
  if (hashtags.length > 0) mobilePanels.push(<HashtagsPanel key="hashtags" hashtags={hashtags} />);
  mobilePanels.push(<DiscoveryPanel key="discovery-hashtags" kind="hashtags" discovery={discovery} />);
  if (saved.length > 0) mobilePanels.push(<SavedPanel key="saved" saved={saved} savedCount={savedCount} />);
  mobilePanels.push(<DiscoveryPanel key="discovery-searches" kind="searches" discovery={discovery} />);
  const mobileItems = videos.flatMap((video, i) => [
    <VideoCard key={`v-${video.id}-${i}`} video={video} currentPath={currentPath} />,
    ...(mobilePanels[i] ? [mobilePanels[i]] : []),
  ]);
  mobileItems.push(...mobilePanels.slice(videos.length));

  return (
    <>
      {feedStyles}
      {isDiscoveryFeed && <DiscoveryPrompt />}
      <FeedHead shown={videos.length} totalCount={totalCount} discoveryFeed={isDiscoveryFeed} />
      <div className="mf-mobile">{mobileItems}</div>
      <div className="mf">
        <section className="mf-videos" aria-label={isDiscoveryFeed ? 'Breakout videos across Brand Beacon' : 'Your breakout videos'}>
          {videos.map((video, i) => <VideoCard key={`v-${video.id}-${i}`} video={video} currentPath={currentPath} />)}
        </section>
        <aside className="mf-sidebar" aria-label="Your search highlights and Brand Beacon trends">
          {sounds.length > 0 && <SoundsPanel sounds={sounds} />}
          <DiscoveryPanel kind="sounds" discovery={discovery} />
          {hashtags.length > 0 && <HashtagsPanel hashtags={hashtags} />}
          <DiscoveryPanel kind="hashtags" discovery={discovery} />
          {saved.length > 0 && <SavedPanel saved={saved} savedCount={savedCount} />}
          <DiscoveryPanel kind="searches" discovery={discovery} />
        </aside>
      </div>
    </>
  );
}

const scopedCss = `
.mf-platform{margin-left:auto;font-size:.55rem;font-weight:800;text-transform:uppercase;white-space:nowrap;background:var(--wash);padding:4px 5px;border-radius:5px}
.mf-discovery-label{font-size:.65rem;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);font-weight:700}
.mf-discovery-note{font-size:.72rem;line-height:1.5;color:var(--muted);margin:0}
.mf-discovery-tags{display:flex;flex-wrap:wrap;gap:8px}
.mf-discovery-tags a{font-size:.78rem;padding:7px;border-radius:8px;background:var(--wash);color:inherit;text-decoration:none;overflow-wrap:anywhere}
.mf-discovery-tags strong{color:var(--amber-ink);margin-left:4px}
.mf-discovery-empty{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(260px,100%),1fr));gap:16px;margin-top:20px;align-items:start}
.mf-header{display:flex;align-items:center;justify-content:space-between;gap:16px}
.mf-feedhead{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px 14px;margin:28px 0 20px}
.mf-feedhead .mf-sec{flex:none}
.mf-feedhead p{margin:0;flex:1;min-width:240px;color:var(--muted);font-size:.86rem;line-height:1.5}
.mf-feedhead__all{margin-left:auto;flex:none;font-size:.82rem;font-weight:700;color:var(--amber-ink)}
.mf-header .mf-qs{flex:1;min-width:0;max-width:520px}
.mf-header .ent{display:none;margin-left:0}
@media(min-width:1100px){.mf-header .ent{display:inline-flex;flex:none}}
.mf-qs{position:relative;display:flex;align-items:center;gap:10px;min-height:52px;padding:0 6px 0 16px;border-radius:12px;border:1px solid rgba(0,0,0,.09);background:var(--white);box-shadow:0 1px 2px rgba(16,18,32,.04);color:inherit;transition:border-color .16s,box-shadow .16s}
.mf-qs:focus-within{border-color:var(--yellow);box-shadow:0 0 0 4px rgba(255,198,41,.18)}
.mf-qs>svg{width:18px;height:18px;color:var(--muted);flex:none}
.mf-qs__in{flex:1;min-width:0;border:0;outline:0;background:transparent;font:inherit;color:var(--ink);font-size:.92rem;font-weight:500}
.mf-qs__in::placeholder{color:var(--faint-2,#5c5a54)}
.mf-qs__menuwrap{position:relative;flex:none}
.mf-qs__btn{flex:none;display:inline-flex;align-items:center;gap:6px;min-height:40px;padding:0 16px;border:0;border-radius:10px;background:linear-gradient(#ffd84d,#ffc629);color:#0b0b0b;font-size:.84rem;font-weight:700;cursor:pointer}
.mf-qs__btn svg{width:13px;height:13px;transition:transform .16s}
.mf-qs__btn[aria-expanded="true"] svg{transform:rotate(180deg)}
.mf-qs__btn[disabled]{opacity:.5;cursor:not-allowed}
.mf-qs__menu{position:absolute;top:calc(100% + 8px);right:0;z-index:30;min-width:190px;overflow:hidden;border:1px solid var(--line);border-radius:12px;background:var(--white);box-shadow:0 18px 36px -18px rgba(20,15,0,.32)}
.mf-qs__menu button{display:block;width:100%;padding:11px 14px;border:0;background:transparent;text-align:left;font-size:.86rem;font-weight:600;color:var(--ink);cursor:pointer}
.mf-qs__menu button:hover,.mf-qs__menu button:focus-visible{background:var(--wash)}

/* Desktop-only: the video feed and highlights sidebar share the page scroll
   in one grid. Both are hidden below 1100px, where .mf-mobile takes over —
   .mf-vc's base rules stay mobile's portrait card; the row layout below is
   scoped under .mf-videos so it never reaches .mf-mobile. */
.mf{margin-top:24px;display:none;gap:24px;align-items:start}
.mf-mobile{margin-top:24px;display:flex;flex-direction:column;gap:14px}
@media(min-width:820px) and (max-width:1099px){
  .mf-mobile{display:block;columns:2;column-gap:16px}
  .mf-mobile>*{break-inside:avoid;margin-bottom:16px}
}
.mf-sidebar{order:2;display:flex;flex-direction:column;gap:16px;min-width:0}
.mf-videos{order:1;min-width:0;display:flex;flex-direction:column;gap:16px}
@media(min-width:1100px){
  .mf{display:grid;grid-template-columns:minmax(0,1fr) 300px}
  .mf-mobile{display:none}
}
.mf-vc{display:block;overflow:hidden;text-align:left;background:var(--white);border:1px solid var(--line);border-radius:16px;text-decoration:none;color:inherit;transition:box-shadow .16s,transform .16s}
.mf-vc:hover{box-shadow:0 14px 34px -20px rgba(20,15,0,.32)}
.mf-vt{position:relative;overflow:hidden;aspect-ratio:4/5;background:var(--paper,#faf9f6)}
.mf-vt__ph{position:absolute;inset:0;width:100%;height:100%;display:block}
.mf-vt img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.mf-vt iframe{position:absolute;inset:0;width:100%;height:100%;border:0;background:#000;display:block}
.mf-close{position:absolute;top:9px;right:9px;z-index:3;width:28px;height:28px;border:0;border-radius:50%;background:rgba(0,0,0,.65);color:#fff;font-size:1.25rem;line-height:1;cursor:pointer}
.mf-play-error{position:absolute;inset:40% 12px auto;padding:12px;border-radius:8px;background:rgba(0,0,0,.8);color:#fff;text-align:center;font-size:.8rem}
.mf-vb{display:block;color:inherit;text-decoration:none}
a.mf-vb:hover{background:var(--wash)}
.mf-rk,.mf-hrow{color:inherit;text-decoration:none}
a.mf-rk:hover,a.mf-hrow:hover{background:var(--wash)}
.mf-p{border:0;cursor:pointer}
.mf-p:focus-visible,a.mf-vb:focus-visible,.mf-rk:focus-visible,.mf-hrow:focus-visible{outline:3px solid var(--yellow);outline-offset:-3px}
.mf-k{position:absolute;top:9px;right:9px;z-index:2;display:inline-flex;align-items:center;gap:5px;padding:4px 9px;border-radius:7px;background:rgba(11,11,11,.62);backdrop-filter:blur(6px);color:#fff;font-size:.68rem;font-weight:700;max-width:60%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mf-m{position:absolute;left:9px;bottom:9px;z-index:2;padding:3px 8px;border-radius:6px;background:var(--yellow);color:#1a1400;font-size:.68rem;font-weight:800}
.mf-d{position:absolute;right:9px;bottom:9px;z-index:2;padding:3px 7px;border-radius:6px;background:rgba(11,11,11,.72);color:#fff;font-size:.66rem;font-weight:700}
.mf-p{position:absolute;inset:0;z-index:2;width:44px;height:44px;margin:auto;display:grid;place-items:center;border-radius:50%;background:rgba(255,255,255,.94);box-shadow:0 3px 12px rgba(0,0,0,.28)}
.mf-p svg{width:15px;height:15px;color:#0b0b0b;transform:translateX(1px)}
.mf-vb{padding:14px}
.mf-vb__meta{display:flex;align-items:baseline;justify-content:space-between;gap:8px}
.mf-vb__h{margin:0;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--amber-ink);font-size:.79rem;font-weight:700}
.mf-vb__sub{margin:0;flex:0 0 auto;white-space:nowrap;color:var(--muted);font-size:.73rem;font-weight:500}
.mf-vb__c{margin:6px 0 0;color:var(--ink);font-size:.82rem;line-height:1.5}
.mf-vb__s{display:flex;flex-wrap:wrap;gap:12px;margin-top:12px;padding-top:11px;border-top:1px solid var(--line);color:var(--muted);font-size:.75rem}
.mf-vb__s span{display:inline-flex;align-items:center;gap:5px;white-space:nowrap}
.mf-vb__s svg{width:12px;height:12px;flex:none}
/* Desktop feed row card — a wide horizontal card (thumb + copy side by side),
   scoped to .mf-videos so .mf-mobile's portrait .mf-vc is untouched. */
.mf-videos .mf-vc{display:flex;flex-direction:row;align-items:center}
.mf-videos .mf-vt{width:200px;flex:none;aspect-ratio:9/16}
.mf-videos .mf-vb{flex:1;min-width:0;padding:18px 22px}
.mf-videos .mf-vb__c{font-size:.86rem}
.mf-panel{background:var(--white);border:1px solid var(--line);border-radius:16px;padding:15px 16px;display:flex;flex-direction:column;gap:12px}
.mf-sec{display:flex;align-items:baseline;gap:9px}
.mf-sec h2{margin:0;display:flex;align-items:center;gap:8px;font-size:.98rem;font-weight:700;letter-spacing:-.03em;color:var(--ink)}
.mf-sec h2::before{content:'';width:3px;height:15px;flex:none;border-radius:2px;background:var(--yellow)}
.mf-rk{display:flex;align-items:center;gap:11px;padding:9px 0;border-top:1px solid rgba(0,0,0,.05)}
.mf-rk__p{width:20px;flex:none;color:var(--muted);font-family:ui-monospace,Menlo,monospace;font-size:.72rem;font-weight:700}
.mf-rk__bd{flex:1;min-width:0;display:flex;flex-direction:column}
.mf-rk__bd strong{font-size:.86rem;font-weight:700;letter-spacing:-.02em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mf-rk__bd span{color:var(--muted);font-size:.72rem;font-weight:500}
.mf-htags{display:flex;flex-direction:column}
.mf-hrow{display:flex;align-items:baseline;justify-content:space-between;gap:10px;padding:9px 0;border-top:1px solid rgba(0,0,0,.05)}
.mf-hrow:first-child{border-top:0}
.mf-hrow strong{font-size:.9rem;font-weight:700;color:var(--ink)}
.mf-hrow span{color:var(--muted);font-size:.75rem;font-weight:600}
.mf-fsub{margin:-3px 0 0;color:var(--ink);font-size:.82rem;line-height:1.5;font-weight:500}
.mf-savedrow{display:flex;gap:9px}
.mf-saved-vc{position:relative;flex:1;aspect-ratio:9/16;border-radius:10px;overflow:hidden;background:var(--paper,#faf9f6)}
.mf-saved-vc img{width:100%;height:100%;object-fit:cover;display:block}
.mf-score{position:absolute;left:8px;bottom:8px;display:inline-flex;align-items:center;padding:3px 8px;border-radius:6px;background:var(--yellow);color:#0b0b0b;font-family:ui-monospace,Menlo,monospace;font-size:.7rem;font-weight:700}
.mf-link{font-size:.79rem;font-weight:700;color:var(--amber-ink);text-decoration:none}
.mf-link:hover{text-decoration:underline}
.mf-prompt{display:flex;gap:14px;align-items:flex-start;margin-top:24px;padding:16px 18px;border:1px solid #F2E2AE;border-radius:16px;background:#FFF8E6}
.mf-prompt__i{width:34px;height:34px;flex:none;display:grid;place-items:center;border-radius:10px;background:var(--yellow);color:#1A1400}
.mf-prompt__i svg{width:17px;height:17px}
.mf-prompt h2{margin:0;font-size:.95rem;font-weight:800;letter-spacing:-.02em;color:var(--ink)}
.mf-prompt p{margin:5px 0 0;font-size:.83rem;line-height:1.55;color:#5B4300;max-width:70ch}
.mf-empty{background:var(--white);border:1px dashed var(--line-2,#DEDBD3);border-radius:20px;padding:40px 26px;text-align:center;margin-top:24px}
.mf-empty__i{width:52px;height:52px;margin:0 auto 16px;border-radius:16px;background:var(--wash);color:var(--amber-ink);display:grid;place-items:center}
.mf-empty__i svg{width:24px;height:24px}
.mf-empty h2{font-size:1.12rem;font-weight:800;letter-spacing:-.03em;color:var(--ink);margin:0}
.mf-empty p{margin:10px auto 0;max-width:440px;color:var(--muted);font-size:.9rem;line-height:1.55}
`;
