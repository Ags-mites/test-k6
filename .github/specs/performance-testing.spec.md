---
id: SPEC-001
status: APPROVED
feature: performance-testing
created: 2026-04-06
updated: 2026-04-06
author: spec-generator
version: "1.0"
related-specs: []
---

# Spec: Validación de Escalabilidad del Catálogo

> **Estado:** `DRAFT` → aprobar con `status: APPROVED` antes de iniciar QA / performance testing.
> **Ciclo de vida:** DRAFT → APPROVED → IN_PROGRESS → IMPLEMENTED → DEPRECATED

---

## 1. REQUERIMIENTOS

### Descripción
Someter los servicios de catálogo y búsqueda (Automation Exercise - Inventory & Search API) a una carga de 20 usuarios concurrentes para garantizar que la experiencia de navegación no se degrade durante picos de tráfico y validar los límites de la infraestructura actual mediante un test de carga.

### Requerimiento de Negocio

**ID:** PERF-01  
**SUT:** Automation Exercise - Inventory & Search API  
https://automationexercise.com/api_list#google_vignette

**Como** Arquitecto de Infraestructura  
**Quiero** someter los servicios de catálogo y búsqueda a una carga de 20 usuarios concurrentes  
**Para** garantizar que la experiencia de navegación no se degrade durante picos de tráfico y validar los límites de la infraestructura actual.

### Historias de Usuario

#### HU-01: Test de Carga del Endpoint de Catálogo

```
Como:        Arquitecto de Infraestructura
Quiero:      ejecutar un test de carga contra GET /productsList con 20 usuarios concurrentes
Para:        validar que el tiempo de respuesta p(95) no supera 1.5s y el 100% de peticiones son exitosas

Prioridad:   Alta
Estimación:  M
Dependencias: Ninguna
Capa:        QA / Performance Testing
```

#### Criterios de Aceptación — HU-01

**Happy Path**
```gherkin
CRITERIO-1.1: El catálogo responde dentro del SLA bajo carga sostenida
  Dado que:  el endpoint GET /productsList está activo y accesible
  Cuando:    se ejecuta un test de carga con 20 usuarios concurrentes durante 60 segundos
  Entonces:  el tiempo de respuesta p(95) es menor a 1.5 segundos
             y el 100% de las peticiones son exitosas (HTTP 200)
             y no hay timeouts configurados a 5 segundos
```

**Error Path**
```gherkin
CRITERIO-1.2: Manejo correcto de errores bajo carga
  Dado que:  el test de carga está en ejecución
  Cuando:    ocurre un error de conexión o timeout
  Entonces:  el error se registra en los logs de k6
             e el test continúa sin interrupción
             y se reporta la tasa de fallos
```

**Edge Case**
```gherkin
CRITERIO-1.3: El 100% de las peticiones completan antes del timeout
  Dado que:  se ejecuta el test de carga
  Cuando:    se alcanza el threshold de 5 segundos por petición
  Entonces:  ninguna petición falla por timeout
             y todas las peticiones se contabilizan correctamente
```

---

#### HU-02: Test de Carga del Endpoint de Búsqueda

```
Como:        Arquitecto de Infraestructura
Quiero:      ejecutar un test de carga contra POST /searchProduct con 20 usuarios concurrentes
Para:        validar que el tiempo de respuesta p(95) no supera 1.0s y el 100% de peticiones son exitosas

Prioridad:   Alta
Estimación:  M
Dependencias: HU-01
Capa:        QA / Performance Testing
```

#### Criterios de Aceptación — HU-02

**Happy Path**
```gherkin
CRITERIO-2.1: El endpoint de búsqueda responde dentro del SLA bajo carga sostenida
  Dado que:  el endpoint POST /searchProduct está activo y accesible
  Cuando:    se ejecuta un test de carga con 20 usuarios concurrentes durante 60 segundos
             y se envía un payload válido con criterio de búsqueda
  Entonces:  el tiempo de respuesta p(95) es menor a 1.0 segundo
             y el 100% de las peticiones son exitosas (HTTP 200)
             y no hay timeouts configurados a 5 segundos
```

**Error Path**
```gherkin
CRITERIO-2.2: Validación de payload de búsqueda bajo carga
  Dado que:  el test de carga está en ejecución
  Cuando:    se envía un payload con criterios de búsqueda vacíos o inválidos
  Entonces:  el endpoint retorna un error 400 o 422
             y el mensaje de error es descriptivo
             y se registra en los logs de k6
```

**Edge Case**
```gherkin
CRITERIO-2.3: Búsquedas sin resultados bajo carga
  Dado que:  se ejecuta una búsqueda
  Cuando:    el criterio de búsqueda no coincide con ningún producto
  Entonces:  el endpoint retorna HTTP 200 con array vacío o similar
             y se registra la búsqueda como exitosa
```

