# Definición funcional de Blaccent

**Estado:** borrador funcional actualizado; las decisiones indicadas como aprobadas reflejan las respuestas acordadas el 21-11-2026. Los puntos marcados como pendientes no deben implementarse como reglas definitivas.

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

### 3.2 Límite por gastos reales

La suma provisional de las aportaciones de los pasajeros no puede superar el límite de gastos reales compartibles aplicable. Si lo supera, las aportaciones se reducen proporcionalmente.

**Regla matemática propuesta para el cálculo:** si las aportaciones provisionales son (a_i) y el límite validado es (G), con (A=\sum a_i):
- Si (A \leq G), se mantienen las aportaciones provisionales.
- Si (A > G), cada aportación ajustada se calcula proporcionalmente: (a_i' = a_i \times G/A).
- El cálculo final se realiza en céntimos. Los céntimos residuales se distribuyen mediante un criterio determinista (por ejemplo, mayores restos), de modo que la suma sea exactamente el límite redondeado y nunca lo supere.

Esta fórmula no resuelve por sí sola qué gastos se consideran compartibles ni cuál es la unidad sobre la que se calcula el límite. Esos elementos deben validarse antes de implementar el cálculo. No se deben inventar gastos ni tratar una estimación como justificante de gasto real.

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
- Sus tarifas, modalidades y condiciones de estancia se configuran desde administración.
- El importe debe calcularse con la información de tarifa y duración que se haya validado.

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

Los importes se expresan en céntimos. Los céntimos residuales se distribuyen de forma determinista, sin que la suma exceda ni quede por debajo del coste que se está repartiendo.

### 4.3 Aceptación y regularización

Antes de confirmar, el pasajero debe ver:
- Aparcamiento seleccionado.
- Coste estimado o calculado.
- Participaciones aplicables.
- Su aportación de parking.
- Aportación del desplazamiento.
- Total estimado.

El pasajero debe aceptar expresamente el importe estimado que le corresponde. Una vez confirmada la plaza, ese importe queda bloqueado y no puede aumentar por cambios posteriores de ocupación, cancelaciones o ausencias. RF-012 a RF-014 establecen que Blaccent no procesa ni gestiona pagos ni reembolsos; cualquier acuerdo o ajuste económico entre las partes se realiza fuera de la plataforma. La app no debe solicitar ni registrar un pago adicional como consecuencia de cambios posteriores.

## 5. Reservas y aprobación

1. El pasajero consulta viajes disponibles.
2. Elige solo ida, solo vuelta o ambos tramos.
3. Consulta disponibilidad por tramo y desglose económico.
4. Acepta el importe estimado del desplazamiento y, si procede, el parking.
5. Envía una solicitud.
6. El conductor acepta o rechaza.
7. La plaza solo queda confirmada tras la aceptación del conductor y la aceptación de las condiciones económicas aplicables.

No se puede confirmar más plazas de las disponibles. La aceptación de ida no reserva automáticamente la vuelta ni viceversa.

## 6. Política de cancelación

### 6.1 Estado de decisión

Está aprobada la necesidad de una política de cancelación explícita, pero **no está aprobado un plazo concreto**. La regla anterior de 24 horas y la caducidad de 30 días del historial no deben tratarse como vigentes.

### 6.2 Propuesta para revisión

La política debe distinguir cancelación por pasajero o conductor, cancelación de uno o ambos tramos, y el registro de cancelaciones tardías. Blaccent no gestionará reembolsos ni pagos; cualquier acuerdo económico derivado de una cancelación se realiza externamente. Los importes aceptados por los pasajeros restantes no se recalculan ni aumentan.

Principios recomendados para la política:
1. Liberar la plaza del tramo cancelado y actualizar su disponibilidad.
2. No aumentar automáticamente la aportación de pasajeros restantes.
3. Recalcular el reparto del parking solo según las condiciones que los pasajeros hayan aceptado y la política publicada.
4. No recalcular ni aumentar las aportaciones aceptadas por los pasajeros restantes.
5. No procesar reembolsos ni pagos desde Blaccent; los acuerdos económicos se realizan fuera de la plataforma.
6. Si cancela el conductor, informar a todos los pasajeros afectados.
7. Registrar el evento de cancelación en el historial durante seis meses.

### 6.3 Decisiones que debe confirmar el propietario del producto

- Plazo de corte para cancelar sin consecuencias.
- Tratamiento económico después del plazo.
- Si existen gastos no reembolsables y cómo se acreditan.
- Si las cancelaciones tardías afectan temporalmente al indicador de historial y durante cuánto tiempo.
- Qué ocurre si la cancelación reduce las participaciones y deja un coste de parking no recuperable.

## 7. Ubicación en vivo e historial

Se mantienen ambas funcionalidades.

**Ubicación en vivo**
- El conductor inicia el seguimiento al comenzar el tramo y lo finaliza al terminarlo.
- El navegador solicita permiso.
- Solo participantes autorizados de ese tramo consultan la ubicación.
- No se transmite ubicación fuera de un trayecto activo.

**Historial**
- Se conserva historial de desplazamientos y cancelaciones para aportar contexto de confianza.
- El acceso debe limitarse a los casos y usuarios autorizados.
- La duración de conservación y visibilidad de cancelaciones tardías queda pendiente de aprobación.

## 8. Administración

El panel de administración deberá permitir:
- Gestionar usuarios, conductores y pasajeros.
- Consultar viajes y reservas.
- Configurar tarifas base por distancia.
- Configurar los importes estimados de Panoramis (2 € por ida y 2 € por vuelta; 4 € ambos tramos en la misma jornada).
- Mantener tarifas y modalidades de Interparking.
- Gestionar la política de cancelación una vez aprobada.
- Consultar los importes estimados y los acuerdos económicos informados; no gestionar pagos ni reembolsos.
- Consultar estadísticas de uso.
- Mantener trazabilidad de cambios y vigencia de cada configuración.

Los cambios de tarifas no deben alterar silenciosamente importes ya aceptados en reservas existentes.

## 9. Pagos y cumplimiento

No se activa todavía el cobro real ni la liquidación a conductores. Antes se debe validar:
- Quién recibe los fondos y cómo se transfieren.
- Qué entidad o persona asume las comisiones de procesamiento.
- Cómo se gestionan reembolsos, pagos fallidos y conciliación.
- Que el proveedor permite el modelo de pagos entre usuarios previsto.
- El encaje legal en España en materia de movilidad colaborativa, gastos compartidos, intermediación, fiscalidad, protección de consumidores y protección de datos.

No se añadirá una comisión de reserva sin aprobación expresa. Los servicios de pago pueden contradecir el requisito de coste cero; cualquier excepción requiere aprobación.

## 10. Privacidad y seguridad

- Acceso limitado al dominio corporativo configurado.
- RLS en Supabase para usuarios, viajes, reservas, ubicación e historial.
- La ubicación solo es visible para participantes autorizados durante el tramo activo.
- Las claves privilegiadas no se exponen en el frontend.
- Las aceptaciones económicas deben quedar asociadas a la reserva y a la configuración aplicable.
- Los cambios administrativos deben ser auditables.

## 11. Cuestiones funcionales pendientes

1. Definir conceptos admisibles y evidencia de los gastos reales compartibles.
2. Definir unidad de cálculo del límite proporcional: por trayecto, jornada o vehículo.
3. Definir cómo se resuelve el exceso del coste real del parking cuando un pasajero no acepta pagarlo.
4. Aprobar plazo y consecuencias de cancelación.
5. Aprobar retención y visibilidad del historial de cancelaciones.
6. Definir modelo de pagos, comisiones y liquidaciones.
7. Definir fuente y método de cálculo de distancia por carretera.
8. Confirmar reglas de recurrencia y reservas de días concretos.

## 12. Fuera del alcance de esta actualización documental

Esta actualización no implementa lógica de cálculo, pagos, migraciones SQL, políticas RLS, interfaz ni integraciones de parking. Esas tareas se abordarán después de validar las decisiones pendientes y el diseño funcional correspondiente.


---

# Requisitos funcionales aprobados (RF-001 a RF-015)

**Fecha de aprobación:** 21-11-2026. Esta sección prevalece sobre cualquier formulación anterior de este documento que la contradiga. Los puntos identificados como pendientes requieren decisión antes de desarrollar la funcionalidad afectada.

## Gestión de costes y gastos compartibles

### RF-001. Costes de parking predefinidos
El sistema deberá considerar un coste estimado de parking de:
- 2,00 € para el trayecto de ida.
- 2,00 € para el trayecto de vuelta.
- 4,00 € para los trayectos de ida y vuelta realizados en la misma jornada.

Estos importes representan el coste estimado de parking del vehículo por tramo/jornada, no el importe que paga individualmente cada pasajero. El reparto individual se calcula según las participaciones de los pasajeros que acepten compartir el parking. El valor de referencia de Panoramis es editable desde administración.

### RF-002. Importe mostrado al pasajero
Antes de confirmar su participación, el sistema mostrará al pasajero el importe estimado que le corresponde asumir en concepto de gastos compartibles, con desglose de desplazamiento y parking cuando corresponda.

### RF-003. Bloqueo del importe aceptado
Una vez que el pasajero confirme su participación, el importe mostrado y aceptado quedará bloqueado. No podrá modificarse como consecuencia de cancelaciones realizadas por otros pasajeros.

### RF-004. No recálculo por cancelaciones permitidas
El sistema no recalculará ni incrementará las aportaciones aceptadas por los pasajeros restantes cuando otro pasajero cancele su participación dentro del plazo de cancelación establecido.

### RF-015. Estabilidad de las condiciones aceptadas
Una vez confirmada una plaza, las condiciones económicas aceptadas no podrán empeorar para ese pasajero como consecuencia de eventos posteriores producidos por otros usuarios, incluyendo cancelaciones, ausencias o modificaciones de ocupación del vehículo. Este requisito amplía RF-003 y RF-004: el importe aceptado debe conservarse como una instantánea asociada a la reserva. No se realizará un cargo ni se exigirá una aportación adicional por un cambio posterior de ocupación.

## Gestión de cancelaciones

### RF-005. Cancelación por parte del pasajero
El sistema permitirá al pasajero cancelar su participación en un trayecto hasta dos horas antes de la hora de salida programada.

**Pendiente de aclaración:** la redacción establece el plazo de cancelación permitida, pero RF-008 contempla cancelaciones con menos de dos horas. Antes de implementar, debe confirmarse si una cancelación tardía se permite y queda registrada como tardía, o si el sistema la bloquea y se registra mediante otro procedimiento.

### RF-006. Advertencia previa de cancelación
Antes de confirmar una cancelación, el sistema informará al usuario de que la cancelación quedará registrada en su historial de actividad y podrá tenerse en cuenta para calcular su fiabilidad dentro de la plataforma.

### RF-007. Registro de cancelaciones
El sistema registrará todas las cancelaciones realizadas por los pasajeros, incluyendo fecha, hora y trayecto afectado.

### RF-008. Cancelaciones tardías
El sistema marcará como cancelación tardía cualquier cancelación realizada con menos de dos horas de antelación respecto a la hora de salida del trayecto. La marca de tardía es un registro de actividad; estos requisitos no definen multa ni cobro asociado.

### RF-009. Ausencias
El sistema permitirá registrar como ausencia ("no presentado") a un pasajero que, habiendo confirmado su participación, no se presente al trayecto y no haya realizado una cancelación previa.

**Pendiente de aclaración:** definir quién puede registrar la ausencia (por ejemplo, conductor o administrador), en qué ventana temporal y si el pasajero puede impugnar o solicitar corrección del registro.

## Historial y fiabilidad

### RF-010. Conservación del historial de cancelaciones
El sistema conservará los registros de cancelaciones y ausencias durante seis meses desde la fecha en que se produzcan. Transcurrido ese periodo dejarán de estar disponibles para el cálculo de fiabilidad y deberán eliminarse o anonimizarse conforme a la política de conservación que se apruebe.

### RF-011. Indicador de fiabilidad
El sistema utilizará la información de cancelaciones y ausencias registradas durante los últimos seis meses para calcular y mostrar un indicador de fiabilidad del usuario.

**Pendiente de aclaración:** definir fórmula, ponderación de cancelación ordinaria frente a tardía y ausencia, umbrales/etiquetas, quién puede consultar el indicador y si el usuario puede consultar su propio detalle. No presentar una puntuación o porcentaje arbitrario como regla aprobada.

## Gestión de pagos

### RF-012. Ausencia de gestión de pagos
El sistema no procesará, custodiará ni distribuirá pagos entre usuarios.

### RF-013. Ausencia de proveedores de pago
El sistema no integrará pasarelas de pago ni proveedores externos de procesamiento de pagos.

### RF-014. Acuerdos económicos externos
Cualquier intercambio económico entre conductor y pasajeros se realizará fuera de la plataforma mediante los medios que acuerden las partes. Blaccent se limita a mostrar estimaciones y condiciones económicas acordadas; no inicia ni verifica transferencias.

## Reglas económicas que se mantienen de decisiones anteriores

- Solo los pasajeros aportan a los gastos; el conductor no paga ni obtiene beneficio.
- Tarifas orientativas por pasajero y trayecto: 0–10 km: 1 €; >10–20 km: 2 €; >20–35 km: 3 €; >35–50 km: 4 €; >50 km: 5 €.
- Cuando las aportaciones provisionales superen el límite de gastos reales compartibles, se aplica reducción proporcional. La unidad de cálculo y los conceptos de gasto admisibles siguen pendientes.
- El parking de Panoramis se estima en 2 € por ida y 2 € por vuelta, 4 € si se realizan ambos tramos en la misma jornada.
- El parking se reparte entre los pasajeros que lo acepten expresamente: una participación por ida, una por vuelta y dos por ida y vuelta. El importe por pasajero queda bloqueado al confirmar.
- El destino es exclusivamente la oficina de Panoramis.
- Se mantiene la aprobación del conductor para confirmar solicitudes.
- Se mantienen ubicación en vivo durante el trayecto activo e historial, con controles de privacidad.

## Decisiones pendientes antes de implementación

1. Unidad de cálculo del límite proporcional de gastos reales y conceptos admisibles.
2. Confirmar si se permite cancelar durante las últimas dos horas o si la cancelación se bloquea.
3. Quién registra ausencias, cuándo y cómo puede revisarse un registro incorrecto.
4. Fórmula, ponderaciones, presentación y permisos del indicador de fiabilidad.
5. Confirmar política de retención técnica y eliminación/anonimización al cumplir seis meses.
6. Cómo se presenta el importe estimado por tramo y la instantánea económica aceptada por cada pasajero.

## Exclusiones expresas
- No implementar pasarelas, pagos, custodia, transferencias, liquidaciones ni reembolsos desde Blaccent.
- No aplicar multas o penalizaciones económicas por cancelaciones tardías o ausencias sin un requisito aprobado adicional.
- No aumentar importes aceptados por cancelaciones, ausencias ni cambios de ocupación.
