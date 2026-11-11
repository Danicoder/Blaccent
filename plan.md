## Story
Como responsable de IT, quiero clonar el repositorio oficial, configurar el entorno a partir de `.env.example` siguiendo `MAINTENANCE.md` y ver Blaccent funcionando en local conectada a Supabase, para poder mantenerla sin depender de nadie.

## Acceptance criteria
- [x] Dado el repositorio clonado y un entorno configurado desde `.env.example`, cuando arranco la app siguiendo `MAINTENANCE.md`, entonces veo la pantalla inicial de Blaccent bien adaptada a móvil y escritorio, sin errores de conexión con Supabase.
- [x] Dado el repositorio, cuando reviso su contenido, entonces no hay credenciales reales ni ficheros de entorno locales, y `.env.example` solo lista con valores de ejemplo la URL y la clave pública de Supabase, el dominio `@accenture.com` y las coordenadas de Panoramis.
- [x] Dado `MAINTENANCE.md`, cuando otro responsable de IT lo lee, entonces encuentra la estructura del proyecto, los servicios usados, qué cuentas los administran y los pasos de traspaso, incluidos los que aún estén pendientes.

## Plan
- [x] Iniciar el control de versiones e ignorar secretos, dependencias y artefactos de build.
- [x] Montar la app Vue mínima con una pantalla inicial mobile-first y estilos base modulares.
- [x] Conectar el cliente de Supabase con la configuración del entorno y comprobar la conexión sin depender de tablas que aún no existen.
- [x] Corregir la plantilla de entorno: valores de ejemplo, URL base del proyecto (sin `/rest/v1/`) y dominio `accenture.com`.
- [x] Redactar el documento de mantenimiento con la situación real de las cuentas.

## Out of scope
- Login con Magic Link y restricción de dominio (#2).
- Tablas, migraciones y políticas RLS (llegan con #2 y siguientes).
- Despliegue en Vercel o Netlify (1b).
- Manifest e iconos de la PWA (#15).
- Pasar Supabase a una cuenta corporativa genérica (solo se documenta como pendiente).

## Suggestions (your call)
- Borrar los ficheros vacíos que ya existen (vistas, componentes, servicios, store, router) y crearlos cuando una historia los necesite; ahora mismo solo hacen ruido.
- Mover `rls_policies.sql` a migraciones cuando exista la tabla `bookings`; ahora apunta a tablas que no existen.
