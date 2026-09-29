# NeoGénesis — Asistente PTU NG

Aplicación **mobile-first** para acompañar partidas de Pokémon Tabletop United NeoGénesis (PTU NG): gestión de campañas, personajes, Pokémon, inventario, sesiones, preparación de encuentros y un motor determinista de reglas.

## Estado actual

La aplicación ya utiliza **Supabase Auth + PostgreSQL + RLS** como fuente de verdad. No depende del estado de demostración ni de `localStorage` para conservar la partida.

Actualmente incluye:

- Autenticación por correo y contraseña.
- Salas/campañas persistentes entre dispositivos.
- Invitaciones por código y enlace.
- Personajes, Pokémon capturados, inventario, sesiones y eventos persistentes.
- Roles de campaña `GM` y `PLAYER`.
- Rol global `PLATFORM_ADMIN` para administrar la plataforma.
- Solicitudes de creación de campañas con aprobación administrativa.
- Panel de administración para aprobar/rechazar solicitudes, crear, archivar, reactivar y eliminar salas.
- RLS y funciones de base de datos para controlar las operaciones sensibles.
- Base de datos preparada para catálogo global de Pokémon, objetos y reglas.
- Catálogo PTU NeoGénesis cargado en Supabase: 978 entradas de Pokémon/formas con Stats Base, tipos, habilidades, capacidades, evoluciones, movimientos por nivel y movimientos de tutor.
- Motor determinista para generación de variantes Pokémon mediante presets, Naturalezas ponderadas y semillas reproducibles.
- Preparador de encuentros para que el DJ seleccione especie, nivel, cantidad y perfil sin depender de IA.
- Estructura persistente para encuentros, participantes, acciones y tiradas físicas.
- Flujo de invitación que conserva el código pendiente durante el inicio de sesión/registro.

## Arquitectura de roles

```text
PLATFORM_ADMIN
    │
    ├── aprueba/rechaza solicitudes
    ├── crea campañas directamente
    ├── archiva/reactiva campañas
    └── elimina campañas
             │
             ↓
            GM
             │
             ├── administra su campaña
             ├── gestiona jugadores
             ├── sesiones
             └── personaliza disponibilidad de contenido
                     │
                     ↓
                   PLAYER
```

El rol `PLATFORM_ADMIN` es global. `GM` y `PLAYER` son roles contextuales de cada campaña; una misma cuenta puede ser GM en una campaña y jugador en otra.

## Flujo de creación de campañas

Un usuario normal no crea una sala activa directamente:

```text
Usuario
  ↓
Solicitud de campaña
  ↓
PENDING
  ↓
Administrador
  ├── APPROVED → campaña ACTIVE + solicitante como GM
  └── REJECTED
```

Se limita además a una solicitud pendiente por usuario para evitar saturación administrativa.

## Invitaciones

Cada campaña activa tiene un código de invitación y un enlace equivalente:

`/?invite=CODIGO`

El código no concede acceso por sí solo. El usuario debe autenticarse y la función de base de datos valida la invitación antes de crear la membresía como `PLAYER`.

Si el usuario abre un enlace sin estar autenticado, el código queda pendiente en el navegador. Después de iniciar sesión o completar el registro, la aplicación retoma automáticamente la invitación.

## Modelo de contenido

Las reglas y el catálogo base serán globales y reutilizables. El DJ no tendrá que volver a cargar las reglas para cada campaña.

La campaña podrá personalizar la disponibilidad:

- habilitar o bloquear objetos;
- modificar precios o disponibilidad;
- añadir objetos propios;
- restringir contenido para una campaña;
- aplicar excepciones temporales durante una sesión.

La intención es mantener una única fuente de reglas base y evitar duplicación de contenido.

## Seguridad

La autorización crítica se realiza en PostgreSQL mediante RLS y funciones protegidas. La interfaz no se considera una barrera de seguridad.

Las funciones administrativas validan `platform_role = PLATFORM_ADMIN`. Los cambios de rol de plataforma y de estado administrativo de una campaña están protegidos contra escalamiento desde el cliente.

La configuración de Supabase usa variables de entorno:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL` (opcional; en producción se recomienda definirla con la URL pública de Vercel)

Nunca se debe colocar una service-role key en el cliente ni en el repositorio.

## Autenticación en producción

La confirmación de correo y la recuperación de contraseña utilizan URLs públicas de Vercel. La aplicación usa `@supabase/ssr` con flujo PKCE y el callback `/auth/confirm`, por lo que no depende de un servidor local para validar cuentas. Configura en Supabase Auth la URL pública de producción y permite `/auth/confirm` y `/auth/reset` como Redirect URLs.

## Desarrollo local

```bash
pnpm install
pnpm dev
```

Después abre `http://localhost:3000`.

La arquitectura detallada está en [docs/architecture.md](docs/architecture.md).

## Dirección del producto

La aplicación no depende de un proveedor LLM ni utiliza IA para generar Pokémon, elegir estadísticas, determinar Naturalezas o resolver reglas. El motor de reglas es determinista y utiliza datos estructurados, presets y aleatoriedad reproducible.

El DJ y los jugadores conservan las decisiones narrativas y el flujo de la partida. NeoGénesis automatiza únicamente el trabajo repetitivo y mecánico que pueda expresarse mediante reglas: preparación de encuentros, generación de variantes, cálculos de combate, actualización de PS y registro de acciones/tiradas.

## Próximas fases

1. Completar la ficha PTU NG y sus validadores.
2. Completar el catálogo base de objetos y revisar los movimientos/acciones que todavía requieran datos adicionales del documento.
3. Definir 3–4 presets por especie donde sea útil y permitir presets específicos de campaña para el DJ.
4. Validar y completar las fórmulas de combate contra el documento PTU NG antes de convertirlas en acciones persistentes.
5. Completar el preparador de encuentros y persistir los participantes generados.
6. Implementar el flujo de combate: tiradas físicas introducidas por los jugadores/DJ → cálculo automático → modificación de estado → evento → historial.
7. Implementar tienda y disponibilidad de contenido por campaña/sesión.
8. Añadir pruebas automatizadas de autorización y reglas.