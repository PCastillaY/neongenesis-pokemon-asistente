# NeoGénesis — arquitectura inicial

## Objetivo

NeoGénesis será una aplicación mobile-first para apoyar partidas de Pokémon Tabletop United NeoGénesis (PTU NG). El producto debe separar cuentas, campañas/salas, membresías, personajes, Pokémon, inventario, historial y conocimiento de reglas.

La aplicación utiliza Supabase como fuente de verdad multiusuario. La UI mantiene una capa mobile-first, mientras Auth, PostgreSQL y RLS controlan identidad, salas y estado de campaña.

## Principios de dominio

- Un **usuario** es una cuenta de la aplicación.
- Un **usuario** tiene además un rol global de plataforma: `USER` o `PLATFORM_ADMIN`.
- Un **miembro de campaña** representa la participación de un usuario en una sala y tiene un rol contextual: `GM` o `PLAYER`.
- Crear una campaña no está abierto a cualquier cuenta: un usuario solicita la creación y un `PLATFORM_ADMIN` la aprueba o rechaza.
- Un mismo usuario puede ser GM en una campaña y jugador en otra.
- Un **personaje** pertenece a una participación/campaña, no directamente al usuario global.
- Un **Pokémon capturado** es una instancia individual de una especie, por lo que especie y Pokémon del jugador son conceptos diferentes.
- El inventario debe evolucionar hacia un libro mayor de eventos para conservar el historial de adquisiciones, usos y modificaciones.
- Los cambios administrativos importantes deben registrar quién los realizó, cuándo y por qué.
- La base de datos será la fuente de verdad; el asistente no debe inventar el estado del personaje.

## Reglas PTU NG consideradas en el prototipo

El modelo contempla los elementos que aparecen como piezas relevantes de un Entrenador: Atributos, Rasgos, Talentos, Clases, Nivel/Stats, Habilidades, Movimientos y Capacidades.

También contempla PA, Pokémon, inventario, dinero e historial. El documento de reglas indica que un Entrenador puede tener hasta cuatro Clases y que los Pokémon pueden tener hasta seis Movimientos. La interfaz no intenta automatizar todavía la totalidad de los requisitos de adquisición ni las fórmulas de progresión.

La progresión deberá parametrizarse por campaña porque PTU NG define progresión Estándar, Acelerada y Lenta.

## Modelo de salas

Una **sala** es la representación de una campaña completa. Es el contexto principal de navegación: primero se selecciona la sala y después se accede a sus personajes, Pokémon, inventarios, sesiones y herramientas de DJ.

```text
Usuario
  └── Salas / campañas
       ├── Miembros (PLAYER / GM)
       ├── Personajes
       │    ├── Pokémon capturados
       │    └── Inventario
       ├── Sesiones
       │    ├── Resumen
       │    └── Notas
       └── herramientas de DJ / asistente
```

Una cuenta puede pertenecer a varias salas y tener un rol distinto en cada una. Las sesiones son subespacios de anotación dentro de la sala, no campañas independientes.

## Arquitectura objetivo

```text
Next.js App Router
        |
        +-- UI mobile-first
        |
        +-- Server Actions / Route Handlers
        |
        +-- autorización por campaña
        |
        +-- PostgreSQL
        |      +-- users
        |      +-- campaigns
        |      +-- campaign_members
        |      +-- characters
        |      +-- character_attributes
        |      +-- character_features
        |      +-- pokemon_species
        |      +-- captured_pokemon
        |      +-- items
        |      +-- inventory_entries
        |      +-- inventory_events
        |      +-- campaign_events
        |      +-- sessions
        |
        +-- knowledge base / reglas
        |
        +-- proveedor LLM
```

## Autorización

La autorización debe comprobarse en servidor. Ocultar botones en React no es suficiente.

La aplicación separa tres conceptos:

```text
PLATFORM_ADMIN -> administra la plataforma y aprueba/gestiona campañas
GM             -> administra una campaña concreta
PLAYER         -> participa en una campaña
```

Un usuario puede ser GM en una campaña y PLAYER en otra. El rol `PLATFORM_ADMIN` es global y está almacenado en `profiles.platform_role`; no se deriva del correo en el frontend.

La creación de campañas sigue este flujo:

```text
USER -> campaign_creation_requests -> PLATFORM_ADMIN -> APPROVED -> campaign ACTIVE
                                  \-> REJECTED
```

