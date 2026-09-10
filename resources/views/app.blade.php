<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        @php
            $gtmContainerId = (string) config('services.analytics.gtm_container_id', '');
            $analyticsEnabled = (bool) config('services.analytics.enabled') && $gtmContainerId !== '';
        @endphp
        <link rel="icon" type="image/svg+xml" href="{{ asset('brand-beacon-logo.svg') }}">
        <link rel="shortcut icon" href="{{ asset('brand-beacon-logo.svg') }}">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        {{-- Brand Beacon is light only — the dark theme was retired with the
             rebrand. Clear any theme class a returning visitor's browser stored
             from the old build so nothing paints dark. --}}
        <script>
            (function () {
                try {
                    document.documentElement.classList.remove('dark');
                    localStorage.removeItem('vvf-theme');
                } catch (e) {}
            })();
        </script>

        {{-- Figtree is the whole brand typeface, self-hosted via the Vite
             fonts plugin (@fonts). Space Mono drives the numeric figures in the
             analytics/tracker detail. --}}
        @fonts
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">

        @if ($analyticsEnabled)
            <script>
                window.dataLayer = window.dataLayer || [];
            </script>
            <script>
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});
                var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
                j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer',@json($gtmContainerId));
            </script>
        @endif

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.jsx'])
        @inertiaHead
    </head>
    <body class="min-h-screen bg-canvas text-ink antialiased">
        @if ($analyticsEnabled)
            <noscript>
                <iframe src="https://www.googletagmanager.com/ns.html?id={{ $gtmContainerId }}" height="0" width="0" style="display:none;visibility:hidden"></iframe>
            </noscript>
        @endif
        @inertia
    </body>
</html>
