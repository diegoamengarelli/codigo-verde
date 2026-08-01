# Código Verde — Contexto del Proyecto

## 1. Resumen

**Código Verde** es una plataforma municipal para coordinar ambulancias, cámaras de tránsito y semáforos durante una emergencia.

El sistema recibe una misión, analiza el estado del tránsito, recomienda una ruta prioritaria y simula la preparación progresiva de los cruces para que la ambulancia pueda llegar más rápido y de forma más segura.

La propuesta no busca reemplazar Google Maps. Su diferencial es que no solo observa el tránsito: permite que la ciudad intervenga sobre él.

> Google Maps le dice a la ambulancia por dónde ir. Código Verde prepara la ciudad para que pueda llegar.

---

## 2. Problema

Una ambulancia puede recibir una ruta rápida, pero aun así perder tiempo por:

- Semáforos en rojo.
- Filas extensas.
- Intersecciones bloqueadas.
- Incidentes repentinos.
- Calles parcialmente obstruidas.
- Cambios de tránsito no reflejados de inmediato.
- Falta de coordinación entre la ambulancia y el centro municipal.

Las aplicaciones de navegación tradicionales optimizan según el tránsito existente, pero no controlan la infraestructura urbana ni coordinan cruces semafóricos.

Código Verde responde:

> ¿Qué ruta puede preparar la ciudad para que la ambulancia llegue antes, sin generar riesgos innecesarios ni paralizar el tránsito general?

---

## 3. Objetivo del MVP

Construir una demo visual, estable y navegable que muestre el flujo completo entre:

1. Una ambulancia.
2. Una plataforma municipal.
3. Cámaras de tránsito.
4. Intersecciones semaforizadas.
5. Una ruta prioritaria.
6. Un evento inesperado.
7. Un recálculo de ruta.
8. Una comparación antes/después.

El MVP debe demostrar una sola hipótesis:

> Utilizando información visual del tránsito y coordinación municipal, una ambulancia puede recibir una ruta que la ciudad ayuda activamente a despejar.

---

## 4. Alcance

### Incluido

- Dashboard municipal.
- Vista móvil para la ambulancia.
- Mapa esquemático.
- Ambulancia simulada.
- Cuatro intersecciones.
- Tres cámaras.
- Estados semafóricos simulados.
- Ruta normal.
- Ruta optimizada.
- Evento de bloqueo.
- Recálculo de ruta.
- Videos procesados previamente.
- Métricas agregadas de tránsito.
- Comparación de resultados.
- Datos ficticios de demostración.

### Fuera de alcance

- Control real de semáforos.
- Acceso a cámaras municipales.
- Geolocalización real continua.
- Aplicación móvil nativa.
- Reconocimiento de patentes.
- Reconocimiento facial.
- Entrenamiento de un modelo propio.
- Integración completa con Google Navigation SDK.
- Integración con centrales de emergencias reales.
- Autenticación institucional.
- Rutas reales de toda Rosario.

---

## 5. Usuarios

### Operador municipal

Utiliza el centro de control para:

- Recibir una emergencia.
- Consultar cámaras.
- Revisar la ruta recomendada.
- Aprobar el corredor.
- Seguir la ambulancia.
- Detectar incidentes.
- Simular ajustes.
- Medir el resultado.

### Conductor de ambulancia

Utiliza una vista móvil simple para:

- Consultar el destino.
- Ver el tiempo estimado.
- Seguir la ruta.
- Ver el próximo giro.
- Saber si el próximo cruce está coordinado.
- Recibir una actualización de ruta.
- Informar un bloqueo.
- Abrir el destino en Google Maps.

---

## 6. Flujo principal

### Paso 1: creación de misión

El operador registra:

- Ambulancia.
- Origen.
- Destino.
- Nivel de prioridad.
- Hospital de destino.

Ejemplo:

```text
Vehículo: Ambulancia 12
Origen: Base Francia
Destino: Hospital Provincial
Prioridad: Código rojo
```

### Paso 2: análisis de tránsito

Las cámaras aportan métricas agregadas:

- Cantidad de vehículos.
- Autos.
- Motos.
- Colectivos.
- Camiones.
- Longitud aproximada de fila.
- Ocupación de la intersección.
- Estado de congestión.
- Presencia de bloqueo.

