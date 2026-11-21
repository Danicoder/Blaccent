# Constitución de Blaccent

## Principios fundamentales

### I. Movilidad colaborativa con destino único
Blaccent es una aplicación web interna, responsive y preparada para instalarse como PWA, destinada a facilitar que empleados compartan desplazamientos habituales en coche hasta su oficina en Panoramis, Alicante. El destino funcional es la oficina; no se ofrecerán destinos alternativos en la publicación de viajes. La aplicación no es un servicio profesional de transporte ni debe incentivar desplazamientos realizados exclusivamente para obtener ingresos.

### II. Sin ánimo de lucro para el conductor
Las aportaciones corresponden exclusivamente a los pasajeros. El conductor no paga aportaciones por su propio vehículo ni recibe beneficio económico. Las tarifas por distancia son orientativas y quedan sujetas a un límite de gastos reales compartibles. Si la suma provisional de aportaciones supera ese límite, se reducirá proporcionalmente entre los pasajeros afectados. El cálculo deberá trabajar en céntimos y garantizar que el total recaudado nunca supere el límite aplicable.

### III. Gastos del desplazamiento y parking separados
La aportación del desplazamiento y la del aparcamiento son conceptos independientes y deben mostrarse desglosados. El coste del parking se reparte exclusivamente entre los pasajeros que hayan aceptado expresamente compartirlo; el conductor no participa en ese reparto. No se pueden añadir importes a una reserva confirmada sin informar y obtener la aceptación correspondiente o aplicar la política de cancelación aceptada.

### IV. Parking configurable
Panoramis tiene un coste estimado predeterminado de **4 € por jornada y vehículo**. Este valor es editable desde administración y debe presentarse como estimación, no como tarifa real garantizada. Interparking Puerto Alicante - Poniente tendrá tarifas y modalidades configurables desde administración. La opción de aparcamiento gratuito tiene coste cero. El coste real conocido deberá regularizarse: las diferencias a favor del pasajero se devolverán; cualquier importe adicional requerirá información y aceptación expresa antes de cobrarlo.

### V. Reparto del parking por participaciones
Se mantiene el criterio funcional de participaciones: solo ida = 1; solo vuelta = 1; ida y vuelta = 2. El coste se divide entre el total de participaciones de los pasajeros que hayan aceptado el parking. El reparto se calcula en céntimos, distribuyendo los céntimos residuales de forma determinista sin superar ni quedar por debajo del coste total que se reparte. La aplicación de este criterio a reservas de distintos tramos y a cancelaciones debe respetar la política de cancelación y no incrementar unilateralmente importes ya aceptados.

### VI. Reservas con aprobación explícita
Una solicitud no confirma una plaza. El conductor debe aceptar o denegar cada solicitud. La disponibilidad se controla independientemente para ida y vuelta. El pasajero debe conocer y aceptar el desglose económico antes de que la reserva quede confirmada.

### VII. Cancelaciones sujetas a política explícita
Blaccent debe disponer de una política de cancelación visible y aceptada por los usuarios. Se mantiene la necesidad de gestionar cancelaciones de pasajeros y conductores, ajustes y reembolsos, así como el historial de cumplimiento. La antigua regla de 24 horas y la caducidad de 30 días de las cancelaciones tardías no se consideran vigentes hasta que se apruebe una política nueva. Ningún cambio puede aumentar unilateralmente el importe de una reserva confirmada.

### VIII. Ubicación en vivo e historial
Se mantienen la ubicación en vivo del conductor durante un trayecto activo y el historial de desplazamientos y cancelaciones. La ubicación solo se comparte con participantes autorizados del trayecto y únicamente mientras esté activo. La consulta y conservación del historial deben limitarse a la finalidad de confianza y coordinación, con controles de privacidad y retención definidos.

### IX. Privacidad y seguridad desde el diseño
El registro y el acceso se limitan al dominio corporativo configurado. La privacidad y autorización de usuarios, trayectos, reservas, pagos, historial y ubicaciones se aplican en PostgreSQL mediante políticas RLS de Supabase; ocultar datos solo en la interfaz no constituye control de acceso. Las claves privilegiadas nunca se exponen en el frontend. Se recopila y comparte únicamente la información necesaria.

### X. Configuración explícita y mantenibilidad
Las tarifas por distancia, el valor estimado de Panoramis, las tarifas de Interparking y la política de cancelación deberán ser configurables desde administración, con trazabilidad de cambios y vigencia. Los importes aplicados a una reserva deben conservar la configuración y aceptación que los originó. El frontend se implementa con Vue.js y CSS modular, siguiendo un enfoque mobile-first. La configuración por entorno se documenta mediante `.env.example`; los secretos no se versionan. El repositorio debe incluir `MAINTENANCE.md`.

