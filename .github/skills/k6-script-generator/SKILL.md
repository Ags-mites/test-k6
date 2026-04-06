---
name: k6-script-generator
description: Genera scripts k6 de performance testing desde specs ASDD y el performance-plan.md. Lee los archivos de specs y el plan de performance, y genera scripts k6 listos para ejecutar.
argument-hint: "<nombre-feature | nombre-proyecto>"
---

# Skill: k6-script-generator [QA]

Genera scripts k6 de performance testing basados en specs ASDD y el performance-plan.

## Entrada OBLIGATORIA — Leer en paralelo

```
.github/specs/<feature>.spec.md    ← spec técnica con SLAs y endpoints
.github/requirements/<feature>.md  ← requerimientos de negocio
docs/output/qa/performance-plan.md  ← plan de performance (si existe)
```

**Si no existe performance-plan.md**, primero ejecutar `/performance-analyzer` para generarlo.

## Proceso de Generación

### 1. Extraer información del SPEC

Del spec, obtener:
- **Endpoints**: URLs, métodos HTTP, payloads, headers
- **SLAs**: p(50), p(95), p(99), success rate, timeouts
- **Perfil de carga**: VUs, duración, ramp-up, think time

### 2. Extraer información del Performance Plan

Del performance-plan.md:
- **Tipo de prueba**: Load, Stress, Spike, Soak
- **VUs y duración** definidos
- **Thresholds** adaptados

### 3. Generar script k6

Estructura del script generado:

```javascript
// tests/performance/<feature>-load-test.js

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

export const options = {
  vus: __VUS__,
  duration: '__DURATION__',
  thresholds: {
    'http_req_duration{endpoint:__ENDPOINT__}': ['p(95)<__THRESHOLD__'],
    'http_req_failed': ['rate<0.01'],
  },
};

const BASE_URL = '__BASE_URL__';

export default function () {
  // Request implementation
}
```

### 4. Estructura de archivos generados

```
tests/performance/
├── <feature>-load-test.js      ← script principal
├── <feature>-stress-test.js   ← si aplica stress
├── <feature>-spike-test.js     ← si aplica spike
├── test-data.js                ← datos de prueba
└── README.md                   ← instrucciones de ejecución
```

## Reglas de Implementación

- **Think time**: SIEMPRE agregar `sleep(1)` entre peticiones para simular comportamiento humano
- **Correlación**: Usar tags en requests para identificar endpoints en métricas: `{ endpoint: 'productsList' }`
- **Validaciones**: Incluir checks para status 200 y estructura JSON válida
- **Thresholds**: Tomados del SPEC (no usar valores por defecto)
- **Datos de prueba**: Generar payloads dinámicos (búsquedas variadas, etc.)

## Umbrales del SPEC vs Defecto

| Fuente | Métrica | Valor |
|--------|---------|-------|
| SPEC | p(95) GET /productsList | < 1.5s |
| SPEC | p(95) POST /searchProduct | < 1.0s |
| SPEC | Success Rate | 100% |
| SPEC | Timeout | 5s |
| Defecto | p(50) | < 200ms |
| Defecto | p(99) | < 2000ms |

## Comandos de Ejecución

```bash
# Ejecución local conUI
k6 run tests/performance/<feature>-load-test.js

# Ejecución con métricas en Cloud
k6 run --out cloud tests/performance/<feature>-load-test.js

# Exportar resultados
k6 run --export-json results.json tests/performance/<feature>-load-test.js
```

## Entregables

1. Script(s) k6 en `tests/performance/`
2. Archivo `test-data.js` con datos de prueba
3. Archivo `README.md` con instrucciones y comandos

## Restricciones

- NO ejecutar contra producción (usar staging o ambiente de prueba)
- NO hardcodear secretos o credenciales en scripts
- SIEMPRE documentar los thresholds usados (referencia al SPEC)
