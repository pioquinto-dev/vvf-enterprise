import { Fragment, useState } from 'react';

const METRICS = [['signups', 'Signups'], ['completed', 'First search completed'], ['trials', 'Trial starts'], ['paid', 'First paid conversion']];
const PAGE_SIZE = 15;
const sourceLabel = (row) => row.medium === 'Medium not recorded' ? row.source : `${row.source} / ${row.medium}`;
const attributionLabel = (row) => row.campaign === 'No campaign recorded' ? sourceLabel(row) : `${sourceLabel(row)} · Campaign: ${row.campaign}`;

export default function AcquisitionTable({ acquisition = {} }) {
    const cohort = acquisition.cohort ?? { groups: [], rows: [], totals: {} };
    const [sort, setSort] = useState({ key: 'signups', descending: true });
    const [expanded, setExpanded] = useState({});
    const [selection, setSelection] = useState(null);
    const [page, setPage] = useState(1);
    const sorted = (rows) => [...rows].sort((a, b) => {
        const comparison = sort.key === 'source'
            ? `${a.source ?? a.campaign} / ${a.medium ?? ''}`.localeCompare(`${b.source ?? b.campaign} / ${b.medium ?? ''}`)
            : a[sort.key] - b[sort.key];
        return comparison * (sort.descending ? -1 : 1);
    });
    const select = (metric, group = null, campaign = null) => {
        setSelection({ metric, group, campaign });
        setPage(1);
    };
    const matches = selection ? cohort.rows.filter((row) => row[selection.metric]
        && (!selection.group || (row.source === selection.group.source && row.medium === selection.group.medium))
        && (selection.campaign === null || row.campaign === selection.campaign)) : [];
    const pages = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
    const currentPage = Math.min(page, pages);
    const cells = (row, group, campaign = null) => <>
        {METRICS.map(([key, label]) => <td key={key} className="px-3 py-3 text-right">
            <button className="rounded px-2 py-1 text-sky-800 underline decoration-sky-200 hover:bg-sky-50 focus-visible:outline-2" onClick={() => select(key, group, campaign)} aria-label={`${label}: ${row[key]} for ${campaign ?? sourceLabel(group)}`}>{row[key].toLocaleString()}</button>
        </td>)}
        <td className="px-3 py-3 text-right">{row.rate}%</td>
    </>;

    return <section className="rounded-2xl border border-[#dce4f0] bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
            <div><p className="text-xs font-semibold uppercase tracking-widest text-sky-700">Acquisition</p><h3 className="mt-1 text-lg font-semibold">Where they come from</h3></div>
            <span className="text-xs text-slate-500">Signed up {acquisition.rangeLabel}</span>
        </div>
        <p className="mt-2 text-sm text-slate-600">People who signed up in this range, followed through their outcomes as of {cohort.asOf ? new Date(cohort.asOf).toLocaleString(undefined, { timeZone: 'UTC' }) : 'today'} UTC. Recent signups have had less time to convert.</p>
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {METRICS.map(([key, label]) => <button key={key} onClick={() => select(key)} className="rounded-xl border border-slate-200 p-3 text-left hover:bg-sky-50">
                <span className="block text-xs text-slate-600">{label}</span><strong className="mt-1 block text-2xl">{(cohort.totals[key] ?? 0).toLocaleString()}</strong>
            </button>)}
        </div>
        <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
                <caption className="sr-only">Acquisition by source and medium. Expand a source to compare campaigns; select a count to see users.</caption>
                <thead><tr className="border-b border-slate-200 text-left text-xs text-slate-600">
                    {[['source', 'Source / medium'], ...METRICS, ['rate', 'Signup → paid']].map(([key, label]) => <th key={key} className={`px-3 py-3 ${key === 'source' ? '' : 'text-right'}`} aria-sort={sort.key === key ? (sort.descending ? 'descending' : 'ascending') : 'none'}>
                        <button onClick={() => setSort({ key, descending: sort.key === key ? !sort.descending : key !== 'source' })}>{label} {sort.key === key ? (sort.descending ? '↓' : '↑') : ''}</button>
                    </th>)}
                </tr></thead>
                <tbody>{sorted(cohort.groups).map((group) => <Fragment key={group.key}>
                    <tr className="border-b border-slate-100"><th className="px-3 py-3 text-left font-medium">
                        <button className="text-left" aria-expanded={Boolean(expanded[group.key])} onClick={() => setExpanded({ ...expanded, [group.key]: !expanded[group.key] })}>{expanded[group.key] ? '▾' : '▸'} {group.source} {group.medium !== 'Medium not recorded' && <span className="font-normal text-slate-500">/ {group.medium}</span>}</button>
                    </th>{cells(group, group)}</tr>
                    {expanded[group.key] && sorted(group.campaigns).map((campaign) => <tr key={campaign.campaign} className="border-b border-slate-100 bg-slate-50"><th className="py-3 pl-8 pr-3 text-left font-normal"><span className="text-xs text-slate-500">Campaign: </span>{campaign.campaign}</th>{cells(campaign, group, campaign.campaign)}</tr>)}
                </Fragment>)}</tbody>
            </table>
            {cohort.groups.length === 0 && <p className="py-8 text-center text-sm text-slate-500">No signups in this range.</p>}
        </div>
        <details className="mt-3 text-xs text-slate-500"><summary className="cursor-pointer">How these numbers are counted</summary>
            <p className="mt-2">Each person counts once per outcome, using their earliest recorded signup attribution. Subscription attribution copies are excluded. Trials stay counted after cancellation or conversion. Completed searches include archived searches.</p>
            <p className="mt-2">Paid conversions use recorded paid subscription events or current paid status. Older customers who canceled before activity recording began may be missing. Trial completion alone does not prove payment.</p>
            <p className="mt-2">Source not recorded means we did not capture where this person came from; it does not necessarily mean they visited directly. Missing medium and campaign values are hidden from user rows. No campaign recorded groups signups without a campaign tag. Paid and organic traffic are not inferred from the source alone. Program membership is separate from acquisition source.</p>
        </details>
        {selection && <div className="mt-5 rounded-xl border border-slate-200 p-3" aria-label="Matching users">
            <div className="flex items-start justify-between gap-3"><h4 className="font-semibold">{METRICS.find(([key]) => key === selection.metric)?.[1]} · {selection.group ? sourceLabel(selection.group) : 'All sources'}{selection.campaign !== null ? ` · ${selection.campaign}` : ''} ({matches.length})</h4><button onClick={() => setSelection(null)} className="text-sm text-slate-600 underline">Close</button></div>
            <ul className="mt-2 divide-y divide-slate-100">{matches.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((user) => <li key={user.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
                <div><p className="font-medium">{user.name || 'Unnamed user'}</p><p className="break-all text-slate-500">{user.email}</p></div>
                <div className="text-xs text-slate-500"><p>{attributionLabel(user)}</p><p>Signed up {user.signup_at.slice(0, 10)}{user.program ? ' · Coupon program member' : ''}</p></div>
            </li>)}</ul>
            {matches.length === 0 && <p className="py-4 text-sm text-slate-500">No matching users.</p>}
            <div className="mt-2 flex items-center justify-between text-sm"><button disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} className="rounded border px-3 py-1 disabled:opacity-40">Previous</button><span>Page {currentPage} of {pages}</span><button disabled={currentPage === pages} onClick={() => setPage(currentPage + 1)} className="rounded border px-3 py-1 disabled:opacity-40">Next</button></div>
        </div>}
    </section>;
}
