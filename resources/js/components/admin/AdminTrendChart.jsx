import { useMemo, useState } from 'react';

const SERIES = [
    { key: 'signups', label: 'Sign ups', color: '#ff2d78' },
    { key: 'trialing', label: 'Trialing', color: '#ffae19' },
    { key: 'paid', label: 'Active paid', color: '#7486ff' },
];

const WIDTH = 960;
const HEIGHT = 250;
const PAD = { top: 14, right: 12, bottom: 28, left: 32 };

function niceMax(value) {
    if (value <= 4) return 4;
    const magnitude = 10 ** Math.floor(Math.log10(value));
    return Math.ceil(value / magnitude) * magnitude;
}

// Clamp bezier handles at the baseline so zero runs stay visibly flat.
function smoothPath(coords, baseline) {
    if (coords.length < 3) return coords.map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x},${y}`).join(' ');
    let path = `M${coords[0][0]},${coords[0][1]}`;
    for (let index = 0; index < coords.length - 1; index += 1) {
        const p0 = coords[index - 1] ?? coords[index];
        const p1 = coords[index];
        const p2 = coords[index + 1];
        const p3 = coords[index + 2] ?? p2;
        const c1x = p1[0] + (p2[0] - p0[0]) / 6;
        const c2x = p2[0] - (p3[0] - p1[0]) / 6;
        const c1y = Math.min(baseline, p1[1] + (p2[1] - p0[1]) / 6);
        const c2y = Math.min(baseline, p2[1] - (p3[1] - p1[1]) / 6);
        path += ` C${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
    }
    return path;
}

export default function AdminTrendChart({ points = [] }) {
    const [hidden, setHidden] = useState({});
    const [hoverIndex, setHoverIndex] = useState(null);
    const visible = SERIES.filter((series) => !hidden[series.key]);
    const { max, xFor, yFor, plotWidth, baseline } = useMemo(() => {
        const highest = points.reduce((peak, point) => visible.reduce((value, series) => Math.max(value, point[series.key] ?? 0), peak), 0);
        const ceiling = niceMax(highest);
        const innerWidth = WIDTH - PAD.left - PAD.right;
        const innerHeight = HEIGHT - PAD.top - PAD.bottom;
        return { max: ceiling, plotWidth: innerWidth, baseline: PAD.top + innerHeight, xFor: (index) => PAD.left + index * (points.length > 1 ? innerWidth / (points.length - 1) : 0), yFor: (value) => PAD.top + innerHeight - (value / ceiling) * innerHeight };
    }, [points, visible]);

    if (points.length === 0) return <p className="px-4 py-16 text-center text-[13px] text-[var(--faint)]">No snapshots captured yet.</p>;

    const active = hoverIndex === null ? null : points[hoverIndex];
    const labelEvery = Math.max(1, Math.ceil(points.length / 14));
    const tooltipLeft = hoverIndex === null ? 0 : Math.min(86, Math.max(2, (xFor(hoverIndex) / WIDTH) * 100));
    const updateHover = (event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        const ratio = ((event.clientX - bounds.left) / bounds.width) * WIDTH;
        const index = Math.round(((ratio - PAD.left) / plotWidth) * (points.length - 1));

        setHoverIndex(Math.min(points.length - 1, Math.max(0, index)));
    };

    return <div className="relative">
        <div className="mb-3 flex flex-wrap gap-2">{SERIES.map((series) => {
            const off = hidden[series.key];
            return <button key={series.key} type="button" onClick={() => setHidden((current) => ({ ...current, [series.key]: !current[series.key] }))} className="rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-[.11em] uppercase transition" style={{ borderColor: off ? '#dce4f0' : `${series.color}99`, color: off ? '#95a2b3' : series.color, backgroundColor: off ? '#fff' : `${series.color}12` }}>{series.label}</button>;
        })}</div>
        {active && <div className="pointer-events-none absolute z-10 w-28 rounded-xl bg-[#101a31] px-3 py-2.5 text-[10px] shadow-[0_14px_30px_rgba(16,26,49,.28)]" style={{ left: `${tooltipLeft}%`, top: 50 }}><strong className="block text-[11px] text-white">{active.label}</strong>{visible.map((series) => <span key={series.key} className="mt-1 block" style={{ color: series.color }}>{series.label}: {active[series.key] ?? 0}</span>)}</div>}
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-[250px] w-full" onMouseLeave={() => setHoverIndex(null)} onMouseMove={updateHover}>
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => { const y = PAD.top + (HEIGHT - PAD.top - PAD.bottom) * ratio; return <g key={ratio}><line x1={PAD.left} x2={WIDTH - PAD.right} y1={y} y2={y} stroke="#edf1f6" /><text x={2} y={y + 3} fill="#8b98aa" fontSize="9">{Math.round(max * (1 - ratio))}</text></g>; })}
            {visible.map((series) => { const coords = points.map((point, index) => [xFor(index), yFor(point[series.key] ?? 0)]); return <path key={series.key} d={smoothPath(coords, baseline)} fill="none" stroke={series.color} strokeWidth="1.8" strokeLinecap="round" />; })}
            {hoverIndex !== null && <g><line x1={xFor(hoverIndex)} x2={xFor(hoverIndex)} y1={PAD.top} y2={baseline} stroke="#cbd5e1" strokeDasharray="3 3" />{visible.map((series) => <circle key={series.key} cx={xFor(hoverIndex)} cy={yFor(points[hoverIndex][series.key] ?? 0)} r="3.4" fill="#fff" stroke={series.color} strokeWidth="2" />)}</g>}
            {points.map((point, index) => index % labelEvery === 0 ? <text key={point.date} x={xFor(index)} y={HEIGHT - 7} fill="#8b98aa" fontSize="9" textAnchor="middle">{point.label}</text> : null)}
        </svg>
    </div>;
}
