
Historia de Usuario: Validación de Escalabilidad del Catálogo
ID: PERF-01

SUT: Automation Exercise - Inventory & Search API https://automationexercise.com/api_list#google_vignette

Como Arquitecto de Infraestructura
Quiero someter los servicios de catálogo y búsqueda a una carga de 20 usuarios concurrentes
Para garantizar que la experiencia de navegación no se degrade durante picos de tráfico y validar los límites de la infraestructura actual.

Criterios de Aceptación (Thresholds):
[ ] CA1: El tiempo de respuesta p(95) para la obtención del catálogo (GET /productsList) debe ser < 1.5s.
[ ] CA2: El tiempo de respuesta p(95) para la búsqueda (POST /searchProduct) debe ser < 1.0s.
[ ] CA3: Success Rate: El 100% de las peticiones deben ser exitosas (HTTP 200).
[ ] CA4: Resource Integrity: Ninguna petición debe fallar por Timeout (configurado a 5s).