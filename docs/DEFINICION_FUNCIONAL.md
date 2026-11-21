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
- Coste predeterminado: **4 € por jornada y vehículo**.
- Es un importe estimado, no una tarifa real garantizada.
- Administración puede modificar el valor predeterminado.

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

El pasajero debe aceptar expresamente el parking. Si el coste real es inferior al estimado, se devuelve la diferencia correspondiente. Si es superior, se informa y solicita aceptación expresa para cualquier importe adicional. No se puede cobrar unilateralmente una diferencia ni aumentar un importe confirmado sin aceptación.

**Pendiente:** definir qué ocurre si el coste real supera la estimación y el pasajero no acepta el importe adicional (por ejemplo, asumir la diferencia sin repercutirla, renegociar antes del uso o aplicar una alternativa de parking). También debe determinarse cómo se acredita el coste real.

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

La política debería distinguir:
- Cancelación por el pasajero.
- Cancelación por el conductor.
- Cancelación de un tramo frente a cancelación de ida y vuelta.
- Cancelación antes y después de un plazo de corte que todavía debe decidirse.
- Costes de parking recuperables y no recuperables.
- Reembolso de la aportación del desplazamiento.
- Efecto sobre las participaciones y aportaciones de los pasajeros restantes.
- Comunicación y aceptación de cualquier modificación económica.

Principios recomendados para la política:
1. Liberar la plaza del tramo cancelado y actualizar su disponibilidad.
2. No aumentar automáticamente la aportación de pasajeros restantes.
3. Recalcular el reparto del parking solo según las condiciones que los pasajeros hayan aceptado y la política publicada.
4. Reembolsar los importes que ya no correspondan, cuando sean recuperables.
5. Si se propone un importe nuevo a los pasajeros restantes, solicitar aceptación expresa.
6. Si cancela el conductor, informar a todos los pasajeros afectados y aplicar el reembolso que corresponda.
7. Registrar el evento de cancelación para el historial, sujeto a una política de retención aún pendiente.

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
- Configurar el importe predeterminado de Panoramis (4 € por jornada y vehículo).
- Mantener tarifas y modalidades de Interparking.
- Gestionar la política de cancelación una vez aprobada.
- Consultar aportaciones, regularizaciones y reembolsos cuando el modelo de pagos esté definido.
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
