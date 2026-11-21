# Mantenimiento de Blaccent

Guía para que cualquier responsable de IT pueda operar, mantener y traspasar Blaccent. Los principios y restricciones están en [`constitution.md`](./constitution.md); el contexto y backlog en [`CLAUDE.md`](./CLAUDE.md); las reglas funcionales y decisiones pendientes en [`docs/DEFINICION_FUNCIONAL.md`](./docs/DEFINICION_FUNCIONAL.md).

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
| `docs/DEFINICION_FUNCIONAL.md` | Reglas funcionales aprobadas y decisiones pendientes. |
| `.env.example` | Plantilla de variables de entorno, sin valores reales. |

## Estado funcional

La aplicación está en fase inicial. La pantalla actual comprueba la conexión con Supabase; no debe considerarse que los flujos de viajes, reservas, aportaciones, parking, pagos, ubicación e historial estén implementados por el hecho de aparecer en la documentación.

La migración RLS existente debe revisarse antes de almacenar información funcional. No se debe desplegar información sensible sin políticas probadas.

## Servicios

| Servicio | Uso | Plan / condición |
|----------|-----|------|
| GitHub | Repositorio del proyecto | Según administración corporativa |
| Supabase Cloud | PostgreSQL, autenticación Magic Link y Realtime | Revisar límites del plan gratuito |
| Vercel o Netlify | Hosting estático y despliegue continuo | Revisar límites del plan gratuito |
| Proveedor de pagos | No seleccionado ni activado | Requiere validación legal, económica y aprobación |

Antes de añadir un servicio o dependencia, comprueba que cumple coste, privacidad y administración corporativa (ver constitución). No incorporar un proveedor de pagos hasta aprobar comisiones, flujo de fondos y liquidaciones.

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
| Parking Interparking | Pendiente de cargar tarifas y modalidades verificadas | Panel de administración |
| Parking gratuito | 0 € | Opción de publicación |
| Reparto del parking | 1 participación por ida, 1 por vuelta, 2 por ida y vuelta | Regla funcional |
| Límite de gastos reales | Reducción proporcional si aportaciones provisionales lo superan | Pendiente definir gastos y unidad de cálculo |
| Cancelaciones | Permitidas hasta la salida; menos de 2 horas se registran como tardías | Regla funcional |

Los importes anteriores son configuración funcional deseada, no parámetros que deban añadirse a `.env`. Los cambios de tarifas deben conservar trazabilidad y no modificar silenciosamente importes ya aceptados.

## Secretos y configuración técnica

- `.env` está ignorado por git; nunca se versiona.
- Las variables `VITE_*` se incluyen en el bundle del navegador: solo pueden contener valores públicos.
- En el hosting, las variables se configuran en el panel del proveedor, no en el repositorio.
- No guardar credenciales privadas, claves `service_role` ni secretos de proveedores en el frontend.

## Administración de cuentas

| Servicio | Propiedad / estado |
|----------|--------------------|
| Supabase | La cuenta corporativa debe mantener control Owner/administrador. Revisar la titularidad efectiva y transferir el proyecto si depende de una cuenta personal. |
| GitHub | Confirmar que el repositorio está bajo la organización autorizada. |
| Vercel / Netlify | Pendiente de definir con administración corporativa. |

## Traspaso a otro responsable de IT

- [ ] Confirmar que una cuenta corporativa autorizada tiene privilegios Owner en Supabase.
- [ ] Confirmar propiedad y permisos del repositorio GitHub.
- [ ] Configurar hosting con acceso corporativo.
- [ ] Entregar variables de entorno mediante el mecanismo seguro aprobado.
- [ ] Verificar que el responsable puede ejecutar la aplicación localmente.
- [ ] Revisar las políticas RLS y los permisos de ubicación antes de habilitar datos reales.
- [ ] Entregar la documentación funcional y el registro de decisiones pendientes.

Procedimiento:
1. Invitar al nuevo responsable como administrador en Supabase, GitHub y hosting.
2. Transferir los accesos mediante el procedimiento interno de IT.
3. Verificar el arranque local y el proceso de despliegue.
4. Retirar accesos del responsable saliente cuando proceda.
5. Actualizar esta guía y registrar los cambios.


## Requisitos económicos vigentes (RF-001 a RF-015)

- Parking Panoramis: **2,00 € estimados para la ida y 2,00 € estimados para la vuelta; 4,00 € para ambos tramos en la misma jornada**. Es un importe estimado por vehículo, no por pasajero, y es editable desde administración.
- El reparto individual se realiza entre pasajeros que acepten compartir parking en cada tramo, con una participación por ida y una por vuelta (dos si el pasajero reserva ambos).
- El importe y las condiciones aceptadas quedan bloqueados tras confirmar la plaza. No se incrementan ni recalculan por cancelaciones, ausencias o cambios de ocupación de otros usuarios.
- El pasajero puede cancelar hasta la salida. Con al menos dos horas de antelación la cancelación es ordinaria; con menos de dos horas se permite y queda marcada como tardía.
- El conductor puede registrar como no presentado a un pasajero con plaza confirmada que no se presente y no haya cancelado.
- Cancelaciones y ausencias se conservan durante seis meses. Una ausencia afecta más negativamente a la fiabilidad que una cancelación tardía; la fórmula numérica y la visibilidad del indicador siguen pendientes.
- **No integrar pagos:** Blaccent no procesa, custodia ni distribuye dinero. No añadir pasarelas ni proveedores externos de pago. Los acuerdos económicos se realizan fuera de la plataforma.

Estos requisitos son documentación funcional aprobada; no implican que las funciones estén implementadas en la versión actual.
