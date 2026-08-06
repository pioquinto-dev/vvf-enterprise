import { compactNumber, outlierLabel, percent } from '../../../landing/flow/format.js';
import { DeltaLine, RebuiltBadge } from './Badges.jsx';

const HOUR_LABELS = { 0: '12a', 6: '6a', 12: '12p', 18: '6p' };

/**
 * Splits a formatted figure into the big number and its trailing unit, so the
 * unit renders in the mockup's smaller muted `small`.
 */
function splitUnit(text) {
  const match = String(text).match(/^([\d.,]+)(.*)$/);
  return match ? [match[1], match[2]] : [text, ''];
}

function tileValue(tile) {
  if (tile.value === null || tile.value === undefined) return ['—', ''];

  switch (tile.format) {
    case 'multiple':
      return splitUnit(outlierLabel(tile.value) ?? '—');
    case 'percent':
      return splitUnit(percent(tile.value) ?? '—');
    case 'compact':
      return splitUnit(compactNumber(tile.value));
    default:
      return [String(tile.value), ''];
  }
}

/**
 * The five signal tiles, each with a week-over-week line where one can be
 * sourced. `deltas` is keyed by tile key; a missing entry renders an empty
 * line rather than a zero. A tile may instead carry its own `deltaNode`
 * (e.g. the sample-data follower growth), which wins over the computed line.
 */
export function SignalTiles({ tiles = [], deltas = {} }) {
  if (tiles.length === 0) return null;

  return (
    <div className="stats">
      {tiles.map((tile) => {
        const [value, unit] = tileValue(tile);

        return (
          <div key={tile.key} className={`stat ${tile.hero ? 'hero' : ''}`} title={tile.hint ?? undefined}>
            <div className="k">{tile.label}</div>
            <div className="v">
              {value}
              {unit && <small>{unit}</small>}
            </div>
            {tile.deltaNode ?? <DeltaLine delta={deltas[tile.key]} />}
          </div>
        );
      })}
    </div>
  );
}

/** Run-over-run movement for a hashtag or sound. */
function Growth({ growth }) {
  if (!growth) return <span className="gro flat">—</span>;
  if (growth.is_new) return <span className="gro">new</span>;
  if (growth.change_pct === null || growth.change_pct === 0) return <span className="gro flat">flat</span>;

  const up = growth.change_pct > 0;

  return (
    <span className={`gro ${up ? '' : 'down'}`}>
      {up ? '↑' : '↓'} {Math.abs(growth.change_pct)}%
    </span>
  );
}

export function HashtagPanel({ hashtags = [] }) {
  return (
    <div className="hspanel">
      <h3># hashtags</h3>
      {hashtags.length === 0 ? (
        <p className="empty">No hashtags on the matched videos.</p>
      ) : (
        hashtags.map((row, index) => (
          <div className="hrow" key={row.tag}>
            <span className="idx">{index + 1}</span>
            <span className="nm">#{row.tag}</span>
            <span className="cnt">on {row.posts} posts</span>
            <Growth growth={row.growth} />
          </div>
        ))
      )}
    </div>
  );
}

export function SoundPanel({ sounds = [] }) {
  return (
    <div className="hspanel">
      <h3>♪ sounds</h3>
      {sounds.length === 0 ? (
        <p className="empty">No sound credited on the matched videos.</p>
      ) : (
        sounds.map((row, index) => (
          <div className="hrow" key={row.label}>
            <span className="idx">{index + 1}</span>
            <span className="splay">
              <svg width="11" height="12" viewBox="0 0 14 16" fill="var(--violet)" aria-hidden>
                <path d="M0 0l14 8-14 8z" />
              </svg>
            </span>
            <span className="nm">
              {row.label}
              {row.on_top_video && <span className="u">used on the winner</span>}
            </span>
            <span className="cnt">{row.posts} posts</span>
            <Growth growth={row.growth} />
          </div>
        ))
      )}
    </div>
  );
}

/**
 * Posting rhythm by weekday and hour. Hours are UTC — `uploaded_at` is stored
 * in UTC and no creator timezone is captured, so the label says so plainly
 * rather than implying local time.
 */
