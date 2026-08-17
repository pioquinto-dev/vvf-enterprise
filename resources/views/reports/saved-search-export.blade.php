<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $search['name'] ?? 'Search report' }} - PDF export</title>
    <style>
        @page { size: A4; margin: 16mm; }
        :root {
            --ink: #1f1a15;
            --muted: #6b6258;
            --line: #ddd4c8;
            --paper: #fffdf8;
            --panel: #f7f2ea;
            --accent: #bf8b21;
            --accent-soft: #fff1ce;
            --good: #246b42;
        }
        * { box-sizing: border-box; }
        body {
            margin: 0;
            font-family: Arial, Helvetica, sans-serif;
            color: var(--ink);
            background: #f3ede4;
        }
        .page {
            max-width: 980px;
            margin: 0 auto;
            background: var(--paper);
            padding: 24px;
        }
        .toolbar {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            margin-bottom: 18px;
            padding: 12px 14px;
            border: 1px solid var(--line);
            border-radius: 14px;
            background: var(--panel);
            color: var(--muted);
            font-size: 13px;
        }
        .toolbar button {
            border: 0;
            border-radius: 999px;
            padding: 10px 16px;
            background: var(--accent);
            color: #fff;
            font-weight: 700;
            cursor: pointer;
        }
        .hero {
            display: grid;
            grid-template-columns: 1.7fr 1fr;
            gap: 18px;
            align-items: start;
        }
        .card, .panel {
            border: 1px solid var(--line);
            border-radius: 18px;
            background: #fff;
            padding: 18px;
        }
        .eyebrow {
            display: inline-block;
            padding: 5px 9px;
            border-radius: 999px;
            background: var(--accent-soft);
            color: #6f5010;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: .04em;
        }
        h1, h2, h3, p { margin: 0; }
        h1 { margin-top: 12px; font-size: 32px; line-height: 1.1; }
        .sub {
            margin-top: 8px;
            color: var(--muted);
            font-size: 14px;
            line-height: 1.55;
        }
        .meta {
            margin-top: 14px;
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            color: var(--muted);
            font-size: 13px;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
        }
        .stat {
            border: 1px solid var(--line);
            border-radius: 14px;
            background: var(--panel);
            padding: 14px;
        }
        .stat b {
            display: block;
            font-size: 24px;
            margin-top: 8px;
        }
        .label {
            color: var(--muted);
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: .04em;
        }
        .grid-2 {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 18px;
            margin-top: 18px;
        }
        .section {
            margin-top: 18px;
        }
        .section h2 {
            font-size: 20px;
            margin-bottom: 12px;
        }
        .chips {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
        .chip {
            border: 1px solid var(--line);
            border-radius: 999px;
            padding: 8px 12px;
            background: var(--panel);
            font-size: 13px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
        }
        th, td {
            padding: 10px 8px;
            border-bottom: 1px solid var(--line);
            text-align: left;
            vertical-align: top;
        }
        th {
            color: var(--muted);
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: .04em;
        }
        .muted { color: var(--muted); }
        .good { color: var(--good); font-weight: 700; }
        .foot {
            margin-top: 20px;
            color: var(--muted);
            font-size: 12px;
            line-height: 1.5;
        }
        .break-avoid { break-inside: avoid; page-break-inside: avoid; }
        @media print {
            body { background: #fff; }
            .page { max-width: none; margin: 0; padding: 0; }
            .toolbar { display: none; }
            a { color: inherit; text-decoration: none; }
        }
    </style>
</head>
<body>
@php
    $fmtCompact = static function ($value): string {
        if (! is_numeric($value)) {
            return '-';
        }
        $value = (float) $value;
        $abs = abs($value);
        if ($abs >= 1000000) {
            return rtrim(rtrim(number_format($value / 1000000, 1), '0'), '.').'M';
        }
        if ($abs >= 1000) {
            return rtrim(rtrim(number_format($value / 1000, 1), '0'), '.').'K';
        }
        return number_format($value);
    };
    $fmtPercent = static function ($value): string {
        return is_numeric($value) ? rtrim(rtrim(number_format((float) $value, 2), '0'), '.').'%' : '-';
    };
    $fmtDate = static function ($value): string {
        if (! is_string($value) || trim($value) === '') {
            return '-';
        }
        try {
            return \Illuminate\Support\Carbon::parse($value)->timezone(config('app.timezone'))->format('M j, Y');
        } catch (\Throwable) {
            return '-';
        }
    };
    $topMultiple = data_get($insights, 'tiles.2.value');
    $medianViews = data_get($insights, 'baseline.median_views');
    $avgEngagement = data_get($insights, 'tiles.4.value');
    $account = data_get($insights, 'account');
    $hashtags = array_slice((array) data_get($insights, 'hashtags', []), 0, 8);
    $sounds = array_slice((array) data_get($insights, 'sounds', []), 0, 8);
@endphp
<div class="page">
    <div class="toolbar">
        <div>
            This layout is optimized for browser print. Use "Print" then choose "Save as PDF".
        </div>
        <button type="button" onclick="window.print()">Print</button>
    </div>

    <section class="hero break-avoid">
        <div class="card">
            <span class="eyebrow">{{ strtoupper((string) ($search['search_type'] ?? 'search')) }} report</span>
            <h1>{{ $search['name'] ?? 'Search report' }}</h1>
            <p class="sub">
                Search phrase: <strong>{{ $search['phrase'] ?? '-' }}</strong>
                @if(! empty($search['ai_summary']))
                    <br><br>{{ $search['ai_summary'] }}
                @endif
            </p>
            <div class="meta">
                <span>Results: {{ number_format((int) ($search['result_count'] ?? 0)) }}</span>
                <span>Scanned: {{ number_format((int) ($search['scanned_count'] ?? 0)) }}</span>
                <span>Last run: {{ $fmtDate($search['last_run_at'] ?? null) }}</span>
                <span>Next run: {{ $fmtDate($search['next_run_at'] ?? null) }}</span>
                <span>Status: {{ ucfirst((string) ($search['status'] ?? 'unknown')) }}</span>
            </div>
        </div>

        <div class="stats">
            <div class="stat">
                <span class="label">Top outlier</span>
                <b>{{ is_numeric($topMultiple) ? rtrim(rtrim(number_format((float) $topMultiple, 2), '0'), '.').'x' : '-' }}</b>
            </div>
            <div class="stat">
                <span class="label">Median views</span>
                <b>{{ $fmtCompact($medianViews) }}</b>
            </div>
            <div class="stat">
                <span class="label">Avg eng rate</span>
                <b>{{ $fmtPercent($avgEngagement) }}</b>
            </div>
            <div class="stat">
                <span class="label">Latest outliers</span>
                <b>{{ number_format((int) data_get($latestTrend, 'outliers', 0)) }}</b>
            </div>
        </div>
    </section>

    <section class="grid-2">
        <div class="panel break-avoid">
            <h2>Tracker snapshot</h2>
            <table>
                <tbody>
                    <tr>
                        <th>Tracked account</th>
                        <td>{{ data_get($account, 'handle') ?: '-' }}</td>
                    </tr>
                    <tr>
                        <th>Followers</th>
                        <td>{{ $fmtCompact(data_get($account, 'followers')) }}</td>
                    </tr>
                    <tr>
                        <th>Own median views</th>
                        <td>{{ $fmtCompact(data_get($account, 'own_median_views')) }}</td>
                    </tr>
                    <tr>
                        <th>Recorded weeks</th>
                        <td>{{ number_format(count((array) data_get($insights, 'trend.points', []))) }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="panel break-avoid">
            <h2>Latest trend point</h2>
            <table>
                <tbody>
                    <tr>
                        <th>Week</th>
                        <td>{{ data_get($latestTrend, 'label') ?: '-' }}</td>
                    </tr>
                    <tr>
                        <th>Posts</th>
                        <td>{{ number_format((int) data_get($latestTrend, 'posts', 0)) }}</td>
                    </tr>
                    <tr>
                        <th>Views</th>
                        <td>{{ $fmtCompact(data_get($latestTrend, 'views')) }}</td>
                    </tr>
                    <tr>
                        <th>Engagement</th>
                        <td>{{ $fmtCompact(data_get($latestTrend, 'engagement')) }}</td>
                    </tr>
                    <tr>
                        <th>Engagement rate</th>
                        <td>{{ $fmtPercent(data_get($latestTrend, 'engagement_rate')) }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </section>

    <section class="grid-2">
        <div class="panel break-avoid">
            <h2>Top hashtags</h2>
            <div class="chips">
                @forelse($hashtags as $tag)
                    <span class="chip">#{{ $tag['tag'] ?? '' }} · {{ (int) ($tag['posts'] ?? 0) }} posts</span>
                @empty
                    <span class="muted">No hashtag data yet.</span>
                @endforelse
            </div>
        </div>

        <div class="panel break-avoid">
            <h2>Top sounds</h2>
            <div class="chips">
                @forelse($sounds as $sound)
                    <span class="chip">{{ $sound['label'] ?? '' }} · {{ (int) ($sound['posts'] ?? 0) }} posts</span>
                @empty
                    <span class="muted">No sound data yet.</span>
                @endforelse
            </div>
        </div>
    </section>

    <section class="section break-avoid">
        <h2>Top matched videos</h2>
        <div class="panel">
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Creator</th>
                        <th>Title</th>
                        <th>Views</th>
                        <th>Outlier</th>
                        <th>Eng. rate</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($results as $video)
                        <tr>
                            <td>{{ (int) ($video['rank'] ?? $loop->iteration) }}</td>
                            <td>
                                <strong>{{ $video['handle'] ?? $video['creator_name'] ?? '-' }}</strong>
                                @if(! empty($video['is_new_breakout']))
                                    <div class="good">New breakout</div>
                                @endif
                            </td>
                            <td>{{ \Illuminate\Support\Str::limit((string) ($video['title'] ?? '-'), 90) }}</td>
                            <td>{{ $fmtCompact($video['views'] ?? null) }}</td>
                            <td>
                                {{ is_numeric($video['outlier_multiple'] ?? null) ? rtrim(rtrim(number_format((float) $video['outlier_multiple'], 2), '0'), '.').'x' : '-' }}
                            </td>
                            <td>{{ $fmtPercent($video['engagement_rate'] ?? null) }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </section>

    <p class="foot">
        Generated from the saved-search results page on {{ now()->format('M j, Y') }}.
        This export uses the same report payload as the live search detail view and is intended for browser PDF save/print.
    </p>
</div>

@if($print)
    <script>
        window.addEventListener('load', function () {
            window.setTimeout(function () {
                window.print();
            }, 150);
        });
    </script>
@endif
</body>
</html>
