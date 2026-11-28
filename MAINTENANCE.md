# Mantenimiento de Blaccent

Guía para que cualquier responsable de IT pueda operar, mantener y traspasar Blaccent. Los principios y restricciones están en [`constitution.md`](./constitution.md); el contexto y backlog en [`CLAUDE.md`](./CLAUDE.md); las reglas funcionales y límites del MVP en [`docs/DEFINICION_FUNCIONAL.md`](./docs/DEFINICION_FUNCIONAL.md).

## Estructura del proyecto

| Ruta | Contenido |
|------|-----------|
| `index.html` | Punto de entrada HTML de la app. |
| `src/main.js` | Arranque de la aplicación Vue. |
| `src/views/App.vue` | Pantalla principal de viajes. |
| `src/components/TripMap.vue` | Selección del origen y visualización de rutas en Leaflet/OpenStreetMap. |
| `src/assets/` | Estilos globales y recursos de diseño. |
| `src/services/supabase.js` | Cliente de Supabase, comprobación de conexión y persistencia de favoritos de origen. |
| `src/services/routing.js` | Consulta OSRM para calcular distancias por tramo. |
| `src/services/geocoding.js` | Búsqueda explícita de direcciones de origen con Nominatim y caché en memoria. |
| `src/services/requestLimiter.js` | Limita a una por segundo las consultas a cada servicio. |
| `src/services/estimates.js` | Estimaciones informativas de desplazamiento y parking. |
| `src/views/`, `src/components/`, `src/router/`, `src/store/` | Estructura prevista para las siguientes historias del backlog. |
| `supabase/` | Migraciones SQL y políticas RLS de la base de datos. |
| `public/` | Recursos estáticos de la PWA. |
| `docs/DEFINICION_FUNCIONAL.md` | Reglas funcionales aprobadas y alcance del MVP. |
| `.env.example` | Plantilla de variables de entorno, sin valores reales. |

## Estado funcional

La aplicación permite buscar y publicar viajes, mostrar estimaciones informativas y calcular distancias por carretera mediante OSRM. La publicación y búsqueda sin sesión solo funcionan en modo local de desarrollo; en producción los servicios requieren una sesión de Supabase. Las reservas, cancelaciones, ubicación en vivo e historial descritos en el alcance siguen necesitando implementación. Blaccent no registra ni procesa pagos.

La migración RLS existente debe revisarse antes de almacenar información funcional. No se debe desplegar información sensible sin políticas probadas.

## Servicios

| Servicio | Uso | Plan / condición |
|----------|-----|------|
| GitHub | Repositorio del proyecto | Según administración corporativa |
| Supabase Cloud | PostgreSQL, autenticación Magic Link y Realtime | Revisar límites del plan gratuito |
| Cloudflare Pages | Hosting estático y despliegue continuo desde GitHub Actions | Proveedor elegido; revisar límites y condiciones del plan |
| Pagos | No forman parte del alcance | Acuerdos económicos externos a la plataforma |

Antes de añadir un servicio o dependencia, comprueba que cumple coste, privacidad y administración corporativa (ver constitución). No incorporar proveedores ni integraciones de pago: Blaccent no procesa, custodia ni distribuye fondos.

## Puesta en marcha en local

Requisitos: Node.js 18 o superior.

1. Clona el repositorio.
2. Instala dependencias: `npm install`.
3. Crea `.env` a partir de `.env.example` y rellena los valores:
   - `VITE_SUPABASE_URL`: URL base del proyecto Supabase, sin `/rest/v1/`.
   - `VITE_SUPABASE_ANON_KEY`: clave pública (publishable/anon). **Nunca** la clave `service_role`.
   - `VITE_ALLOWED_EMAIL_DOMAIN`: `accenture.com`.
   - `VITE_PANORAMIS_LAT` / `VITE_PANORAMIS_LNG`: coordenadas de la oficina de Panoramis.
   - `VITE_OSRM_BASE_URL`: URL base de un servidor compatible con OSRM; por defecto, `https://routing.openstreetmap.de/routed-car`.
   - `VITE_NOMINATIM_BASE_URL`: URL base compatible con Nominatim; por defecto, `https://nominatim.openstreetmap.org`.