export function PostingHeatmap({ heatmap }) {
  if (!heatmap || heatmap.counted === 0) {
    return (
      <div className="panel">
        <p className="empty">No upload timestamps on the matched videos yet.</p>
      </div>
    );
  }

  const { days = [], cells = [], max = 0, peak, timezone } = heatmap;

  return (
    <div className="panel">
      <div className="heat">
        <div className="heatgrid">
          <div />
          {Array.from({ length: 24 }).map((_, hour) => (
            <div className="hh" key={hour}>
              {HOUR_LABELS[hour] ?? ''}
            </div>
          ))}

          {days.map((day, dayIndex) => (
            <div className="contents" key={day} style={{ display: 'contents' }}>
              <div className="dl">{day}</div>
              {(cells[dayIndex] ?? []).map((count, hour) => {
                const t = max > 0 ? count / max : 0;
                const isPeak = peak && peak.day === day && peak.hour === hour && count > 0;

                return (
                  <div
                    className="cell"
                    key={hour}
                    title={`${day} ${String(hour).padStart(2, '0')}:00 ${timezone} — ${count} ${count === 1 ? 'post' : 'posts'}`}
                    style={
                      count > 0
                        ? {
                            background: isPeak
                              ? 'var(--coral)'
                              : `color-mix(in srgb, var(--violet) ${Math.round(18 + t * 82)}%, var(--paper-2))`,
                          }
                        : undefined
                    }
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="heatlegend">
        less
        <span className="scale">
          {[10, 30, 50, 70, 100].map((step) => (
            <i key={step} style={{ background: `color-mix(in srgb, var(--violet) ${step}%, var(--paper-2))` }} />
          ))}
          <i style={{ background: 'var(--coral)' }} />
        </span>
        more
      </div>

      {peak && (
        <div className="heat-note">
          <b>Their rhythm:</b> busiest slot is {peak.day} around {String(peak.hour).padStart(2, '0')}:00 {timezone},
          with {peak.count} {peak.count === 1 ? 'post' : 'posts'}. Hours are {timezone} — no creator timezone is
          captured on a scrape.
        </div>
      )}
    </div>
  );
}

/** Faint placeholder bars that keep the panel's shape while it has no story. */
const GHOST_HEIGHTS = [34, 58, 42, 66, 50, 82];

/**
 * Six-week outlier bars. An all-zero week set renders as ghost bars with an
 * explanation instead of six zeros — on a first run that chart looks broken,
 * and the two reasons it can be empty deserve different sentences: either no
 * post has cleared the threshold at all, or the outliers exist but were
 * posted before the 12-week window this chart covers.
 */
export function OutliersPerWeek({ bars = [], threshold = 3, totalOutliers = 0, nextRunLabel = null }) {
  const max = Math.max(...bars.map((b) => b.value), 1);
  const anyRebuilt = bars.some((b) => b.reconstructed);
  const isEmpty = bars.length === 0 || bars.every((b) => !b.value);

  if (isEmpty) {
    return (
      <div className="panel">
        <h3>outliers per week</h3>
        <div className="psub">their posts scoring {outlierLabel(threshold) ?? '3x'} or higher</div>

        <div className="spark ghost" aria-hidden>
          {GHOST_HEIGHTS.map((height, index) => (
            <div className="col" key={index}>
              <div className="bar2" style={{ height: `${height}%` }} />
              <span className="wl">{index === GHOST_HEIGHTS.length - 1 ? 'now' : `wk ${index + 1}`}</span>
            </div>
          ))}
        </div>

        <p className="ghostnote">
          {totalOutliers > 0
            ? `All ${totalOutliers} of their outliers were posted more than 12 weeks ago — this chart covers recent weeks only. It fills in as refreshes land.`
            : `Nothing has beaten ${outlierLabel(threshold) ?? '3x'} the search median yet. A bar appears the week a post breaks out${nextRunLabel ? ` — next check ${nextRunLabel}` : ''}.`}
        </p>
      </div>
    );
  }

  return (
    <div className="panel">
      <h3>
        outliers per week {anyRebuilt && <RebuiltBadge className="ml-2" />}
      </h3>
      <div className="psub">their posts scoring {outlierLabel(threshold) ?? '3x'} or higher</div>

      <div className="spark">
        {bars.map((bar, index) => (
          <div className="col" key={`${bar.label}-${index}`}>
            <div
              className={`bar2 ${index === bars.length - 1 ? 'now' : ''}`}
              style={{ height: `${Math.max((bar.value / max) * 100, 4)}%` }}
            >
              <em>{bar.value}</em>
            </div>
            {/* Mockup labels: "wk 1" … "now", oldest first. */}
            <span className="wl">{index === bars.length - 1 ? 'now' : `wk ${index + 1}`}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Mockup bar colours by bucket floor: violet-soft, violet, then coral. */
function bucketColor(min) {
  if (min >= 8) return 'var(--coral)';
  if (min >= 5) return 'var(--violet)';
  return 'var(--violet-soft)';
}

export function ScoreDistribution({ distribution = [] }) {
  const top = Math.max(...distribution.map((row) => row.count), 1);
  const outliers = distribution.reduce((sum, row) => sum + row.count, 0);

  return (
    <div className="panel">
      <h3>score distribution</h3>
      <div className="psub">
        this search's {outliers} {outliers === 1 ? 'outlier' : 'outliers'}
      </div>

      <div className="dist">
        {distribution.map((row) => (
          <div className="dline" key={row.label}>
            <span className="rng">{row.label}</span>
            <span className="dbar">
              <span
                style={{
                  width: `${(row.count / top) * 100}%`,
                  background: bucketColor(row.min),
                }}
              />
            </span>
            <span className="cnt">{row.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
