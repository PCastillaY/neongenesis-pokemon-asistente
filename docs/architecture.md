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
- La base de datos y el motor de reglas son la fuente de verdad; la aplicación no debe delegar decisiones mecánicas en un modelo generativo.

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

## Motor de reglas y automatización

El producto no utiliza IA para resolver la partida. Las reglas mecánicas se implementan como funciones deterministas y datos estructurados derivados de PTU NG.

El patrón general es:

```
acción del usuario/DJ
      ↓
validación
      ↓
motor de reglas
      ↓
cálculo
      ↓
modificación de estado
      ↓
evento persistente
      ↓
historial
```

La aleatoriedad permitida por el sistema utiliza un RNG con semilla para que las generaciones puedan auditarse y reproducirse.

### Generación de Pokémon

Una especie contiene sus datos base. Los presets contienen únicamente preferencias de generación, no sustituyen las reglas del manual:

- pesos de distribución de Stats;
- pesos de Naturaleza;
- pesos de selección de Movimientos;
- reglas de comportamiento opcionales para herramientas del DJ.

La aplicación puede ofrecer 3–4 presets por especie cuando tenga sentido. El DJ puede seleccionar especie, nivel, cantidad y preset para preparar un encuentro. La Naturaleza se obtiene mediante selección ponderada y la variante conserva la semilla utilizada.

Las Naturalezas se mantienen como datos del motor y aplican el +2/-2 indicado por PTU NG. El BSP se calcula según los tres Stats Base más altos y los incrementos por cada 10 Niveles.

### Combate

Los dados utilizados durante la partida son físicos. NeoGénesis no lanza los dados por el usuario. El jugador o DJ introduce el resultado de la tirada y el motor realiza los cálculos restantes.

El flujo objetivo es:

```
Movimiento elegido
→ indicación de dados a lanzar
→ resultado físico introducido
→ cálculo de Precisión/Daño
→ modificadores y efectividad
→ PS/estado actualizado
→ evento de combate
```

Cada encuentro conserva participantes, acciones y tiradas para reconstruir lo ocurrido.

Las decisiones narrativas, la selección final de enemigos, objetivos, posicionamiento y excepciones de la partida permanecen bajo control del DJ y los jugadores.

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
- Encuentros

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
5. Motor de reglas PTU NG y catálogo estructurado.
6. Preparador y sala de combates.
7. Pruebas de reglas y autorización.

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
