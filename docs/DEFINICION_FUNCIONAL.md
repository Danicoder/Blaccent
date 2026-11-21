# Definición funcional de Blaccent

**Estado:** decisiones para el MVP aprobadas el 21-11-2026 y 22-11-2026. Esta definición prevalece sobre borradores anteriores. Las exclusiones y condiciones de validación futura se indican expresamente.

## 1. Propósito y alcance

Blaccent facilita que empleados compartan desplazamientos habituales en coche hasta la oficina de Panoramis (Alicante). No es un servicio de transporte profesional ni una actividad destinada a generar ingresos para el conductor.

El destino de los viajes publicados es la oficina. Se mantienen los perfiles funcionales de conductor y pasajero. Un empleado puede desempeñar ambos papeles.

## 2. Publicación del viaje

El conductor podrá indicar:
- Origen.
- Fecha del desplazamiento.
- Hora aproximada de salida y llegada.
- Hora prevista de regreso, si ofrece vuelta.
- Plazas disponibles.
- Modalidad: solo ida, solo vuelta o ida y vuelta.
- Aparcamiento previsto.

La ida y la vuelta tienen disponibilidad y reservas independientes. La oficina de Panoramis es el destino único.
Para la distancia por carretera, el MVP utilizará OSRM público y guardará el resultado asociado al viaje. Antes del despliegue se verificarán los términos y límites vigentes del servicio.

## 3. Aportación por desplazamiento

### 3.1 Tarifas orientativas aprobadas

| Distancia del trayecto | Aportación orientativa por pasajero |
|---|---:|
| 0–10 km | 1 € |
| Más de 10–20 km | 2 € |
| Más de 20–35 km | 3 € |
| Más de 35–50 km | 4 € |
| Más de 50 km | 5 € |

La ida y la vuelta se calculan por separado. No se cobra por un tramo que el pasajero no haya reservado.

### 3.2 Límite por gastos reales — fuera del MVP

En el MVP no se calcula ni se cobra un importe definitivo de gastos compartibles. Las tarifas por distancia y los importes de parking son estimaciones informativas; no acreditan el gasto real ni constituyen una cotización, deuda o solicitud de pago. No se implementa todavía la reducción proporcional.

