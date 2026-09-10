import { useEffect, useRef, useState } from 'react';
import { usePage } from '@inertiajs/react';

import { videoAnalysis } from '../../landing/flow/api.js';
import BreakoutVideoCard from '../components/BreakoutVideoCard.jsx';

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

/* The weighted engagement-per-follower score used to rank Breakout videos. */
function breakoutScore(video) {
  const value = Number(video?.score ?? video?.viral_score ?? video?.virality_score ?? 0);
  return Number.isFinite(value) && value > 0 ? value : null;
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
      // Analyses stored before rewrites carried an objection label are plain
      // strings; they render without the label rather than breaking.
      objection: typeof hook === 'string' ? null : hook?.objection ?? null,
      text: typeof hook === 'string' ? hook : hook?.text || hook?.variation || JSON.stringify(hook),
    }));
  }

  return [];
}

/* What held the video back — the counterpart to whyDrivers. */
function whyDrags(result) {
  if (!Array.isArray(result?.drags)) return [];

  return result.drags
    .map((item, index) => ({
      id: index,
      rank: String(index + 1),
      title: typeof item === 'string' ? item : item?.title || 'Drag',
      body: typeof item === 'string' ? null : item?.explanation || item?.reason || null,
    }))
    .filter((item) => item.title || item.body);
}

/* Beat-by-beat construction of the opening, for the Hook tab. */
function hookBeats(result) {
  if (!Array.isArray(result?.hook_beats)) return [];

  return result.hook_beats
    .filter((beat) => beat && (beat.title || beat.explanation))
    .map((beat, index) => ({
      id: index,
      time: beat.time || null,
      title: beat.title || `Beat ${index + 1}`,
      body: beat.explanation || null,
    }));
}

function hookPatterns(result) {
  return Array.isArray(result?.hook_patterns)
    ? result.hook_patterns.filter((item) => typeof item === 'string' && item.trim() !== '')
    : [];
}

