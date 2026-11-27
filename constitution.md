# Constitución de Blaccent

## Principios fundamentales

### I. Movilidad colaborativa con destino único
Blaccent es una aplicación web interna, responsive y preparada para instalarse como PWA, destinada a facilitar que empleados compartan desplazamientos habituales en coche hasta su oficina en Panoramis, Alicante. El destino funcional es la oficina; no se ofrecen destinos alternativos al publicar viajes. Blaccent no es un servicio profesional de transporte ni debe incentivar desplazamientos para obtener ingresos.

### II. Sin ánimo de lucro para el conductor
Blaccent no calcula ni cobra gastos reales compartibles en el MVP. Las tarifas por distancia y los importes de parking que muestre son estimaciones informativas, no justificantes ni importes productivos. No se implementará un límite de gasto real ni un reparto económico definitivo hasta que se validen legalmente los conceptos admisibles, su evidencia y la unidad de cálculo. El conductor no paga aportaciones ni recibe beneficio económico.

### III. Importes aceptados estables
Antes de solicitar una plaza, el pasajero debe conocer la estimación informativa de desplazamiento y parking que se le muestra; no representa una deuda ni una obligación de pago en Blaccent. Una vez confirmada su participación, esa estimación y las condiciones asociadas quedan guardadas y no se recalculan al alza ni empeoran por cancelaciones, ausencias o cambios de ocupación producidos por otros usuarios. No se generan cobros automáticos.

### IV. Costes de parking predefinidos y reparto por tramo
En el MVP solo se ofrecen Parking Panoramis (estimación de 2 € por ida y 2 € por vuelta) y aparcamiento gratuito (0 €). Los 4 € corresponden a ambos tramos en una jornada y son una estimación por vehículo, no un importe individual ni un coste verificado. Interparking queda fuera del MVP hasta que se validen sus tarifas. No se aumenta ni redistribuye una estimación ya aceptada por cancelaciones o cambios de ocupación. Si el conductor cambia el parking de un tramo con reservas, cancela ese tramo y publica uno nuevo con las nuevas condiciones; cada pasajero debe solicitarlas y aceptarlas de nuevo. La negativa a aceptar el parking permite retirar la solicitud sin trasladar el importe a otros pasajeros.

### V. Reservas y aprobación explícita
Una solicitud de reserva no confirma una plaza. El conductor acepta o rechaza cada solicitud. La disponibilidad se controla por tramo. El pasajero debe aceptar las condiciones económicas mostradas antes de confirmar su participación.

### VI. Cancelaciones y ausencias
El pasajero puede cancelar en cualquier momento antes de la salida programada. Las cancelaciones realizadas con al menos dos horas de antelación se registran como ordinarias; las realizadas con menos de dos horas se permiten y se registran como tardías. Antes de confirmar, se informa al usuario de que la cancelación quedará registrada y podrá influir en su fiabilidad. El conductor puede registrar como ausencia a un pasajero con plaza confirmada que no se presente y no haya cancelado. Las cancelaciones y ausencias se conservan durante seis meses. La fiabilidad se calcula sobre las reservas confirmadas evaluables de los últimos seis meses: viaje completado = 1 punto; cancelación con al menos dos horas de antelación = 1 punto; cancelación con menos de dos horas = 0,5 puntos; ausencia confirmada = 0 puntos. La puntuación es la suma de puntos dividida entre el número de reservas evaluables, multiplicada por 100. Solo se muestra un valor numérico cuando existen al menos cinco reservas evaluables; por debajo se muestra «Datos insuficientes». Una ausencia tiene, por tanto, el doble de impacto negativo que una cancelación tardía. El conductor que registró una ausencia puede deshacer ese registro durante los diez minutos siguientes; la corrección se refleja en la fiabilidad y conserva trazabilidad.

### VII. Acuerdos económicos fuera de la plataforma
Blaccent puede mostrar importes estimados e información de reparto, pero no procesa, custodia ni distribuye pagos. No integra pasarelas ni proveedores externos de pago. Cualquier intercambio económico entre conductor y pasajeros se acuerda y realiza fuera de Blaccent, mediante los medios que las partes decidan.

