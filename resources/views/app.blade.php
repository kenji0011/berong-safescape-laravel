<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Prefetch loader images for later display (avoids console warnings) -->
        <link rel="prefetch" href="/berong_pr.png" as="image">
        <link rel="prefetch" href="/berong_logout.png" as="image">

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Figtree:wght@300;400;500;600;700&display=swap" rel="stylesheet">

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx'])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia

        <!-- Color Blindness SVG Filters -->
        <svg style="position: absolute; width: 0; height: 0; overflow: hidden;" aria-hidden="true" version="1.1" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <!-- Protanopia (Red-Blindness / Red-Weakness) -->
            <filter id="protanopia">
              <feColorMatrix type="matrix" values="0.567, 0.433, 0,     0, 0
                                                   0.558, 0.442, 0,     0, 0
                                                   0,     0.242, 0.758, 0, 0
                                                   0,     0,     0,     1, 0"/>
            </filter>
            <!-- Deuteranopia (Green-Blindness / Green-Weakness) -->
            <filter id="deuteranopia">
              <feColorMatrix type="matrix" values="0.625, 0.375, 0,     0, 0
                                                   0.7,   0.3,   0,     0, 0
                                                   0,     0.3,   0.7,   0, 0
                                                   0,     0,     0,     1, 0"/>
            </filter>
            <!-- Tritanopia (Blue-Blindness / Blue-Weakness) -->
            <filter id="tritanopia">
              <feColorMatrix type="matrix" values="0.95,  0.05,  0,     0, 0
                                                   0,     0.433, 0.567, 0, 0
                                                   0,     0.475, 0.525, 0, 0
                                                   0,     0,     0,     1, 0"/>
            </filter>
          </defs>
        </svg>
    </body>
</html>
