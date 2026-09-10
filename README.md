# NeoGénesis — Asistente PTU NG

Aplicación **mobile-first** para acompañar partidas de Pokémon Tabletop United NeoGénesis (PTU NG): gestión de campañas, personajes, Pokémon, inventario, historial y un futuro asistente contextual de reglas.

## Estado actual

Este repositorio contiene el **primer bosquejo funcional de interfaz y dominio**. Se puede desplegar en Vercel como una aplicación Next.js y probarse desde un teléfono o navegador.

El prototipo incluye:

- Navegación mobile-first.
- Ficha de Entrenador con Nivel, Vida, PA, Stats, Atributos y Clases.
- Equipo de Pokémon con Nivel, PS, Tipos, Habilidad, Naturaleza y Movimientos.
- Inventario y dinero.
- Historial de eventos del personaje.
- Vista de jugadores para el modo GM.
- Cambio entre vista Jugador y modo DJ para explorar el flujo administrativo.
- Persistencia local de los datos de demostración mediante `localStorage`.
- Manifest e icono para una experiencia web móvil instalable.
- Tipos de dominio separados de la interfaz para facilitar la futura conexión a PostgreSQL.

## Importante

La persistencia actual es **solo de demostración y local al navegador**. Todavía no existe autenticación, base de datos, invitaciones reales, autorización de servidor ni sincronización entre dispositivos.

No se ha intentado automatizar todavía la totalidad de las reglas de PTU NG. El modelo se prepara para soportarlas progresivamente sin convertir el LLM en la fuente de verdad.

## Arquitectura prevista

```text
Next.js App Router
  ├── UI mobile-first
  ├── Server Actions / Route Handlers
  ├── autenticación + autorización por campaña
  ├── PostgreSQL
  │    ├── usuarios
  │    ├── campañas / salas
  │    ├── miembros
  │    ├── personajes
  │    ├── Pokémon capturados
  │    ├── inventario
  │    ├── eventos e historial
  │    └── sesiones
  ├── base de conocimiento PTU NG
  └── asistente LLM contextual
```

La arquitectura detallada está en [`docs/architecture.md`](docs/architecture.md).

## Reglas de diseño de dominio

- Un usuario puede participar en varias campañas.
- El rol es contextual a la campaña: el mismo usuario puede ser GM en una sala y PLAYER en otra.
- Personaje, Pokémon capturado y especie Pokémon son entidades distintas.
- Inventario y cambios relevantes deben evolucionar hacia un historial auditable.
- La base de datos será la fuente de verdad.
- El asistente consultará reglas y datos estructurados antes de responder.

## PTU NG considerado

El bosquejo se alinea con elementos descritos en PTU NG como Atributos, Rasgos, Talentos, Clases, Nivel/Stats, Habilidades, Movimientos y Capacidades. También contempla PA, Pokémon, dinero, objetos y progresiones de personaje.

## Desarrollo local

```bash
pnpm install
pnpm dev
```

Después abre `http://localhost:3000`.

## Despliegue

El proyecto utiliza Next.js App Router y está preparado para desplegarse directamente en Vercel. No requiere variables de entorno para ejecutar el prototipo actual.

Cuando se incorpore autenticación, PostgreSQL o IA, las credenciales deberán configurarse como variables de entorno en Vercel y mantenerse fuera del repositorio.
