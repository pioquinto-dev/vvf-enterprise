import { useEffect, useRef, useState } from 'react';
import { usePage } from '@inertiajs/react';

import { videoAnalysis } from '../../landing/flow/api.js';

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
  if (!Number.isFinite(total) || total <= 0) return '0:14';
  const minutes = Math.floor(total / 60);
  const remainder = String(Math.round(total % 60)).padStart(2, '0');
  return `${minutes}:${remainder}`;
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

// Chip variants mirror .bbchip--score / --views / --mut from the design handoff.
const STAT_CHIP = {
  score: 'border-[#d8c9a6] bg-[#FFF3CF]',
  views: 'border-[#e0c5b6] bg-[#FEF0E7]',
  mut: 'border-[#E7E5DF] bg-[#FAF9F6]',
};
const STAT_LABEL = {
  score: 'text-[#9A6B00]',
  views: 'text-[#C2410C]',
  mut: 'text-[#5C5A54]',
};

function statCards(video) {
  return [
    { label: 'Outlier', value: `${formatMetric(video.virality_score || 18)}x`, variant: 'score' },
    { label: 'Views', value: compactNumber(video.views), variant: 'views' },
    { label: 'Eng rate', value: video.engagement_rate ? `${formatMetric(video.engagement_rate)}%` : '12.2%', variant: 'mut' },
    { label: 'Shares', value: compactNumber(video.shares), variant: 'mut' },
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

function LeftSidebar({ video, canRegenerate = false, regenerating = false, disabledRegenerate = false, onRegenerate }) {
  const metrics = statCards(video);
  const [playing, setPlaying] = useState(false);
  const [thumbBroken, setThumbBroken] = useState(false);
  const embed = videoEmbedUrl(video);
  const hasThumb = Boolean(video.thumbnail_url) && !thumbBroken;
  const postedAt = video?.uploaded_at
    ? new Date(video.uploaded_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <aside className="self-start rounded-[18px] border border-[#E7E5DF] bg-white p-[13px] min-[980px]:sticky min-[980px]:top-0">
      <div className="mx-auto w-full max-w-[260px] overflow-hidden rounded-[13px] bg-[#FAF9F6] min-[980px]:max-w-none">
        {playing && embed ? (
          <div className="relative">
            <iframe
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
        <span className="h-[30px] w-[30px] flex-shrink-0 rounded-full bg-[linear-gradient(150deg,#ffd27a,#ff9a5a_55%,#c0607a)]" />
        <div className="min-w-0">
          <div className="truncate text-[13px] font-bold text-[#0B0B0B]">{video.handle ?? video.creator_name ?? '@creator'}</div>
          <div className="text-[11.5px] text-[#5C5A54]">{compactNumber(video.followers ?? video.views)} followers</div>
        </div>
      </div>

      <div className="mt-[11px] flex flex-wrap items-center gap-2 text-[11.5px] text-[#5C5A54]">
        <span className="rounded-[7px] bg-[#FFF3CF] px-[9px] py-1 text-[10px] font-extrabold uppercase tracking-[0.05em] text-[#9A6B00]">
          Skincare &amp; Beauty
        </span>
        {postedAt && <span>{postedAt}</span>}
        <span>{formatDuration(video.duration)}</span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {metrics.map((item) => (
          <div key={item.label} className={`rounded-[11px] border px-[11px] py-[9px] ${STAT_CHIP[item.variant]}`}>
            <span className={`inline-flex items-center gap-[5px] whitespace-nowrap text-[9px] font-extrabold uppercase tracking-[0.06em] ${STAT_LABEL[item.variant]}`}>
              <i className="h-[5px] w-[5px] rounded-full bg-current" />
              {item.label}
            </span>
            <span className="mt-1 block text-[17px] font-extrabold leading-none tracking-[-0.02em] text-[#0B0B0B] [font-variant-numeric:tabular-nums]">
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {canRegenerate && (
        <div className="mt-3">
          <RegenerateButton
            regenerating={regenerating}
            disabled={disabledRegenerate}
            onClick={onRegenerate}
            fullWidth
          />
        </div>
      )}
    </aside>
  );
}

function SummaryCard({ summary }) {
  return (
    <section className="rounded-[14px] border border-[#ddd6ca] bg-[#fbfaf7] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
      <div className="text-[13px] font-semibold text-[#1f1f1f]">Summary</div>
      <p className="mt-1 text-[13px] leading-6 text-[#696257]">{summary}</p>
    </section>
  );
}

function TabRow({ tabs, activeTab, onChange }) {
  return (
    <div className="flex rounded-[14px] border border-[#ddd6ca] bg-[#fbfaf7] p-1">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`flex-1 rounded-[10px] px-3 py-2.5 text-[12px] font-semibold transition ${
            activeTab === tab.key ? 'bg-[#ffeeb8] text-[#6c5715]' : 'text-[#5f584d] hover:text-[#1f1f1f]'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function PanelShell({ icon, title, subtitle, children }) {
  return (
    <section className="rounded-[16px] border border-[#ddd6ca] bg-[#fffdf9] p-4">
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
        : 'Analysis has not started yet.';

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
  const baseline = Number(video?.virality_score);
  const subtitle = Number.isFinite(baseline) && baseline > 0 ? `${Math.round(baseline)}x baseline` : 'Outlier drivers';

  return (
    <PanelShell
      title="Why It Went Viral"
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
          <article key={item.id} className="rounded-[12px] border border-[#ddd6ca] bg-white px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#fff0bf] text-[10px] font-bold text-[#916e16]">
                {item.rank}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-[14px] font-semibold text-[#1a1a1a]">{item.title}</h3>
                  {item.uplift && <span className="rounded-full bg-[#dff4df] px-2 py-0.5 text-[10px] font-semibold text-[#2c8a4d]">{item.uplift}</span>}
                </div>
                <p className="mt-1 text-[13px] leading-5 text-[#696257]">{item.body}</p>
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
          <article key={item.id} className="rounded-[12px] border border-[#ddd6ca] bg-white px-4 py-3">
            <div className="flex gap-3">
              <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#fff0bf] text-[10px] font-bold text-[#916e16]">-</span>
              <div>
                <div className="text-[14px] font-semibold text-[#1a1a1a]">{item.title}</div>
                <p className="mt-1 text-[13px] leading-5 text-[#696257]">{item.body}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#8c8579]">Variations to test</div>
      <div className="mt-3 space-y-3">
        {variations.map((item) => (
          <div key={item.id} className="flex items-center gap-3 rounded-[12px] border border-[#ddd6ca] bg-white px-4 py-3 text-[13px] text-[#5f584d]">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#fff0bf] text-[10px] font-bold text-[#916e16]">{item.label}</span>
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    </PanelShell>
  );
}

function TranscriptTab({ analysis }) {
  const rows = transcriptRows(analysis);
  const segments = Array.isArray(analysis?.transcript_segments) ? analysis.transcript_segments : [];
  const duration = segments.length > 0 ? formatDuration((segments.at(-1)?.end_ms || 14000) / 1000) : '0:14';

  return (
    <PanelShell
      title="Transcript"
      subtitle={`auto-generated - ${duration}`}
      icon={
        <svg viewBox="0 0 24 24" className="h-4 w-4 stroke-current" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 4h10a2 2 0 0 1 2 2v12l-4-2-4 2-4-2-4 2V6a2 2 0 0 1 2-2h2" />
        </svg>
      }
    >
      <div className="space-y-1">
        {rows.map((row) => (
          <div key={row.id} className="grid grid-cols-[44px_minmax(0,1fr)] gap-4 border-b border-dashed border-[#e7dfd1] py-3 last:border-b-0">
            <div className="text-[12px] font-bold text-[#a07512]">{row.time}</div>
            <div className="text-[14px] leading-6 text-[#4f4a42]">{row.text}</div>
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
          <article key={item.id} className="rounded-[12px] border border-[#ddd6ca] bg-white px-4 py-3">
            <div className="flex gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#fff0bf] text-[10px] font-bold text-[#916e16]">{item.rank}</span>
              <div>
                <div className="text-[14px] font-semibold text-[#1a1a1a]">{item.title}</div>
                {item.body && <p className="mt-1 text-[13px] leading-5 text-[#696257]">{item.body}</p>}
              </div>
            </div>
          </article>
        ))}
      </div>

      {blueprint && (
        <>
          <div className="mt-5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#8c8579]">Script to replicate</div>
          <div className="mt-3 rounded-[14px] border border-dashed border-[#ddc79d] bg-[#fffaf0] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
            <div className="space-y-3 font-mono text-[12.5px] leading-6 text-[#5f584d]">
              {blueprintLines.map((line) => (
                <div key={line.id}>
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
  { key: 'why', label: 'Why It Went Viral' },
  { key: 'hook', label: 'Hook' },
  { key: 'transcript', label: 'Transcript' },
  { key: 'strategist', label: 'Creative Strategist' },
];

export default function AnalysisModal({ video, initialAnalysis, tabs = DEFAULT_TABS, open = true, onClose, onAnalysisChange }) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.key ?? 'why');
  const [analysis, setAnalysis] = usePolling(video.id, initialAnalysis, open);
  const [regenerating, setRegenerating] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
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
  }, [tabs, video?.id]);

  if (!open || !video) return null;

  const result = analysis?.result ?? {};
  const summary = result.why_it_went_viral || result.evidence_summary || 'We are still assembling the summary for this video.';
  const regenerateDisabled = regenerating || analysis?.status === 'processing';

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[rgba(38,33,28,0.42)] px-4 py-6 backdrop-blur-[2px]" onClick={onClose}>
      <div
        className="max-h-[calc(100vh-3rem)] w-full max-w-[1150px] overflow-y-auto rounded-[26px] border border-[#d9d1c4] bg-[radial-gradient(circle_at_top,#f7f2e9_0%,#f3efe8_32%,#f1ede6_100%)] p-3 shadow-[0_28px_90px_rgba(42,33,20,0.22)]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Video analysis"
      >
        <div className="relative rounded-[22px] border border-[#d9d1c4] bg-[#f6f3ec] p-4 md:p-5">
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
            />

            <div className="space-y-4">
              <SummaryCard summary={summary} />
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
