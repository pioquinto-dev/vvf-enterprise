import { useState } from 'react';

import { compactNumber, outlierLabel, percent, relativeTime } from '../../../landing/flow/format.js';

const GRADIENTS = [
  'linear-gradient(150deg,#a7e0c4,#4aa886 50%,#2f6a7a)',
  'linear-gradient(150deg,#ffd27a,#ff9a5a 55%,#c0607a)',
  'linear-gradient(150deg,#c5b8ff,#7a5ae0 55%,#3a2f6a)',
  'linear-gradient(150deg,#8fd0ff,#5a7ce0 55%,#3a2f8a)',
  'linear-gradient(150deg,#7affc4,#3ac0a0 55%,#2a6a7a)',
  'linear-gradient(150deg,#ffb0d8,#d1409a 55%,#5a2060)',
];

/** Stable per-video gradient behind a thumbnail that fails to load. */
function gradientStyle(video) {
  const key = String(video?.video_id ?? video?.id ?? '');
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return GRADIENTS[hash % GRADIENTS.length];
}

const PlayIcon = ({ w = 14, h = 16 }) => (
  <svg width={w} height={h} viewBox="0 0 14 16" fill="#1B1834" aria-hidden>
    <path d="M0 0l14 8-14 8z" />
  </svg>
);

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

/**
 * Where a video sits on the rail, as a percentage. Inset on both ends so the
 * dot and the median tick never clip.
 */
function position(multiple, max) {
  const n = Number(multiple);
  if (!Number.isFinite(n) || n <= 0 || !max || max <= 0) return null;
  return 2 + Math.min(n / max, 1) * 93;
}

function Avatar({ video, className }) {
  const [broken, setBroken] = useState(false);

  if (!video?.avatar || broken) {
    return <span className={className} style={{ background: gradientStyle(video) }} />;
  }

  return (
    <img
      className={className}
      src={video.avatar}
      alt=""
      referrerPolicy="no-referrer"
      onError={() => setBroken(true)}
    />
  );
}

/**
 * The winner block: big score, deviation rail, creative detail, actions.
 */
