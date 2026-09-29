export type PokemonStat = 'ps' | 'ataque' | 'defensa' | 'ataqueEspecial' | 'defensaEspecial' | 'velocidad'

export type PokemonBaseStats = Record<PokemonStat, number>

export type Nature = {
  name: string
  up: PokemonStat
  down: PokemonStat
}

export type PokemonPreset = {
  id: string
  name: string
  description: string
  statWeights: Partial<Record<PokemonStat, number>>
  natureWeights: Record<string, number>
  moveWeights?: Record<string, number>
  behaviorRules?: string[]
}

export type GeneratedPokemon = {
  nature: Nature
  baseStats: PokemonBaseStats
  investedStats: PokemonBaseStats
  principalBonus: PokemonBaseStats
  finalStats: PokemonBaseStats
  maxHp: number
  natureName: string
  seed: number
}

export const NATURES: Nature[] = [
  { name: 'Mimosa', up: 'ps', down: 'ataque' },
  { name: 'Distraída', up: 'ps', down: 'defensa' },
  { name: 'Orgullosa', up: 'ps', down: 'ataqueEspecial' },
  { name: 'Decidida', up: 'ps', down: 'defensaEspecial' },
  { name: 'Paciente', up: 'ps', down: 'velocidad' },
  { name: 'Desesperada', up: 'ataque', down: 'ps' },
  { name: 'Cauta', up: 'defensaEspecial', down: 'ataqueEspecial' },
  { name: 'Huraña', up: 'ataque', down: 'defensa' },
  { name: 'Grosera', up: 'defensaEspecial', down: 'velocidad' },
  { name: 'Firme', up: 'ataque', down: 'ataqueEspecial' },
  { name: 'Asustadiza', up: 'velocidad', down: 'ps' },
  { name: 'Pícara', up: 'ataque', down: 'defensaEspecial' },
  { name: 'Miedosa', up: 'velocidad', down: 'ataque' },
  { name: 'Audaz', up: 'ataque', down: 'velocidad' },
  { name: 'Activa', up: 'velocidad', down: 'defensa' },
  { name: 'Rígida', up: 'defensa', down: 'ps' },
  { name: 'Alegre', up: 'velocidad', down: 'ataqueEspecial' },
  { name: 'Osada', up: 'defensa', down: 'ataque' },
  { name: 'Ingenua', up: 'velocidad', down: 'defensaEspecial' },
  { name: 'Agitada', up: 'defensa', down: 'ataqueEspecial' },
  { name: 'Calmada', up: 'ps', down: 'ps' },
  { name: 'Floja', up: 'defensa', down: 'defensaEspecial' },
  { name: 'Fuerte', up: 'ataque', down: 'ataque' },
  { name: 'Dócil', up: 'defensa', down: 'defensa' },
  { name: 'Curiosa', up: 'ataqueEspecial', down: 'ps' },
  { name: 'Tímida', up: 'ataqueEspecial', down: 'ataqueEspecial' },
  { name: 'Modesta', up: 'ataqueEspecial', down: 'ataque' },
  { name: 'Rara', up: 'defensaEspecial', down: 'defensaEspecial' },
  { name: 'Afable', up: 'ataqueEspecial', down: 'defensa' },
  { name: 'Seria', up: 'velocidad', down: 'velocidad' },
  { name: 'Activa', up: 'velocidad', down: 'defensa' },
  { name: 'Rígida', up: 'defensa', down: 'ps' },
  { name: 'Plácida', up: 'defensa', down: 'velocidad' },
  { name: 'Dócil', up: 'defensa', down: 'defensa' },
  { name: 'Mansa', up: 'ataqueEspecial', down: 'velocidad' },
]

const DEFAULT_WEIGHTS: Record<PokemonStat, number> = {
  ps: 1, ataque: 1, defensa: 1, ataqueEspecial: 1, defensaEspecial: 1, velocidad: 1,
}

const statOrder: PokemonStat[] = ['ps', 'ataque', 'defensa', 'ataqueEspecial', 'defensaEspecial', 'velocidad']

