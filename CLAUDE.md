# Blaccent — Instrucciones del agente

## Contexto
Blaccent es una PWA interna y responsive para que empleados de Accenture compartan desplazamientos habituales en coche hasta su oficina en Panoramis (Alicante). No es un servicio profesional de transporte ni debe generar beneficios económicos para los conductores. Los pasajeros realizan aportaciones para compartir gastos; el conductor no paga aportaciones ni recibe remuneración.

La fuente de verdad de principios y restricciones es [`constitution.md`](./constitution.md). La definición funcional detallada, incluidas las decisiones aprobadas y las cuestiones pendientes, está en [`docs/DEFINICION_FUNCIONAL.md`](./docs/DEFINICION_FUNCIONAL.md). La constitución prevalece en caso de conflicto.

## Decisiones funcionales aprobadas
- Destino único: oficina de Panoramis, Alicante. No se permiten destinos alternativos al publicar un viaje.
- Tarifas orientativas por pasajero y trayecto: 0–10 km: 1 €; >10–20 km: 2 €; >20–35 km: 3 €; >35–50 km: 4 €; >50 km: 5 €. Ida y vuelta se calculan por separado.
- Si la suma provisional de aportaciones supera el límite de gastos reales compartibles, las aportaciones se reducen proporcionalmente. La unidad de aplicación del límite y los conceptos de gasto admisibles deben validarse antes de implementar el cálculo definitivo.
- Solo los pasajeros pagan aportaciones. No hay beneficio para el conductor.
- Desplazamiento y parking son conceptos separados.
- Parking Panoramis: 4 € estimados por jornada y vehículo, valor predeterminado editable desde administración.
- Interparking Puerto Alicante - Poniente: tarifas y modalidades configurables desde administración. Parking gratuito: 0 €.
- El parking se reparte solo entre pasajeros que lo aceptan: 1 participación por ida, 1 por vuelta y 2 por ida y vuelta.
- El coste real del parking se regulariza: se devuelve cualquier diferencia a favor del pasajero; un importe adicional exige informar y obtener aceptación expresa. No se incrementan importes confirmados unilateralmente.
- El conductor debe aprobar o rechazar las solicitudes.
- Se mantienen ubicación en vivo durante el trayecto activo e historial de viajes/cancelaciones.

## Decisiones pendientes (no inventar ni dar por aprobadas)
- Política de cancelación: el plazo antiguo de 24 horas no está aprobado. Preparar una propuesta para revisión; no implementar penalizaciones ni plazos definitivos hasta su aprobación.
- Límite proporcional: definir unidad de cálculo (trayecto, ida/vuelta o jornada/vehículo), conceptos de gastos compartibles, evidencia y tratamiento de gastos no cubiertos.
- Parking: concretar cómo se acredita el coste real y cómo se tratan diferencias no recuperables, así como la distribución exacta de céntimos entre participantes.
- Pagos: proveedor, destinatario de fondos, liquidaciones, comisiones, reembolsos y responsabilidades pendientes de validación legal y económica. No activar pagos reales todavía.
- Retención y visibilidad temporal del historial de cancelaciones.
- Reglas de viajes recurrentes y disponibilidad por fecha.

## Stack
- **Frontend:** Vue.js + CSS modular, mobile-first, PWA instalable.
- **Backend:** Supabase Cloud — PostgreSQL, Auth (Magic Link), Realtime.
- **Seguridad:** políticas RLS de mínimo privilegio en todas las tablas con datos de usuarios, trayectos, reservas, ubicación, historial o pagos; nunca exponer claves privilegiadas en el frontend.
- **Autenticación:** Magic Link solo para correos del dominio `@accenture.com`, configurado por variable de entorno y no eludible desde el cliente.
- **Ubicación:** API nativa de geolocalización del navegador + Supabase Realtime; solo el conductor transmite y solo durante un trayecto activo.
- **Hosting:** frontend estático en Vercel o Netlify; revisar límites y condiciones del plan gratuito.
- **Configuración:** `.env.example` documenta URL y clave pública de Supabase, dominio permitido y coordenadas de Panoramis. Las tarifas y el parking son configuración funcional administrable, no secretos ni variables de entorno.
- **Costes:** no incorporar servicios de pago ni proveedor de pagos sin aprobación expresa de coste y modelo operativo.

## Backlog
- [x] 1a. Como responsable de IT, quiero clonar el repositorio oficial, configurar el entorno a partir de `.env.example` siguiendo `MAINTENANCE.md` y ver Blaccent funcionando en local conectada a Supabase, para poder mantenerla.
- [ ] 1b. Como responsable de IT, quiero que cada cambio aprobado en la rama principal se publique automáticamente en el hosting autorizado, para operar la aplicación de forma mantenible. Requires: #1a
- [ ] 2. Como empleado, quiero autenticarme con mi correo corporativo y publicar un desplazamiento a la oficina de Panoramis indicando fecha, horarios, plazas y tramos ofrecidos, para compartir un viaje que ya tengo previsto.
- [ ] 3. Como pasajero, quiero consultar viajes y solicitar solo ida, solo vuelta o ida y vuelta, para elegir únicamente los tramos que necesito. Requires: #2
- [ ] 4. Como conductor, quiero aceptar o rechazar cada solicitud y que las plazas se actualicen por tramo, para controlar quién viaja conmigo. Requires: #3
- [ ] 5. Como pasajero, quiero ver la aportación orientativa por distancia y su reducción proporcional cuando se alcance el límite de gastos compartibles, para conocer el importe del desplazamiento antes de solicitar plaza. Requires: #3
- [ ] 6. Como conductor, quiero seleccionar Panoramis, Interparking o aparcamiento gratuito y que los pasajeros vean y acepten su parte del parking antes de confirmar, para compartir únicamente ese gasto. Requires: #2
- [ ] 7. Como pasajero o conductor, quiero cancelar conforme a una política visible y aceptada, para conocer las consecuencias y liberar plazas correctamente. Requires: #4
- [ ] 8. Como pasajero, quiero recibir los ajustes o reembolsos de parking que correspondan sin aumentos unilaterales de importes confirmados, para que el reparto refleje el coste aplicable. Requires: #6, #7
- [ ] 9. Como conductor, quiero iniciar y finalizar el seguimiento de ubicación durante cada trayecto, para compartir mi posición solo cuando corresponda. Requires: #4
- [ ] 10. Como pasajero aceptado, quiero consultar la ubicación del conductor durante el tramo activo, para coordinar la recogida. Requires: #9
- [ ] 11. Como empleado, quiero consultar el historial pertinente de viajes y cumplimiento de otros participantes, para disponer de señales de confianza con privacidad. Requires: #7
- [ ] 12. Como responsable de administración, quiero configurar tarifas por distancia, los 4 € estimados de Panoramis, las tarifas de Interparking y la política aprobada, para mantener las reglas sin modificar código.
- [ ] 13. Como pasajero, quiero realizar aportaciones y recibir reembolsos mediante un modelo de pagos validado legal y económicamente, para compartir gastos de forma transparente. Requires: #5, #6, #7
- [ ] 14. Como conductor, quiero publicar desplazamientos recurrentes y permitir reservas en fechas concretas, para organizar mis viajes habituales.
- [ ] 15. Como empleado, quiero instalar Blaccent como PWA en mi móvil, para acceder fácilmente.

Marca cada historia como `- [x]` solo cuando esté finalizada y verificada. No implementes requisitos pendientes como si estuvieran aprobados.