### VIII. Ubicación en vivo e historial
Se mantienen la ubicación en vivo del conductor durante un trayecto activo y el historial de desplazamientos, cancelaciones y ausencias. La ubicación solo se comparte con participantes autorizados del trayecto y únicamente mientras esté activo. Los eventos identificables de cancelación y ausencia se conservan durante seis meses.
El historial detallado solo es visible para el propio usuario y administración autorizada. El indicador numérico de fiabilidad solo se muestra a otro usuario en el contexto de una solicitud o reserva entre ambos; no se expone un historial detallado a terceros. Al cumplir seis meses, se eliminan los registros identificables de cancelaciones, ausencias y sus correcciones; no se conserva un historial por usuario y dejan de estar disponibles para el cálculo.

### IX. Privacidad y seguridad desde el diseño
El registro y el acceso se limitan al dominio corporativo configurado. La privacidad y autorización de usuarios, trayectos, reservas, ubicaciones e historial se aplican en PostgreSQL mediante políticas RLS de Supabase; ocultar datos solo en la interfaz no constituye control de acceso. Las claves privilegiadas nunca se exponen en el frontend. Se recopila y comparte únicamente la información necesaria.

### X. Configuración explícita y mantenibilidad
Las tarifas por distancia, los importes estimados de parking y la configuración funcional se mantienen de forma administrable y trazable. Los cambios de configuración no alteran importes y condiciones ya aceptados. El frontend se implementa con Vue.js y CSS modular, siguiendo un enfoque mobile-first. La configuración por entorno se documenta mediante `.env.example`; los secretos no se versionan. El repositorio debe incluir `MAINTENANCE.md`.

### XI. Coste y servicios
La solución prioriza servicios gratuitos y serverless. Supabase Cloud proporciona PostgreSQL, autenticación y Realtime; el frontend estático se despliega en Cloudflare Pages desde el repositorio autorizado mediante GitHub Actions, sujeto a verificar los límites y condiciones del plan elegido. No se incorporan proveedores ni integraciones de pago, ya que la plataforma no debe gestionar transferencias económicas.

## Requisitos funcionales y de plataforma

- **Autenticación:** Supabase gestiona la autenticación corporativa y la aplicación valida el dominio permitido mediante configuración no eludible desde el cliente.
- **Destino:** todos los viajes publicados tienen como destino la oficina de Panoramis, Alicante.
- **Tarifas de desplazamiento:** importes orientativos por pasajero y trayecto: 0–10 km: 1 €; más de 10–20 km: 2 €; más de 20–35 km: 3 €; más de 35–50 km: 4 €; más de 50 km: 5 €. Ida y vuelta se calculan por separado.
- **Economía del MVP:** solo se muestran estimaciones informativas. No se calcula un importe productivo ni un límite proporcional de gastos reales hasta validación legal de conceptos, evidencia y unidad de cálculo.
- **Parking Panoramis:** 2 € estimados para ida, 2 € para vuelta y 4 € para ambos tramos en la misma jornada. Se entienden como costes estimados del vehículo por tramo/jornada y son configurables desde administración.
- **Parking MVP:** Panoramis (2 € estimados por tramo) o gratuito. No se incluyen Interparking ni reparto productivo. Una estimación aceptada no cambia por modificaciones posteriores; cambiar parking con reservas requiere cancelar y volver a publicar el tramo con nuevas condiciones.
- **Bloqueo económico:** el importe y condiciones aceptadas por el pasajero no aumentan ni se recalculan por cancelaciones, ausencias o cambios de ocupación posteriores.
- **Reservas:** se permite solo ida, solo vuelta o ida y vuelta. Las plazas y estados se gestionan por tramo. La confirmación requiere aprobación del conductor y aceptación de las condiciones económicas.
- **Cancelaciones:** el pasajero puede cancelar hasta la salida. Si faltan al menos dos horas, la cancelación es ordinaria; si faltan menos de dos horas, se permite y se marca como tardía.
- **Ausencias:** el conductor puede registrar como no presentado a un pasajero confirmado que no haya cancelado previamente.
- **Fiabilidad:** (viajes completados + cancelaciones en plazo + 0,5 × cancelaciones tardías) / reservas confirmadas evaluables × 100, durante los últimos seis meses. El conductor cierra cada tramo e indica por reserva si se completó o si hubo ausencia; las reservas sin resultado explícito no son evaluables. Si deshace una ausencia, debe clasificar expresamente la reserva como completada para que puntúe. Una ausencia suma 0. Se muestra solo con al menos cinco reservas evaluables; en otro caso, «Datos insuficientes». El conductor dispone de diez minutos para deshacer su registro de ausencia. El detalle se limita al usuario y administración; el indicador agregado se muestra a otros usuarios solo en el contexto de solicitud o reserva.
- **Historial:** se conservan cancelaciones y ausencias durante seis meses desde que ocurren.
- **Distancia:** la fuente elegida para el MVP es OSRM público. Se guarda la distancia calculada con el trayecto; antes del despliegue se verifican los términos y límites vigentes del servicio. No cambiar una distancia o estimación aceptada silenciosamente.
- **Fuera del MVP:** tarifas y modalidades de Interparking, viajes recurrentes y cálculo productivo de gastos compartibles. No son requisitos pendientes del MVP.
- **Pagos:** no hay procesamiento, custodia ni distribución de fondos dentro de Blaccent. Los acuerdos económicos se realizan fuera de la plataforma.
- **Ubicación en vivo:** geolocalización del navegador y Supabase Realtime durante trayectos activos; solo el conductor transmite y solo participantes autorizados consultan.
- **Administración:** gestión de usuarios, viajes, reservas, tarifas, importes estimados de parking y consulta del historial conforme a los permisos.
- **RLS:** toda tabla con información de usuarios, trayectos, reservas, ubicación o historial cuenta con políticas de mínimo privilegio y pruebas de acceso permitido y denegado.
- **Despliegue:** frontend estático en Cloudflare Pages desde GitHub Actions; se revisan límites y condiciones del plan elegido.

