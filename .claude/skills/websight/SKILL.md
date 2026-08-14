---
name: websight
description: Renderiza una página web (URL o ruta local absoluta) y devuelve un screenshot optimizado como bloque image_url de Anthropic, para "ver" el resultado de código web. Úsalo cuando necesites verificar visualmente una UI, un cambio de CSS/layout, o el render de una página antes de dar algo por bueno.
version: 0.1.0
author: Luis Xavier García Pimentel Ascencio
license: MIT
---

# websight

Da visión sobre el render real de código web: captura una página con Chromium
headless y devuelve la imagen optimizada para consumo por un LLM (máx 1080 px en el
lado largo, JPEG calidad 80).

## Cuándo usarlo

- Verificar visualmente una UI/página tras escribir o cambiar HTML/CSS/JS.
- Comprobar responsive: capturar en `mobile` y `desktop`.
- QA visual dentro de un loop (código → captura → crítica).

## Prerrequisito

Requiere el CLI `websight` disponible en el sistema:

```bash
npm install -g github:luisxavierxd/websight
```

(Si falla el symlink global en Windows, clona el repo y `npm link`.)

## Cómo invocarlo

Renderiza y obtén el data-URI (ideal para pasarlo como imagen a un modelo con visión):

```bash
websight render <url|ruta-absoluta> --viewport mobile|desktop --base64
```

O guarda un archivo para inspección:

```bash
websight render http://localhost:3000 --viewport desktop --out captura.jpg
```

- Páginas que necesitan servidor: arranca uno (p.ej. `python -m http.server 8000`) y
  apunta a la URL; para un `.html` suelto usa su ruta absoluta.
- `--delay-ms N` espera antes de capturar (para animaciones); se acota a 10 s.

La salida `--base64` es exactamente un `data:image/jpeg;base64,…`, que encaja como
content-part `image_url` en una API OpenAI/Anthropic-compatible.

## Viewports

- `mobile`  390×844
- `desktop` 1280×1600
