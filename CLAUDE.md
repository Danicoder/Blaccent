# Blaccent — Instrucciones del agente

## Contexto
Blaccent es una PWA interna y responsive para que los empleados de Accenture compartan coche hasta la sede de Panoramis (Alicante), con reservas aprobadas por el conductor, reparto automático de gastos, ubicación en vivo del conductor e historial de cumplimiento de los usuarios.

La fuente de verdad de principios y restricciones es [`constitution.md`](./constitution.md); prevalece sobre este archivo en caso de conflicto.

Decisiones caras de cambiar: login con Magic Link restringido a `@accenture.com`, ciclo de estados de reserva (solicitada / aceptada / denegada / cancelada / cancelada fuera de plazo), regla de cancelación de 24 h, caducidad de cancelaciones fuera de plazo a los 30 días, fuente gratuita de distancia por carretera, privacidad de ubicación e historial, proveedor de hosting (Vercel o Netlify).

## Stack
- **Frontend:** Vue.js + CSS modular, mobile-first, PWA instalable.
- **Backend:** Supabase Cloud (capa gratuita) — PostgreSQL, Auth (Magic Link), Realtime.
- **Seguridad:** políticas RLS de mínimo privilegio en todas las tablas con datos de usuarios, trayectos, reservas, ubicación o historial; nunca exponer claves privilegiadas en el frontend.
- **Autenticación:** Magic Link solo para correos del dominio `@accenture.com`, configurado por variable de entorno y no eludible desde el cliente.
- **Ubicación:** API nativa de geolocalización del navegador + Supabase Realtime; solo el conductor transmite y solo durante un trayecto activo.
- **Hosting:** frontend estático en Vercel o Netlify (capa gratuita) con despliegue continuo desde el repositorio de la organización.
- **Cuentas:** GitHub, Supabase y hosting administrados con un correo corporativo genérico; nada depende de cuentas personales.
- **Configuración:** `.env.example` documenta URL y clave pública de Supabase, dominio permitido y coordenadas de Panoramis; los secretos no se versionan. `MAINTENANCE.md` documenta estructura, administración y traspaso.
- **Coste cero:** solo servicios gratuitos sin tarjeta de crédito; sin contenedores ni servidores propios.

## Backlog
- [x] 1a. Como responsable de IT, quiero clonar el repositorio oficial, configurar el entorno a partir de `.env.example` siguiendo `MAINTENANCE.md` y ver Blaccent funcionando en local conectada a Supabase, para poder mantenerla sin depender de nadie.
- [ ] 1b. Como responsable de IT, quiero que cada cambio en la rama principal del repositorio de la organización se publique automáticamente en Vercel o Netlify con cuentas corporativas, para operarla sin coste ni cuentas personales. Requires: #1a
- [ ] 2. Como conductor, quiero entrar con un Magic Link que solo se envía a correos `@accenture.com` y publicar un trayecto a Panoramis con fecha, hora y plazas que mis compañeros puedan ver, para empezar a compartir coche. Requires: #1
- [ ] 3. Como conductor, quiero cambiar Panoramis por otro destino final al publicar, para ofrecer trayectos a otros sitios. Requires: #2
- [ ] 4. Como conductor, quiero que la app estime por defecto el gasto del viaje según la distancia por carretera al destino final, para no tener que calcularlo yo. Requires: #2
- [ ] 5. Como conductor, quiero poner a mano el importe total en lugar del estimado, para ajustarlo a mi gasto real. Requires: #4
- [ ] 6. Como responsable de IT, quiero configurar las tarifas y los supuestos de la estimación, para que sean explícitos y no se tomen por un coste exacto. Requires: #4
- [ ] 7. Como conductor, quiero elegir al publicar dónde aparcaré: en el garaje (con aviso del coste estimado de 4 € descontado de nómina y enlace a Accenture Places, https://support-places.accenture.com), en otro sitio que yo indico, o sin especificar, para organizar el aparcamiento a mi manera. Requires: #2
- [ ] 8. Como pasajero, quiero pedir una plaza en un trayecto y ver mi aportación antes de hacerlo, para saber cuánto pagaré. Requires: #4
- [ ] 9. Como conductor, quiero aceptar o denegar cada solicitud y que el pasajero vea el resultado en la app, para que ninguna plaza se confirme sin mi aprobación. Requires: #8
- [ ] 10. Como pasajero o conductor, quiero cancelar mi reserva o mi trayecto con al menos 24 h de antelación, liberando la plaza sin penalización, para no dejar colgados a mis compañeros. Requires: #9
- [ ] 11. Como pasajero o conductor, quiero que, si faltan menos de 24 h, la app me avise de que ya no puedo cancelar en plazo y de sus consecuencias, y que si confirmo se cancele igualmente y quede registrado como cancelación fuera de plazo, para decidir sabiendo lo que implica. Requires: #10
- [ ] 12. Como conductor, quiero pulsar "Iniciar trayecto" para empezar a emitir mi ubicación en vivo, después de que se me informe y dé permiso al navegador, y "Finalizar trayecto" para dejar de emitirla, para controlar cuándo se comparte. Requires: #9
- [ ] 13. Como pasajero aceptado, quiero ver la ubicación en vivo del conductor mientras el trayecto está activo, para saber cuándo llega, y que nadie fuera del trayecto pueda verla. Requires: #12
- [ ] 14. Como conductor que revisa una solicitud, o como pasajero que pide plaza, quiero ver el historial de la otra persona (por ejemplo, "8 viajes completados · 1 cancelación fuera de plazo"), visible solo en ese momento y en el que cada cancelación fuera de plazo deja de contar a los 30 días, para saber si suele cumplir sin penalizar a nadie para siempre. Requires: #11, #12
- [ ] 15. Como empleado, quiero instalar Blaccent como app en mi móvil, para abrirla rápido. Requires: #2

Marca cada historia como `- [x]` cuando esté finalizada.
