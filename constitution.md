# Constitución de Blaccent

## Principios fundamentales

### I. Movilidad colaborativa con destino único
Blaccent es una aplicación web interna, responsive y preparada para instalarse como PWA, destinada a facilitar que empleados compartan desplazamientos habituales en coche hasta su oficina en Panoramis, Alicante. El destino funcional es la oficina; no se ofrecen destinos alternativos al publicar viajes. Blaccent no es un servicio profesional de transporte ni debe incentivar desplazamientos para obtener ingresos.

### II. Sin ánimo de lucro para el conductor
Las aportaciones corresponden exclusivamente a los pasajeros. El conductor no paga aportaciones por su propio vehículo ni recibe beneficio económico. Las tarifas por distancia son orientativas y quedan sujetas a un límite de gastos reales compartibles. Si las aportaciones provisionales superan el límite aplicable, se reducen proporcionalmente. El cálculo monetario debe realizarse en céntimos y no superar el límite.

### III. Importes aceptados estables
Antes de solicitar una plaza, el pasajero debe conocer el importe estimado que le corresponde por gastos compartibles. Una vez confirmada su participación, el importe y las condiciones económicas aceptadas quedan bloqueados. No se pueden recalcular al alza ni empeorar por cancelaciones, ausencias o cambios de ocupación producidos por otros usuarios. Cualquier propuesta posterior de aportación adicional requiere una aceptación voluntaria y separada; no se genera un cobro automático.

### IV. Costes de parking predefinidos y reparto por tramo
El coste estimado del parking de Panoramis es de 2 € para la ida y 2 € para la vuelta, es decir, 4 € cuando se realizan ambos tramos en la misma jornada. Estos importes son estimaciones por vehículo y tramo/jornada, no importes individuales por pasajero. Se mantienen editables desde administración. El coste de cada tramo se reparte entre los pasajeros que hayan aceptado compartir el parking en ese mismo tramo. El criterio de participaciones es: una por ida, una por vuelta y dos por ida y vuelta. Los importes aceptados no aumentan por cancelaciones o cambios de ocupación posteriores.

### V. Reservas y aprobación explícita
Una solicitud de reserva no confirma una plaza. El conductor acepta o rechaza cada solicitud. La disponibilidad se controla por tramo. El pasajero debe aceptar las condiciones económicas mostradas antes de confirmar su participación.

### VI. Cancelaciones y ausencias
El pasajero puede cancelar en cualquier momento antes de la salida programada. Las cancelaciones realizadas con al menos dos horas de antelación se registran como ordinarias; las realizadas con menos de dos horas se permiten y se registran como tardías. Antes de confirmar, se informa al usuario de que la cancelación quedará registrada y podrá influir en su fiabilidad. El conductor puede registrar como ausencia a un pasajero con plaza confirmada que no se presente y no haya cancelado. Las cancelaciones y ausencias se conservan durante seis meses. En el indicador de fiabilidad, una ausencia tiene un impacto negativo mayor que una cancelación tardía; la ponderación numérica exacta sigue pendiente.

### VII. Acuerdos económicos fuera de la plataforma
Blaccent puede mostrar importes estimados e información de reparto, pero no procesa, custodia ni distribuye pagos. No integra pasarelas ni proveedores externos de pago. Cualquier intercambio económico entre conductor y pasajeros se acuerda y realiza fuera de Blaccent, mediante los medios que las partes decidan.

### VIII. Ubicación en vivo e historial
Se mantienen la ubicación en vivo del conductor durante un trayecto activo y el historial de desplazamientos, cancelaciones y ausencias. La ubicación solo se comparte con participantes autorizados del trayecto y únicamente mientras esté activo. Los registros de cancelaciones y ausencias se conservan durante seis meses desde su producción; el acceso debe estar limitado y ser coherente con la finalidad de confianza y coordinación.

### IX. Privacidad y seguridad desde el diseño
El registro y el acceso se limitan al dominio corporativo configurado. La privacidad y autorización de usuarios, trayectos, reservas, ubicaciones e historial se aplican en PostgreSQL mediante políticas RLS de Supabase; ocultar datos solo en la interfaz no constituye control de acceso. Las claves privilegiadas nunca se exponen en el frontend. Se recopila y comparte únicamente la información necesaria.

### X. Configuración explícita y mantenibilidad
Las tarifas por distancia, los importes estimados de parking y la configuración funcional se mantienen de forma administrable y trazable. Los cambios de configuración no alteran importes y condiciones ya aceptados. El frontend se implementa con Vue.js y CSS modular, siguiendo un enfoque mobile-first. La configuración por entorno se documenta mediante `.env.example`; los secretos no se versionan. El repositorio debe incluir `MAINTENANCE.md`.

