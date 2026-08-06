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
  const suffix = unit === 'percent' ? '%' : unit === 'points' ? ' pts' : unit === 'multiple' ? 'x' : '';

  return (
    <div
      className={`d ${direction === 'up' ? 'up' : direction === 'down' ? 'down' : 'flat'}`}
      title={reconstructed ? 'Compared against a week rebuilt from upload dates' : 'Versus the previous week'}
    >
      {arrow} {Math.abs(value)}
      {suffix} wk{reconstructed ? ' ~' : ''}
    </div>
  );
}
