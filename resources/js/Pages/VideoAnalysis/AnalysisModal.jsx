import { useEffect, useRef, useState } from 'react';
import { usePage } from '@inertiajs/react';

import { videoAnalysis } from '../../landing/flow/api.js';
import { postTikTokMessage } from '../SavedSearches/detail/tiktokPlayer.js';

function compactNumber(value) {
  const number = Number(value || 0);
  if (!Number.isFinite(number)) return '0';
  return new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(number);
}

function formatMetric(value) {
  const number = Number(value || 0);
  if (!Number.isFinite(number)) return '0';
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: number >= 100 ? 0 : 1 }).format(number);
}

function formatTimestamp(ms) {
  if (!Number.isFinite(Number(ms))) return null;
  const total = Math.max(0, Math.floor(Number(ms) / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = String(total % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function formatDuration(seconds) {
  const total = Number(seconds || 0);
  // No runtime on record: render nothing rather than inventing one.
  if (!Number.isFinite(total) || total <= 0) return null;
  const minutes = Math.floor(total / 60);
  const remainder = String(Math.round(total % 60)).padStart(2, '0');
  return `${minutes}:${remainder}`;
}

function initials(name) {
  const source = String(name || '').replace(/^@/, '').trim();
  return source.slice(0, 2).toUpperCase() || '?';
}

/*
 * How far past the baseline this video landed. The search pipeline writes
 * `outlier_multiple`; the older keys are kept so a video handed in from another
 * screen still resolves. Null means "we do not know" — never a stand-in number.
 */
function outlierMultiple(video) {
  const value = Number(video?.outlier_multiple ?? video?.multiple ?? video?.score ?? video?.virality_score ?? 0);
  return Number.isFinite(value) && value > 0 ? value : null;
}

/* The creator's own median, which is what the multiple is measured against. */
function baselineMedian(video) {
  const multiple = outlierMultiple(video);
  const views = Number(video?.views ?? 0);
  return multiple && views > 0 ? Math.round(views / multiple) : null;
}

function usePolling(videoId, initial, open) {
  const [analysis, setAnalysis] = useState(initial);

  useEffect(() => {
    setAnalysis(initial);
  }, [initial, videoId]);

  useEffect(() => {
    if (!open || analysis?.status === 'complete' || analysis?.status === 'failed') return undefined;

    let cancelled = false;
    const timer = window.setInterval(async () => {
      try {
        const payload = await videoAnalysis.get(videoId);
        if (!cancelled) setAnalysis(payload.analysis);
      } catch {
        // Keep polling quiet while the current state remains visible.
      }
    }, 3000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [analysis?.status, open, videoId]);

  return [analysis, setAnalysis];
}

/*
 * The four numbers that make the comparison legible: what this video did, the
 * creator's own median it is measured against, how hard it engaged, and the
 * resulting multiple. Anything we cannot compute renders as an em dash — the
 * old placeholder values (18x, 12.2%) read as real data and were not.
 */
function statCards(video) {
  const views = Number(video?.views ?? 0);
  const rate = Number(video?.engagement_rate ?? 0);
  const median = baselineMedian(video);
  const multiple = outlierMultiple(video);

  return [
    { label: 'Views', value: views > 0 ? compactNumber(views) : '—' },
    { label: 'Median', value: median ? compactNumber(median) : '—' },
    { label: 'Engaged', value: rate > 0 ? `${formatMetric(rate)}%` : '—' },
    { label: 'Baseline', value: multiple ? `${formatMetric(multiple)}x` : '—', good: true },
  ];
}

function transcriptRows(analysis) {
  const segments = Array.isArray(analysis?.transcript_segments) ? analysis.transcript_segments : [];

  if (segments.length > 0) {
    return segments.map((segment, index) => ({
      id: `segment-${index}`,
      time: formatTimestamp(segment.start_ms) ?? '0:00',
      text: segment.text,
    }));
  }

  const transcript = String(analysis?.transcript || '').trim();

  if (transcript === '') return [];

  return transcript
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => ({
      id: `line-${index}`,
      time: formatTimestamp(index * 3000) ?? '0:00',
      text: line,
    }));
}

function hookVariations(result) {
  if (Array.isArray(result?.hooks) && result.hooks.length > 0) {
    return result.hooks.map((hook, index) => ({
      id: index,
      label: String.fromCharCode(65 + index),
      text: typeof hook === 'string' ? hook : hook?.text || hook?.variation || JSON.stringify(hook),
    }));
  }

  return [];
}

function whyDrivers(result) {
  if (Array.isArray(result?.content_breakdown) && result.content_breakdown.length > 0) {
    return result.content_breakdown.map((item, index) => ({
      id: index,
      rank: String(index + 1).padStart(2, '0'),
      title: item?.title || item?.driver || item?.label || 'Outlier signal',
      body: item?.explanation || item?.reason || String(item),
      uplift: item?.uplift || item?.delta || item?.impact || null,
    }));
  }

  const evidence = String(result?.evidence_summary || '').trim();

  return evidence === ''
    ? []
    : evidence.split(/(?<=\.)\s+/).filter(Boolean).map((line, index) => ({
        id: index,
        rank: String(index + 1).padStart(2, '0'),
        title: `Driver ${index + 1}`,
        body: line,
        uplift: null,
      }));
}

function strategistRecommendations(result) {
  const recommendations = result?.creative_strategy?.recommendations;

  if (Array.isArray(recommendations) && recommendations.length > 0) {
    return recommendations.map((item, index) => ({
      id: index,
      rank: String(index + 1).padStart(2, '0'),
      title: typeof item === 'string' ? item : item?.title || item?.headline || `Recommendation ${index + 1}`,
      body: typeof item === 'string' ? null : item?.text || item?.body || item?.reason || null,
    }));
  }

  const summary = result?.creative_strategy?.summary;

  return summary
    ? [{ id: 0, rank: '01', title: String(summary), body: null }]
    : [];
}

function blueprintText(result) {
  const blueprint = result?.creative_strategy?.blueprint;

  if (typeof blueprint === 'string') return blueprint;
  if (blueprint && typeof blueprint === 'object') {
    return Object.entries(blueprint)
      .map(([key, value]) => `${String(key).toUpperCase()} - ${typeof value === 'string' ? value : JSON.stringify(value)}`)
      .join('\n');
  }

  const ctas = Array.isArray(result?.ctas) ? result.ctas : [];
  const delivery = Array.isArray(result?.delivery_instructions) ? result.delivery_instructions : [];
  const lines = [
    ...ctas.map((item) => `CTA - ${typeof item === 'string' ? item : item?.text || JSON.stringify(item)}`),
    ...delivery.map((item) => `DELIVERY - ${typeof item === 'string' ? item : item?.text || JSON.stringify(item)}`),
  ];

  return lines.join('\n');
}

function blueprintRows(blueprint) {
  return String(blueprint || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const matched = line.match(/^([^:-]+)\s*[:|-]\s*(.+)$/);

      if (!matched) {
        return {
          id: `blueprint-${index}`,
          label: null,
          body: line,
        };
      }

      return {
        id: `blueprint-${index}`,
        label: matched[1].trim().replace(/_/g, ' '),
        body: matched[2].trim(),
      };
    });
}

function videoEmbedUrl(video) {
  // Prefer the video-only player (fills the aspect box cleanly). The stored
  // embed_url is TikTok's oEmbed *card*, which renders ~700px tall with caption
  // and music chrome and blows out the sidebar, so it's only a last resort.
  const id = video?.video_id;
  if (id) return `https://www.tiktok.com/player/v1/${id}?autoplay=1&description=0&rel=0&music_info=0`;
  return video?.embed_url ?? null;
}

function RegenerateButton({ regenerating, disabled, onClick, fullWidth = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${fullWidth ? 'flex w-full justify-center' : 'inline-flex'} items-center gap-1.5 rounded-full border border-[#e5ddd1] bg-[#fbfaf7] px-3 py-2 text-[11px] font-semibold text-[#8c6b10] transition hover:bg-[#fff0bf] disabled:cursor-not-allowed disabled:opacity-60`}
    >
      <svg
        viewBox="0 0 24 24"
        className={`h-3.5 w-3.5 stroke-current ${regenerating ? 'animate-spin' : ''}`}
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12a9 9 0 1 1-2.64-6.36" />
        <path d="M21 3v6h-6" />
      </svg>
      {regenerating ? 'Regenerating…' : 'Regenerate'}
    </button>
  );
}

/* Primary CTA: idle → running → ready, mirroring the analysis lifecycle. */
function AnalyzeButton({ state, onClick }) {
  const running = state === 'running';
  const ready = state === 'ready';
  const base = 'flex h-10 w-full items-center justify-center gap-2 rounded-[11px] px-3.5 text-[13px] font-bold transition';

  if (ready) {
    return (
      <div className={`${base} cursor-default border border-[#E7E5DF] bg-white text-[#0B0B0B]`}>
        <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" fill="none" stroke="#1F7A4D" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12.5l5.5 5.5L20 7" />
        </svg>
        Analysis ready
      </div>
    );
  }

  if (running) {
    return (
      <div className={`${base} cursor-default bg-[#FFF8E6] text-[#9A6B00]`}>
        <span className="h-[14px] w-[14px] animate-spin rounded-full border-2 border-[rgba(154,107,0,.3)] border-t-[#9A6B00]" />
        Analyzing…
      </div>
    );
  }

  return (
    <button type="button" onClick={onClick} className={`${base} bg-[#FFC629] text-[#1A1400] hover:bg-[#FFD84D]`}>
      <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      Analyze video
    </button>
  );
}

function LeftSidebar({
  video,
  canRegenerate = false,
  regenerating = false,
  disabledRegenerate = false,
  onRegenerate,
  analyzeState = 'idle',
  onAnalyze,
  saved = false,
  saving = false,
  onToggleSave,
}) {
  const metrics = statCards(video);
  const multiple = outlierMultiple(video);
  const followers = Number(video?.followers ?? 0);
  const runtime = formatDuration(video.duration);
  const [playing, setPlaying] = useState(false);
  const [thumbBroken, setThumbBroken] = useState(false);
  const [avatarBroken, setAvatarBroken] = useState(false);
  const iframeRef = useRef(null);
  const embed = videoEmbedUrl(video);
  const hasThumb = Boolean(video.thumbnail_url) && !thumbBroken;
  const postedAt = video?.uploaded_at
    ? new Date(video.uploaded_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

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
    <aside className="self-start rounded-[16px] border border-[#E7E5DF] bg-white p-3 shadow-[0_10px_24px_rgba(42,33,20,0.06)] min-[980px]:sticky min-[980px]:top-0 min-[980px]:rounded-[18px] min-[980px]:p-[13px]">
      <div className="mx-auto w-full max-w-[260px] overflow-hidden rounded-[13px] bg-[#FAF9F6] min-[980px]:max-w-none">
        {playing && embed ? (
          <div className="relative">
            <iframe
              ref={iframeRef}
              src={embed}
              title={video?.title || 'TikTok video'}
              loading="lazy"
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              allowFullScreen
              className="aspect-[9/13] w-full border-0"
            />
            <button
              type="button"
              onClick={() => setPlaying(false)}
              aria-label="Close player"
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition hover:bg-black/80"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="relative">
            {hasThumb ? (
              <img
                src={video.thumbnail_url}
                alt=""
                referrerPolicy="no-referrer"
                onError={() => setThumbBroken(true)}
                className="aspect-[9/13] w-full object-cover"
              />
            ) : (
              <div className="aspect-[9/13] w-full bg-[linear-gradient(165deg,#cfb396,#a98069)]" />
            )}
            {multiple && (
              <span className="absolute bottom-[9px] left-[9px] z-[2] rounded-[8px] bg-[rgba(11,11,11,0.82)] px-[9px] py-1 text-[12px] font-extrabold tracking-[-0.01em] text-[#FFC629] backdrop-blur-[2px]">
                {formatMetric(multiple)}x
              </span>
            )}
            {embed && (
              <button
                type="button"
                onClick={() => setPlaying(true)}
                className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/92 text-[#343434] shadow-[0_8px_30px_rgba(0,0,0,0.18)] transition hover:bg-white"
                aria-label={video?.title ? `Play: ${video.title}` : 'Play video'}
              >
                <svg viewBox="0 0 24 24" className="ml-0.5 h-4 w-4 fill-current">
                  <path d="M8 6.5v11l9-5.5-9-5.5z" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center gap-[9px]">
        <span className="h-[30px] w-[30px] flex-shrink-0 overflow-hidden rounded-full bg-[linear-gradient(150deg,#ffd27a,#ff9a5a_55%,#c0607a)]">
          {video.avatar && !avatarBroken ? (
            <img
              src={video.avatar}
              alt=""
              referrerPolicy="no-referrer"
              onError={() => setAvatarBroken(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-[10px] font-extrabold text-white">
              {initials(video.handle ?? video.username ?? video.creator_name)}
            </span>
          )}
        </span>
        <div className="min-w-0">
          <div className="truncate text-[13px] font-bold text-[#0B0B0B]">{video.handle ?? video.creator_name ?? '@creator'}</div>
          {followers > 0 && <div className="text-[11.5px] text-[#5C5A54]">{compactNumber(followers)} followers</div>}
        </div>
      </div>

      <div className="mt-[11px] flex flex-wrap items-center gap-2 text-[11px] text-[#5C5A54] min-[640px]:text-[11.5px]">
        {video.content_format && (
          <span className="rounded-[7px] bg-[#FFF3CF] px-[9px] py-1 text-[10px] font-extrabold uppercase tracking-[0.05em] text-[#9A6B00]">
            {video.content_format}
          </span>
        )}
        {(postedAt || runtime) && (
          <span>{[postedAt, runtime].filter(Boolean).join(' · ')}</span>
        )}
      </div>

      <div className="mt-3.5 grid grid-cols-4 overflow-hidden rounded-[13px] border border-[#E7E5DF] bg-white">
        {metrics.map((item) => (
          <div key={item.label} className="min-w-0 border-r border-[#E7E5DF] px-[7px] py-[10px] text-center last:border-r-0 min-[640px]:px-[8px]">
            <span className={`block text-[15px] font-extrabold leading-[1.1] tracking-[-0.03em] [font-variant-numeric:tabular-nums] ${item.good ? 'text-[#1F7A4D]' : 'text-[#0B0B0B]'} min-[640px]:text-[16.5px]`}>
              {item.value}
            </span>
            <span className="mt-[3px] block whitespace-nowrap text-[8.5px] font-extrabold uppercase tracking-[0.02em] text-[#74716A]">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3.5 flex flex-col gap-[7px] border-t border-[#E7E5DF] pt-3.5">
        <AnalyzeButton state={analyzeState} onClick={onAnalyze} />

        <div className="grid grid-cols-[minmax(0,1fr)_40px] gap-[7px]">
          {onToggleSave ? (
            <button
              type="button"
              onClick={onToggleSave}
              disabled={saving}
              aria-pressed={saved}
              className={`flex h-10 items-center justify-center gap-2 rounded-[11px] border px-2.5 text-[13px] font-bold transition disabled:opacity-60 ${
                saved
                  ? 'border-[#FFC629] bg-[#FFF8E6] text-[#5C4200]'
                  : 'border-[#E7E5DF] bg-white text-[#0B0B0B] hover:bg-[#FAF9F6]'
              }`}
            >
              <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
                <path d="M6 3h12v18l-6-4.5L6 21z" />
              </svg>
              {saved ? 'Saved' : 'Save'}
            </button>
          ) : (
            <span />
          )}

          <a
            href={video.post_url || video.postUrl || '#'}
            target="_blank"
            rel="noreferrer noopener"
            aria-disabled={!(video.post_url || video.postUrl)}
            title="Open on TikTok"
            aria-label="Open on TikTok"
            className={`flex h-10 items-center justify-center rounded-[11px] border border-[#E7E5DF] bg-white text-[#0B0B0B] transition hover:bg-[#FAF9F6] ${
              video.post_url || video.postUrl ? '' : 'pointer-events-none opacity-40'
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
            </svg>
          </a>
        </div>

        {canRegenerate && (
          <RegenerateButton
            regenerating={regenerating}
            disabled={disabledRegenerate}
            onClick={onRegenerate}
            fullWidth
          />
        )}
      </div>
    </aside>
  );
}

/*
 * Right-column lead. The caption is the headline because it is the thing the
 * viewer actually saw, and the callout heads off the one number people misread:
 * the multiple is against this creator's own median, not the category's.
 *
 * This replaced a "Summary" card whose only content, before an analysis exists,
 * was a placeholder sentence about assembling one.
 */
function VideoHeadline({ video, calloutDismissed, onDismissCallout }) {
  const caption = String(video?.title || video?.caption || '').trim();
  const multiple = outlierMultiple(video);
  const median = baselineMedian(video);
  const showCallout = !calloutDismissed && Boolean(multiple && median);

  if (!caption && !showCallout) return null;

  return (
    <>
      {caption && (
        <p className="min-w-0 break-words px-0.5 pt-0.5 pr-10 text-[15.5px] font-extrabold leading-[1.4] tracking-[-0.01em] text-[#0B0B0B] min-[640px]:text-[16.5px]">
          &ldquo;{caption}&rdquo;
        </p>
      )}

      {showCallout && (
        <div className="flex min-w-0 items-start gap-2.5 rounded-[13px] border border-[#F2E4BE] bg-[#FFF8E6] px-3.5 py-3">
          <span aria-hidden className="mt-px flex-none text-[#9A6B00]">
            <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8h.01M11 12h1v4h1" />
            </svg>
          </span>
          <p className="min-w-0 flex-1 break-words text-[13px] leading-[1.45] text-[#5C5A54]">
            <b className="font-bold text-[#0B0B0B]">
              {formatMetric(multiple)}x is against their own median of {compactNumber(median)},
            </b>{' '}
            not the category.
          </p>
          <button
            type="button"
            onClick={onDismissCallout}
            aria-label="Dismiss"
            className="flex h-[22px] w-[22px] flex-none items-center justify-center rounded-[6px] text-[#74716A] transition hover:bg-[rgba(154,107,0,0.08)] hover:text-[#0B0B0B]"
          >
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}

function TabRow({ tabs, activeTab, onChange }) {
  return (
    <div className="no-scrollbar flex snap-x snap-mandatory gap-1 overflow-x-auto rounded-[14px] border border-[#ddd6ca] bg-[#fbfaf7] p-1">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`snap-start shrink-0 rounded-[10px] px-3 py-2.5 text-[11.5px] font-semibold whitespace-nowrap transition md:flex-1 md:text-center md:text-[12px] ${
            activeTab === tab.key ? 'bg-[#ffeeb8] text-[#6c5715] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]' : 'text-[#5f584d] hover:text-[#1f1f1f]'
          }`}
        >
          <span className="sm:hidden">{tab.shortLabel ?? tab.label}</span>
          <span className="hidden sm:inline">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

function PanelShell({ icon, title, subtitle, children }) {
  return (
    <section className="min-w-0 rounded-[16px] border border-[#ddd6ca] bg-[#fffdf9] p-3.5 min-[640px]:p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fff0bf] text-[#8c6b10]">{icon}</div>
        <div>
          <div className="text-[20px] font-semibold leading-none text-[#1a1a1a]">{title}</div>
          {subtitle && <div className="mt-1 text-[11px] text-[#8c8579]">{subtitle}</div>}
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ProcessingState({ status, error }) {
  const copy =
    status === 'failed'
      ? error || 'This analysis could not be completed.'
      : status === 'processing'
        ? 'We are preparing the transcript, shared diagnostics, and creator-facing guidance.'
        : (
            <>
              Analysis hasn&rsquo;t started yet. Run <b className="font-bold text-[#1a1a1a]">Analyze video</b> to break down
              what carried this past the search median — and get a playbook you can hand to your creators.
            </>
          );

  return (
    <section className="rounded-[16px] border border-[#ddd6ca] bg-[#fffdf9] p-5">
      <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#8c6b10]">{status || 'idle'}</div>
      <p className="mt-2 text-[14px] leading-6 text-[#696257]">{copy}</p>
    </section>
  );
}

function ErrorStateModal({ message, retrying, onRetry, onDismiss }) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[22px] bg-[rgba(42,33,20,0.28)] px-4 backdrop-blur-[2px]">
      <div className="w-full max-w-[430px] rounded-[20px] border border-[#ddd6ca] bg-[#fffdf9] p-5 shadow-[0_24px_60px_rgba(42,33,20,0.18)]">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff0bf] text-[#8c6b10]">
          <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 8v5" />
            <path d="M12 16h.01" />
            <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
          </svg>
        </div>
        <h3 className="mt-4 text-[20px] font-semibold text-[#1a1a1a]">Something went wrong</h3>
        <p className="mt-2 text-[14px] leading-6 text-[#696257]">
          {message || 'We could not finish this analysis right now. Please try again later.'}
        </p>
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onRetry}
            disabled={retrying}
            className="inline-flex flex-1 items-center justify-center rounded-full bg-[#f2c44f] px-4 py-2.5 text-[12px] font-semibold text-[#4f3d08] transition hover:bg-[#e8bb48] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {retrying ? 'Retrying…' : 'Try again'}
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="inline-flex flex-1 items-center justify-center rounded-full border border-[#ddd6ca] bg-white px-4 py-2.5 text-[12px] font-semibold text-[#5f584d] transition hover:bg-[#faf7f1]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function WhyTab({ result, video }) {
  const drivers = whyDrivers(result);
  // Same source as the sidebar chips, so the panel and the numbers agree.
  const baseline = outlierMultiple(video);
  const subtitle = baseline ? `${formatMetric(baseline)}x baseline` : 'Outlier drivers';

  return (
    <PanelShell
      title="Analysis"
      subtitle={subtitle}
      icon={
        <svg viewBox="0 0 24 24" className="h-4 w-4 stroke-current" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 16l8-8" />
          <path d="M9 8h7v7" />
        </svg>
      }
    >
      <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.1em] text-[#8c8579]">Top outlier drivers</div>
      <div className="space-y-3">
        {drivers.map((item) => (
          <article key={item.id} className="min-w-0 rounded-[12px] border border-[#ddd6ca] bg-white px-3.5 py-3 min-[640px]:px-4">
            <div className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#fff0bf] text-[10px] font-bold text-[#916e16]">
                {item.rank}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-[14px] font-semibold text-[#1a1a1a]">{item.title}</h3>
                  {item.uplift && <span className="rounded-full bg-[#dff4df] px-2 py-0.5 text-[10px] font-semibold text-[#2c8a4d]">{item.uplift}</span>}
                </div>
                <p className="mt-1 break-words text-[13px] leading-5 text-[#696257]">{item.body}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </PanelShell>
  );
}

function hookReasons(result) {
  const reasons = Array.isArray(result?.hook_reasons) ? result.hook_reasons : [];

  if (reasons.length > 0) {
    return reasons.map((item, index) => ({
      id: index,
      title: item?.title || item?.tactic || item?.label || `Hook tactic ${index + 1}`,
      body: item?.explanation || item?.reason || (typeof item === 'string' ? item : ''),
    }));
  }

  // Fallback for analyses generated before hook_reasons existed: use the
  // first whole-video drivers so the tab is never empty.
  return whyDrivers({ content_breakdown: Array.isArray(result?.content_breakdown) ? result.content_breakdown.slice(0, 3) : [] })
    .map((item) => ({ id: item.id, title: item.title, body: item.body }));
}

function HookTab({ result }) {
  const variations = hookVariations(result);
  const reasons = hookReasons(result);

  return (
    <PanelShell
      title="Hook"
      subtitle="first 2 seconds"
      icon={
        <svg viewBox="0 0 24 24" className="h-4 w-4 stroke-current" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3l2.3 4.7L19 8.4l-3.5 3.4.8 4.8L12 14.9 7.7 16.6l.8-4.8L5 8.4l4.7-.7L12 3z" />
        </svg>
      }
    >
      <div className="border-l-2 border-[#f0c24b] pl-3 text-[24px] font-semibold leading-8 text-[#1a1a1a]">
        {typeof result?.hook_analysis === 'string' ? result.hook_analysis : 'The core hook is still being assembled.'}
      </div>

      <div className="mt-5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#8c8579]">Why it works</div>
      <div className="mt-3 space-y-3">
        {reasons.map((item) => (
          <article key={item.id} className="min-w-0 rounded-[12px] border border-[#ddd6ca] bg-white px-3.5 py-3 min-[640px]:px-4">
            <div className="flex gap-3">
              <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#fff0bf] text-[10px] font-bold text-[#916e16]">-</span>
              <div>
                <div className="text-[14px] font-semibold text-[#1a1a1a]">{item.title}</div>
                <p className="mt-1 break-words text-[13px] leading-5 text-[#696257]">{item.body}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#8c8579]">Variations to test</div>
      <div className="mt-3 space-y-3">
        {variations.map((item) => (
          <div key={item.id} className="min-w-0 flex items-center gap-3 rounded-[12px] border border-[#ddd6ca] bg-white px-3.5 py-3 text-[13px] text-[#5f584d] min-[640px]:px-4">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#fff0bf] text-[10px] font-bold text-[#916e16]">{item.label}</span>
            <span className="break-words">{item.text}</span>
          </div>
        ))}
      </div>
    </PanelShell>
  );
}

function TranscriptTab({ analysis }) {
  const rows = transcriptRows(analysis);
  const segments = Array.isArray(analysis?.transcript_segments) ? analysis.transcript_segments : [];
  // Only claim a runtime when the segments actually carry one.
  const lastEnd = Number(segments.at(-1)?.end_ms);
  const duration = Number.isFinite(lastEnd) && lastEnd > 0 ? formatDuration(lastEnd / 1000) : null;

  return (
    <PanelShell
      title="Transcript"
      subtitle={duration ? `auto-generated - ${duration}` : 'auto-generated'}
      icon={
        <svg viewBox="0 0 24 24" className="h-4 w-4 stroke-current" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 4h10a2 2 0 0 1 2 2v12l-4-2-4 2-4-2-4 2V6a2 2 0 0 1 2-2h2" />
        </svg>
      }
    >
      <div className="space-y-1">
        {rows.map((row) => (
          <div key={row.id} className="grid grid-cols-[40px_minmax(0,1fr)] gap-3 min-[640px]:grid-cols-[44px_minmax(0,1fr)] min-[640px]:gap-4 border-b border-dashed border-[#e7dfd1] py-3 last:border-b-0">
            <div className="text-[12px] font-bold text-[#a07512]">{row.time}</div>
            <div className="break-words text-[13px] leading-5.5 text-[#4f4a42] min-[640px]:text-[14px] min-[640px]:leading-6">{row.text}</div>
          </div>
        ))}
      </div>
    </PanelShell>
  );
}

function StrategistTab({ result }) {
  const recommendations = strategistRecommendations(result);
  const blueprint = blueprintText(result);
  const blueprintLines = blueprintRows(blueprint);

  return (
    <PanelShell
      title="Creative Strategist"
      subtitle="how to replicate this for your brand"
      icon={
        <svg viewBox="0 0 24 24" className="h-4 w-4 stroke-current" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="6" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
      }
    >
      <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#8c8579]">Recommendations</div>
      <div className="mt-3 space-y-3">
        {recommendations.map((item) => (
          <article key={item.id} className="min-w-0 rounded-[12px] border border-[#ddd6ca] bg-white px-3.5 py-3 min-[640px]:px-4">
            <div className="flex gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#fff0bf] text-[10px] font-bold text-[#916e16]">{item.rank}</span>
              <div>
                <div className="text-[14px] font-semibold text-[#1a1a1a]">{item.title}</div>
                {item.body && <p className="mt-1 break-words text-[13px] leading-5 text-[#696257]">{item.body}</p>}
              </div>
            </div>
          </article>
        ))}
      </div>

      {blueprint && (
        <>
          <div className="mt-5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#8c8579]">Script to replicate</div>
          <div className="mt-3 min-w-0 rounded-[14px] border border-dashed border-[#ddc79d] bg-[#fffaf0] px-3.5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] min-[640px]:px-4">
            <div className="space-y-3 font-mono text-[12px] leading-5.5 text-[#5f584d] min-[640px]:text-[12.5px] min-[640px]:leading-6">
              {blueprintLines.map((line) => (
                <div key={line.id} className="break-words">
                  {line.label ? (
                    <>
                      <span className="font-semibold uppercase tracking-[0.02em] text-[#4a4338]">{line.label}</span>
                      <span className="text-[#8f8678]"> - </span>
                      <span>{line.body}</span>
                    </>
                  ) : (
                    <span>{line.body}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </PanelShell>
  );
}

function ActivePanel({ activeTab, analysis, result, video }) {
  if (activeTab === 'hook') return <HookTab result={result} />;
  if (activeTab === 'transcript') return <TranscriptTab analysis={analysis} />;
  if (activeTab === 'strategist') return <StrategistTab result={result} />;
  return <WhyTab result={result} video={video} />;
}

const DEFAULT_TABS = [
  { key: 'why', label: 'Analysis' },
  { key: 'hook', label: 'Hook' },
  { key: 'transcript', label: 'Transcript' },
  { key: 'strategist', label: 'Creative Strategist', shortLabel: 'Strategist' },
];

export default function AnalysisModal({
  video,
  initialAnalysis,
  tabs = DEFAULT_TABS,
  open = true,
  onClose,
  onAnalysisChange,
  // Supplied by the results page so the CTA goes through its credit check and
  // confirm step. Without it the modal starts the analysis itself, which is the
  // right behaviour on the standalone /video-analysis page.
  onAnalyze,
  analyzeBusy = false,
  saved = false,
  saving = false,
  onToggleSave,
}) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.key ?? 'why');
  const [analysis, setAnalysis] = usePolling(video.id, initialAnalysis, open);
  const [regenerating, setRegenerating] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [calloutDismissed, setCalloutDismissed] = useState(false);
  const canRegenerate = Boolean(usePage().props?.features?.videoAnalysisRefresh);

  // Keep the parent (and therefore the Analyze/View CTA) in sync with the
  // modal's live analysis state — regenerate flips it back to "processing",
  // and the poller lands it on "complete" again.
  const onAnalysisChangeRef = useRef(onAnalysisChange);
  onAnalysisChangeRef.current = onAnalysisChange;
  useEffect(() => {
    if (analysis) onAnalysisChangeRef.current?.(video.id, analysis);
  }, [analysis, video.id]);

  useEffect(() => {
    if (!open) return;
    setShowErrorModal(analysis?.status === 'failed');
  }, [analysis?.status, open, video?.id]);

  const requestAnalysis = async (forceRefresh = false) => {
    const payload = await videoAnalysis.request(video.id, forceRefresh ? { force_refresh: true } : {});
    setShowErrorModal(false);
    setAnalysis(payload.analysis);
  };

  const regenerate = async () => {
    if (regenerating) return;

    setRegenerating(true);
    try {
      await requestAnalysis(true);
    } catch (error) {
      window.alert(error?.message || 'Could not regenerate this analysis.');
    } finally {
      setRegenerating(false);
    }
  };

  const retryAnalysis = async () => {
    if (regenerating) return;

    setRegenerating(true);
    try {
      await requestAnalysis(false);
    } catch (error) {
      window.alert(error?.message || 'Could not restart this analysis.');
    } finally {
      setRegenerating(false);
    }
  };

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    setActiveTab(tabs[0]?.key ?? 'why');
    setCalloutDismissed(false);
  }, [tabs, video?.id]);

  if (!open || !video) return null;

  const result = analysis?.result ?? {};
  const regenerateDisabled = regenerating || analysis?.status === 'processing';
  const status = analysis?.status;
  const analyzeState = status === 'complete'
    ? 'ready'
    : (analyzeBusy || regenerating || status === 'processing' || status === 'queued' || status === 'pending')
      ? 'running'
      : 'idle';

  const startAnalysis = () => {
    if (onAnalyze) {
      onAnalyze();
      return;
    }

    retryAnalysis();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[rgba(38,33,28,0.42)] px-2 py-3 backdrop-blur-[2px] min-[640px]:px-4 min-[640px]:py-6" onClick={onClose}>
      <div
        className="max-h-[calc(100vh-1.5rem)] w-full max-w-[1150px] overflow-x-hidden overflow-y-auto rounded-[22px] border border-[#d9d1c4] bg-[radial-gradient(circle_at_top,#f7f2e9_0%,#f3efe8_32%,#f1ede6_100%)] p-2 shadow-[0_28px_90px_rgba(42,33,20,0.22)] min-[640px]:max-h-[calc(100vh-3rem)] min-[640px]:rounded-[26px] min-[640px]:p-3"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Video analysis"
      >
        <div className="relative min-w-0 overflow-x-hidden rounded-[18px] border border-[#d9d1c4] bg-[#f6f3ec] p-3 min-[640px]:rounded-[22px] min-[640px]:p-4 md:p-5">
          {showErrorModal && (
            <ErrorStateModal
              message={analysis?.error_message}
              retrying={regenerating}
              onRetry={retryAnalysis}
              onDismiss={onClose}
            />
          )}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-[#e5ddd1] bg-[#fbfaf7] text-[#8a8479] transition hover:text-[#2a2a2a]"
            aria-label="Close analysis"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 stroke-current" fill="none" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>

          <div className="grid items-start gap-4 min-[980px]:grid-cols-[292px_minmax(0,1fr)]">
            <LeftSidebar
              video={video}
              canRegenerate={canRegenerate}
              regenerating={regenerating}
              disabledRegenerate={regenerateDisabled}
              onRegenerate={regenerate}
              analyzeState={analyzeState}
              onAnalyze={startAnalysis}
              saved={saved}
              saving={saving}
              onToggleSave={onToggleSave}
            />

            <div className="min-w-0 space-y-3 min-[640px]:space-y-4">
              <VideoHeadline
                video={video}
                calloutDismissed={calloutDismissed}
                onDismissCallout={() => setCalloutDismissed(true)}
              />
              <TabRow tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

              {analysis?.status !== 'complete' ? (
                <ProcessingState status={analysis?.status ?? 'idle'} error={analysis?.error_message} />
              ) : (
                <ActivePanel activeTab={activeTab} analysis={analysis} result={result} video={video} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
