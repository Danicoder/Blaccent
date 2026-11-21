# Blaccent — Instrucciones del agente

## Contexto
Blaccent es una PWA interna y responsive para que empleados de Accenture compartan desplazamientos habituales en coche hasta su oficina en Panoramis (Alicante). No es un servicio profesional de transporte ni debe generar beneficios económicos para el conductor. Los pasajeros aportan a gastos compartibles; el conductor no paga aportaciones ni recibe remuneración.

La fuente de verdad de principios y restricciones es [`constitution.md`](./constitution.md). La definición funcional, incluidos los requisitos RF-001 a RF-015 y las decisiones pendientes, está en [`docs/DEFINICION_FUNCIONAL.md`](./docs/DEFINICION_FUNCIONAL.md). La constitución prevalece en caso de conflicto.

## Reglas funcionales aprobadas
- Destino único: oficina de Panoramis, Alicante.
- Tarifas orientativas por pasajero y trayecto: 0–10 km: 1 €; >10–20 km: 2 €; >20–35 km: 3 €; >35–50 km: 4 €; >50 km: 5 €. Ida y vuelta se calculan por separado.
- Si las aportaciones provisionales superan el límite de gastos reales compartibles, se reducen proporcionalmente. La unidad de cálculo y los conceptos admisibles deben validarse antes de programar el cálculo.
- Solo los pasajeros aportan a gastos. El conductor no paga ni obtiene beneficio.
- Parking Panoramis: 2 € estimados para ida, 2 € para vuelta y 4 € para ambos tramos en la misma jornada. Son estimaciones del vehículo, editables desde administración.
- Reparto de parking: una participación por ida, una por vuelta y dos por ida y vuelta; solo entre pasajeros que acepten el parking.
- El importe y las condiciones económicas aceptadas por un pasajero quedan bloqueados. No pueden aumentar por cancelaciones, ausencias ni cambios de ocupación posteriores.
- El conductor aprueba o rechaza las solicitudes.
- Cancelaciones: plazo de referencia de dos horas antes de la salida; se registran con fecha, hora y trayecto. Menos de dos horas se etiqueta como tardía.
- Cancelaciones y ausencias se conservan seis meses y alimentan un indicador de fiabilidad.
- Se mantienen ubicación en vivo durante el trayecto activo e historial.
- Blaccent no procesa, custodia ni distribuye pagos y no integra proveedores de pago. Los acuerdos económicos se realizan fuera de la plataforma.

## Decisiones pendientes (no inventar ni dar por aprobadas)
- Confirmar si el sistema permite cancelar durante las últimas dos horas (marcando la cancelación como tardía) o si bloquea la acción. RF-005 y RF-008 requieren concretar este comportamiento.
- Definir quién registra ausencias, en qué momento y cómo puede revisarse una ausencia incorrecta.
- Definir fórmula, ponderaciones y visibilidad del indicador de fiabilidad.
- Definir eliminación/anonimización y tratamiento técnico de registros al cumplir seis meses.
- Definir conceptos admisibles y unidad de cálculo del límite proporcional de gastos reales.
- No añadir multas, penalizaciones económicas ni pagos dentro de la app.

## Stack
- **Frontend:** Vue.js + CSS modular, mobile-first, PWA instalable.
- **Backend:** Supabase Cloud — PostgreSQL, Auth (Magic Link), Realtime.
- **Seguridad:** políticas RLS de mínimo privilegio en todas las tablas con datos de usuarios, trayectos, reservas, ubicación e historial; nunca exponer claves privilegiadas en el frontend.
- **Autenticación:** Magic Link solo para correos del dominio `@accenture.com`, configurado por variable de entorno y no eludible desde el cliente.
- **Ubicación:** API nativa de geolocalización del navegador + Supabase Realtime; solo el conductor transmite y solo durante un trayecto activo.
- **Hosting:** frontend estático en Vercel o Netlify; revisar límites y condiciones del plan gratuito.
- **Configuración:** `.env.example` documenta URL y clave pública de Supabase, dominio permitido y coordenadas de Panoramis. Las tarifas y el parking son configuración funcional, no secretos ni variables de entorno.
- **Pagos:** prohibido integrar pasarelas o proveedores de pago o desarrollar custodia/transferencia/liquidación de fondos.

## Backlog
- [x] 1a. Como responsable de IT, quiero clonar el repositorio oficial, configurar el entorno a partir de `.env.example` siguiendo `MAINTENANCE.md` y ver Blaccent funcionando en local conectada a Supabase, para poder mantenerla.
- [ ] 1b. Como responsable de IT, quiero que cada cambio aprobado en la rama principal se publique automáticamente en el hosting autorizado, para operar la aplicación de forma mantenible. Requires: #1a
- [ ] 2. Como empleado, quiero autenticarme con mi correo corporativo y publicar un desplazamiento a la oficina de Panoramis indicando fecha, horarios, plazas y tramos ofrecidos, para compartir un viaje que ya tengo previsto.
- [ ] 3. Como pasajero, quiero consultar viajes y solicitar solo ida, solo vuelta o ida y vuelta, para elegir únicamente los tramos que necesito. Requires: #2
- [ ] 4. Como conductor, quiero aceptar o rechazar cada solicitud y que las plazas se actualicen por tramo, para controlar quién viaja conmigo. Requires: #3
- [ ] 5. Como pasajero, quiero ver y aceptar el importe estimado del desplazamiento y parking antes de confirmar plaza, y conservar ese importe aunque cambie la ocupación, para conocer sus condiciones económicas. Requires: #3
- [ ] 6. Como pasajero, quiero cancelar mi participación y recibir aviso del registro de actividad conforme a la regla de dos horas, para gestionar cambios en mis planes. Requires: #4
- [ ] 7. Como usuario autorizado, quiero registrar y consultar cancelaciones y ausencias de los últimos seis meses, para disponer de un historial de cumplimiento. Requires: #6
- [ ] 8. Como usuario, quiero consultar un indicador de fiabilidad basado en cancelaciones y ausencias de los últimos seis meses, para valorar el cumplimiento de otros participantes. Requires: #7
- [ ] 9. Como conductor, quiero iniciar y finalizar el seguimiento de ubicación durante cada trayecto, para compartir mi posición solo cuando corresponda. Requires: #4
- [ ] 10. Como pasajero aceptado, quiero consultar la ubicación del conductor durante el tramo activo, para coordinar la recogida. Requires: #9
- [ ] 11. Como responsable de administración, quiero configurar tarifas por distancia, los importes de parking de Panoramis y las tarifas de otros parkings, para mantener las estimaciones sin modificar importes ya aceptados.
- [ ] 12. Como empleado, quiero instalar Blaccent como PWA en mi móvil, para acceder fácilmente.

Marca cada historia como `- [x]` solo cuando esté finalizada y verificada. No implementes requisitos pendientes como si estuvieran aprobados. No añadas pagos ni proveedores de pago.
