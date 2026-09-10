import { useEffect, useRef, useState } from 'react';

import { playerUrlFor, postTikTokMessage } from '../SavedSearches/detail/tiktokPlayer.js';

/**
 * The one breakout video card. The results page, the saved-videos library and
 * the analysis modal all render this so a video looks the same wherever it is
 * shown. Styles live in app.css under "breakout video card" so every surface
 * picks them up without importing anything.
 *
 * Analyze and bookmark are opt-in: a surface that cannot spend analysis credits
 * simply omits `onAnalyze`, and the action row collapses to what it can do.
 */

const Icons = {
  Play: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>,
  Spark: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" /></svg>,
  Eye: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>,
  Heart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M12 20s-7-4.5-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.5-7 9-7 9z" /></svg>,
  Comment: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H8l-5 4V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
  Share: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" /><path d="m16 6-4-4-4 4" /><path d="M12 2v14" /></svg>,
  ExtLink: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M8 7h9v9" /></svg>,
  Bookmark: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 3h12v18l-6-4.5L6 21z" /></svg>,
  BookmarkO: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M6 3h12v18l-6-4.5L6 21z" /></svg>,
};

export function compact(n) {
  if (n == null || Number.isNaN(n)) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return String(Math.round(n));
}

// Breakout Score is the weighted engagement-per-follower score assigned when
// the search ranks the video. The search-relative multiple is a separate metric.
export function breakoutScore(video) {
  const value = Number(video?.score ?? video?.viral_score ?? video?.virality_score ?? 0);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

export function formatDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function formatDuration(seconds) {
  if (seconds == null || Number.isNaN(seconds)) return null;
  const s = Math.round(seconds);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

export function gradientFor(id) {
  const palettes = [
    'linear-gradient(150deg,#ffd6a6,#ff9a8f 55%,#c07a9a)',
    'linear-gradient(150deg,#d8c0ff,#a88fff 55%,#7a9ac0)',
    'linear-gradient(150deg,#c8f0d8,#7ad0a0 55%,#5aa0c0)',
    'linear-gradient(150deg,#a6d8ff,#7aa8ff 55%,#8f7aff)',
    'linear-gradient(150deg,#ffe0a6,#ffbf8f 55%,#c0907a)',
    'linear-gradient(150deg,#ffc0d8,#ff8fb0 55%,#c07a9a)',
    'linear-gradient(150deg,#e0d0ff,#b0a0ff 55%,#8f7aff)',
    'linear-gradient(150deg,#ffd27a,#ff9a5a 60%,#c0607a)',
  ];
  let h = 0;
  const s = String(id || '');
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return palettes[h % palettes.length];
}

function analysisCtaLabel(analysis) {
  if (analysis?.status === 'processing') return 'Analyzing video...';
  if (analysis?.status === 'complete') return 'View analysis';
  if (analysis?.status === 'failed') return 'Retry analysis';
  return 'Analyze video';
}

export function AnalyzeStateButton({ analysis, onClick, small = false }) {
  const status = analysis?.status ?? 'idle';
  const isProcessing = status === 'processing';
  const isComplete = status === 'complete';
  const stateClass = isProcessing ? 'rs-analyze--busy' : isComplete ? 'rs-analyze--done' : 'rs-analyze--ready';
  const desktopLabel = analysisCtaLabel(analysis);
  const mobileLabel = desktopLabel === 'Analyze video' ? 'Analyze' : desktopLabel;

  return (
    <button
      type="button"
      className={`rs-analyze ${stateClass}${small ? ' rs-analyze--sm' : ''}`}
      onClick={onClick}
      aria-busy={isProcessing}
      disabled={isProcessing}
    >
      {isProcessing ? (
        <>
          <span className="rs-analyze__ring" aria-hidden />
          <span className="rs-analyze__label rs-analyze__label--desktop">{desktopLabel}</span>
          <span className="rs-analyze__label rs-analyze__label--mobile">{mobileLabel}</span>
        </>
      ) : isComplete ? (
        <>
          <span className="rs-analyze__badge" aria-hidden>✓</span>
          <span className="rs-analyze__label rs-analyze__label--desktop">{desktopLabel}</span>
          <span className="rs-analyze__label rs-analyze__label--mobile">{mobileLabel}</span>
          <span className="rs-analyze__chev" aria-hidden>→</span>
        </>
      ) : (
        <>
          <span className="rs-analyze__icon" aria-hidden>{Icons.Spark}</span>
          <span className="rs-analyze__label rs-analyze__label--desktop">{desktopLabel}</span>
          <span className="rs-analyze__label rs-analyze__label--mobile">{mobileLabel}</span>
        </>
      )}
    </button>
  );
}

export function VideoFrame({ video, winner = false, leading = false, showStats = true, isPlaying, onTogglePlay }) {
  const bg = video.thumbnail_url ? undefined : gradientFor(video.id ?? video.handle);
  const playerUrl = playerUrlFor(video, true);
  const [playerReady, setPlayerReady] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    setPlayerReady(false);
  }, [isPlaying, playerUrl]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!isPlaying || !iframe || !video?.video_id) return undefined;

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
  }, [isPlaying, video?.video_id]);

  return (
    <div className={`rs-vf${isPlaying ? ' playing' : ''}${winner ? ' rs-vf--big' : ''}`}>
      {!isPlaying && (video.thumbnail_url
        ? <img className="rs-vf__img" src={video.thumbnail_url} alt="" loading="lazy" />
        : <div className="rs-vf__img" style={{ background: bg }} />)}
      {isPlaying && playerUrl && (
        <iframe
          ref={iframeRef}
          className="rs-vf__player"
          src={playerUrl}
          title={video.title ? `Video: ${video.title}` : 'Video preview'}
          allow="autoplay; encrypted-media; fullscreen"
          allowFullScreen
          onLoad={() => setPlayerReady(true)}
        />
      )}
      {!isPlaying && <div className="rs-vf__scrim" />}
      {winner
        ? <span className={`rs-vf__win${leading ? ' rs-vf__win--lead' : ''}`}>{leading ? 'Leading so far' : <>{Icons.Spark}Winner</>}</span>
        : video.rank != null && <span className="rs-vf__rank">{video.rank}</span>}
      {video.duration != null && <span className="rs-vf__dur">{formatDuration(video.duration)}</span>}
      {!isPlaying && <button type="button" className="rs-vf__play-target" onClick={onTogglePlay} aria-label="Play"><span className="rs-vf__play">{Icons.Play}</span></button>}
      {isPlaying && playerUrl && !playerReady && <span className="rs-vf__loading">Loading video…</span>}
      {isPlaying && <button className="rs-vf__close" onClick={onTogglePlay} aria-label="Close video preview">×</button>}
      {showStats && (
        <div className="rs-vf__stats" aria-hidden={Boolean(isPlaying)}>
          <div className="rs-ovchip rs-ovchip--out">
            <div className="rs-ovchip__l">Breakout Score</div>
            <div className="rs-ovchip__n">{compact(breakoutScore(video))}×</div>
          </div>
          <div className="rs-ovchip rs-ovchip--views">
            <div className="rs-ovchip__l">Views</div>
            <div className="rs-ovchip__n">{compact(video.views)}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BreakoutVideoCard({
  video,
  runBucket = 'old',
  onAnalyze,
  onToggleBookmark,
  bookmarking = false,
  isPlaying,
  onTogglePlay,
  // The analysis modal keeps its own richer CTA stack under the card, so it
  // renders the card body alone rather than doubling up the actions.
  showActions = true,
}) {
  // Surfaces that coordinate playback (only one video at a time) pass the pair
  // in; the rest let the card keep its own.
  const [selfPlaying, setSelfPlaying] = useState(false);
  const controlled = typeof onTogglePlay === 'function';
  const playing = controlled ? isPlaying : selfPlaying;
  const togglePlay = controlled ? onTogglePlay : () => setSelfPlaying((cur) => !cur);

  const postedAt = video.uploaded_at
    ? formatDate(video.uploaded_at)
    : video.posted_at ? formatDate(video.posted_at) : '';

  return (
    <article className={`rs-oc rs-oc--run-${runBucket}`}>
      <VideoFrame video={video} isPlaying={playing} onTogglePlay={togglePlay} />
      <div className="rs-oc__b">
        <div className="rs-oc__cr">
          <span className="rs-av rs-av--sm" style={{ background: gradientFor(video.handle ?? video.id) }} />
          <div className="rs-oc__copy">
            <div className="rs-oc__h">{video.handle || video.username || '—'}</div>
            {Number(video.followers ?? 0) > 0 && <div className="rs-oc__f">{compact(video.followers)} followers</div>}
          </div>
          <div className="rs-oc__s">{postedAt}</div>
        </div>
        <p className="rs-oc__c">{video.title || video.caption}</p>
        <div className="rs-oc__st">
          <span>{Icons.Eye}{compact(video.views)}</span>
          <span>{Icons.Heart}{compact(video.likes)}</span>
          <span>{Icons.Comment}{compact(video.comments)}</span>
          <span>{Icons.Share}{compact(video.shares)}</span>
        </div>
        {showActions && <div className="rs-oc__an">
          {onAnalyze
            ? <AnalyzeStateButton analysis={video.analysis} onClick={onAnalyze} small />
            : <span />}
          {video.post_url && (
            <a className="rs-ic2" href={video.post_url} target="_blank" rel="noopener noreferrer" title="Open in TikTok" aria-label="Open in TikTok">{Icons.ExtLink}</a>
          )}
          {onToggleBookmark && (
            <button
              className={`rs-ic2${video.bookmarked ? ' on' : ''}`}
              title={video.bookmarked ? 'Remove from bookmarks' : 'Save video'}
              aria-label={video.bookmarked ? 'Remove from bookmarks' : 'Save video'}
              onClick={onToggleBookmark}
              disabled={bookmarking}
            >
              {video.bookmarked ? Icons.Bookmark : Icons.BookmarkO}
            </button>
          )}
        </div>}
      </div>
    </article>
  );
}