## Flujo de desarrollo y calidad

- Esta constitución prevalece sobre otras guías del repositorio cuando exista conflicto.
- Los cambios de esquema incluyen migraciones y políticas RLS correspondientes.
- Los cambios de autenticación, permisos, reservas, importes, cancelaciones, ausencias y ubicación requieren pruebas de acceso permitido y denegado.
- Los cálculos monetarios usan céntimos enteros o representación decimal exacta; no usar coma flotante binaria para importes.
- Las tarifas e importes mostrados deben indicar su naturaleza estimada.
- Los importes y condiciones aceptados se conservan como una instantánea vinculada a la reserva; los cambios posteriores de ocupación no pueden aumentarlos.
- La ubicación solo puede compartirse con participantes autorizados durante el tramo activo.
- Los registros de cancelación y ausencia tienen una retención de seis meses.
- Cada tramo finalizado requiere que el conductor clasifique cada reserva activa como viaje completado o ausencia; sin clasificación explícita, no se incluye en el cálculo de fiabilidad.
- El historial detallado es privado para el titular y administración autorizada. Otros usuarios solo ven el indicador en el contexto de solicitud o reserva.
- Los registros identificables de cancelación, ausencia y corrección se eliminan al cumplir seis meses; no se conserva un historial por usuario después de ese plazo.
- En el MVP, no se calcula un importe definitivo de gastos compartibles. OSRM público es la fuente elegida para distancia, sujeto a verificación de sus términos y límites antes del despliegue.
- Interparking y los viajes recurrentes quedan expresamente fuera del MVP.
- No incorporar funciones para cobrar, custodiar, transferir o liquidar pagos.

## Gobernanza

Toda enmienda debe actualizar este documento, incrementar su versión y registrar motivo y fecha. Las excepciones deben ser explícitas, acotadas y aprobadas.

**Versión**: 1.7.0 | **Ratificada**: 2026-11-21 | **Última enmienda**: 2026-11-27

**Motivo de la enmienda 1.4.0**: aprobar la fórmula del indicador de fiabilidad, el mínimo de cinco reservas evaluables para mostrarlo y la ventana de diez minutos para que el conductor deshaga una ausencia registrada por error, conservando trazabilidad.

**Motivo de la enmienda 1.5.0 (2026-11-22)**: cerrar las reglas de acceso y eliminación del historial, clasificación de reservas completadas, tratamiento del rechazo/cambio de parking y definir el alcance MVP para gastos, distancia, Interparking y recurrencia. Los cálculos productivos de gastos quedan fuera del MVP hasta validación legal.

**Motivo de la enmienda 1.6.0 (2026-11-22)**: seleccionar un proveedor de hosting estático para el MVP; verificar sus límites y condiciones antes del despliegue.

**Motivo de la enmienda 1.7.0 (2026-11-27)**: seleccionar Cloudflare Pages como proveedor de hosting estático y automatizar el despliegue de producción desde GitHub Actions; verificar los límites y condiciones del plan elegido antes del despliegue.