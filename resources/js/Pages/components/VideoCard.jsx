import { useEffect, useRef, useState } from 'react';

import { Play, Trend, Heart, Comment } from '../../landing/components/Icons.jsx';
import { buildTikTokPlayerUrl, postTikTokMessage } from '../SavedSearches/detail/tiktokPlayer.js';

function compact(n) {
  const value = Number(n) || 0;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1)}K`;
  return String(value);
}

function formatDuration(duration) {
  if (duration == null || duration === '') return null;
  if (typeof duration === 'string') return duration;
  const total = Number(duration);
  if (!Number.isFinite(total)) return null;
  const mins = Math.floor(total / 60);
  const secs = Math.round(total % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

/**
 * One video card (the mockup's `.vc`), wired to a `ViralVideo::toCardArray`
 * payload. Library now plays in place like the results flow, using TikTok's
 * player when we have a stable video id and falling back to the saved embed.
 */
export default function VideoCard({ video, rank }) {
  const [broken, setBroken] = useState(false);
  const [playing, setPlaying] = useState(false);
  const iframeRef = useRef(null);
  const shellRef = useRef(null);
  const multiplier = Number(video.virality_score) > 0 ? `${Math.round(video.virality_score)}x` : null;
  const duration = formatDuration(video.duration);
  const cover = video.thumbnail_url;
  const embed = buildTikTokPlayerUrl(video.video_id, true) ?? video.embed_url ?? null;

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

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    shell.dataset.playerActive = playing ? 'true' : 'false';
  }, [playing]);

  const closePlayer = () => {
    setPlaying(false);
  };

  const openPlayer = () => {
    const shell = shellRef.current;

    document.querySelectorAll('[data-bookmark-video-player="true"][data-player-active="true"]').forEach((node) => {
      if (node !== shell) {
        const closeButton = node.querySelector('[data-player-close]');
        if (closeButton instanceof HTMLButtonElement) {
          closeButton.click();
        }
      }
    });

    setPlaying(true);
  };

  return (
    <article ref={shellRef} className="vc" data-bookmark-video-player="true" data-player-active="false">
      <div className="vt">
        {playing && embed ? (
          <>
            <div className="tiktok-frame-host">
              <iframe
                ref={iframeRef}
                src={embed}
                title={video.title || 'TikTok video'}
                loading="lazy"
                scrolling="no"
                allow="accelerometer; controls; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="tracker-embed-frame"
              />
            </div>
            <button
              type="button"
              onClick={closePlayer}
              aria-label="Close player"
              className="absolute top-2.5 right-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition hover:bg-black/80"
              data-player-close
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </>
        ) : (
          <>
            {cover && !broken && (
              <img
                src={cover}
                alt=""
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={() => setBroken(true)}
              />
            )}
            {rank != null && <span className="vt__r">{rank}</span>}
            {multiplier && <span className="vt__m">{multiplier}</span>}
            {duration && <span className="vt__d">{duration}</span>}
            {embed ? (
              <button type="button" className="vt__p" onClick={openPlayer} aria-label={video.title ? `Play: ${video.title}` : 'Play video'}>
                <Play />
              </button>
            ) : (
              <span className="vt__p">
                <Play />
              </span>
            )}
          </>
        )}
      </div>
      <div className="vb">
        <p className="vb__h">{video.handle}</p>
        <p className="vb__c">{video.title || video.content_hook}</p>
        <div className="vb__s">
          <span>
            <Trend />
            {compact(video.views)}
          </span>
          <span>
            <Heart />
            {compact(video.likes)}
          </span>
          <span>
            <Comment />
            {compact(video.comments)}
          </span>
        </div>
      </div>
    </article>
  );
}

export { compact };