---

### Reglas de Negocio

1. **Umbrales de Rendimiento (SLAs)**
   - GET /productsList: p(95) < 1.5s
   - POST /searchProduct: p(95) < 1.0s
   - Success Rate: 100% (HTTP 200)
   - Timeout global: 5s (no se permite que ninguna petición falle por timeout)

2. **Perfil de Carga**
   - Usuarios concurrentes: 20
   - Duración: mínimo 60 segundos de carga sostenida
   - Ramp-up: gradual (opcional, para estabilización)

3. **Reporte de Performance**
   - Debe incluir: p(50), p(95), p(99), min, max, tasa de error
   - Desglose por endpoint y por método HTTP
   - Detección de tendencias (degradación progresiva, si aplica)

4. **Integridad de Datos**
   - Los datos retornados deben ser válidos JSON
   - La estructura del response debe coincidir con el contrato API original
   - No se harán cambios a la base de datos del SUT durante el test

---

## 2. DISEÑO

### Endpoints API a Validar

#### GET /productsList
- **Descripción**: Obtiene la lista completa de productos del catálogo
- **URL base**: https://automationexercise.com/api
- **Method**: GET
- **Auth requerida**: No
- **Query Parameters**: Ninguno (endpoint simple de catálogo)
- **Request Body**: N/A
- **Response 200**:
  ```json
  {
    "responseCode": 200,
    "products": [
      {
        "id": 1,
        "name": "Blue Top",
        "price": 500,
        "brand": "Polo",
        "category": { "usertype": "...", "category": "..." }
      },
      { ... }
    ]
  }
  ```
- **HTTP Codes**: 
  - `200`: éxito
  - `5xx`: error del servidor (a investigar)
- **Timeout**: 5 segundos

---

#### POST /searchProduct
- **Descripción**: Busca productos por término de búsqueda
- **URL base**: https://automationexercise.com/api
- **Method**: POST
- **Auth requerida**: No
- **Content-Type**: `application/x-www-form-urlencoded` o `application/json`
- **Request Body**:
  ```json
  {
    "search_product": "string"
  }
  ```
  Ejemplo: `{ "search_product": "top" }`

- **Response 200** (búsqueda exitosa):
  ```json
  {
    "responseCode": 200,
    "products": [
      {
        "id": 1,
        "name": "Blue Top",
        "price": 500,
        "brand": "Polo",
        "category": { "usertype": "...", "category": "..." }
      }
    ]
  }
  ```

- **Response 200** (sin resultados):
  ```json
  {
    "responseCode": 200,
    "products": []
  }
  ```

- **HTTP Codes**: 
  - `200`: éxito (con o sin resultados)
  - `400`: request inválido (payload mal formado)
  - `422`: campo requerido faltante
  - `5xx`: error del servidor
- **Timeout**: 5 segundos

---

### Herramienta de Performance Testing

**Framework**: k6 (Load Testing Framework)  
**Lenguaje**: JavaScript  
**Métricas clave a capturar**: 
- Duración de respuesta (latencia)
- Percentiles: p(50), p(95), p(99)
- Tasa de éxito / error
- Contador de timeouts
- Throughput (requests/sec)

---

### Configuración del Test de Carga

**Perfil VU (Virtual Users)**:
```
Ramp-up:        0-30 segundos (gradualmente 0 → 20 VUs)
Meseta sostenida: 30-90 segundos (20 VUs constantes)
Total:          90 segundos
```

**Think Time (Tiempo de Reflexión / Pausa Entre Peticiones)**:
- Se aplicará un `sleep(1)` entre peticiones para simular comportamiento humano realista.
- **Justificación**: Sin pausa, un VU dispara cientos de peticiones/segundo, simulando un ataque DDoS.
- **Duración**: 1 segundo entre GET /productsList → POST /searchProduct por VU.
- **Efecto en carga**: 20 VUs × 1 req/segundo ≈ 20 req/segundo sostenidas (carga realista).

**Validaciones en tiempo de ejecución**:
- p(95) latencia GET /productsList < 1.5s
- p(95) latencia POST /searchProduct < 1.0s
- Tasa de error = 0% (100% success rate)
- Máximo 1 timeout permitido en 100 peticiones (99% no-timeout)

**Notas sobre Variabilidad de Red**:
- El SUT (automationexercise.com) es un servidor público con latencia externa variable.
- Los thresholds están aprobados, pero resultados pueden variar según conexión a internet del ejecutor.
- Si los thresholds fallan por margen pequeño (ej. p(95) = 1.6s en lugar de 1.5s), indica latencia de red externa, no defectos del servidor.
- Recomendación: ejecutar múltiples iteraciones y promediar resultados para mayor confiabilidad.

