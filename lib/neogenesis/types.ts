export type UserRole = 'PLAYER' | 'GM'

export type CampaignMemberRole = 'PLAYER' | 'GM'

export type AttributeRank = 'Patético' | 'Inexperto' | 'Novato' | 'Adepto' | 'Experto' | 'Maestro' | 'Virtuoso'

export type TrainerAttribute =
  | 'Acrobacias' | 'Atletismo' | 'Astucia' | 'Carisma' | 'Combate' | 'Concentración'
  | 'Educación General' | 'Educación Médica' | 'Educación Oculta' | 'Educación Pokémon'
  | 'Educación Tecnológica' | 'Intimidación' | 'Intuición' | 'Liderazgo' | 'Percepción'
  | 'Sigilo' | 'Supervivencia'

export type TrainerStats = {
  ps: number
  ataque: number
  defensa: number
  ataqueEspecial: number
  defensaEspecial: number
  velocidad: number
}

export type Pokemon = {
  id: string
  name: string
  species: string
  level: number
  hp: number
  maxHp: number
  types: string[]
  ability: string
  moves: string[]
  nature?: string
  imageUrl?: string
}

export type InventoryItem = {
  id: string
  name: string
  quantity: number
  category: string
}

export type HistoryEvent = {
  id: string
  type: 'LEVEL_UP' | 'ITEM_USED' | 'POKEMON_CAPTURED' | 'NOTE'
  title: string
  detail: string
  date: string
}

export type Character = {
  id: string
  name: string
  concept: string
  level: number
  hp: number
  maxHp: number
  actionPoints: number
  maxActionPoints: number
  money: number
  classes: string[]
  attributes: Partial<Record<TrainerAttribute, AttributeRank>>
  stats: TrainerStats
  pokemon: Pokemon[]
  inventory: InventoryItem[]
  history: HistoryEvent[]
}

export type CampaignMember = {
  id: string
  displayName: string
  role: CampaignMemberRole
  character?: Character
}

export type CampaignSession = {
  id: string
  sessionNumber: number
  title: string
  playedAt?: string
  summary: string
  notes: string
}

export type Campaign = {
  id: string
  name: string
  description: string
  progressionMode?: 'STANDARD' | 'ACCELERATED' | 'SLOW'
  inviteCode?: string
  imageUrl?: string
  members: CampaignMember[]
  sessions: CampaignSession[]
  sessionNumber: number
}
