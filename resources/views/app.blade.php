<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        {{-- Apply the stored theme before first paint so there is no flash of the wrong theme. --}}
        <script>
            (function () {
                try {
                    var stored = localStorage.getItem('vvf-theme');
                    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    document.documentElement.classList.toggle('dark', (stored || (prefersDark ? 'dark' : 'light')) === 'dark');
                } catch (e) {}
            })();
        </script>

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.jsx'])
        @inertiaHead
    </head>
    <body class="min-h-screen bg-canvas text-ink antialiased dark:bg-canvas-dark dark:text-white">
        @inertia
    </body>
</html>