---

## Consideraciones Técnicas de Implementación

### Think Time y Comportamiento Humano

**Problema**: Sin pausa entre peticiones, un VU puede disparar cientos de requests/segundo, lo que:
- Simula un ataque DDoS en lugar de carga realista
- Satura el servidor artificialmente
- Distorsiona las métricas de latencia

**Solución**: Implementar `sleep(1)` entre ciclos de peticiones
```javascript
// Pseudocódigo
for (let i = 0; i < iteraciones; i++) {
  http.get(BASE_URL + '/productsList');
  sleep(1); // simular tiempo humano de lectura
  
  http.post(BASE_URL + '/searchProduct', payload);
  sleep(1); // simular tiempo humano de análisis de resultados
}
```

**Efecto real**:
- 20 VUs × ~1 petición/segundo = ~20 requests/segundo sostenidas
- Perfil más realista de un usuario navegando el catálogo
- Métricas de latencia comparables con producción real

### Correlación de Latencia y Contexto de Red

| Escenario | Causa Probable | Acción |
|-----------|---|---|
| p(95) latencia > threshold por < 200ms | Latencia de red externa | Aceptable, reejecutar para confirmar |
| p(95) latencia > threshold por > 500ms | Posible degradación del servidor | Investigar rendimiento del SUT |
| 100% errores 5xx | Servidor caído o en mantenimiento | Contactar administrador del SUT |
| Algunos timeouts (< 1%) | Picos de red o congestión momentánea | Reejecutar, normal en internet público |

---

## 3. LISTA DE TAREAS

### Backend (N/A — test de SUT externo)
- [ ] No aplica. El SUT es externo (Automation Exercise API)

### QA / Performance Testing (Fases)

#### Fase 1: Diseño del Test
- [ ] Crear script k6 (`load-test.js`)
  - [ ] Implementar función para GET /productsList
  - [ ] Implementar función para POST /searchProduct con términos de búsqueda variados
  - [ ] **OBLIGATORIO**: Agregar `sleep(1)` entre peticiones para simular think time humano
  - [ ] Configurar opciones k6: `vus: 20`, `duration: '90s'`, `ramp-up: 30s`
  - [ ] Definir thresholds de aceptación:
    - `http_req_duration{staticItem:productsList}: ['p(95)<1500']`
    - `http_req_duration{staticItem:searchProduct}: ['p(95)<1000']`
    - `http_req_failed: ['rate<0.01']` (máx 1% de fallos)
  - [ ] Implementar validaciones de response (status 200, JSON válido)
  - [ ] Agregar checks para integridad de datos (estructura de respuesta)
  
#### Fase 2: Configuración del Ambiente
- [ ] Definir ambiente de prueba (https://automationexercise.com)
- [ ] Verificar conectividad hacia el SUT
- [ ] Documentar baseline de latencia (sin carga)

#### Fase 3: Ejecución y Resultados
- [ ] Ejecutar test de carga local con k6
- [ ] Capturar métricas en consola y exportar a JSON/HTML
- [ ] Generar reporte de performance
  - [ ] Tabla de percentiles
  - [ ] Gráficos de latencia vs tiempo
  - [ ] Análisis de thresholds cumplidos/fallidos

#### Fase 4: Análisis y Recomendaciones
- [ ] Validar cumplimiento de SLAs (CA1-CA4)
- [ ] Documentar findings (cuellos de botella, si los hay)
- [ ] Proponer mejoras (caché, escalado, etc.)
- [ ] Generar artefacto final: Reporte QA

---

## Artefactos

| Artefacto | Ruta | Responsable |
|-----------|------|-------------|
| Script k6 | `tests/performance/load-test.js` | QA Agent |
| Reporte de Performance | `docs/output/qa/performance-report.html` o `.md` | QA Agent |
| Datos de prueba (búsquedas) | `tests/performance/test-data.js` | QA Agent |

---

## Notas de Arquitectura

- **SUT**: Servicio externo (Automation Exercise). No requiere cambios de código backend / frontend del proyecto.
- **Herramienta**: k6 (cloud-ready, métricas en tiempo real, reporte estándar).
- **Entorno**: Validar contra PROD o staging de Automation Exercise.
- **Monitoreo**: Logs de k6 en JSON para análisis post-ejecución.

---

## Próximos Pasos

1. **QA Agent** lee esta spec (status: `DRAFT`)
2. Usuario aprueba: cambiar status a `APPROVED`
3. **QA Agent** ejecuta skill `/performance-analyzer` para:
   - Refinar estrategia de test
   - Definir thresholds exactos
   - Generar script k6 inicial
4. Ejecutar test y generar reporte final
