# Mantenimiento de Blaccent

Guía para que cualquier responsable de IT pueda operar, mantener y traspasar Blaccent. Los principios y restricciones están en [`constitution.md`](./constitution.md); el contexto y backlog en [`CLAUDE.md`](./CLAUDE.md); las reglas funcionales y límites del MVP en [`docs/DEFINICION_FUNCIONAL.md`](./docs/DEFINICION_FUNCIONAL.md).

## Estructura del proyecto

| Ruta | Contenido |
|------|-----------|
| `index.html` | Punto de entrada HTML de la app. |
| `src/main.js` | Arranque de la aplicación Vue. |
| `src/App.vue` | Pantalla inicial. |
| `src/assets/` | Estilos globales y recursos de diseño. |
| `src/services/supabase.js` | Cliente de Supabase y comprobación de conexión. |
| `src/views/`, `src/components/`, `src/router/`, `src/store/` | Estructura prevista para las siguientes historias del backlog. |
| `supabase/` | Migraciones SQL y políticas RLS de la base de datos. |
| `public/` | Recursos estáticos de la PWA. |
| `docs/DEFINICION_FUNCIONAL.md` | Reglas funcionales aprobadas y alcance del MVP. |
| `.env.example` | Plantilla de variables de entorno, sin valores reales. |

## Estado funcional

La aplicación está en fase inicial. La pantalla actual comprueba la conexión con Supabase; no debe considerarse que los flujos de viajes, reservas, estimaciones, parking, ubicación e historial estén implementados por el hecho de aparecer en la documentación. Blaccent no registra ni procesa pagos.

La migración RLS existente debe revisarse antes de almacenar información funcional. No se debe desplegar información sensible sin políticas probadas.

## Servicios

| Servicio | Uso | Plan / condición |
|----------|-----|------|
| GitHub | Repositorio del proyecto | Según administración corporativa |
| Supabase Cloud | PostgreSQL, autenticación Magic Link y Realtime | Revisar límites del plan gratuito |
| Netlify | Hosting estático y despliegue continuo | Proveedor elegido; revisar límites del plan gratuito |
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
4. Arranca: `npm run dev` y abre la URL que indica la consola.
5. La pantalla inicial debe mostrar **"Conectado con Supabase"**. Si muestra un error, revisa URL y clave pública.

Otros comandos: `npm run build` y `npm run preview`.

> En Windows, si PowerShell bloquea `npm`, usa `npm.cmd`.

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
- En el hosting, las variables se configuran en el panel del proveedor, no en el repositorio.
- No guardar credenciales privadas, claves `service_role` ni secretos de proveedores en el frontend.

## Despliegue continuo en Netlify

La rama `main` es la única rama que publica automáticamente. El flujo [`deploy-netlify.yml`](./.github/workflows/deploy-netlify.yml) instala dependencias, construye `dist/` y lo publica en producción.

1. Crea un sitio en Netlify dentro de la cuenta corporativa autorizada.
2. En GitHub, crea las variables públicas:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ALLOWED_EMAIL_DOMAIN`
   - `VITE_PANORAMIS_LAT`
   - `VITE_PANORAMIS_LNG`
3. En GitHub Actions, crea los secretos:
   - `NETLIFY_AUTH_TOKEN`: token personal o de integración autorizado.
   - `NETLIFY_SITE_ID`: identificador del sitio Netlify.
4. Comprueba una ejecución manual con **Run workflow** y verifica que el estado sea exitoso.
5. Confirma que el dominio configurado y la aplicación muestran los valores públicos de Supabase esperados.

`netlify.toml` define el directorio publicado y redirige todas las rutas SPA a `index.html`. GitHub Actions usa únicamente el token público de Netlify y las variables públicas `VITE_*`; nunca añadas claves `service_role` ni secretos al frontend.

## Administración de cuentas

| Servicio | Propiedad / estado |
|----------|--------------------|
| Supabase | La cuenta corporativa debe mantener control Owner/administrador. Revisar la titularidad efectiva y transferir el proyecto si depende de una cuenta personal. |
| GitHub | Confirmar que el repositorio está bajo la organización autorizada. |
| Netlify | Proveedor elegido; falta configurar el sitio con acceso corporativo y confirmar la titularidad. |

## Traspaso a otro responsable de IT

- [ ] Confirmar que una cuenta corporativa autorizada tiene privilegios Owner en Supabase.
- [ ] Confirmar propiedad y permisos del repositorio GitHub.
- [ ] Configurar hosting con acceso corporativo.
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
