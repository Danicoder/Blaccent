# Blaccent — Instrucciones del agente

## Contexto
Blaccent es una PWA interna y responsive para que empleados de Accenture compartan desplazamientos habituales en coche hasta su oficina en Panoramis (Alicante). No es un servicio profesional de transporte ni debe generar beneficios económicos para el conductor. En el MVP solo se muestran estimaciones informativas; cualquier acuerdo de gastos se realiza fuera de Blaccent.

La fuente de verdad de principios y restricciones es [`constitution.md`](./constitution.md). Las reglas funcionales y el alcance MVP están en [`docs/DEFINICION_FUNCIONAL.md`](./docs/DEFINICION_FUNCIONAL.md). La constitución prevalece en caso de conflicto.

## Reglas funcionales aprobadas
- Destino único: oficina de Panoramis, Alicante.
- Tarifas orientativas por pasajero y trayecto: 0–10 km: 1 €; >10–20 km: 2 €; >20–35 km: 3 €; >35–50 km: 4 €; >50 km: 5 €. Ida y vuelta se calculan por separado.
- El MVP solo muestra estimaciones informativas; no calcula ni registra gastos reales, deudas o pagos. El cálculo productivo de gastos compartibles queda fuera del MVP hasta validación legal de los conceptos, evidencias y unidad del límite.
- El MVP no gestiona aportaciones ni pagos. La regla de no generar beneficio para el conductor rige cualquier posible fase económica futura.
- Parking Panoramis: 2 € estimados para ida, 2 € para vuelta y 4 € para ambos tramos en la misma jornada. Son estimaciones del vehículo, editables desde administración.
- Desglose estimado de parking: una participación por ida, una por vuelta y dos por ida y vuelta; no es una deuda ni un reparto productivo.
- El importe y las condiciones económicas aceptadas por un pasajero quedan bloqueados. No pueden aumentar por cancelaciones, ausencias ni cambios de ocupación posteriores.
- El conductor aprueba o rechaza las solicitudes.
- Al cerrar cada tramo, el conductor clasifica cada reserva confirmada no cancelada como completada o ausencia; reservas sin clasificación explícita no computan para fiabilidad.
- Cancelaciones: el pasajero puede cancelar hasta la salida. Con al menos dos horas de antelación es ordinaria; con menos de dos horas está permitida y se marca como tardía.
- El conductor puede marcar como no presentado a un pasajero con plaza confirmada que no acudió y no canceló previamente.
- Cancelaciones y ausencias identificables se conservan seis meses y después se eliminan. Fiabilidad = (viajes completados + cancelaciones en plazo + 0,5 × cancelaciones tardías) / reservas confirmadas evaluables × 100. Las ausencias aportan 0 puntos. Mostrar solo con al menos cinco reservas evaluables; por debajo, «Datos insuficientes».
- El conductor que registró una ausencia puede deshacerla durante los diez minutos siguientes. La corrección deja de computar como ausencia y conserva trazabilidad.
- Historial detallado: visible solo para el titular y administración autorizada. El indicador agregado se muestra a otros usuarios solo en el contexto de una solicitud o reserva entre ambos. Eventos identificables y sus correcciones se eliminan al cumplir seis meses.
- Parking del MVP: Panoramis a 2 € estimados por tramo o gratuito. Si el pasajero no acepta el parking, puede retirar la solicitud. Para cambiar el parking de un tramo con reservas, el conductor lo cancela y publica otro con nuevas condiciones; no se alteran importes aceptados.
- OSRM público es la fuente elegida para distancia por carretera; se guardan las distancias por trayecto y se verifican términos y límites vigentes antes de desplegar la integración.
- Interparking y los viajes recurrentes quedan fuera del MVP.
- Se mantienen ubicación en vivo durante el trayecto activo e historial.
- Blaccent no procesa, custodia ni distribuye pagos y no integra proveedores de pago. Los acuerdos económicos se realizan fuera de la plataforma.

## Condiciones antes de futuras ampliaciones
- No habilitar cálculo productivo de gastos compartibles sin validación legal de conceptos, evidencias y unidad de cálculo; esto queda fuera del MVP y no bloquea los flujos no económicos.
- No incorporar Interparking ni viajes recurrentes sin una decisión de alcance posterior y documentación actualizada.
- Antes de desplegar OSRM, verificar sus términos y límites vigentes.
- No añadir multas, penalizaciones económicas ni pagos, reembolsos, liquidaciones o proveedores de pago dentro de la app.

