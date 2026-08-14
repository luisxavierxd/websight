# websight

Renderiza una página web (URL o ruta local) con Chromium headless y devuelve un
**screenshot optimizado como bloque `image_url` compatible con la API de mensajes de
Anthropic**, para que un LLM pueda "ver" el resultado de código web. Sirve como
**microservicio HTTP** y como **CLI** global.

Motor: [Playwright](https://playwright.dev/) (Chromium). La imagen se optimiza siempre
para consumo por un LLM: se reduce a **máx 1080 px en el lado largo** y se codifica
**JPEG calidad 80** (el tamaño final en KB se registra en stderr).

## Instalación

Requiere Node.js ≥ 20. El `postinstall` descarga Chromium automáticamente.

Instalar el CLI global directo desde GitHub:

```bash
npm install -g github:luisxavierxd/websight
```

O clonar el repo para trabajarlo localmente:

```bash
git clone https://github.com/luisxavierxd/websight.git
cd websight
npm install
npm link             # (opcional) expone el bin `websight` global
```

## CLI

```bash
# Renderiza y guarda un JPEG
websight render <url|ruta-absoluta> [--viewport mobile|desktop] [--delay-ms N] [--out captura.jpg]

# Emite el data-URI a stdout en vez de a un archivo
websight render http://localhost:3000 --viewport mobile --base64

# Levanta el microservicio HTTP
websight serve [--port N]        # por defecto 8787
```

- `--out FILE` escribe el JPEG a disco. `--base64` emite el data-URI
  (`data:image/jpeg;base64,…`) a stdout. Debes pasar al menos uno de los dos.
- `--delay-ms N` espera N ms tras cargar la página (acotado a 10 s como techo).

Sin instalar globalmente, sustituye `websight` por `node cli.js`.

## HTTP

```
POST /api/v1/skills/websight/render
{ "target_url": "http://localhost:3000", "viewport": "mobile", "delay_ms": 300 }
```

Respuesta `200`:

```json
{ "type": "image_url", "image_url": { "url": "data:image/jpeg;base64,..." } }
```

Errores: body inválido / no-objeto, `viewport` no soportado o `target_url` ausente →
`400 { "error": ... }`; fallo de render → `500`; cualquier otra ruta → `404`.

## Viewports

| Nombre    | Tamaño     |
|-----------|------------|
| `mobile`  | 390 × 844  |
| `desktop` | 1280 × 1600 |

Las capturas honran `prefers-reduced-motion: reduce` para resultados estables.

## Tests

```bash
npm test             # node --test (optimize, render, cli, server)
```

## Alcance

Es una herramienta local de cero configuración y sin claves. No incluye allow-list de
hosts (SSRF), tope de tamaño de request ni límite de concurrencia: está pensada para
uso en `localhost`. No la expongas a llamadas no confiables sin añadir ese endurecimiento.

## Licencia

[MIT](LICENSE) © 2026 Luis Xavier García Pimentel Ascencio