### Paso 3: cálculo de ruta

Se comparan:

- Ruta convencional.
- Ruta prioritaria.
- Cruces que pueden prepararse.
- Incidentes.
- Impacto estimado en el tránsito general.

### Paso 4: aprobación

El operador pulsa:

```text
Activar corredor
```

### Paso 5: preparación semafórica

Cada intersección pasa por estos estados:

```text
NORMAL
PREPARANDO
PRIORIDAD ACTIVA
AMBULANCIA ATRAVESANDO
RECUPERANDO
NORMAL
```

### Paso 6: navegación

La ambulancia recibe:

- Ruta.
- ETA.
- Próximo giro.
- Próximo cruce.
- Estado de prioridad.
- Alertas.

### Paso 7: incidente

El operador pulsa:

```text
Simular bloqueo
```

El sistema:

- Bloquea un segmento.
- Descarta la ruta previa.
- Recalcula.
- Actualiza el ETA.
- Prepara otra intersección.
- Notifica a la ambulancia.

### Paso 8: resultados

Se muestran métricas antes y después.

Ejemplo:

```text
Tiempo sin Código Verde: 10 min 40 s
Tiempo con Código Verde: 8 min 22 s
Tiempo recuperado: 2 min 18 s
Cruces coordinados: 4
Demora agregada al tránsito: 34 s
```

---

## 7. Componentes del producto

## 7.1 Centro municipal

Ruta sugerida:

```text
/control
```

Debe incluir:

- Sidebar.
- Estado del sistema.
- Fecha y hora.
- Cámaras conectadas.
- Ambulancias activas.
- Intersecciones priorizadas.
- Tiempo recuperado.
- Mapa.
- Incidentes.
- Cronología.
- Panel de misión.
- Botones de simulación.

## 7.2 Nueva misión

Ruta:

```text
/missions/new
```

Campos:

- Ambulancia.
- Origen.
- Destino.
- Hospital.
- Prioridad.
- Botón para calcular.
- Botón para activar corredor.

## 7.3 Seguimiento de misión

Ruta:

```text
/missions/[id]
```

Debe incluir:

- Ambulancia en movimiento.
- Ruta activa.
- Cruces priorizados.
- ETA.
- Estado de cada intersección.
- Eventos.
- Comparación antes/después.
- Acción para simular bloqueo.
- Acción para reiniciar.

## 7.4 Vista de ambulancia

Ruta:

```text
/ambulance/[id]
```

Diseño mobile-first.

Mostrar únicamente:

- Destino.
- ETA.
- Próximo giro.
- Próximo cruce.
- Estado de prioridad.
- Progreso.
- Avisos.
- Botón de inicio.
- Botón de bloqueo.
- Botón para abrir Google Maps.

## 7.5 Cámaras

Ruta:

```text
/cameras
```

Mostrar:

- Feed simulado.
- Video anotado.
- Objetos detectados.
- Conteos.
- Ocupación.
- Fila.
- Estado.
- Última actualización.
- Etiqueta de datos demostrativos.

## 7.6 Resultados

Ruta:

```text
/analytics
```

Mostrar:

- Tiempo normal.
- Tiempo optimizado.
- Tiempo recuperado.
- Cruces coordinados.
- Demora agregada.
- Incidentes detectados.
- Variación de ETA.
- Resumen de misión.

---

## 8. Arquitectura

```text
┌──────────────────────────────┐
│ Aplicación Next.js / Vercel  │
│                              │
│ Dashboard municipal          │
│ Vista ambulancia             │
│ Simulación                   │
│ Resultados                   │
└──────────────┬───────────────┘
               │
               │ JSON / API
               ▼
┌──────────────────────────────┐
│ Datos del MVP                │
│                              │
│ Intersecciones               │
│ Cámaras                      │
│ Ambulancias                  │
│ Misiones                     │
│ Eventos                      │
└──────────────┬───────────────┘
               │
               │ Métricas precalculadas
               ▼
┌──────────────────────────────┐
│ Pipeline Python              │
│                              │
│ YOLO / Roboflow Inference    │
│ Supervision                  │
│ ByteTrack                    │
│ LineZone                     │
│ PolygonZone                  │
└──────────────────────────────┘
```