La siguiente regla matemática queda como referencia para una fase posterior, no aprobada para uso productivo: si las aportaciones provisionales son (a_i) y el límite validado es (G), con (A=\sum a_i):
- Si (A \leq G), se mantienen las aportaciones provisionales.
- Si (A > G), cada aportación ajustada se calcula proporcionalmente: (a_i' = a_i \times G/A).
- El cálculo final se realiza en céntimos. Los céntimos residuales se distribuyen mediante un criterio determinista (por ejemplo, mayores restos), de modo que la suma sea exactamente el límite redondeado y nunca lo supere.

Antes de habilitar cálculo productivo, una validación legal deberá aprobar los conceptos y evidencias admisibles y la unidad del límite (trayecto, jornada o vehículo). Hasta entonces se mantienen las estimaciones informativas y no se presenta el simulador como cálculo de gasto real.

### 3.3 Principios

- Solo los pasajeros realizan aportaciones.
- El conductor no paga por su plaza ni obtiene beneficio.
- Desplazamiento y aparcamiento son conceptos separados.
- Tarifas y supuestos son configurables y deben mostrarse claramente antes de solicitar plaza.

## 4. Aparcamiento

### 4.1 Opciones

**Panoramis**
- Coste estimado: **2 € para la ida y 2 € para la vuelta; 4 € para ida y vuelta en la misma jornada**.
- Es un importe estimado del vehículo, no un importe individual por pasajero ni una tarifa real garantizada.
- Administración puede modificar los valores de referencia.

**Interparking Puerto Alicante - Poniente**
- Queda fuera del MVP; no se ofrece ni se configura hasta validar tarifas, modalidades y condiciones.

**Aparcamiento gratuito**
- Coste: 0 €.
- No se añade aportación de parking.

### 4.2 Reparto por participaciones

El coste del parking se reparte solo entre los pasajeros que hayan aceptado expresamente compartirlo. Se mantiene este criterio:
- Solo ida: 1 participación.
- Solo vuelta: 1 participación.
- Ida y vuelta: 2 participaciones.

Coste por participación = coste de parking a repartir / total de participaciones aceptadas.

Aportación individual = coste por participación × participaciones del pasajero.

Los importes estimados se muestran en céntimos. El reparto mostrado es orientativo, no un cargo ni una liquidación. Una vez aceptadas las condiciones de una plaza, su importe estimado no se recalcula ni aumenta por cambios posteriores de ocupación.

### 4.3 Aceptación y regularización

Antes de confirmar, el pasajero debe ver:
- Aparcamiento seleccionado.
- Coste estimado o calculado.
- Participaciones aplicables.
- Su aportación de parking.
- Aportación del desplazamiento.
- Total estimado.

El pasajero debe aceptar expresamente las estimaciones informativas que se muestran. No son una deuda ni una obligación de pago dentro de Blaccent. Una vez confirmada la plaza, las estimaciones quedan guardadas y no aumentan ni se recalculan por cambios posteriores de ocupación, cancelaciones o ausencias. RF-012 a RF-014 establecen que Blaccent no procesa ni gestiona pagos ni reembolsos; cualquier acuerdo económico externo no se registra ni verifica en la plataforma.

## 5. Reservas y aprobación

1. El pasajero consulta viajes disponibles.
2. Elige solo ida, solo vuelta o ambos tramos.
3. Consulta disponibilidad por tramo y desglose económico.
4. Acepta el importe estimado del desplazamiento y, si procede, el parking.
5. Si no acepta el parking, puede retirar la solicitud; no se traslada su parte a otros pasajeros.
6. Envía una solicitud.
7. El conductor acepta o rechaza.
8. La plaza solo queda confirmada tras la aceptación del conductor y la aceptación de las condiciones estimadas aplicables.

No se puede confirmar más plazas de las disponibles. La aceptación de ida no reserva automáticamente la vuelta ni viceversa.

## 6. Política de cancelación

### 6.1 Estado de decisión

El pasajero puede cancelar en cualquier momento antes de la hora de salida programada. Si cancela con al menos dos horas de antelación, la cancelación se registra como ordinaria. Si cancela con menos de dos horas, la cancelación se permite y se registra como tardía. La regla anterior de 24 horas y la caducidad de 30 días del historial quedan sustituidas.

### 6.2 Reglas aprobadas

La funcionalidad debe distinguir cancelación por pasajero o conductor, cancelación de uno o ambos tramos, y registrar las cancelaciones tardías. El pasajero puede ejecutar la cancelación tardía; no se bloquea la acción por encontrarse dentro de las últimas dos horas. Blaccent no gestionará reembolsos ni pagos; cualquier acuerdo económico derivado de una cancelación se realiza externamente. Los importes aceptados por los pasajeros restantes no se recalculan ni aumentan.

Reglas aprobadas para la política:
1. Liberar la plaza del tramo cancelado y actualizar su disponibilidad.
2. No aumentar automáticamente la aportación de pasajeros restantes.
3. Mantener intactos los importes de parking ya aceptados por los pasajeros restantes; no recalcularlos cuando cambie la ocupación.
4. No recalcular ni aumentar las aportaciones aceptadas por los pasajeros restantes.
5. No procesar reembolsos ni pagos desde Blaccent; los acuerdos económicos se realizan fuera de la plataforma.
6. Si cancela el conductor, informar a todos los pasajeros afectados.
7. Registrar el evento de cancelación en el historial durante seis meses.
8. Si el conductor desea cambiar el parking de un tramo con reservas, cancela el tramo y publica otro con las nuevas condiciones. Las reservas existentes no se modifican; cada pasajero debe solicitar y aceptar las condiciones nuevas. Una cancelación hecha por el conductor no afecta a la fiabilidad del pasajero.

### 6.3 Cierre de tramo y resultado de reservas

Al finalizar un tramo, el conductor lo cierra y clasifica cada reserva confirmada no cancelada como viaje completado o ausencia. Las cancelaciones del conductor no se imputan al pasajero. Una reserva sin clasificación explícita no se incluye en el cálculo de fiabilidad. El conductor puede deshacer su propio registro de ausencia durante los diez minutos siguientes, conservando la trazabilidad; si lo deshace, debe clasificar expresamente la reserva como completada para que puntúe.

## 7. Ubicación en vivo e historial

Se mantienen ambas funcionalidades.

**Ubicación en vivo**
- El conductor inicia el seguimiento al comenzar el tramo y lo finaliza al terminarlo.
- El navegador solicita permiso.
- Solo participantes autorizados de ese tramo consultan la ubicación.
- No se transmite ubicación fuera de un trayecto activo.

**Historial**
- Se conserva historial de desplazamientos, cancelaciones y ausencias para aportar contexto de confianza.
- El conductor puede registrar una ausencia cuando un pasajero con plaza confirmada no se presenta y no ha cancelado previamente.
- El historial detallado solo lo consulta el propio usuario y administración autorizada.
- El indicador agregado se muestra a otro usuario solo al revisar una solicitud o reserva entre ambos; no se muestran a terceros fechas ni detalles de eventos.
- Los registros identificables de cancelaciones, ausencias y sus correcciones se conservan durante seis meses desde que ocurren y después se eliminan; no se conserva historial por usuario pasado ese plazo.

## 8. Administración

El panel de administración deberá permitir:
- Gestionar usuarios, conductores y pasajeros.
- Consultar viajes y reservas.
- Configurar tarifas base por distancia.
- Configurar los importes estimados de Panoramis (2 € por ida y 2 € por vuelta; 4 € ambos tramos en la misma jornada).
- Interparking queda fuera del MVP; no administrar ni mostrar sus tarifas hasta que se incorpore en una fase posterior aprobada.
- Permitir cancelar hasta la hora de salida y clasificar la cancelación según la antelación: ordinaria (dos horas o más) o tardía (menos de dos horas).
- Consultar las estimaciones; no registrar acuerdos, pagos, reembolsos ni liquidaciones.
- Consultar estadísticas de uso.
- Mantener trazabilidad de cambios y vigencia de cada configuración.

Los cambios de tarifas no deben alterar silenciosamente importes ya aceptados en reservas existentes.

## 9. Pagos y cumplimiento

Blaccent no procesa, custodia ni distribuye pagos. No integra pasarelas ni proveedores externos de pago. Los acuerdos económicos entre conductor y pasajeros se realizan fuera de la plataforma. La aplicación se limita a mostrar las estimaciones y condiciones aceptadas; no registra pagos, reembolsos, conciliaciones ni liquidaciones.

## 10. Privacidad y seguridad

- Acceso limitado al dominio corporativo configurado.
- RLS en Supabase para usuarios, viajes, reservas, ubicación e historial.
- La ubicación solo es visible para participantes autorizados durante el tramo activo.
- Las claves privilegiadas no se exponen en el frontend.
- Las aceptaciones económicas deben quedar asociadas a la reserva y a la configuración aplicable.
- Los cambios administrativos deben ser auditables.

## 11. Decisiones cerradas y límites del MVP

- **Gastos compartibles:** el MVP muestra únicamente estimaciones, sin declarar ni calcular gastos reales, importes productivos o pagos debidos. El cálculo proporcional queda fuera del MVP hasta que una validación legal apruebe los conceptos, evidencias y unidad de cálculo. No se requiere esa decisión para avanzar con los flujos no económicos.
- **Rechazo del parking:** el pasajero puede retirar la solicitud; nunca se redistribuye su importe a otros. Para cambiar el parking de un tramo con reservas, el conductor cancela y vuelve a publicar el tramo con nuevas condiciones.
- **Visibilidad:** el detalle del historial es accesible solo al titular y a administración autorizada. Otros usuarios ven únicamente el indicador agregado durante una solicitud o reserva entre ellos.
- **Viaje completado:** el conductor cierra el tramo y clasifica cada reserva confirmada no cancelada como completada o ausencia. Sin clasificación explícita, no se computa para fiabilidad. Las cancelaciones del conductor no afectan al pasajero.
- **Retención:** los eventos identificables de cancelación, ausencia y corrección se eliminan a los seis meses y se excluyen del indicador; no se conserva historial por usuario pasado ese plazo.
- **Distancia:** OSRM público es la fuente elegida para distancia por carretera en el MVP. Se guarda la distancia con el trayecto y se verifican términos y límites vigentes antes de desplegar esa integración.
- **Parking:** el MVP ofrece Panoramis (2 € estimados por tramo) y aparcamiento gratuito. Interparking queda fuera hasta validar sus tarifas y condiciones.
- **Recurrencia:** los viajes recurrentes quedan fuera del MVP; las publicaciones son viajes individuales.
- **Fiabilidad:** se mantienen la fórmula, el umbral mínimo de cinco reservas evaluables y la ventana de diez minutos para deshacer una ausencia, aprobados en RF-009/RF-011 y en la constitución.

## 12. Fuera del alcance del MVP

No se implementan cálculo productivo de gastos compartibles, pagos, reembolsos, Interparking ni viajes recurrentes. Las estimaciones informativas no generan deudas ni obligan a realizar pagos. Las funcionalidades incluidas en el MVP siguen requiriendo su implementación, migraciones y pruebas RLS; esta definición no implica que ya estén construidas.


---

# Requisitos funcionales aprobados (RF-001 a RF-015)

**Fecha de aprobación:** 21-11-2026 y 22-11-2026. Esta sección y las decisiones de la sección 11 prevalecen sobre cualquier formulación anterior que las contradiga.

## Gestión de costes y gastos compartibles

### RF-001. Costes de parking predefinidos
El sistema deberá considerar un coste estimado de parking de:
- 2,00 € para el trayecto de ida.
- 2,00 € para el trayecto de vuelta.
- 4,00 € para los trayectos de ida y vuelta realizados en la misma jornada.

Estos importes representan el coste estimado de parking del vehículo por tramo/jornada, no un coste verificado ni el importe de una deuda individual. El desglose informativo por pasajero puede usar las participaciones de quienes acepten compartir el parking. El valor de referencia de Panoramis es editable desde administración y no altera estimaciones ya aceptadas.

### RF-002. Estimación mostrada al pasajero
Antes de enviar su solicitud, el sistema mostrará al pasajero las estimaciones informativas de desplazamiento y parking cuando correspondan, indicando que no son gastos reales verificados, una deuda ni una solicitud de pago.

### RF-003. Bloqueo del importe aceptado
Una vez que el pasajero confirme su participación, el importe mostrado y aceptado quedará bloqueado. No podrá modificarse como consecuencia de cancelaciones realizadas por otros pasajeros.

### RF-004. No recálculo por cancelaciones permitidas
El sistema no recalculará ni incrementará las aportaciones aceptadas por los pasajeros restantes cuando otro pasajero cancele su participación dentro del plazo de cancelación establecido.

### RF-015. Estabilidad de las condiciones aceptadas
Una vez confirmada una plaza, las condiciones económicas aceptadas no podrán empeorar para ese pasajero como consecuencia de eventos posteriores producidos por otros usuarios, incluyendo cancelaciones, ausencias o modificaciones de ocupación del vehículo. Este requisito amplía RF-003 y RF-004: el importe aceptado debe conservarse como una instantánea asociada a la reserva. No se realizará un cargo ni se exigirá una aportación adicional por un cambio posterior de ocupación.

## Gestión de cancelaciones

### RF-005. Cancelación por parte del pasajero
El sistema permitirá al pasajero cancelar su participación en cualquier momento antes de la hora de salida programada. Las cancelaciones con al menos dos horas de antelación se registrarán como ordinarias; las realizadas con menos de dos horas se permitirán y se registrarán como tardías.

Las cancelaciones con menos de dos horas de antelación también están permitidas; se registran como tardías conforme a RF-008.

### RF-006. Advertencia previa de cancelación
Antes de confirmar una cancelación, el sistema informará al usuario de que la cancelación quedará registrada en su historial de actividad y podrá tenerse en cuenta para calcular su fiabilidad dentro de la plataforma.

### RF-007. Registro de cancelaciones
El sistema registrará todas las cancelaciones realizadas por los pasajeros, incluyendo fecha, hora y trayecto afectado.

### RF-008. Cancelaciones tardías
El sistema marcará como cancelación tardía cualquier cancelación realizada con menos de dos horas de antelación respecto a la hora de salida del trayecto. La marca de tardía es un registro de actividad; estos requisitos no definen multa ni cobro asociado.

### RF-009. Ausencias
El sistema permitirá registrar como ausencia ("no presentado") a un pasajero que, habiendo confirmado su participación, no se presente al trayecto y no haya realizado una cancelación previa.

El conductor puede registrar la ausencia de un pasajero que tenía plaza confirmada, no se presentó y no realizó una cancelación previa. El conductor que hizo el registro puede deshacerlo durante los diez minutos siguientes. El registro original y su corrección deben conservar trazabilidad.

## Historial y fiabilidad

### RF-010. Conservación del historial de cancelaciones
El sistema conservará los registros identificables de cancelaciones, ausencias y sus correcciones durante seis meses desde la fecha en que se produzcan. Al finalizar ese periodo, los registros se eliminarán y dejarán de estar disponibles para el cálculo de fiabilidad; no se conserva historial por usuario pasado ese plazo.

### RF-011. Indicador de fiabilidad
El sistema utilizará la información de cancelaciones y ausencias registradas durante los últimos seis meses para calcular y mostrar un indicador de fiabilidad del usuario.

**Fórmula aprobada de fiabilidad:**

\[
\text{Fiabilidad} =
\frac{C + O + 0,5T}{N}\times 100
\]

Donde:
- \(C\): número de viajes completados en el periodo.
- \(O\): número de cancelaciones ordinarias del pasajero (realizadas con al menos dos horas de antelación).
- \(T\): número de cancelaciones tardías del pasajero (realizadas con menos de dos horas de antelación).
- \(N\): total de reservas confirmadas evaluables del usuario en los últimos seis meses. Cada reserva se cuenta una sola vez.
- Una ausencia confirmada aporta 0 puntos y forma parte de \(N\).

Por tanto, viaje completado y cancelación ordinaria aportan 1 punto; cancelación tardía aporta 0,5 puntos; ausencia aporta 0 puntos. Una ausencia tiene el doble de impacto negativo que una cancelación tardía. Las cancelaciones realizadas por el conductor y los viajes cancelados por el conductor no se imputan como incumplimiento del pasajero.

**Umbral mínimo:** el indicador numérico solo se muestra cuando existen al menos cinco reservas confirmadas evaluables dentro de los últimos seis meses. Con menos de cinco, se muestra «Datos insuficientes» y no se presenta una puntuación numérica.

**Corrección de ausencias:** el conductor que haya registrado una ausencia puede deshacer su propio registro durante los diez minutos siguientes. Al deshacerlo, la ausencia deja de contar como tal y la fiabilidad se recalcula según el estado definitivo de la reserva; no se convierte automáticamente en viaje completado. La corrección debe quedar auditada, conservando quién registró la ausencia, quién la deshizo y las marcas temporales.

**Cierre y acceso:** el conductor cierra cada tramo e indica por cada reserva confirmada no cancelada si se completó el viaje o hubo ausencia. Una reserva sin clasificación explícita no se evalúa. El historial detallado solo está disponible para su titular y administración autorizada. A terceros solo se muestra el indicador agregado, y únicamente al revisar una solicitud o reserva entre ambos; nunca se muestra el detalle de eventos.

## Gestión de pagos

### RF-012. Ausencia de gestión de pagos
El sistema no procesará, custodiará ni distribuirá pagos entre usuarios.

### RF-013. Ausencia de proveedores de pago
El sistema no integrará pasarelas de pago ni proveedores externos de procesamiento de pagos.

### RF-014. Acuerdos económicos externos
Cualquier intercambio económico entre conductor y pasajeros se realizará fuera de la plataforma mediante los medios que acuerden las partes. Blaccent se limita a mostrar estimaciones y condiciones económicas acordadas; no inicia ni verifica transferencias.

## Reglas económicas informativas que se mantienen de decisiones anteriores

- El conductor no paga aportaciones ni obtiene beneficio. En el MVP, Blaccent no calcula ni registra pagos ni deudas.
- Tarifas orientativas por pasajero y trayecto: 0–10 km: 1 €; >10–20 km: 2 €; >20–35 km: 3 €; >35–50 km: 4 €; >50 km: 5 €.
- El límite proporcional de gastos reales no se implementa en el MVP. Los conceptos, evidencias y unidad se validarán legalmente antes de habilitar una fase de cálculo productivo.
- El parking de Panoramis se estima en 2 € por ida y 2 € por vuelta, 4 € si se realizan ambos tramos en la misma jornada.
- La estimación de parking se presenta de forma informativa; se congela para cada reserva aceptada y no aumenta ni se redistribuye por cambios posteriores. El reparto por participaciones se conserva como desglose estimado.
- El parking gratuito está incluido; Interparking queda fuera del MVP.
- El destino es exclusivamente la oficina de Panoramis.
- Se mantiene la aprobación del conductor para confirmar solicitudes.
- Se mantienen ubicación en vivo durante el trayecto activo e historial, con controles de privacidad.

## Alcance y condiciones futuras

Las decisiones funcionales para el MVP están cerradas en la sección 11. El cálculo productivo de gastos compartibles, Interparking y recurrencia quedan fuera del MVP, no como requisitos bloqueantes. Antes del despliegue de OSRM se verifican sus términos y límites; esta es una condición operativa de integración, no una decisión de producto pendiente.

## Exclusiones expresas
- No implementar pasarelas, pagos, custodia, transferencias, liquidaciones ni reembolsos desde Blaccent.
- No aplicar multas o penalizaciones económicas por cancelaciones tardías o ausencias sin un requisito aprobado adicional.
- No aumentar importes aceptados por cancelaciones, ausencias ni cambios de ocupación.
