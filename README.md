# websight

Microservicio + CLI en Node que renderiza una página web y devuelve un screenshot
optimizado como bloque `image_url` compatible con la API de mensajes de Anthropic.

## Instalación

    npm install          # descarga Chromium vía postinstall
    npm link             # (opcional) expone el bin `websight` global

## Uso

Ver `SKILL.md`. Ejemplos rápidos:

    node cli.js render http://localhost:3000 --viewport mobile --out shot.jpg
    node cli.js serve --port 8787

## Tests

    npm test             # node --test (optimize, render, cli, server)

## Optimización

Nunca devuelve resolución nativa: reduce a máx 1080 px en el lado largo y codifica
JPEG calidad 80. El tamaño final en KB se registra en stderr.