4. Arranca: `npm run dev` y abre la URL que indica la consola.
5. La pantalla inicial debe mostrar **"Conectado con Supabase"**. Si muestra un error, revisa URL y clave pública.

Otros comandos: `npm run build` y `npm run preview`.

> En Windows, si PowerShell bloquea `npm`, usa `npm.cmd`.

## Mapa y cálculo de distancias

Leaflet presenta el mapa estándar de OpenStreetMap con atribución visible y un enlace para corregir datos. El usuario puede buscar explícitamente una dirección, elegir un resultado y ajustar el marcador arrastrándolo o haciendo clic en el mapa. También puede guardar, reutilizar, renombrar y eliminar favoritos privados. En Supabase, `origin_favorites` debe mantener RLS para que cada usuario solo acceda a sus propios registros; el modo demo guarda esos favoritos únicamente en el navegador. OSRM devuelve una distancia independiente por cada tramo ofrecido. Esas distancias alimentan solo las estimaciones informativas de la aplicación. Mantener el uso de mosaicos por HTTPS, conservar la atribución, respetar las cabeceras de caché del servicio y no hacer scraping ni descargas masivas.

El endpoint predeterminado es el servicio público FOSSGIS (`routing.openstreetmap.de`). Su política vigente limita el uso a una solicitud por segundo y prohíbe el uso intensivo; no ofrece garantías de disponibilidad ni latencia. Las coordenadas de ruta se envían al servidor y se conservan en sus logs conforme a su política de privacidad. Antes de desplegar, confirmar las condiciones vigentes y, si el uso previsto no encaja, configurar una instancia/proveedor OSRM apropiado mediante `VITE_OSRM_BASE_URL`. No usar el servidor público para tráfico de producción sin validar previamente el uso aceptable.

La búsqueda opcional de direcciones usa Nominatim solo cuando el usuario pulsa «Buscar en el mapa» (no hay autocompletado), ofrece hasta cinco resultados y cachea hasta 128 búsquedas durante la sesión. Al seleccionar un punto en el mapa o soltar el marcador, también se consulta la dirección inversa para actualizar el campo; no se consulta durante el arrastre. Las búsquedas y consultas inversas comparten el intervalo local de un segundo y usan cachés separados. Se configura con `VITE_NOMINATIM_BASE_URL`; `referrerPolicy: strict-origin-when-cross-origin` hace que el navegador identifique el sitio mediante la cabecera `Referer` (no se puede establecer manualmente `User-Agent` desde JavaScript del navegador). La política pública cuenta el límite de una solicitud por segundo para toda la aplicación, no por usuario: la limitación cliente evita ráfagas locales, pero no garantiza el límite agregado entre usuarios. Antes de desplegar, verificar si el uso previsto cumple la política y aplicar el mecanismo compartido o proveedor adecuado si se necesita; la baja escala no sustituye la verificación de términos. Las direcciones y coordenadas se envían al proveedor; no introducir datos personales o confidenciales.

## Configuración funcional que deberá administrarse

Estos valores describen requisitos funcionales; no están implementados necesariamente en la aplicación actual.