function whyDrivers(result) {
  if (Array.isArray(result?.content_breakdown) && result.content_breakdown.length > 0) {
    return result.content_breakdown.map((item, index) => ({
      id: index,
      rank: String(index + 1).padStart(2, '0'),
      title: item?.title || item?.driver || item?.label || 'Breakout signal',
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
  showExternalLink = true,
}) {

  // The rail is the breakout card plus the modal's own CTA stack. It never
  // drives the modal's height — it scrolls inside its own column if it must.
  return (
    <aside className="flex max-h-full min-h-0 flex-col gap-3 self-start overflow-y-auto">
      <BreakoutVideoCard video={video} showActions={false} />

      <div className="flex flex-col gap-[7px]">
        <div className={`grid gap-[7px] ${showExternalLink ? 'grid-cols-[minmax(0,1fr)_40px]' : 'grid-cols-1'}`}>
          <AnalyzeButton state={analyzeState} onClick={onAnalyze} />

          {showExternalLink && (
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
          )}
        </div>

        {onToggleSave && (
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
        )}

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
 * viewer actually saw, and the callout explains the score's audience-relative
 * calculation.
 *
 * This replaced a "Summary" card whose only content, before an analysis exists,
 * was a placeholder sentence about assembling one.
 */
function VideoHeadline({ video, calloutDismissed, onDismissCallout }) {
  const caption = String(video?.title || video?.caption || '').trim();
  const score = breakoutScore(video);
  const showCallout = !calloutDismissed && Boolean(score);

  // Trailing hashtags are tinted rather than quoted with the sentence, so the
  // line the viewer actually read stays the headline.
  const tagMatch = caption.match(/(\s#[^\s#]+(?:\s+#[^\s#]+)*)\s*$/);
  const captionTags = tagMatch ? tagMatch[1].trim() : null;
  const captionBody = tagMatch ? caption.slice(0, tagMatch.index).trim() : caption;

  if (!caption && !showCallout) return null;

  return (
    <>
      {caption && (
        <p className="mr-11 mt-0.5 min-w-0 break-words text-[16.5px] font-extrabold leading-[1.4] tracking-[-0.01em] text-[#0B0B0B]">
          &ldquo;{captionBody}&rdquo;
          {captionTags && <span className="font-bold text-[#9A6B00]"> {captionTags}</span>}
        </p>
      )}

      {showCallout && (
        <div className="flex min-w-0 items-start gap-[9px] rounded-[12px] border border-[#F2E2AE] bg-[#FFF3CF] px-3 py-2.5">
          <span aria-hidden className="mt-px flex-none text-[#9A6B00]">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-5M12 8h.01" strokeLinecap="round" />
            </svg>
          </span>
          <p className="m-0 min-w-0 flex-1 break-words text-[12px] leading-[1.45] text-[#5B4300]">
            <b className="font-extrabold">
              {formatMetric(score)}x is this video&rsquo;s weighted engagement relative to its creator&rsquo;s follower count.
            </b>{' '}
            Views, likes and comments contribute to the score.
          </p>
          <button
            type="button"
            onClick={onDismissCallout}
            aria-label="Dismiss"
            className="ml-auto flex-none cursor-pointer font-bold leading-none text-[#9B8140] transition hover:text-[#0B0B0B]"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}

function TabRow({ tabs, activeTab, onChange }) {
  return (
    <div className="flex gap-1.5 rounded-[12px] border border-[#E7E5DF] bg-white p-[5px]" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.key}
          onClick={() => onChange(tab.key)}
          className={`h-9 flex-1 rounded-[9px] text-[13px] font-bold transition ${
            activeTab === tab.key ? 'bg-[#FFF3CF] text-[#9A6B00]' : 'text-[#5C5A54] hover:text-[#0B0B0B]'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
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
              what made this video outperform its audience size — and get a playbook you can hand to your creators.
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

/* ---------------- panel primitives (mockup: .sect / .items / .n) ---------------- */

function Section({ tone = 'plain', title, count, children, className = '' }) {
  const next = tone === 'next';

  return (
    <section
      className={`min-w-0 rounded-[14px] border px-[15px] py-[14px] ${
        next ? 'border-[#F2E2AE] bg-[#FFFCF2]' : 'border-[#E7E5DF] bg-white'
      } ${className}`}
    >
      {title && (
        <h3 className="mb-[11px] flex items-center gap-2 text-[13.5px] font-extrabold tracking-[-0.01em] text-[#0B0B0B]">
          {title}
          {count && <span className="text-[10px] font-extrabold tracking-[0.06em] text-[#8A877F]">{count}</span>}
        </h3>
      )}
      {children}
    </section>
  );
}

/* Numbered list with a coloured index chip: gold drivers, coral drags, green actions. */
function NumberedItems({ items, tone = 'good' }) {
  const chip = {
    good: 'bg-[#FFF3CF] text-[#9A6B00]',
    bad: 'bg-[#FEF0E7] text-[#C2410C]',
    next: 'bg-[#E9F5EE] text-[#1F7A4D]',
  }[tone];

  return (
    <ul className="m-0 grid list-none gap-[11px] p-0">
      {items.map((item, index) => (
        <li key={item.id ?? index} className="flex gap-2.5">
          <span className={`mt-px flex h-[19px] flex-[0_0_19px] items-center justify-center rounded-[6px] text-[10.5px] font-extrabold ${chip}`}>
            {item.rank ?? index + 1}
          </span>
          <div className="min-w-0">
            {item.title && <b className="mb-0.5 block text-[12.8px] font-bold text-[#0B0B0B]">{item.title}</b>}
            {item.body && <p className="m-0 text-[12.3px] leading-[1.5] text-[#5C5A54]">{item.body}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}

function SourceNote({ children }) {
  return <p className="mb-0 mt-[11px] text-[11px] italic text-[#8A877F]">{children}</p>;
}

function EmptySection({ children }) {
  return <p className="m-0 text-[12.3px] leading-[1.5] text-[#8A877F]">{children}</p>;
}

/* ---------------- "Why it worked" panel ---------------- */

function WhyPanel({ result, analysis, video }) {
  const drivers = whyDrivers(result);
  const drags = whyDrags(result);
  const actions = strategistRecommendations(result);
  const rows = transcriptRows(analysis);
  // The runtime badge on Transcript comes from the video itself; the analysis
  // record carries no duration of its own.
  const runtime = formatDuration(video?.duration ?? null);

  return (
    <div className="grid gap-3">
      <Section title="Why it worked" count={drivers.length ? `${drivers.length} ${drivers.length === 1 ? 'DRIVER' : 'DRIVERS'}` : null}>
        {drivers.length > 0
          ? <NumberedItems items={drivers} tone="good" />
          : <EmptySection>No drivers were identified for this video.</EmptySection>}
      </Section>

      <Section title="What could be improved" count={drags.length ? `${drags.length} ${drags.length === 1 ? 'DRAG' : 'DRAGS'}` : null}>
        {drags.length > 0
          ? <NumberedItems items={drags} tone="bad" />
          : <EmptySection>Nothing measurable held this video back.</EmptySection>}
      </Section>

      <Section tone="next" title="What you should do next" count={actions.length ? `${actions.length} ${actions.length === 1 ? 'ACTION' : 'ACTIONS'}` : null}>
        {actions.length > 0
          ? <>
              <NumberedItems items={actions} tone="next" />
              <SourceNote>From this video&rsquo;s transcript and metrics.</SourceNote>
            </>
          : <EmptySection>No next actions were generated for this video.</EmptySection>}
      </Section>

      <Section title="Transcript" count={runtime}>
        {rows.length > 0 ? (
          <ul className="m-0 grid list-none gap-2 p-0">
            {rows.map((row, index) => (
              <li key={row.id} className="flex gap-[11px] text-[12.3px] leading-[1.5]">
                <span className="flex-[0_0_34px] pt-px text-[11px] font-bold [font-variant-numeric:tabular-nums] text-[#8A877F]">{row.time}</span>
                <span className={index === 0 ? 'rounded-[6px] bg-[#FFF3CF] px-1.5 py-px' : undefined}>{row.text}</span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptySection>No transcript was captured for this video.</EmptySection>
        )}
      </Section>
    </div>
  );
}

/* ---------------- "Hook" panel ---------------- */

function HookPanel({ result, video }) {
  const hookLine = String(result?.hook_analysis || '').trim();
  const patterns = hookPatterns(result);
  const reasons = hookReasons(result);
  const beats = hookBeats(result);
  const rewrites = hookVariations(result);
  const [copiedId, setCopiedId] = useState(null);

  const copy = async (item) => {
    try {
      await navigator.clipboard.writeText(item.text);
      setCopiedId(item.id);
      window.setTimeout(() => setCopiedId((current) => (current === item.id ? null : current)), 1600);
    } catch {
      // Clipboard is blocked in some embedded contexts; the text stays selectable.
    }
  };

  return (
    <div className="grid gap-3">
      <Section>
        <div className="flex items-stretch gap-[13px]">
          <div className="relative aspect-[9/13] flex-[0_0_76px] overflow-hidden rounded-[10px] bg-[#FAF9F6]">
            {video?.thumbnail_url
              ? <img src={video.thumbnail_url} alt="" referrerPolicy="no-referrer" className="absolute inset-0 h-full w-full object-cover" />
              : <span className="absolute inset-0 bg-[linear-gradient(150deg,#e8dcd2,#d8c4b6_55%,#a8887c)]" />}
            <span className="absolute bottom-1.5 left-1.5 text-[9px] font-extrabold tracking-[0.06em] text-white [text-shadow:0_1px_4px_rgba(0,0,0,.6)]">0:00</span>
          </div>
          <div className="flex min-w-0 flex-1 flex-col justify-center">
            {hookLine
              ? <blockquote className="m-0 mb-[9px] text-[16px] font-extrabold leading-[1.35] tracking-[-0.01em] text-[#0B0B0B] text-balance">&ldquo;{hookLine}&rdquo;</blockquote>
              : <EmptySection>The opening line was not captured for this video.</EmptySection>}
            {patterns.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {patterns.map((pattern, index) => (
                  <span
                    key={pattern}
                    className={`rounded-[7px] border px-2 py-1 text-[10.5px] font-extrabold tracking-[0.03em] ${
                      index === 0
                        ? 'border-[#F2E2AE] bg-[#FFF3CF] text-[#9A6B00]'
                        : 'border-[#E7E5DF] bg-[#F5F4F0] text-[#5C5A54]'
                    }`}
                  >
                    {pattern}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Section>

      <Section title="Why it stops the scroll" count={reasons.length ? `${reasons.length} ${reasons.length === 1 ? 'REASON' : 'REASONS'}` : null}>
        {reasons.length > 0
          ? <NumberedItems items={reasons} tone="good" />
          : <EmptySection>No hook breakdown was generated for this video.</EmptySection>}
      </Section>

      {beats.length > 0 && (
        <Section title="How the first three seconds are built">
          <div className="mb-3 flex h-1.5 overflow-hidden rounded-full bg-[#E7E5DF]">
            <i className="block flex-[3] bg-[#9A6B00]" />
            <i className="block flex-[4] bg-[#E0B44A]" />
            <i className="block flex-[3] bg-[#F0D89A]" />
          </div>
          <ul className="m-0 grid list-none gap-0 p-0">
            {beats.map((beat, index) => (
              <li
                key={beat.id}
                className={`grid grid-cols-[46px_1fr] gap-3 py-[9px] ${index === 0 ? 'pt-0' : 'border-t border-dashed border-[#E7E5DF]'}`}
              >
                <span className="pt-px text-[11px] font-extrabold [font-variant-numeric:tabular-nums] text-[#9A6B00]">{beat.time ?? ''}</span>
                <div className="min-w-0">
                  <b className="mb-0.5 block text-[12.5px] font-bold text-[#0B0B0B]">{beat.title}</b>
                  {beat.body && <p className="m-0 text-[12.2px] leading-[1.5] text-[#5C5A54]">{beat.body}</p>}
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {rewrites.length > 0 && (
        <Section tone="next" title="Swipe this hook" count={`${rewrites.length} ${rewrites.length === 1 ? 'REWRITE' : 'REWRITES'}`}>
          <ul className="m-0 grid list-none gap-[9px] p-0">
            {rewrites.map((item) => (
              <li key={item.id} className="flex items-start gap-2.5 rounded-[11px] border border-[#E7E5DF] bg-[#F5F4F0] px-[11px] py-2.5">
                <span className="min-w-0 flex-1 text-[12.4px] leading-[1.5] text-[#0B0B0B]">
                  {item.objection && (
                    <em className="mb-[3px] block text-[10.5px] font-extrabold uppercase not-italic tracking-[0.05em] text-[#8A877F]">
                      {item.objection}
                    </em>
                  )}
                  {item.text}
                </span>
                <button
                  type="button"
                  onClick={() => copy(item)}
                  className="inline-flex h-[26px] flex-shrink-0 items-center gap-[5px] rounded-[8px] border border-[#E7E5DF] bg-white px-[9px] text-[11px] font-bold text-[#5C5A54] transition hover:border-[#c8c4ba] hover:text-[#0B0B0B]"
                >
                  <svg viewBox="0 0 24 24" className="h-[11px] w-[11px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
                    <rect x="9" y="9" width="12" height="12" rx="2" />
                    <path d="M5 15V5a2 2 0 012-2h10" />
                  </svg>
                  {copiedId === item.id ? 'Copied' : 'Copy'}
                </button>
              </li>
            ))}
          </ul>
          <SourceNote>Structure lifted from this video&rsquo;s opening.</SourceNote>
        </Section>
      )}
    </div>
  );
}

function ActivePanel({ activeTab, analysis, result, video }) {
  if (activeTab === 'hook') return <HookPanel result={result} video={video} />;
  return <WhyPanel result={result} analysis={analysis} video={video} />;
}

const DEFAULT_TABS = [
  { key: 'why', label: 'Why it worked' },
  { key: 'hook', label: 'Hook' },
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
  showExternalLink = true,
}) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.key ?? 'why');
  const [analysis, setAnalysis] = usePolling(video.id, initialAnalysis, open);
  const [regenerating, setRegenerating] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [calloutDismissed, setCalloutDismissed] = useState(false);
  const canRegenerate = Boolean(usePage().props?.features?.videoAnalysisRefresh);
  const scrollerRef = useRef(null);

  // Both panels share one scroller, so switching tabs starts at the top.
  const selectTab = (key) => {
    setActiveTab(key);
    if (scrollerRef.current) scrollerRef.current.scrollTop = 0;
  };

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
        className="max-h-[calc(100vh-1.5rem)] w-full max-w-[1120px] overflow-y-auto rounded-[22px] border border-[#E7E5DF] bg-[#FAF9F6] p-2 shadow-[0_2px_4px_rgba(20,15,0,.05),0_24px_56px_-20px_rgba(20,15,0,.18)] min-[640px]:max-h-[calc(100vh-3rem)] min-[640px]:p-3 min-[820px]:overflow-hidden"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Video analysis"
      >
        {/* Above 820px the modal takes a fixed height and only the right pane's
            sections scroll; below it the whole thing runs at natural height. */}
        <div className="relative min-w-0 rounded-[18px] p-3 min-[640px]:p-4 min-[820px]:h-[min(760px,calc(100vh-88px))] min-[820px]:overflow-hidden md:p-5">
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
            className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-[#E7E5DF] bg-white text-[#5C5A54] transition hover:text-[#0B0B0B]"
            aria-label="Close analysis"
          >
            <svg viewBox="0 0 24 24" className="h-[13px] w-[13px] stroke-current" fill="none" strokeWidth="2.4" strokeLinecap="round">
              <path d="M5 5l14 14M19 5L5 19" />
            </svg>
          </button>

          <div className="grid h-full items-start gap-6 min-[980px]:grid-cols-[300px_minmax(0,1fr)]">
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
              showExternalLink={showExternalLink}
            />

            {/* Caption, score note and tabs stay pinned; the sections below
                them are the only thing that scrolls. */}
            <div className="flex min-h-0 min-w-0 flex-col gap-3.5 min-[820px]:h-full">
              <VideoHeadline
                video={video}
                calloutDismissed={calloutDismissed}
                onDismissCallout={() => setCalloutDismissed(true)}
              />
              <TabRow tabs={tabs} activeTab={activeTab} onChange={selectTab} />

              <div className="relative flex min-h-0 flex-1 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-[26px] after:bg-[linear-gradient(180deg,rgba(250,249,246,0),#FAF9F6)] min-[820px]:after:block max-[819px]:after:hidden">
                <div
                  ref={scrollerRef}
                  className="-mr-2.5 min-h-0 flex-1 overscroll-contain py-0.5 pl-0.5 pr-3 min-[820px]:overflow-y-auto"
                >
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
      </div>
    </div>
  );
}