Una solicitud pendiente por usuario evita la creación masiva de solicitudes. El administrador puede aprobar, rechazar, archivar, reactivar o eliminar campañas.

Ejemplo conceptual:

```text
request
  -> authenticated user
  -> campaign membership
  -> campaign role
  -> permission for requested operation
  -> transaction + audit event
```

## Asistente

El asistente tendrá tres fuentes principales de contexto:

1. **Reglas:** recuperación de fragmentos del manual/base de conocimiento.
2. **Campaña:** sesión, eventos y decisiones del GM.
3. **Personaje:** atributos, clases, rasgos, talentos, Pokémon, objetos y recursos actuales.

Preguntas sobre datos estructurados deben consultar primero la base de datos. Preguntas sobre reglas deben consultar el conocimiento de reglas. El LLM se utiliza para interpretar y presentar la respuesta, no como fuente de verdad.

## Estados de campaña

Las campañas manejan `ACTIVE`, `PAUSED`, `ARCHIVED` y estados administrativos relacionados con el flujo de aprobación. Archivar conserva los datos de la campaña; eliminar es una operación administrativa destructiva y se reserva al administrador de plataforma.

## Invitaciones

Cada sala tiene un código persistente y un enlace equivalente (`/?invite=CODIGO`). Ambos métodos desembocan en la misma operación de unión. El código no concede acceso por sí mismo: el usuario debe autenticarse y la función de base de datos valida expiración, usos y pertenencia antes de insertar el miembro.

## UX inicial

La navegación principal está diseñada para teléfono:

- Inicio
- Ficha
- Equipo Pokémon
- Objetos
- Asistente

Cuando el usuario tiene permisos de GM, la misma aplicación incorpora la vista administrativa de jugadores. El prototipo incluye un selector de modo para visualizar esta experiencia sin crear todavía autenticación real.

## Estado de implementación

1. Autenticación por correo y contraseña mediante Supabase Auth.
2. Selección real de salas/campañas mediante `campaign_members`.
3. Creación de salas con código de invitación persistente.
4. Unión mediante código o enlace `?invite=CODIGO`, usando una función transaccional protegida.
5. Fichas, Pokémon, inventario y sesiones leídos desde PostgreSQL.
6. RLS aplicado por pertenencia a campaña, rol GM/PLAYER y rol administrativo de plataforma.
7. Solicitudes de creación de campaña y panel de administración de salas.

## Próximas fases

1. Ficha completa y validadores PTU NG.
2. Pokémon y Pokédex estructurada.
3. Inventario con ledger de eventos y tienda por campaña.
4. Sesiones, notas y herramientas de GM.
5. Base de conocimiento de reglas.
6. Asistente contextual con herramientas de lectura/escritura controladas.
7. Pruebas de reglas y autorización.
4. Ficha completa y validadores PTU NG.
5. Pokémon y Pokédex estructurada.
6. Inventario con ledger de eventos.
7. Sesiones, notas y herramientas de GM.
8. Base de conocimiento de reglas.
9. Asistente contextual con herramientas de lectura/escritura controladas.
10. Pruebas de reglas y autorización.

## Persistencia mínima obligatoria

La base de datos debe conservar, como mínimo, el estado necesario para reconstruir una partida desde cualquier dispositivo:

- Cuenta y perfil básico.
- Sala/campaña, propietario, configuración de progresión y miembros/roles.
- Personaje: identidad, nivel/experiencia, recursos, stats, atributos, clases y elementos de progresión (rasgos, talentos, habilidades y capacidades), además de notas e imagen.
- Pokémon capturados: especie, identidad individual, nivel, PS, movimientos, habilidad, naturaleza, objeto equipado, estado, notas e imagen.
- Catálogo de especies y sus datos de reglas.
- Inventario actual y un ledger de cambios para poder reconstruir cómo se obtuvo/usó/modificó cada objeto.
- Sesiones: número, fecha, título, resumen y notas.
- Notas individuales de sesión, incluyendo notas privadas del GM.
- Eventos relevantes de campaña con actor, fecha, entidad afectada y payload de datos.
- Invitaciones de sala y su estado de uso.

Los datos derivados (por ejemplo, contadores de Pokémon, cantidades agregadas o una vista de historial) deben poder reconstruirse desde estas entidades; no deben ser la única fuente de verdad.

Las imágenes se almacenarán físicamente en Supabase Storage o un proveedor equivalente y la base de datos conservará únicamente su referencia (URL o ruta).