export function WinnerVideo({ video, medianViews, max, onToggleBookmark, bookmarking = false }) {
  if (!video) return null;

  const dot = position(video.outlier_multiple, max);
  const median = position(1, max);
  const packEnd = position(Math.min(2, max), max);
  const rate = percent(video.engagement_rate);
  const hasCreative = video.content_format || video.content_hook || video.content_angle;

  return (
    <div className="winner">
      <div className="vid">
        <Cover video={video} />
        <span className="flag">★ winner</span>
        <div className="play">
          <PlayIcon w={16} h={18} />
        </div>
        <span className="views-ov">▶ {compactNumber(video.views)}</span>
      </div>

      <div className="detail">
        <div className="dtop">
          <div className="bigscore">
            <div className="n">{outlierLabel(video.outlier_multiple) ?? '—'}</div>
            <div className="l">outlier score</div>
          </div>

          {dot !== null && (
            <div className="devbig">
              <div className="track">
                <div className="ln" />
                <div className="pack" style={{ left: '2%', width: `${Math.max(packEnd - 2, 2)}%` }} />
                <div className="med" style={{ left: `${median}%` }} />
                <div className="pt" style={{ left: `${dot}%` }} />
              </div>
              <div className="cap">
                <span>
                  search median <b>{compactNumber(medianViews)}</b>
                </span>
                <span>
                  this video <b>{compactNumber(video.views)}</b>
                </span>
              </div>
            </div>
          )}
        </div>

        {video.title && <h3>{video.title}</h3>}

        <div className="creator">
          <Avatar video={video} className="av" />
          <div>
            <div className="cn">{video.handle ?? video.creator_name}</div>
            <div className="cs">
              {video.uploaded_at ? relativeTime(video.uploaded_at) : 'date unknown'} · TikTok
            </div>
          </div>
        </div>

        <div className="kv">
          <div className="row">
            <span className="k">views</span>
            <span className="val mono">{compactNumber(video.views)}</span>
          </div>
          <div className="row">
            <span className="k">engagement rate</span>
            <span className={`val ${rate ? 'mono' : 'empty'}`}>{rate ?? '—'}</span>
          </div>
          <div className="row">
            <span className="k">format</span>
            <span className={`val ${video.content_format ? '' : 'empty'}`}>
              {video.content_format ? <span className="tag">{video.content_format}</span> : '—'}
            </span>
          </div>
          <div className="row">
            <span className="k">sound</span>
            <span className={`val ${video.sound_label ? '' : 'empty'}`}>
              {video.sound_label ? <span className="tag">{video.sound_label}</span> : '—'}
            </span>
          </div>
          <div className="row">
            <span className="k">hook</span>
            <span className={`val ${video.content_hook ? '' : 'empty'}`}>{video.content_hook ?? '—'}</span>
          </div>
          <div className="row">
            <span className="k">angle</span>
            <span className={`val ${video.content_angle ? '' : 'empty'}`}>{video.content_angle ?? '—'}</span>
          </div>
        </div>

        {hasCreative && (
          <p className="provnote" style={{ marginTop: '12px' }}>
            Format, hook and angle are inferred from the caption, not the footage.
          </p>
        )}

        <div className="cta">
          <a href={video.post_url} target="_blank" rel="noreferrer noopener" className="tbtn primary">
            open in TikTok ↗
          </a>
          {onToggleBookmark && (
            <button type="button" className="tbtn" onClick={() => onToggleBookmark(video)} disabled={bookmarking}>
              {video.bookmarked ? 'saved to board' : 'save to board'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * One card in the ranked feed beneath the winner.
 */
export function OutlierCard({ video, rank, medianViews, max, onToggleBookmark, bookmarking = false }) {
  const dot = position(video.outlier_multiple, max);
  const median = position(1, max);
  const packEnd = position(Math.min(2, max), max);
  const label = outlierLabel(video.outlier_multiple);
  const hot = video.outlier_multiple >= 3;

  return (
    <article className="card">
      <div className="thumb">
        <Cover video={video} />
        <span className="rank">{String(rank).padStart(2, '0')}</span>
        {label && (
          <span className={`score-tag ${hot ? '' : 'mid'}`}>
            <span className="num">{label}</span>
            <span className="lbl">outlier</span>
          </span>
        )}
        <div className="play">
          <PlayIcon />
        </div>
        <span className="views-ov">▶ {compactNumber(video.views)}</span>
      </div>

      <div className="card-body">
        {dot !== null && (
          <div className="dev">
            <div className="dev-track">
              <div className="dev-line" />
              <div className="dev-pack" style={{ left: '2%', width: `${Math.max(packEnd - 2, 2)}%` }} />
              <div className="dev-median" style={{ left: `${median}%` }} />
              <div className={`dev-pt ${hot ? '' : 'mid'}`} style={{ left: `${dot}%` }} />
            </div>
            <div className="dev-cap">
              <span>
                median <b>{compactNumber(medianViews)}</b>
              </span>
              <span>
                <b>{label}</b> out
              </span>
            </div>
          </div>
        )}

        <div className="creator">
          <Avatar video={video} className="av" />
          <div style={{ minWidth: 0 }}>
            <div className="h2n">{video.handle ?? video.creator_name}</div>
            <div className="sub">{video.uploaded_at ? relativeTime(video.uploaded_at) : 'date unknown'}</div>
          </div>
        </div>

        <div className="card-foot">
          <span className="metric">
            <b>{compactNumber(video.views)}</b> views
          </span>
          <span style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              type="button"
              className="open"
              onClick={() => onToggleBookmark?.(video)}
              disabled={!onToggleBookmark || bookmarking}
              title={video.bookmarked ? 'Remove from board' : 'Save to board'}
            >
              {video.bookmarked ? 'saved' : 'save'}
            </button>
            <a href={video.post_url} target="_blank" rel="noreferrer noopener" className="open">
              open ↗
            </a>
          </span>
        </div>
      </div>
    </article>
  );
}
