<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

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
             fonts plugin (@fonts). Bricolage + Space Mono still drive the
             analytics/tracker detail until that screen is ported. --}}
        @fonts
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.jsx'])
        @inertiaHead
    </head>
    <body class="min-h-screen bg-canvas text-ink antialiased">
        @inertia
    </body>
</html>
