import { useState } from 'react';

import { compactNumber, outlierLabel, percent, relativeTime } from '../../../landing/flow/format.js';
import { Heart, Comment, Share, Trend, Bookmark, Search, Arrow } from '../../../landing/components/Icons.jsx';

const GRADIENTS = [
  'linear-gradient(150deg,#ffd27a,#ff9a5a 55%,#c0607a)',
  'linear-gradient(150deg,#ffe08a,#f0a24a 55%,#b5654a)',
  'linear-gradient(150deg,#ffcf7a,#e88f5a 55%,#a8607a)',
  'linear-gradient(150deg,#ffdd9a,#f5a05a 55%,#c07a5a)',
  'linear-gradient(150deg,#ffd06a,#ee954a 55%,#b06a5a)',
  'linear-gradient(150deg,#ffe4a6,#f2ab63 55%,#bd7059)',
];

function gradientStyle(video) {
  const key = String(video?.video_id ?? video?.id ?? '');
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return GRADIENTS[hash % GRADIENTS.length];
}

function formatDuration(duration) {
  if (duration == null || duration === '') return null;
  if (typeof duration === 'string') return duration;
  const total = Number(duration);
  if (!Number.isFinite(total)) return null;
  return `${Math.floor(total / 60)}:${String(Math.round(total % 60)).padStart(2, '0')}`;
}

/** Tags shown under the winner — the inferred creative signals, as chips. */
function creativeTags(video) {
  return [
    video.content_format,
    video.sound_label,
    video.content_hook ? `hook: ${video.content_hook}` : null,
    video.content_angle,
  ].filter(Boolean);
}

const PlayIcon = ({ w = 14, h = 16 }) => (
  <svg width={w} height={h} viewBox="0 0 14 16" fill="#1B1834" aria-hidden>
    <path d="M0 0l14 8-14 8z" />
  </svg>
);

function embedFor(video) {
  if (video?.embed_url) return video.embed_url;
  const id = video?.video_id;
  return id ? `https://www.tiktok.com/player/v1/${id}?autoplay=1&description=0&rel=0` : null;
}

function playerIdOf(video) {
  return String(video?.id ?? video?.video_id ?? '');
}

function Cover({ video }) {
  const [broken, setBroken] = useState(false);
  const src = video?.thumbnail_url;

  return (
    <>
      <span className="grad" style={{ background: gradientStyle(video) }} />
      {src && !broken && (
        <img
          className="cov"
          src={src}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setBroken(true)}
        />
      )}
    </>
  );
}

function Avatar({ video, className }) {
  const [broken, setBroken] = useState(false);

  if (!video?.avatar || broken) {
    return <span className={className} style={{ background: gradientStyle(video) }} />;
  }

  return (
    <img className={className} src={video.avatar} alt="" referrerPolicy="no-referrer" onError={() => setBroken(true)} />
  );
}

/**
 * The play button that swaps the cover for the TikTok embed in place. Uses the
 * signed `embed_url` (or a player URL built from the id); the raw `video_url`
 * 403s from a browser origin, so it is never used here.
 */
function InlinePlayer({ video, className, buttonClassName = 'play', iconProps = {}, activePlayerId, onPlay, onClose }) {
  const embed = embedFor(video);
  const playerId = playerIdOf(video);
  const playing = playerId !== '' && activePlayerId === playerId;

  if (playing && embed) {
    return (
      <>
        <iframe
          src={embed}
          title={video?.title || 'TikTok video'}
          loading="lazy"
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowFullScreen
          className={`${className} tracker-embed-frame`}
        />
        <button
          type="button"
          onClick={() => onClose?.()}
          aria-label="Close player"
          className="absolute top-2.5 right-2.5 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition hover:bg-black/80"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </>
    );
  }

  if (!embed) {
    return (
      <div className={buttonClassName} aria-hidden>
        <PlayIcon {...iconProps} />
      </div>
    );
  }

  return (
    <button type="button" onClick={() => onPlay?.(playerId)} aria-label={video?.title ? `Play: ${video.title}` : 'Play video'} className={buttonClassName}>
      <PlayIcon {...iconProps} />
    </button>
  );
}

function AnalyzeButton({ status = 'idle', small = false, onClick }) {
  const isProcessing = status === 'processing';
  const isComplete = status === 'complete';
  const label = isProcessing ? 'Analyzing Video.....' : isComplete ? 'View Analysis' : 'Analyze video';

  return (
    <button
      type="button"
      className={`bb-analyze${small ? ' bb-analyze--sm' : ''}${isProcessing ? ' opacity-90' : ''}`}
      onClick={onClick}
      aria-busy={isProcessing}
    >
      {isProcessing ? (
        <span className="inline-flex items-center gap-2">
          <span className="relative flex h-3.5 w-3.5 items-center justify-center">
            <span className="absolute inline-flex h-3.5 w-3.5 animate-ping rounded-full bg-current/35" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-current" />
          </span>
          {label}
        </span>
      ) : (
        <>
          <Search className={small ? 'h-[13px] w-[13px]' : 'h-[15px] w-[15px]'} /> {label}
        </>
      )}
    </button>
  );
}

