import { Play, Trend, Heart, Comment } from '../../landing/components/Icons.jsx';

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
 * payload. The play glyph opens the TikTok post rather than advertising a
 * control that does nothing — the signed CDN `video_url` 403s from a browser.
 */
export default function VideoCard({ video, rank }) {
  const multiplier = Number(video.virality_score) > 0 ? `${Math.round(video.virality_score)}x` : null;
  const duration = formatDuration(video.duration);
  const cover = video.thumbnail_url;
  const link = video.post_url || video.embed_url;

  return (
    <article className="vc">
      <div className="vt">
        {cover && <img src={cover} alt="" loading="lazy" />}
        {rank != null && <span className="vt__r">{rank}</span>}
        {multiplier && <span className="vt__m">{multiplier}</span>}
        {duration && <span className="vt__d">{duration}</span>}
        {link ? (
          <a className="vt__p" href={link} target="_blank" rel="noreferrer" aria-label="Open on TikTok">
            <Play />
          </a>
        ) : (
          <span className="vt__p">
            <Play />
          </span>
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