| Configuración | Valor inicial / regla | Gestión prevista |
|---|---|---|
| Destino | Oficina Panoramis, Alicante; destino único | Configuración de aplicación |
| Tarifa 0–10 km | 1 € por pasajero y trayecto | Panel de administración |
| Tarifa >10–20 km | 2 € por pasajero y trayecto | Panel de administración |
| Tarifa >20–35 km | 3 € por pasajero y trayecto | Panel de administración |
| Tarifa >35–50 km | 4 € por pasajero y trayecto | Panel de administración |
| Tarifa >50 km | 5 € por pasajero y trayecto | Panel de administración |
| Parking Panoramis | **2 € estimados para ida y 2 € para vuelta; 4 € ambos tramos en la misma jornada** | Valores predeterminados editables desde administración |
| Parking Interparking | Fuera del MVP; no se ofrece ni se configura | Futuro alcance aprobado expresamente |
| Parking gratuito | 0 € | Opción de publicación |
| Reparto del parking | 1 participación por ida, 1 por vuelta, 2 por ida y vuelta | Regla funcional |
| Límite de gastos reales | No se calcula en el MVP; las tarifas son estimaciones informativas | Validación legal obligatoria antes de una fase futura |
| Cancelaciones | Permitidas hasta la salida; menos de 2 horas se registran como tardías | Regla funcional |

Los importes anteriores son configuración funcional deseada, no parámetros que deban añadirse a `.env`. Los cambios de tarifas deben conservar trazabilidad y no modificar silenciosamente importes ya aceptados.

## Secretos y configuración técnica

- `.env` está ignorado por git; nunca se versiona.
- Las variables `VITE_*` se incluyen en el bundle del navegador: solo pueden contener valores públicos.
- Las variables `VITE_*` del despliegue se configuran como variables de GitHub Actions, porque se necesitan durante la compilación; no son variables de ejecución de Cloudflare Pages.
- No guardar credenciales privadas, claves `service_role` ni secretos de proveedores en el frontend.

## Despliegue continuo en Cloudflare Pages

La rama `main` es la única rama que publica automáticamente. El flujo [`deploy-cloudflare-pages.yml`](./.github/workflows/deploy-cloudflare-pages.yml) instala dependencias, construye `dist/` y lo publica en Cloudflare Pages. También se puede ejecutar manualmente desde **Actions > Deploy to Cloudflare Pages > Run workflow**, seleccionando `main`; el trabajo de despliegue se omite en cualquier otra rama.

### Preparación de Cloudflare

1. Accede a una cuenta de Cloudflare controlada por la organización autorizada y crea un proyecto de **Workers & Pages > Pages > Direct Upload**. Usa un nombre de proyecto único; será parte de la URL `https://<nombre>.pages.dev`. Si el asistente solicita una primera carga, ejecuta `npm run build` en el repositorio y carga el contenido de `dist/`. Configura `main` como rama de producción.
2. En **My Profile > API Tokens**, crea un token personalizado restringido a la cuenta correspondiente, con permiso **Account > Cloudflare Pages > Edit**. No necesita permisos de zona DNS para este despliegue.
3. En GitHub, abre **Settings > Secrets and variables > Actions** y configura las variables del repositorio:
   - `CLOUDFLARE_ACCOUNT_ID`: identificador de la cuenta Cloudflare (no es un secreto).
   - `CLOUDFLARE_PAGES_PROJECT`: nombre exacto del proyecto Pages creado.
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ALLOWED_EMAIL_DOMAIN`
   - `VITE_PANORAMIS_LAT`
   - `VITE_PANORAMIS_LNG`
   - `VITE_OSRM_BASE_URL` (opcional; si se omite usa el endpoint público documentado arriba)
   - `VITE_NOMINATIM_BASE_URL` (opcional; si se omite usa el endpoint público documentado arriba)
4. En la pestaña **Secrets**, crea `CLOUDFLARE_API_TOKEN` con el token del paso anterior. No pegues el token en el código, en el repositorio ni en mensajes; guárdalo únicamente como secreto de GitHub.
5. Ejecuta el flujo manualmente y verifica que termine correctamente y que `https://<nombre>.pages.dev` carga la aplicación. Después, un push a `main` publicará automáticamente.

Las variables `VITE_*` se usan durante la compilación y quedan incluidas en el bundle público; solo deben contener valores públicos, nunca claves `service_role`. La regla [`public/_redirects`](./public/_redirects) conserva el enrutamiento SPA a `index.html`. Las credenciales de Cloudflare se usan solo por GitHub Actions y no se incluyen en el frontend. Si se desea un dominio propio, se añade posteriormente desde la configuración del proyecto Pages y se configura su DNS en Cloudflare.

