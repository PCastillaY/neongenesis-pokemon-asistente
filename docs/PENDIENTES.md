# Pendientes de la aplicación

Este archivo es la lista viva de trabajo pendiente del proyecto. Debe actualizarse conforme se complete, redefina o descubra trabajo nuevo.

## Prioridad inmediata

- [ ] Completar el flujo **DJ → encuentro → especie → nivel → preset → generación determinista → Pokémon runtime → participante de encuentro → persistencia en Supabase**.
- [ ] Implementar y validar presets concretos para pruebas iniciales:
  - [ ] Pidgey nivel 5.
  - [ ] Profesor Pokémon como NPC/guía.
- [ ] Verificar que el sistema de presets pueda representar tanto Pokémon como entrenadores/NPCs cuando corresponda.
- [ ] Completar y validar las fórmulas de combate contra las reglas PTU NeoGénesis antes de persistir acciones de combate.
- [ ] Completar el encounter builder y persistir los participantes generados.

## Motor de reglas

- [ ] Completar validadores de la ficha de personaje PTU NG.
- [ ] Completar catálogo base de objetos.
- [ ] Revisar movimientos/acciones que todavía necesiten datos desde el documento fuente.
- [ ] Definir presets reutilizables por especie donde aporten valor (objetivo inicial: 3–4 por especie cuando corresponda).
- [ ] Permitir presets específicos creados por el DJ para una campaña.
- [ ] Validar de forma sistemática fórmulas de HP, estadísticas, daño, precisión, modificadores y demás cálculos de combate.
- [ ] Añadir pruebas automatizadas para reglas y cálculos deterministas.

## Combate

- [ ] Implementar flujo de combate persistente.
- [ ] Registrar tiradas físicas introducidas por jugador/DJ.
- [ ] Calcular automáticamente el resultado a partir de las reglas.
- [ ] Aplicar modificaciones de estado/HP.
- [ ] Registrar eventos y mantener historial de acciones.
- [ ] Validar autorización/RLS de acciones de combate.

## Encuentros y NPCs

- [ ] Completar el builder de encuentros.
- [ ] Generar participantes desde especies, presets y niveles.
- [ ] Persistir encuentros y participantes.
- [ ] Definir estructura reutilizable para entrenadores/NPCs.
- [ ] Permitir presets de NPC/entrenador además de presets de Pokémon.
- [ ] Revisar capacidades de edición manual del DJ sobre entidades generadas.

## Catálogo y tienda

- [ ] Completar catálogo base de objetos.
- [ ] Implementar tienda por campaña.
- [ ] Definir categorías de objetos vendibles.
- [ ] Permitir que el DJ habilite/deshabilite contenido.
- [ ] Permitir precios y disponibilidad personalizados por campaña.
- [ ] Permitir objetos personalizados creados por el DJ.
- [ ] Definir disponibilidad temporal o excepciones por sesión.
- [ ] Añadir soporte de imágenes para Pokémon, personajes y objetos donde corresponda.

## Campañas, usuarios y permisos

- [ ] Revisar integralmente las políticas RLS después de los cambios recientes del motor determinista.
- [ ] Añadir pruebas automatizadas de autorización.
- [ ] Verificar casos de cambio de rol y pertenencia a múltiples campañas.
- [ ] Validar flujo completo de invitación desde enlace/código hasta incorporación a campaña.
- [ ] Revisar operaciones administrativas sensibles y sus funciones PostgreSQL.

## Datos y Supabase

- [ ] Revisar consistencia entre tipos TypeScript, esquema PostgreSQL y datos estructurados del catálogo.
- [ ] Verificar restricciones de unicidad de especies/Pokémon.
- [ ] Validar migraciones desde una instalación limpia.
- [ ] Confirmar que no exista dependencia accidental de estado demo/localStorage para datos persistentes.
- [ ] Añadir pruebas de integridad para datos del catálogo.
- [ ] Documentar cambios relevantes del modelo de datos.

## Calidad y mantenimiento

- [ ] Añadir scripts de lint/test si el proyecto los necesita.
- [ ] Incorporar pruebas automatizadas para el motor de reglas.
- [ ] Incorporar pruebas de integración para Supabase/RLS.
- [ ] Revisar errores de build y tipos antes de cada hito.
- [ ] Mantener README y documentación sincronizados con la implementación real.

## Funcionalidades posteriores

- [ ] Completar experiencia de ficha de personaje.
- [ ] Completar inventario y gestión de objetos.
- [ ] Completar sesiones/eventos de campaña.
- [ ] Definir y completar flujo de compra de la tienda.
- [ ] Mejorar gestión de imágenes.
- [ ] Evaluar funciones de IA únicamente como interfaz o asistencia narrativa, sin delegar en LLM la autoridad sobre las reglas deterministas.

## Historial de hitos recientes

- [x] Reemplazar la arquitectura basada en LLM como motor de reglas por un motor determinista.
- [x] Incorporar catálogo estructurado de Pokémon PTU NG.
- [x] Cargar catálogo de 978 entradas/especies-formas de Pokémon.
- [x] Separar tipos de especie y Pokémon runtime.
- [x] Crear infraestructura para presets de generación de encuentros.
- [x] Corregir fórmula de HP de Pokémon según PTU NG.
- [x] Registrar esquema base del motor determinista y combate.
- [x] Registrar políticas RLS del motor determinista en migración.
- [x] Registrar restricción de unicidad de especies Pokémon.
