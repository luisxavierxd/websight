---
name: websight
description: Renderiza una página web (URL o ruta local) y devuelve un screenshot optimizado como bloque image_url de Anthropic, para que un LLM "vea" el resultado de código web. Microservicio HTTP + CLI global.
version: 0.1.0
author: Luis Xavier García Pimentel Ascencio
---

# websight

Servicio de doble propósito para dar visión a un LLM sobre el render de código web.
Motor: Playwright (Chromium). Optimiza siempre la imagen para consumo por LLM
(máx 1080 px en el lado largo, JPEG calidad 80).

## CLI

    websight render <url|ruta-absoluta> [--viewport mobile|desktop] [--delay-ms N] [--out captura.jpg]
    websight render http://localhost:3000 --viewport mobile --base64
    websight serve [--port N]        # por defecto 8787

- `--out FILE`   escribe el JPEG a disco.
- `--base64`     emite el data-URI (`data:image/jpeg;base64,…`) a stdout.
- Debes pasar `--out` o `--base64` (o ambos). `--delay-ms` se acota a 10 s.

## HTTP

    POST /api/v1/skills/websight/render
    { "target_url": "http://localhost:3000", "viewport": "mobile", "delay_ms": 300 }

Respuesta:

    { "type": "image_url", "image_url": { "url": "data:image/jpeg;base64,..." } }

## Viewports

- `mobile`  390×844
- `desktop` 1280×1600

Las capturas honran `prefers-reduced-motion: reduce` para resultados estables.