### XI. Coste y servicios
La solución prioriza servicios gratuitos y serverless. Supabase Cloud proporciona PostgreSQL, autenticación y Realtime; el frontend estático se despliega desde el repositorio oficial en Vercel o Netlify. No se incorporarán servicios de pago ni un proveedor de pagos hasta validar su coste, las comisiones, el modelo de cobro y liquidación y su encaje legal. Cualquier excepción al principio de coste cero requiere aprobación documentada.

## Requisitos funcionales y de plataforma

- **Autenticación:** Supabase gestiona la autenticación corporativa y la aplicación valida el dominio permitido mediante configuración no eludible desde el cliente.
- **Destino:** todos los viajes publicados tienen como destino la oficina de Panoramis, Alicante.
- **Tarifas de desplazamiento:** importes orientativos por pasajero y trayecto: 0–10 km: 1 €; más de 10–20 km: 2 €; más de 20–35 km: 3 €; más de 35–50 km: 4 €; más de 50 km: 5 €. Ida y vuelta se calculan por separado. Las tarifas se pueden modificar desde administración.
- **Límite de gastos:** las aportaciones provisionales se reducen proporcionalmente cuando superan el límite de gastos reales compartibles. Debe definirse y documentarse la unidad de cálculo, los conceptos admisibles y cómo se acredita el gasto antes de implementar el cálculo definitivo.
- **Parking:** Panoramis parte de 4 € estimados por jornada y vehículo; Interparking es configurable; aparcamiento gratuito equivale a 0 €. El parking se reparte solo entre pasajeros que lo acepten, mediante participaciones por trayecto.
- **Regularización del parking:** se devuelve la diferencia cuando el coste real es inferior al estimado. Si el coste real es superior, se informa y solicita aceptación expresa; no se cobra unilateralmente.
- **Reservas:** se permite solo ida, solo vuelta o ida y vuelta. Las plazas y estados se gestionan por tramo. La confirmación requiere aprobación del conductor y aceptación de las condiciones económicas.
- **Cancelaciones:** se aplica la política publicada y aceptada. Plazo, consecuencias, tratamiento de costes no recuperables, reembolsos y efecto sobre el reparto del parking siguen pendientes de aprobación.
- **Ubicación en vivo:** geolocalización del navegador y Supabase Realtime durante trayectos activos; solo el conductor transmite y solo los participantes autorizados consultan.
- **Historial:** se conserva historial de viajes y cancelaciones con acceso limitado y política de retención pendiente de aprobación.
- **Administración:** gestión de usuarios, viajes, reservas, tarifas, configuración de parking, política de cancelación y trazabilidad de cambios.
- **Pagos:** no se activan cobros ni liquidaciones reales hasta validar el modelo operativo, las comisiones, las responsabilidades y el cumplimiento legal.
- **RLS:** toda tabla con información de usuarios, trayectos, reservas, ubicación, historial o pagos cuenta con políticas de mínimo privilegio y pruebas de acceso permitido y denegado.
- **Despliegue:** frontend estático en Vercel o Netlify; se revisan límites y condiciones del nivel gratuito antes de adoptar servicios o aumentar su uso.

## Flujo de desarrollo y calidad

- Esta constitución prevalece sobre otras guías del repositorio cuando exista conflicto.
- Los cambios de esquema incluyen migraciones y políticas RLS correspondientes.
- Los cambios de autenticación, permisos, reservas, importes, cancelaciones y ubicación requieren pruebas de acceso permitido y denegado.
- Los cálculos monetarios usan céntimos enteros o una representación decimal exacta; no se utiliza aritmética binaria de coma flotante para importes.
- Las tarifas y estimaciones mostradas deben indicar su naturaleza y no presentarse como gastos reales cuando sean aproximaciones.
- Los cambios de configuración económica conservan trazabilidad y no alteran silenciosamente importes ya aceptados.
- Antes de incorporar dependencias o servicios externos se verifica su compatibilidad con coste, privacidad y administración corporativa.
- Antes de activar pagos se revisan las normas aplicables en España sobre movilidad colaborativa, gastos compartidos, intermediación, fiscalidad, protección de datos y consumidores.

## Gobernanza

Toda enmienda debe actualizar este documento, incrementar su versión y registrar motivo y fecha. Las excepciones deben ser explícitas, acotadas y aprobadas; no pueden introducir costes no autorizados ni debilitar la seguridad y privacidad.

**Versión**: 1.1.0 | **Ratificada**: 2026-11-21 | **Última enmienda**: 2026-11-21

**Motivo de la enmienda 1.1.0**: sustituir el modelo anterior de coste automático/manual y destinos alternativos por tarifas por distancia limitadas proporcionalmente por gastos reales; fijar Panoramis como destino único; establecer Panoramis 4 € estimados por jornada y vehículo; separar desplazamiento y parking; mantener aprobación del conductor, ubicación en vivo e historial; dejar la política de cancelación y el modelo de pagos pendientes de validación.