# Performance Testing Suite - k6 
Automatización de pruebas de carga y rendimiento para los servicios críticos de Automation Exercise utilizando k6 (Grafana). Esta suite se enfoca en validar la resiliencia y los tiempos de respuesta del catálogo bajo condiciones de tráfico concurrente.

# Descripción del Proyecto
Este proyecto implementa una estrategia de Load Testing basada en el comportamiento real del usuario (User Journey). No solo disparamos peticiones aisladas, sino que simulamos el flujo de navegación: Consulta de Catálogo ➔ Tiempo de Reflexión ➔ Búsqueda de Producto.Características Principales:User Journey Simulation: Flujos encadenados de GET y POST.SLA Enforcement: Uso estricto de Thresholds (Umbrales) para detectar degradación de performance.Performance Metrics: Monitoreo detallado de percentiles $p(50)$, $p(95)$ y $p(99)$.Scalability Testing: Perfil de carga con Ramp-up y Ramp-down para observar la recuperación del sistema.

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
