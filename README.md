# Performance Tests - k6

## Scripts

| Script | Descripción |
|--------|-------------|
| `load-test.js` | Load test con 20 VUs, 90s duración (30s ramp-up + 60s sostenido) |

## Thresholds

| Endpoint | p(95) | p(99) | Timeout |
|----------|-------|-------|---------|
| GET /productsList | < 1.5s | < 2.0s | 5s |
| POST /searchProduct | < 1.0s | < 1.5s | 5s |
| Error Rate | < 1% | - | - |

## Ejecución

```bash
# Local con UI
k6 run tests/performance/load-test.js

# Local sin UI
k6 run --no-thresholds tests/performance/load-test.js

# Exportar resultados a JSON
k6 run --export-json results.json tests/performance/load-test.js
```

## Requisitos

```bash
# Instalar k6
brew install k6  # macOS
# o
sudo apt install k6  # Ubuntu/Debian
```

## Links

- Documentación k6: https://k6.io/docs/
- SUT: https://automationexercise.com/api