---

## 9. Stack

### Frontend

- Next.js.
- App Router.
- TypeScript.
- Tailwind CSS.
- shadcn/ui.
- Lucide Icons.
- Recharts.
- Mapa esquemático o MapLibre/Leaflet.
- Estado local para el modo demo.

### Hosting

- Vercel.
- Proyecto generado y refinado con v0.
- Repositorio GitHub.
- Deploy automático por commit.

### Visión artificial

- Python.
- Roboflow Supervision.
- YOLO o Roboflow Inference.
- ByteTrack.
- PolygonZone.
- LineZone.
- Videos preprocesados.

### Persistencia futura

- Neon Postgres.
- Vercel Blob.
- Route Handlers de Next.js.

Para el MVP inicial, la base puede reemplazarse por archivos TypeScript con datos mock.

---

## 10. Uso de Roboflow Supervision

La librería se utilizará fuera de Vercel para procesar videos previamente.

### Objetos

- Car.
- Motorcycle.
- Bus.
- Truck.
- Person.

### Tracking

ByteTrack asignará un identificador persistente a cada vehículo.

### LineZone

Permitirá contar vehículos que cruzan una línea virtual.

Ejemplo:

```text
Sentido oeste-este: 27
Sentido este-oeste: 14
```

### PolygonZone

Permitirá medir:

- Vehículos dentro de un carril.
- Cantidad en la zona de espera.
- Ocupación.
- Intersección bloqueada.
- Longitud aproximada de fila.

### Salidas

Por cada cámara:

```text
camera-01-annotated.mp4
camera-01-metrics.json
```

Ejemplo de JSON:

```json
{
  "cameraId": "CAM-01",
  "intersectionId": "INT-01",
  "timestamp": "2026-08-01T12:30:00-03:00",
  "vehicleCount": 27,
  "motorcycles": 8,
  "buses": 2,
  "trucks": 1,
  "queueLength": 14,
  "occupancy": 0.78,
  "status": "congested",
  "blockedIntersection": false
}
```

---

## 11. Modelo de datos

### Intersection

```ts
type Intersection = {
  id: string
  name: string
  latitude: number
  longitude: number
  congestion: "clear" | "moderate" | "congested" | "critical"
  signalState:
    | "normal"
    | "preparing"
    | "priority"
    | "crossing"
    | "recovering"
  cameraId?: string
}
```

### Mission

```ts
type Mission = {
  id: string
  ambulanceId: string
  origin: Coordinates
  destination: Coordinates
  priority: "low" | "medium" | "critical"
  normalEtaSeconds: number
  optimizedEtaSeconds: number
  status: "pending" | "active" | "completed"
  route: RoutePoint[]
  prioritizedIntersections: string[]
}
```

### CameraMetrics

```ts
type CameraMetrics = {
  cameraId: string
  timestamp: string
  vehicleCount: number
  motorcycles: number
  buses: number
  trucks: number
  queueLength: number
  occupancy: number
  blockedIntersection: boolean
  status: "clear" | "moderate" | "congested" | "critical"
}
```

### Ambulance

```ts
type Ambulance = {
  id: string
  name: string
  status: "available" | "dispatched" | "en_route" | "arrived"
  currentPosition: Coordinates
  missionId?: string
}
```

### Event

```ts
type MissionEvent = {
  id: string
  missionId: string
  timestamp: string
  type:
    | "mission_created"
    | "corridor_activated"
    | "signal_preparing"
    | "signal_priority"
    | "intersection_crossed"
    | "blockage_detected"
    | "route_recalculated"
    | "mission_completed"
  message: string
}
```

---

## 12. Reglas de negocio del modo demo

### Estado de tránsito

```ts
function calculateTrafficStatus(
  vehicleCount: number,
  occupancy: number,
  queueLength: number
) {
  if (occupancy > 0.8 || queueLength >= 15) {
    return "critical"
  }

  if (occupancy > 0.6 || queueLength >= 10) {
    return "congested"
  }

  if (occupancy > 0.35) {
    return "moderate"
  }

  return "clear"
}
```

### Simulación semafórica

