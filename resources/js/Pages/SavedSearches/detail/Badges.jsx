/**
 * Two different kinds of "this is not a normal measurement", kept visually
 * distinct because they mean genuinely different things.
 *
 *  - SampleBadge:        invented. Needs the TikTok profile actor, which is not
 *                        built. Comes from PlaceholderProfileData on the server.
 *  - RebuiltBadge:       derived from real videos, but describing when posts
 *                        went up rather than what the metric read at the time.
 *
 * Never use one for the other. Amber says "do not trust this number", violet
 * says "trust it, but know what it measures".
 */

export function SampleBadge({ className = '' }) {
  return (
    <span
      className={`prov sample ${className}`}
      title="Sample data — needs the TikTok profile scrape, which isn't built yet"
    >
      sample
    </span>
  );
}

export function RebuiltBadge({ className = '' }) {
  return (
    <span
      className={`prov rebuilt ${className}`}
      title="Rebuilt from upload dates — shows when posts went up and what they're worth now, not what the metric read at the time"
    >
      rebuilt
    </span>
  );
}

/**
 * The `.d` line under a signal tile. Renders nothing when the change is
 * unknown — a missing line is honest, a "0%" line is not.
 */
export function DeltaLine({ delta }) {
  if (!delta || delta.value === null || delta.value === undefined) {
    return <div className="d" />;
  }

  const { value, unit, direction, reconstructed } = delta;
  const arrow = direction === 'up' ? '↑' : direction === 'down' ? '↓' : '→';
  const suffix = unit === 'percent' ? '%' : unit === 'points' ? 'pt' : unit === 'multiple' ? 'x' : '';

  // Round to keep the line tidy (the mockup shows e.g. "↑ 4x", "↓ 0.6x"): whole
  // numbers for anything ≥ 10, one decimal below that.
  const magnitude = Math.abs(value);
  const rounded = magnitude >= 10 ? Math.round(magnitude) : Math.round(magnitude * 10) / 10;

  return (
    <div
      className={`d ${direction === 'up' ? 'up' : direction === 'down' ? 'down' : 'flat'}`}
      title={reconstructed ? 'vs a week rebuilt from upload dates' : 'vs the previous week'}
    >
      {arrow} {rounded}
      {suffix}
    </div>
  );
}
