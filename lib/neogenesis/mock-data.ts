import type { Campaign, Character, Pokemon } from './types'

const pikachu: Pokemon = {
  id: 'pokemon-pikachu',
  name: 'Chispa',
  species: 'Pikachu',
  level: 12,
  hp: 34,
  maxHp: 42,
  types: ['Eléctrico'],
  ability: 'Electricidad Estática',
  moves: ['Impactrueno', 'Onda Trueno', 'Ataque Rápido', 'Cola Férrea'],
  nature: 'Alegre',
}

const eevee: Pokemon = {
  id: 'pokemon-eevee',
  name: 'Lumen',
  species: 'Eevee',
  level: 10,
  hp: 28,
  maxHp: 36,
  types: ['Normal'],
  ability: 'Adaptabilidad',
  moves: ['Placaje', 'Gruñido', 'Ataque Rápido', 'Mordisco'],
  nature: 'Serena',
}

const character: Character = {
  id: 'character-aria',
  name: 'Aria Vega',
  concept: 'Exploradora de ruinas y guardiana de Pokémon',
  level: 4,
  hp: 27,
  maxHp: 32,
  actionPoints: 3,
  maxActionPoints: 5,
  money: 1240,
  classes: ['Entrenadora', 'Exploradora'],
  attributes: {
    Percepción: 'Experto',
    Supervivencia: 'Adepto',
    'Educación Pokémon': 'Adepto',
    Sigilo: 'Novato',
    Combate: 'Novato',
  },
  stats: {
    ps: 32,
    ataque: 14,
    defensa: 12,
    ataqueEspecial: 16,
    defensaEspecial: 15,
    velocidad: 18,
  },
  pokemon: [pikachu, eevee],
  inventory: [
    { id: 'item-potion', name: 'Poción', quantity: 4, category: 'Curación' },
    { id: 'item-pokeball', name: 'Poké Ball', quantity: 7, category: 'Captura' },
    { id: 'item-repel', name: 'Repelente', quantity: 2, category: 'Exploración' },
  ],
  history: [
    { id: 'event-1', type: 'POKEMON_CAPTURED', title: 'Lumen se unió al equipo', detail: 'Eevee fue encontrado en el Bosque Umbrío.', date: 'Hoy' },
    { id: 'event-2', type: 'LEVEL_UP', title: 'Subiste a nivel 4', detail: 'Has desbloqueado nuevas capacidades.', date: 'Ayer' },
    { id: 'event-3', type: 'ITEM_USED', title: 'Poción utilizada', detail: 'Chispa recuperó 20 PS.', date: 'Hace 2 días' },
  ],
}

export const demoCampaign: Campaign = {
  id: 'campaign-neogenesis',
  name: 'Ecos de NeoGénesis',
  description: 'Una aventura Pokémon de misterio, exploración y vínculos imposibles.',
  sessionNumber: 8,
  members: [
    { id: 'member-gm', displayName: 'Dr. Oak', role: 'GM' },
    { id: 'member-aria', displayName: 'Aria Vega', role: 'PLAYER', character },
    { id: 'member-noah', displayName: 'Noah Kells', role: 'PLAYER' },
    { id: 'member-luna', displayName: 'Luna Sol', role: 'PLAYER' },
  ],
  sessions: [
    {
      id: 'session-8',
      sessionNumber: 8,
      title: 'La señal del Santuario',
      playedAt: 'Hoy',
      summary: 'El equipo siguió una señal desconocida hasta las ruinas del santuario.',
      notes: 'Investigar el símbolo de NeoGénesis y preparar la próxima expedición.',
    },
  ],
}

export { character }
export type { Campaign, Character, Pokemon }