Cada cruce cambia de estado según la distancia estimada de la ambulancia:

```text
Más de 50 s: normal
Entre 50 y 20 s: preparando
Entre 20 y 5 s: prioridad activa
Durante el cruce: atravesando
Después del cruce: recuperando
Luego: normal
```

### Bloqueo

Al pulsar `Simular bloqueo`:

1. El tercer segmento cambia a bloqueado.
2. Se registra un evento.
3. Se descarta la ruta original.
4. Se activa una ruta alternativa.
5. Se incrementa el ETA.
6. Se cambia la próxima intersección.
7. Se notifica a la ambulancia.

---

## 13. Componentes reutilizables

```text
MunicipalMap
AmbulanceMarker
EmergencyRoute
IntersectionNode
TrafficSignal
CameraFeed
TrafficMetrics
MissionPanel
AmbulanceNavigation
RouteComparison
SimulationControls
EventTimeline
ImpactSummary
StatusBadge
MetricCard
IncidentList
```

---

## 14. Datos iniciales

```text
Cámaras activas: 3
Ambulancias activas: 1
Cruces coordinados: 4
Tiempo normal: 10 min 40 s
Tiempo optimizado: 8 min 22 s
Tiempo recuperado: 2 min 18 s
Demora agregada al tránsito: 34 s
```

Intersecciones ficticias inspiradas en Rosario:

- Pellegrini y Francia.
- Pellegrini y Oroño.
- Córdoba y Francia.
- Mendoza y Cafferata.

Los datos deben etiquetarse siempre como simulados y no deben presentarse como información oficial de la Municipalidad de Rosario.

---

## 15. Diseño visual

### Estilo

- Profesional.
- Municipal.
- Operativo.
- Claro.
- Sin estética futurista exagerada.
- Contraste alto en la vista de ambulancia.
- Estados fáciles de reconocer.

### Estados

- Verde: libre o confirmado.
- Amarillo: moderado o preparando.
- Naranja: congestionado o recuperando.
- Rojo: crítico o bloqueado.
- Azul: ambulancia o ruta prioritaria.

### Dashboard

- Sidebar.
- Métricas superiores.
- Mapa como elemento principal.
- Panel de misión.
- Cronología.
- Incidentes.
- Cámaras.

### Vista móvil

- Poco texto.
- Información grande.
- Instrucción principal visible.
- Estado del próximo cruce.
- ETA destacada.
- Botones grandes.

---

## 16. Integración con Google Maps

No se desarrollará un plugin dentro de Google Maps.

El MVP tendrá dos opciones:

### Navegación Código Verde

Ruta mostrada dentro de la propia PWA.

Permite visualizar:

- Corredor.
- Ambulancia.
- Cruces.
- Estados semafóricos.
- Alertas municipales.

### Abrir en Google Maps

Botón secundario que abre el destino mediante una URL de Google Maps.

La navegación principal del pitch será la vista propia de Código Verde.

---

## 17. Prompt base para v0