### XI. Coste y servicios
La solución prioriza servicios gratuitos y serverless. Supabase Cloud proporciona PostgreSQL, autenticación y Realtime; el frontend estático se despliega desde el repositorio autorizado en Vercel o Netlify. No se incorporan proveedores ni integraciones de pago, ya que la plataforma no debe gestionar transferencias económicas.

## Requisitos funcionales y de plataforma

- **Autenticación:** Supabase gestiona la autenticación corporativa y la aplicación valida el dominio permitido mediante configuración no eludible desde el cliente.
- **Destino:** todos los viajes publicados tienen como destino la oficina de Panoramis, Alicante.
- **Tarifas de desplazamiento:** importes orientativos por pasajero y trayecto: 0–10 km: 1 €; más de 10–20 km: 2 €; más de 20–35 km: 3 €; más de 35–50 km: 4 €; más de 50 km: 5 €. Ida y vuelta se calculan por separado.
- **Límite de gastos:** las aportaciones provisionales se reducen proporcionalmente cuando superan el límite de gastos reales compartibles. Deben concretarse los conceptos admisibles y la unidad de cálculo antes de implementar el motor económico.
- **Parking Panoramis:** 2 € estimados para ida, 2 € para vuelta y 4 € para ambos tramos en la misma jornada. Se entienden como costes estimados del vehículo por tramo/jornada y son configurables desde administración.
- **Reparto del parking:** solo participan pasajeros que aceptan el coste; cada tramo se reparte entre los pasajeros de ese tramo. El criterio de participaciones es una por ida, una por vuelta y dos por ida y vuelta.
- **Bloqueo económico:** el importe y condiciones aceptadas por el pasajero no aumentan ni se recalculan por cancelaciones, ausencias o cambios de ocupación posteriores.
- **Reservas:** se permite solo ida, solo vuelta o ida y vuelta. Las plazas y estados se gestionan por tramo. La confirmación requiere aprobación del conductor y aceptación de las condiciones económicas.
- **Cancelaciones:** el pasajero puede cancelar hasta la salida. Si faltan al menos dos horas, la cancelación es ordinaria; si faltan menos de dos horas, se permite y se marca como tardía.
- **Ausencias:** el conductor puede registrar como no presentado a un pasajero confirmado que no haya cancelado previamente.
- **Fiabilidad:** se calcula a partir de la actividad de los últimos seis meses. Una ausencia pesa más negativamente que una cancelación tardía. La fórmula numérica y las reglas de visibilidad quedan pendientes.
- **Historial:** se conservan cancelaciones y ausencias durante seis meses desde que ocurren.
- **Pagos:** no hay procesamiento, custodia ni distribución de fondos dentro de Blaccent. Los acuerdos económicos se realizan fuera de la plataforma.
- **Ubicación en vivo:** geolocalización del navegador y Supabase Realtime durante trayectos activos; solo el conductor transmite y solo participantes autorizados consultan.
- **Administración:** gestión de usuarios, viajes, reservas, tarifas, importes estimados de parking y consulta del historial conforme a los permisos.
- **RLS:** toda tabla con información de usuarios, trayectos, reservas, ubicación o historial cuenta con políticas de mínimo privilegio y pruebas de acceso permitido y denegado.
- **Despliegue:** frontend estático en Vercel o Netlify; se revisan límites y condiciones del nivel gratuito.

## Flujo de desarrollo y calidad

- Esta constitución prevalece sobre otras guías del repositorio cuando exista conflicto.
- Los cambios de esquema incluyen migraciones y políticas RLS correspondientes.
- Los cambios de autenticación, permisos, reservas, importes, cancelaciones, ausencias y ubicación requieren pruebas de acceso permitido y denegado.
- Los cálculos monetarios usan céntimos enteros o representación decimal exacta; no usar coma flotante binaria para importes.
- Las tarifas e importes mostrados deben indicar su naturaleza estimada.
- Los importes y condiciones aceptados se conservan como una instantánea vinculada a la reserva; los cambios posteriores de ocupación no pueden aumentarlos.
- La ubicación solo puede compartirse con participantes autorizados durante el tramo activo.
- Los registros de cancelación y ausencia tienen una retención de seis meses.
- No incorporar funciones para cobrar, custodiar, transferir o liquidar pagos.

## Gobernanza

Toda enmienda debe actualizar este documento, incrementar su versión y registrar motivo y fecha. Las excepciones deben ser explícitas, acotadas y aprobadas.

**Versión**: 1.3.0 | **Ratificada**: 2026-11-21 | **Última enmienda**: 2026-11-21

**Motivo de la enmienda 1.3.0**: aclarar que las cancelaciones tardías están permitidas y se registran como tales; atribuir al conductor la capacidad de registrar ausencias; y establecer que una ausencia afecta más negativamente a la fiabilidad que una cancelación tardía. La ponderación numérica permanece pendiente.