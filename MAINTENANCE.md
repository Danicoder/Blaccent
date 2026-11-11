# Mantenimiento de Blaccent

Guía para que cualquier responsable de IT pueda operar, mantener y traspasar Blaccent. Los principios y restricciones están en [`constitution.md`](./constitution.md); el contexto, stack y backlog en [`CLAUDE.md`](./CLAUDE.md).

## Estructura del proyecto

| Ruta | Contenido |
|------|-----------|
| `index.html` | Punto de entrada HTML de la app. |
| `src/main.js` | Arranque de la aplicación Vue. |
| `src/App.vue` | Pantalla inicial. |
| `src/assets/` | Estilos globales (`main.css`) y variables de diseño (`variables.css`). Los componentes usan CSS Modules (`<style module>`). |
| `src/services/supabase.js` | Cliente de Supabase y comprobación de conexión. |
| `src/views/`, `src/components/`, `src/router/`, `src/store/` | Reservados para las siguientes historias del backlog. |
| `supabase/` | Migraciones SQL y políticas RLS de la base de datos. |
| `public/` | Recursos estáticos (manifest e iconos de la PWA). |
| `.env.example` | Plantilla de variables de entorno, sin valores reales. |

## Servicios

| Servicio | Uso | Plan |
|----------|-----|------|
| GitHub | Repositorio oficial de la organización | Gratuito |
| Supabase Cloud | PostgreSQL, autenticación (Magic Link), Realtime | Free tier |
| Vercel o Netlify | Hosting estático con despliegue continuo (pendiente, historia 1b) | Gratuito |

Antes de añadir un servicio o dependencia, comprueba que cumple coste cero, privacidad y administración corporativa (ver constitución).

## Puesta en marcha en local

Requisitos: Node.js 18 o superior.

1. Clona el repositorio oficial de la organización.
2. Instala dependencias: `npm install`.
3. Crea el archivo `.env` a partir de `.env.example` y rellena los valores:
   - `VITE_SUPABASE_URL`: URL base del proyecto (Supabase > Project Settings > API), sin `/rest/v1/`.
   - `VITE_SUPABASE_ANON_KEY`: clave pública (publishable/anon). **Nunca** la clave `service_role`.
   - `VITE_ALLOWED_EMAIL_DOMAIN`: `accenture.com`.
   - `VITE_PANORAMIS_LAT` / `VITE_PANORAMIS_LNG`: coordenadas de la sede de Panoramis.
4. Arranca: `npm run dev` y abre la URL que indica la consola.
5. La pantalla inicial debe mostrar **"Conectado con Supabase"**. Si muestra un error, revisa la URL y la clave del `.env`.

Otros comandos: `npm run build` (genera `dist/`) y `npm run preview` (sirve el build).

> En Windows, si PowerShell bloquea `npm`, usa `npm.cmd` (por ejemplo `npm.cmd run dev`).

## Secretos y configuración

- `.env` está ignorado por git; nunca se versiona.
- Las variables `VITE_*` se incluyen en el bundle del navegador: solo pueden contener valores públicos.
- En el hosting, las variables se configuran en el panel del proveedor, no en el repositorio.

## Administración de cuentas

| Servicio | Propietario actual | Estado |
|----------|--------------------|--------|
| Supabase (proyecto `gnkbslmgkadvphzrtewj`) | Cuenta personal del creador, con una cuenta de empresa Accenture invitada como Owner | ⚠️ Incumple el principio III: debe pasar a una cuenta corporativa genérica |
| GitHub (repositorio de la organización) | Pendiente de definir | ⚠️ Pendiente |
| Vercel / Netlify | Pendiente de definir (historia 1b) | ⚠️ Pendiente |

## Traspaso a otro responsable de IT

### Pendiente
- [ ] Crear o identificar el correo corporativo genérico de administración.
- [ ] Invitar ese correo como Owner en la organización de Supabase y retirar la cuenta personal.
- [ ] Crear el repositorio en la organización de GitHub administrada por el correo corporativo genérico.
- [ ] Dar de alta el hosting con el correo corporativo genérico (historia 1b).

### Procedimiento de traspaso
1. Invitar al nuevo responsable como Owner en Supabase, GitHub y el hosting.
2. Entregarle acceso al correo corporativo genérico (según el procedimiento interno de IT).
3. Verificar que puede arrancar la app en local siguiendo esta guía.
4. Retirar los accesos del responsable saliente y actualizar la tabla de administración.