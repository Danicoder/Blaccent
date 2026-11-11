# Constitución de Blaccent

## Principios fundamentales

### I. Movilidad compartida con destino unificado
Blaccent es una aplicación web interna, responsive y preparada para instalarse como PWA, que ayuda a los empleados a compartir vehículo en sus desplazamientos a la sede corporativa de Panoramis, Alicante. La interfaz debe adaptarse a móviles de distintos tamaños. Panoramis es el destino predeterminado de los trayectos, pero el conductor puede elegir y especificar otro destino final al publicar el viaje. Las funciones deben favorecer una experiencia clara, accesible y sencilla.

### II. Coste cero y operación serverless
La solución utilizará exclusivamente capas gratuitas de servicios serverless gestionados que no requieran tarjeta de crédito ni infraestructura de pago. Supabase Cloud proporciona PostgreSQL, autenticación y Realtime; el frontend estático se despliega desde el repositorio oficial de la organización en Vercel o Netlify. No se introducirán contenedores, servidores propios ni servicios que incumplan estas condiciones.

### III. Propiedad corporativa y transferibilidad
GitHub y el despliegue del hosting pueden gestionarse desde cuentas personales de los desarrolladores responsables. En el caso de Supabase, el proyecto puede registrarse desde una cuenta personal siempre que se invite y mantenga una cuenta corporativa u organizativa (como la de Accenture) con privilegios de administración. La configuración, credenciales y procedimientos deben documentarse de forma que garanticen la transferibilidad y permitan que otro responsable de IT asume el control o la administración completa si fuera necesario.La configuración y los procedimientos deben permitir que otro responsable de IT asuma la administración.

### IV. Reservas con aprobación explícita
Una solicitud de reserva no confirma una plaza. El conductor debe poder aceptar o denegar cada solicitud, y el pasajero debe recibir el estado resultante en la aplicación. La disponibilidad de plazas y las transiciones de estado deben respetar este flujo y evitar confirmar solicitudes sin aprobación del conductor.

### V. Gastos transparentes
Al publicar un trayecto, el conductor elige entre una estimación automática basada en la distancia por carretera hasta el destino final elegido y un importe total introducido manualmente para compartir entre los ocupantes. La opción elegida y el importe comunicado deben ser claros antes de solicitar una plaza. Cualquier tarifa o supuesto usado por el cálculo automático debe ser explícito y configurable, no inventado ni presentado como un coste exacto.

### VI. Privacidad y seguridad desde el diseño
El registro y el acceso se limitan al dominio corporativo configurado. La privacidad y autorización de trayectos, reservas y ubicaciones se aplican en PostgreSQL mediante políticas RLS de Supabase; ocultar datos solo en la interfaz no constituye control de acceso. Las claves privilegiadas nunca se exponen en el frontend. Se recopila y comparte únicamente la ubicación necesaria para un trayecto activo, con acceso limitado a sus participantes autorizados.

### VII. Configuración explícita y mantenibilidad
El frontend se implementa con Vue.js y CSS modular, siguiendo un enfoque mobile-first. La configuración por entorno —URL y clave pública de Supabase, dominio permitido y coordenadas de Panoramis— se documenta mediante `.env.example` (o el mecanismo equivalente del stack); los valores secretos no se versionan. El repositorio debe incluir `MAINTENANCE.md` con su estructura, administración de servicios y pasos de traspaso a futuros responsables de IT.

## Requisitos funcionales y de plataforma

- **Autenticación:** Supabase gestiona la autenticación corporativa y la aplicación valida el dominio permitido mediante una variable de entorno. La configuración no debe permitir eludir esta restricción desde el cliente.
- **Destino:** las coordenadas de Panoramis se configuran por entorno y se usan como destino predeterminado. Al publicar el trayecto, el conductor puede conservar Panoramis o seleccionar otro destino final.
- **Coste:** el modo automático estima el gasto a partir de la distancia al destino final elegido; el modo manual permite al conductor especificar el total a compartir. El reparto por ocupante debe mostrarse de forma comprensible.
- **Ubicación en vivo:** durante un trayecto activo, el navegador obtiene la ubicación mediante su API nativa de geolocalización y la transmite por Supabase Realtime. Se informa al usuario y se solicita el permiso del navegador; el seguimiento no se inicia fuera de un trayecto activo.
- **RLS:** toda tabla con información de usuarios, trayectos, reservas o ubicación cuenta con políticas de mínimo privilegio. Las políticas se prueban para los roles y participantes pertinentes antes del despliegue.
- **Despliegue:** el frontend se sirve como contenido estático desde Vercel o Netlify, con despliegue continuo desde el repositorio oficial de la organización. Los límites y condiciones del nivel gratuito se revisan antes de adoptar servicios o aumentar su uso.

## Flujo de desarrollo y calidad

- Los cambios deben mantener el alcance interno de la aplicación y cumplir esta constitución; cualquier excepción requiere justificación y aprobación documentada.
- Los cambios de esquema de base de datos incluyen las migraciones y políticas RLS correspondientes. Los cambios de autenticación, permisos, reservas y ubicación requieren pruebas que cubran tanto el acceso permitido como el denegado.
- La configuración necesaria se documenta sin incluir credenciales reales. Los despliegues deben usar variables de entorno configuradas en el proveedor y evitar depender de valores locales.
- La interfaz debe adaptarse a móviles de distintos tamaños y conservar su usabilidad en escritorio.
- Los flujos de publicación, solicitud, decisión del conductor y seguimiento activo deben verificarse antes de publicar cambios que los afecten.
- Antes de incorporar una dependencia o servicio externo, se verifica que sea compatible con el stack y con los requisitos de coste cero, privacidad y administración corporativa.

## Gobernanza

Esta constitución prevalece sobre otras guías del repositorio cuando exista conflicto. Las propuestas y revisiones deben comprobar su cumplimiento, especialmente en costes, propiedad corporativa, RLS y protección de ubicaciones. Toda enmienda debe actualizar este documento, incrementar su versión y registrar el motivo y la fecha. Las excepciones deben ser explícitas, acotadas y aprobadas; no pueden introducir cuentas personales, exposición de datos ni costes no autorizados.

**Versión**: 1.0.0 | **Ratificada**: 2026-11-08 | **Última enmienda**: 2026-11-08