export function WinnerVideo({
  video,
  onToggleBookmark,
  onAnalyze,
  bookmarking = false,
  activePlayerId = null,
  onPlay = null,
  onClose = null,
  analysisStatus = 'idle',
}) {
  if (!video) return null;

  const playing = activePlayerId === playerIdOf(video);
  const rate = percent(video.engagement_rate);
  const duration = formatDuration(video.duration);
  const tags = creativeTags(video);
  const hasCreative = video.content_format || video.content_hook || video.content_angle;

  return (
    <div className="winner">
      <div className={`vid${playing ? ' playing' : ''}`}>
        <Cover video={video} />
        <span className="flag">★ winner</span>
        <span className="ovscrim" aria-hidden />
        <div className="ovstats">
          <div className="ovchip ovchip--score">
            <span className="lab">
              <i />
              Outlier score
            </span>
            <span className="num">{outlierLabel(video.outlier_multiple) ?? '—'}</span>
          </div>
          <div className="ovchip ovchip--views">
            <span className="lab">
              <i />
              Views
            </span>
            <span className="num">{compactNumber(video.views)}</span>
          </div>
        </div>
        <InlinePlayer
          video={video}
          className="absolute inset-0 h-full w-full border-0"
          iconProps={{ w: 16, h: 18 }}
          activePlayerId={activePlayerId}
          onPlay={onPlay}
          onClose={onClose}
        />
      </div>

      <div className="detail">
        <div className="creator">
          <Avatar video={video} className="av" />
          <div style={{ minWidth: 0 }}>
            <div className="cn">{video.handle ?? video.creator_name}</div>
            <div className="cs">{video.uploaded_at ? relativeTime(video.uploaded_at) : 'date unknown'} · TikTok</div>
          </div>
          {duration && <span className="durbadge">{duration}</span>}
        </div>

        {video.title && <h3 style={{ marginTop: '12px' }}>{video.title}</h3>}

        <div className="engrow">
          <span>
            <Heart /> {compactNumber(video.likes)}
          </span>
          <span>
            <Comment /> {compactNumber(video.comments)}
          </span>
          <span>
            <Share /> {compactNumber(video.shares)}
          </span>
          {rate && (
            <span>
              <Trend /> {rate} eng
            </span>
          )}
        </div>

        {tags.length > 0 && (
          <div className="tagrow">
            {tags.map((tag) => (
              <span className="tag" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {hasCreative && (
          <p className="provnote" style={{ marginTop: '10px' }}>
            Format, hook and angle are inferred from the caption, not the footage.
          </p>
        )}

        <div className="cta">
          <AnalyzeButton status={analysisStatus} onClick={() => onAnalyze?.(video, analysisStatus)} />
          {video.post_url && (
            <a href={video.post_url} target="_blank" rel="noreferrer noopener" className="tbtn">
              open in TikTok ↗
            </a>
          )}
          {onToggleBookmark && (
            <button
              type="button"
              className={`tbtn tbtn-ic${video.bookmarked ? ' is-saved' : ''}`}
              onClick={() => onToggleBookmark(video)}
              disabled={bookmarking}
              title={video.bookmarked ? 'Saved to board' : 'Save to board'}
              aria-label={video.bookmarked ? 'Saved to board' : 'Save to board'}
            >
              <Bookmark className="h-4 w-4" filled={Boolean(video.bookmarked)} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function OutlierCard({
  video,
  rank,
  onToggleBookmark,
  onAnalyze,
  bookmarking = false,
  activePlayerId = null,
  onPlay = null,
  onClose = null,
  analysisStatus = 'idle',
}) {
  const rate = percent(video.engagement_rate);
  const duration = formatDuration(video.duration);

  return (
    <article className="bbcard">
      <div className="bbthumb">
        <Cover video={video} />
        {rank != null && <span className="bbrank">{String(rank).padStart(2, '0')}</span>}
        <InlinePlayer
          video={video}
          className="absolute inset-0 z-10 h-full w-full border-0"
          activePlayerId={activePlayerId}
          onPlay={onPlay}
          onClose={onClose}
        />
      </div>

      <div className="bbbody">
        <div className="bbstats">
          <div className="bbchip bbchip--score">
            <span className="lab">
              <i />
              Outlier score
            </span>
            <span className="num">{outlierLabel(video.outlier_multiple) ?? '—'}</span>
          </div>
          <div className="bbchip bbchip--views">
            <span className="lab">
              <i />
              Views
            </span>
            <span className="num">{compactNumber(video.views)}</span>
          </div>
        </div>

        <div className="bbwho">
          <Avatar video={video} className="av" />
          <div style={{ minWidth: 0 }}>
            <div className="h2n">{video.handle ?? video.creator_name}</div>
            <div className="sub">{video.uploaded_at ? relativeTime(video.uploaded_at) : 'date unknown'}</div>
          </div>
          {video.post_url && (
            <a href={video.post_url} target="_blank" rel="noreferrer noopener" className="bbopen" title="Open in TikTok" aria-label="Open in TikTok">
              <Arrow />
            </a>
          )}
        </div>

        <div className="bbcap">
          <p>{video.title || video.content_hook}</p>
          {duration && <span className="bbdur">{duration}</span>}
        </div>

        <div className="bbeng">
          <span>
            <Heart /> {compactNumber(video.likes)}
          </span>
          <span>
            <Comment /> {compactNumber(video.comments)}
          </span>
          <span>
            <Share /> {compactNumber(video.shares)}
          </span>
          {rate && (
            <span>
              <Trend /> {rate}
            </span>
          )}
        </div>

        <div className="bbact">
          <AnalyzeButton small status={analysisStatus} onClick={() => onAnalyze?.(video, analysisStatus)} />
          {onToggleBookmark && (
            <button
              type="button"
              className={`tbtn tbtn-ic${video.bookmarked ? ' is-saved' : ''}`}
              onClick={() => onToggleBookmark(video)}
              disabled={bookmarking}
              title={video.bookmarked ? 'Saved to board' : 'Save to board'}
              aria-label={video.bookmarked ? 'Saved to board' : 'Save to board'}
            >
              <Bookmark className="h-3.5 w-3.5" filled={Boolean(video.bookmarked)} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