```text
Crea una aplicación web full-stack responsive llamada “Código Verde”.

Es una plataforma municipal de Rosario para coordinar ambulancias, cámaras de tránsito y semáforos durante emergencias. Debe ser una demostración con datos simulados, no debe afirmar que está conectada con infraestructura municipal real.

Tecnología:
- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide Icons
- Recharts
- estado de demostración en el frontend
- componentes reutilizables
- preparada para desplegar en Vercel

Crear dos experiencias:

1. Centro municipal de control
2. Aplicación móvil de la ambulancia

Centro municipal:
- sidebar
- mapa esquemático de Rosario
- ambulancias activas
- cuatro intersecciones
- tres cámaras
- segmentos de ruta
- estados de tránsito
- semáforos normales, preparando prioridad, prioridad activa y recuperando
- métricas superiores: ambulancias activas, cámaras conectadas, intersecciones priorizadas y tiempo recuperado
- panel de misión activa
- cronología de eventos
- lista de incidentes
- comparación entre tiempo normal y tiempo optimizado

Aplicación de ambulancia:
- diseño móvil simple y de alto contraste
- destino
- llegada estimada
- próximo giro
- próximo cruce coordinado
- estado de prioridad
- barra de progreso
- botón para iniciar navegación
- botón para informar bloqueo
- botón para abrir destino en Google Maps

Simulación:
- botón “Iniciar misión”
- la ambulancia debe avanzar automáticamente por la ruta
- cada intersección debe pasar por los estados normal, preparando, prioridad activa, ambulancia atravesando, recuperando y normal
- mostrar mensajes en la cronología
- botón “Simular bloqueo”
- cuando se activa, bloquear el tercer segmento, recalcular una ruta alternativa y actualizar la pantalla de la ambulancia
- permitir reiniciar la simulación

Datos iniciales:
- tiempo normal: 10 minutos 40 segundos
- tiempo optimizado: 8 minutos 22 segundos
- cuatro cruces coordinados
- demora agregada al tránsito general: 34 segundos
- tiempo recuperado: 2 minutos 18 segundos

Agregar una página de cámaras:
- tres feeds de video simulados
- overlays para vehículos
- cantidad de autos, motos, colectivos y camiones
- longitud de fila
- ocupación
- estado
- etiquetas que indiquen que los datos son demostrativos

Agregar una página de resultados:
- comparación antes/después
- tiempo recuperado
- intersecciones coordinadas
- demora al tránsito general
- eventos detectados
- gráfico simple de ETA durante la misión

La aplicación debe ser completamente navegable y tener un modo demo estable para presentar ante un jurado.
```

---

## 18. Orden de construcción

### Fase 1: interfaz

1. Dashboard municipal.
2. Mapa.
3. Ambulancia.
4. Intersecciones.
5. Ruta.
6. Métricas.
7. Panel de misión.

### Fase 2: simulación

1. Iniciar misión.
2. Movimiento automático.
3. Estados semafóricos.
4. Cronología.
5. Simular bloqueo.
6. Recálculo.
7. Reiniciar.

### Fase 3: ambulancia

1. Vista mobile-first.
2. ETA.
3. Próximo giro.
4. Próximo cruce.
5. Estado de prioridad.
6. Cambio de ruta.

### Fase 4: cámaras

1. Procesar videos.
2. Generar overlays.
3. Exportar JSON.
4. Reproducir videos.
5. Mostrar métricas.

### Fase 5: pitch

1. Preparar escenario.
2. Verificar modo demo.
3. Preparar antes/después.
4. Ensayar recorrido.
5. Cerrar con métricas.

---

## 19. Pitch

### Problema

> Una ambulancia puede tener una buena ruta, pero sigue perdiendo tiempo en filas, cruces bloqueados y semáforos. Las aplicaciones de navegación observan el tránsito; la ciudad puede intervenirlo.

### Solución

> Código Verde conecta ambulancia, cámaras y centro municipal para crear un corredor de prioridad dinámico.

### Demo

1. Crear misión.
2. Analizar cámaras.
3. Activar corredor.
4. Mostrar ambulancia.
5. Simular bloqueo.
6. Recalcular.
7. Completar recorrido.

### Resultado

> En la simulación, Código Verde recupera 2 minutos y 18 segundos, coordinando cuatro cruces y generando sólo 34 segundos de demora distribuida sobre el tránsito general.

### Cierre

> Google Maps le dice a la ambulancia por dónde ir. Código Verde prepara la ciudad para que pueda llegar.

---

## 20. Criterios de éxito

El MVP es exitoso si el jurado entiende, sin explicaciones técnicas extensas:

- Qué problema resuelve.
- Quién usa la plataforma.
- Cómo recibe información de las cámaras.
- Cómo se coordina la ambulancia.
- Cómo se preparan los cruces.
- Qué ocurre ante un bloqueo.
- Cuánto tiempo se recuperó.
- Por qué no es simplemente otro mapa.

---

## 21. Principios del proyecto

- No afirmar integraciones reales.
- No usar datos municipales como si fueran propios.
- No mostrar reconocimiento facial.
- No mostrar patentes.
- Priorizar métricas agregadas.
- Mantener las decisiones explicables.
- Simular reglas de seguridad.
- Mantener una experiencia simple para el conductor.
- Favorecer una demo estable sobre una arquitectura excesivamente compleja.
- Mostrar impacto medible.