function mulberry32(seed: number) {
  let value = seed >>> 0
  return () => {
    value += 0x6D2B79F5
    let t = value
    t = Math.imul(t ^ t >>> 15, t | 1)
    t ^= t + Math.imul(t ^ t >>> 7, t | 61)
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

function weightedPick<T>(items: T[], weights: number[], random: () => number): T {
  const total = weights.reduce((sum, weight) => sum + Math.max(0, weight), 0)
  if (total <= 0) return items[Math.floor(random() * items.length)]
  let cursor = random() * total
  for (let i = 0; i < items.length; i += 1) {
    cursor -= Math.max(0, weights[i])
    if (cursor <= 0) return items[i]
  }
  return items[items.length - 1]
}

function emptyStats(): PokemonBaseStats {
  return { ps: 0, ataque: 0, defensa: 0, ataqueEspecial: 0, defensaEspecial: 0, velocidad: 0 }
}

function allocateLevelPoints(level: number, weights: Partial<Record<PokemonStat, number>>, random: () => number): PokemonBaseStats {
  const invested = emptyStats()
  const points = Math.max(0, level - 1)
  const maxPerStat = Math.floor(points * 0.4)
  const configured = statOrder.map((stat) => weights[stat] ?? DEFAULT_WEIGHTS[stat])

  for (let point = 0; point < points; point += 1) {
    const available = statOrder.filter((stat) => invested[stat] < maxPerStat || maxPerStat === 0)
    const candidates = available.length ? available : statOrder
    const candidateWeights = candidates.map((stat) => weights[stat] ?? 1)
    const chosen = weightedPick(candidates, candidateWeights, random)
    if (maxPerStat > 0 && invested[chosen] >= maxPerStat) continue
    invested[chosen] += 1
  }

  if (points > 0 && maxPerStat === 0) {
    for (let i = 0; i < points; i += 1) invested[statOrder[i % statOrder.length]] += 1
  }

  void configured
  return invested
}

function topThree(stats: PokemonBaseStats): PokemonStat[] {
  return [...statOrder].sort((a, b) => stats[b] - stats[a] || statOrder.indexOf(a) - statOrder.indexOf(b)).slice(0, 3)
}

export function applyNature(baseStats: PokemonBaseStats, nature: Nature): PokemonBaseStats {
  const result = { ...baseStats }
  result[nature.up] += 2
  result[nature.down] -= 2
  return result
}

export function calculatePrincipalBonus(baseStats: PokemonBaseStats, level: number): PokemonBaseStats {
  const result = emptyStats()
  const steps = Math.floor(level / 10)
  if (steps <= 0) return result
  const [primary, secondary, tertiary] = topThree(baseStats)
  result[primary] += steps * 3
  result[secondary] += steps * 2
  result[tertiary] += steps
  return result
}

export function calculatePokemonMaxHp(stats: PokemonBaseStats, level: number, mode: 'ACTUAL' | 'OLD' = 'ACTUAL'): number {
  // PTU NG 1.2.3: Pokémon HP = (PS × 3) + Nivel + 10.
  // The OLD mode is retained only as an explicit compatibility hook.
  if (mode === 'OLD') return stats.ps * 3 + level + 10
  return stats.ps * 3 + level + 10
}

export function generatePokemonBuild(
  baseStats: PokemonBaseStats,
  level: number,
  preset: PokemonPreset,
  seed = Date.now(),
  hpFormula: 'ACTUAL' | 'OLD' = 'ACTUAL',
): GeneratedPokemon {
  const random = mulberry32(seed)
  const naturePool = NATURES
  const natureWeights = naturePool.map((nature) => preset.natureWeights[nature.name] ?? 1)
  const nature = weightedPick(naturePool, natureWeights, random)
  const natureStats = applyNature(baseStats, nature)
  const investedStats = allocateLevelPoints(level, preset.statWeights, random)
  const principalBonus = calculatePrincipalBonus(natureStats, level)
  const finalStats = statOrder.reduce((result, stat) => {
    result[stat] = natureStats[stat] + investedStats[stat] + principalBonus[stat]
    return result
  }, emptyStats())
  return {
    nature,
    baseStats: natureStats,
    investedStats,
    principalBonus,
    finalStats,
    maxHp: calculatePokemonMaxHp(finalStats, level, hpFormula),
    natureName: nature.name,
    seed,
  }
}


export const DEFAULT_PRESETS: PokemonPreset[] = [
  { id: 'balanced', name: 'Equilibrado', description: 'Distribución uniforme para encuentros generales.', statWeights: { ps: 1, ataque: 1, defensa: 1, ataqueEspecial: 1, defensaEspecial: 1, velocidad: 1 }, natureWeights: {} },
  { id: 'fast', name: 'Rápido', description: 'Prioriza Velocidad y un perfil ofensivo.', statWeights: { ps: 0.5, ataque: 1.4, defensa: 0.5, ataqueEspecial: 1.2, defensaEspecial: 0.5, velocidad: 2 }, natureWeights: { Alegre: 4, Audaz: 2, Miedosa: 2, Activa: 1 } },
  { id: 'physical', name: 'Ofensivo físico', description: 'Prioriza Ataque y Velocidad.', statWeights: { ps: 0.7, ataque: 2, defensa: 0.8, ataqueEspecial: 0.4, defensaEspecial: 0.6, velocidad: 1.5 }, natureWeights: { Firme: 4, Audaz: 2, Alegre: 2, Pícara: 1 } },
  { id: 'special', name: 'Ofensivo especial', description: 'Prioriza Ataque Especial y Velocidad.', statWeights: { ps: 0.7, ataque: 0.4, defensa: 0.7, ataqueEspecial: 2, defensaEspecial: 0.8, velocidad: 1.5 }, natureWeights: { Modesta: 4, Miedosa: 3, Afable: 1, Alegre: 1 } },
  { id: 'tank', name: 'Resistente', description: 'Prioriza PS y Stats Defensivos.', statWeights: { ps: 2, ataque: 0.7, defensa: 1.7, ataqueEspecial: 0.6, defensaEspecial: 1.7, velocidad: 0.4 }, natureWeights: { Osada: 3, Amable: 3, Serena: 2, Rígida: 1 } },
]