## Administración de cuentas

| Servicio | Propiedad / estado |
|----------|--------------------|
| Supabase | La cuenta corporativa debe mantener control Owner/administrador. Revisar la titularidad efectiva y transferir el proyecto si depende de una cuenta personal. |
| GitHub | Confirmar que el repositorio está bajo la organización autorizada. |
| Cloudflare | Cloudflare Pages es el proveedor elegido; falta crear el proyecto con acceso corporativo, añadir las variables y el secreto de Actions, y verificar el primer despliegue. |

## Traspaso a otro responsable de IT

- [ ] Confirmar que una cuenta corporativa autorizada tiene privilegios Owner en Supabase.
- [ ] Confirmar propiedad y permisos del repositorio GitHub.
- [ ] Configurar Cloudflare Pages con acceso corporativo y verificar el despliegue desde GitHub Actions.
- [ ] Entregar variables de entorno mediante el mecanismo seguro aprobado.
- [ ] Verificar que el responsable puede ejecutar la aplicación localmente.
- [ ] Revisar las políticas RLS y los permisos de ubicación antes de habilitar datos reales.
- [ ] Entregar la documentación funcional, el alcance MVP y las condiciones de validación futura.

Procedimiento:
1. Invitar al nuevo responsable como administrador en Supabase, GitHub y hosting.
2. Transferir los accesos mediante el procedimiento interno de IT.
3. Verificar el arranque local y el proceso de despliegue.
4. Retirar accesos del responsable saliente cuando proceda.
5. Actualizar esta guía y registrar los cambios.


## Reglas funcionales vigentes (RF-001 a RF-015)

- Parking Panoramis: **2,00 € estimados para la ida y 2,00 € estimados para la vuelta; 4,00 € para ambos tramos en la misma jornada**. Es un importe estimado por vehículo, no por pasajero, y es editable desde administración.
- El desglose de parking por pasajero es informativo, con una participación por ida y una por vuelta (dos si se ofrecen ambos tramos); no constituye deuda ni pago dentro de la app.
- El importe y las condiciones aceptadas quedan bloqueados tras confirmar la plaza. No se incrementan ni recalculan por cancelaciones, ausencias o cambios de ocupación de otros usuarios.
- El pasajero puede cancelar hasta la salida. Con al menos dos horas de antelación la cancelación es ordinaria; con menos de dos horas se permite y queda marcada como tardía.
- El conductor puede registrar como no presentado a un pasajero con plaza confirmada que no se presente y no haya cancelado.
- Al cerrar un tramo, el conductor clasifica cada reserva confirmada no cancelada como viaje completado o ausencia; sin clasificación explícita no cuenta para fiabilidad.
- Cancelaciones y ausencias se conservan seis meses y después se eliminan; no se guarda historial identificable por usuario pasado ese plazo. Fiabilidad = (viajes completados + cancelaciones ordinarias + 0,5 × cancelaciones tardías) / reservas confirmadas evaluables × 100. Ausencia = 0 puntos. Mostrar solo con al menos cinco reservas evaluables; por debajo, «Datos insuficientes».
- El conductor que registró una ausencia puede deshacerla durante los diez minutos siguientes; la corrección conserva trazabilidad y deja de computar como ausencia.
- Historial detallado: solo el titular y administración autorizada. Otros usuarios solo ven el indicador agregado al revisar una solicitud o reserva con esa persona. Los eventos identificables y sus correcciones se eliminan al cumplir seis meses.
- La distancia por carretera usa OSRM público; verificar sus términos y límites antes del despliegue. Interparking y recurrencia quedan fuera del MVP.
- **No integrar pagos:** Blaccent no procesa, custodia ni distribuye dinero. No añadir pasarelas ni proveedores externos de pago. Los acuerdos económicos se realizan fuera de la plataforma.

Estos requisitos son documentación funcional aprobada; no implican que las funciones estén implementadas en la versión actual.
