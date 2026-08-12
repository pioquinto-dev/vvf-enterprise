import { useMemo, useState } from 'react';

/**
 * Hand-rolled SVG line chart. The admin bundle has no charting dependency and
 * a handful of series over a year of points does not justify adding one.
 */
const SERIES = [
    { key: 'signups', label: 'Sign ups', color: '#ff2d78' },
    { key: 'trialing', label: 'Trialing', color: '#f5c518' },
    { key: 'paid', label: 'Active paid', color: '#6d8bff' },
];

const WIDTH = 960;
const HEIGHT = 300;
const PAD = { top: 16, right: 12, bottom: 26, left: 30 };

function niceMax(value) {
    if (value <= 4) {
        return 4;
    }

    const magnitude = 10 ** Math.floor(Math.log10(value));
    return Math.ceil(value / magnitude) * magnitude;
}

/**
 * Catmull-Rom through the points, converted to cubic beziers. This is what
 * gives the reference look its soft peaks instead of hard polyline corners.
 */
function smoothPath(coords) {
    if (coords.length === 0) {
        return '';
    }

    if (coords.length < 3) {
        return coords.map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x},${y}`).join(' ');
    }

    let path = `M${coords[0][0]},${coords[0][1]}`;

    for (let i = 0; i < coords.length - 1; i += 1) {
        const p0 = coords[i - 1] ?? coords[i];
        const p1 = coords[i];
        const p2 = coords[i + 1];
        const p3 = coords[i + 2] ?? p2;

        const c1x = p1[0] + (p2[0] - p0[0]) / 6;
        const c1y = p1[1] + (p2[1] - p0[1]) / 6;
        const c2x = p2[0] - (p3[0] - p1[0]) / 6;
        const c2y = p2[1] - (p3[1] - p1[1]) / 6;

        path += ` C${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
    }

    return path;
}

export default function AdminTrendChart({ points = [] }) {
    const [hidden, setHidden] = useState({});
    const [hoverIndex, setHoverIndex] = useState(null);

    const visible = SERIES.filter((series) => !hidden[series.key]);

    const { max, xFor, yFor, plotWidth, baseline } = useMemo(() => {
        const highest = points.reduce(
            (peak, point) => visible.reduce((inner, series) => Math.max(inner, point[series.key] ?? 0), peak),
            0,
        );
        const ceiling = niceMax(highest);
        const innerWidth = WIDTH - PAD.left - PAD.right;
        const innerHeight = HEIGHT - PAD.top - PAD.bottom;
        const step = points.length > 1 ? innerWidth / (points.length - 1) : 0;

        return {
            max: ceiling,
            plotWidth: innerWidth,
            baseline: PAD.top + innerHeight,
            xFor: (index) => PAD.left + index * step,
            yFor: (value) => PAD.top + innerHeight - (ceiling === 0 ? 0 : (value / ceiling) * innerHeight),
        };
    }, [points, visible]);

    if (points.length === 0) {
        return <p className="px-4 py-16 text-center text-[13px] text-white/45">No snapshots captured yet.</p>;
    }

    const gridLines = [0, 0.25, 0.5, 0.75, 1];
    const active = hoverIndex === null ? null : points[hoverIndex];
    const labelEvery = Math.max(1, Math.ceil(points.length / 14));

    return (
        <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
                {SERIES.map((series) => {
                    const off = hidden[series.key];

                    return (
                        <button
                            key={series.key}
                            type="button"
                            onClick={() => setHidden((current) => ({ ...current, [series.key]: !current[series.key] }))}
                            className="rounded-full border px-2.5 py-1 text-[10.5px] font-semibold tracking-[.1em] uppercase transition"
                            style={{
                                borderColor: off ? 'rgba(255,255,255,.1)' : `${series.color}66`,
                                color: off ? 'rgba(255,255,255,.28)' : series.color,
                                backgroundColor: off ? 'transparent' : `${series.color}14`,
                            }}
                        >
                            {series.label}
                        </button>
                    );
                })}
            </div>

            <svg
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                className="h-[300px] w-full"
                onMouseLeave={() => setHoverIndex(null)}
                onMouseMove={(event) => {
                    const bounds = event.currentTarget.getBoundingClientRect();
                    const ratio = ((event.clientX - bounds.left) / bounds.width) * WIDTH;
                    const index = Math.round(((ratio - PAD.left) / plotWidth) * (points.length - 1));
                    setHoverIndex(Math.min(points.length - 1, Math.max(0, index)));
                }}
            >
                <defs>
                    {SERIES.map((series) => (
                        <linearGradient key={series.key} id={`fill-${series.key}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={series.color} stopOpacity="0.22" />
                            <stop offset="100%" stopColor={series.color} stopOpacity="0" />
                        </linearGradient>
                    ))}
                </defs>

                {gridLines.map((ratio) => {
                    const y = PAD.top + (HEIGHT - PAD.top - PAD.bottom) * ratio;

                    return (
                        <g key={ratio}>
                            <line x1={PAD.left} x2={WIDTH - PAD.right} y1={y} y2={y} stroke="rgba(255,255,255,.05)" />
                            <text x={0} y={y + 3} fill="rgba(255,255,255,.3)" fontSize="10">
                                {Math.round(max * (1 - ratio))}
                            </text>
                        </g>
                    );
                })}

                {visible.map((series) => {
                    const coords = points.map((point, index) => [xFor(index), yFor(point[series.key] ?? 0)]);
                    const line = smoothPath(coords);

                    return (
                        <g key={series.key}>
                            <path
                                d={`${line} L${coords[coords.length - 1][0]},${baseline} L${coords[0][0]},${baseline} Z`}
                                fill={`url(#fill-${series.key})`}
                            />
                            <path d={line} fill="none" stroke={series.color} strokeWidth="2.25" strokeLinecap="round" />
                        </g>
                    );
                })}

                {hoverIndex !== null && (
                    <g>
                        <line
                            x1={xFor(hoverIndex)}
                            x2={xFor(hoverIndex)}
                            y1={PAD.top}
                            y2={baseline}
                            stroke="rgba(255,255,255,.2)"
                        />
                        {visible.map((series) => (
                            <circle
                                key={series.key}
                                cx={xFor(hoverIndex)}
                                cy={yFor(points[hoverIndex][series.key] ?? 0)}
                                r="3.5"
                                fill="#0b0e1c"
                                stroke={series.color}
                                strokeWidth="2"
                            />
                        ))}
                    </g>
                )}

                {points.map((point, index) =>
                    index % labelEvery === 0 ? (
                        <text
                            key={point.date}
                            x={xFor(index)}
                            y={HEIGHT - 8}
                            fill="rgba(255,255,255,.3)"
                            fontSize="9.5"
                            textAnchor="middle"
                        >
                            {point.label}
                        </text>
                    ) : null,
                )}
            </svg>

            <div className="mt-2 flex min-h-[18px] flex-wrap items-center gap-4 text-[12px] text-white/55">
                {active && (
                    <>
                        <span className="font-medium text-white/80">{active.label}</span>
                        {visible.map((series) => (
                            <span key={series.key}>
                                <span style={{ color: series.color }}>{series.label}</span>{' '}
                                <span className="text-white">{active[series.key]}</span>
                            </span>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}