## Stack
- **Frontend:** Vue.js + CSS modular, mobile-first, PWA instalable.
- **Backend:** Supabase Cloud — PostgreSQL, Auth (Magic Link), Realtime.
- **Seguridad:** políticas RLS de mínimo privilegio en todas las tablas con datos de usuarios, trayectos, reservas, ubicación e historial; nunca exponer claves privilegiadas en el frontend.
- **Autenticación:** Magic Link solo para correos del dominio `@accenture.com`, configurado por variable de entorno y no eludible desde el cliente.
- **Ubicación:** API nativa de geolocalización del navegador + Supabase Realtime; solo el conductor transmite y solo durante un trayecto activo.
- **Hosting:** frontend estático en Netlify; revisar límites y condiciones del plan gratuito.
- **Configuración:** `.env.example` documenta URL y clave pública de Supabase, dominio permitido y coordenadas de Panoramis. Las tarifas y el parking son configuración funcional, no secretos ni variables de entorno.
- **Pagos:** prohibido integrar pasarelas o proveedores de pago o desarrollar custodia/transferencia/liquidación de fondos.

## Backlog
- [x] 1a. Como responsable de IT, quiero clonar el repositorio oficial, configurar el entorno a partir de `.env.example` siguiendo `MAINTENANCE.md` y ver Blaccent funcionando en local conectada a Supabase, para poder mantenerla.
- [ ] 1b. Como responsable de IT, quiero que los cambios aprobados en la rama principal se publiquen automáticamente en Netlify desde el repositorio autorizado, para operar la aplicación de forma mantenible. Requires: #1a
- [ ] 2. Como empleado, quiero acceder con un Magic Link restringido a `@accenture.com` y publicar un viaje a Panoramis con origen, fecha, horarios, plazas y tramos disponibles, para compartir un desplazamiento que ya tengo previsto.
- [ ] 3. Como pasajero, quiero buscar viajes por origen y fecha y consultar su disponibilidad por tramo, para elegir el desplazamiento que necesito. Requires: #2
- [ ] 4. Como pasajero, quiero ver las estimaciones informativas de desplazamiento y parking y poder retirar mi solicitud si no las acepta, para conocerlas sin que se presenten como una deuda o un gasto real verificado. Requires: #3
- [ ] 5. Como conductor, quiero aceptar o rechazar cada solicitud y confirmar plazas por separado para ida y vuelta, para controlar quién viaja en cada tramo. Requires: #4
- [ ] 6. Como pasajero o conductor, quiero cancelar mi reserva o tramo antes de la salida, recibir el aviso y que la cancelación se clasifique según la regla de dos horas, para gestionar cambios sin alterar las condiciones aceptadas por otros pasajeros. Requires: #5
- [ ] 7. Como pasajero afectado, quiero recibir aviso si el conductor cancela mi tramo y que se registre el evento sin afectar mi fiabilidad, para conocer el estado de mi viaje. Requires: #5
- [ ] 8. Como conductor, quiero cerrar cada tramo y clasificar las reservas confirmadas no canceladas como viaje completado o ausencia, pudiendo deshacer una ausencia durante diez minutos, para registrar resultados con trazabilidad. Requires: #5
- [ ] 9. Como usuario, quiero consultar mi historial detallado y que administración autorizada pueda hacerlo, conservado hasta seis meses, para revisar mi actividad. Requires: #6, #8
- [ ] 10. Como conductor o pasajero que revisa una solicitud o reserva con otro usuario, quiero ver únicamente su indicador de fiabilidad agregado si tiene al menos cinco reservas evaluables en los últimos seis meses, calculado como (viajes completados + cancelaciones ordinarias + 0,5 × cancelaciones tardías) / reservas evaluables × 100, para valorar su cumplimiento sin acceder a su historial detallado. Requires: #9
- [ ] 11. Como conductor, quiero iniciar y finalizar la ubicación en vivo por tramo, para compartirla solo durante el trayecto activo. Requires: #5
- [ ] 12. Como pasajero aceptado, quiero consultar la ubicación del conductor durante mi tramo activo, para coordinar la recogida. Requires: #11
- [ ] 13. Como responsable de administración, quiero consultar y gestionar usuarios, viajes y reservas, y consultar estadísticas de uso, para supervisar la plataforma con los permisos autorizados.
- [ ] 14. Como responsable de administración, quiero configurar las tarifas orientativas de distancia y el coste estimado de Panoramis, para mantener las estimaciones sin alterar condiciones ya aceptadas.
- [ ] 15. Como empleado, quiero instalar Blaccent como PWA en mi móvil, para acceder fácilmente.

Marca cada historia como `- [x]` solo cuando esté finalizada y verificada. No implementes requisitos pendientes como si estuvieran aprobados. No añadas pagos ni proveedores de pago.

La historia 4 implementa solo estimaciones informativas, no un motor de gastos reales, cálculo de deuda ni pagos. La validación legal de gastos compartibles es una condición para una fase futura, no un bloqueo del MVP. Interparking y recurrencia quedan fuera del MVP. Los pagos externos no se registran ni se concilian en Blaccent.
