import type { Campaign, Character } from './types'

export const demoCharacter: Character = {
  id: 'char-ash-demo',
  name: 'Aster',
  concept: 'Entrenador táctico',
  level: 5,
  hp: 46,
  maxHp: 46,
  actionPoints: 6,
  maxActionPoints: 6,
  money: 3200,
  classes: ['Comandante', 'Estratega'],
  attributes: {
    Acrobacias: 'Inexperto', Atletismo: 'Novato', Astucia: 'Adepto', Carisma: 'Inexperto',
    Combate: 'Novato', 'Educación Pokémon': 'Adepto', Liderazgo: 'Novato',
    Percepción: 'Inexperto', Sigilo: 'Inexperto',
  },
  stats: { ps: 10, ataque: 7, defensa: 6, ataqueEspecial: 5, defensaEspecial: 5, velocidad: 7 },
  pokemon: [
    { id: 'pkm-pikachu', name: 'Volt', species: 'Pikachu', level: 15, hp: 38, maxHp: 42, types: ['Eléctrico'], ability: 'Estática', moves: ['Impactrueno', 'Onda Trueno', 'Ataque Rápido', 'Electrobola'], nature: 'Alegre' },
    { id: 'pkm-bulbasaur', name: 'Brote', species: 'Bulbasaur', level: 12, hp: 31, maxHp: 39, types: ['Planta', 'Veneno'], ability: 'Espesura', moves: ['Placaje', 'Látigo Cepa', 'Drenadoras', 'Polvo Veneno'], nature: 'Serena' },
    { id: 'pkm-charcadet', name: 'Brasa', species: 'Charcadet', level: 10, hp: 27, maxHp: 34, types: ['Fuego'], ability: 'Absorbe Fuego', moves: ['Ascuas', 'Nitrocarga', 'Golpe Cabeza'], nature: 'Firme' },
  ],
  inventory: [
    { id: 'item-potion', name: 'Poción', quantity: 3, category: 'Curativo' },
    { id: 'item-super-potion', name: 'Superpoción', quantity: 1, category: 'Curativo' },
    { id: 'item-pokeball', name: 'Poké Ball', quantity: 7, category: 'Captura' },
    { id: 'item-antidote', name: 'Antídoto', quantity: 2, category: 'Curativo' },
    { id: 'item-mt', name: 'MT', quantity: 1, category: 'Máquina Técnica' },
  ],
  history: [
    { id: 'event-1', type: 'ITEM_USED', title: 'Poción utilizada', detail: 'Sesión 8 · combate contra un entrenador rival', date: 'Hoy' },
    { id: 'event-2', type: 'POKEMON_CAPTURED', title: 'Pokémon capturado', detail: 'Charcadet · Ruta 7', date: 'Ayer' },
    { id: 'event-3', type: 'LEVEL_UP', title: 'Nivel 5 alcanzado', detail: 'Se obtuvo un Rasgo y un Talento', date: '12/08/2026' },
  ],
}

export const demoCampaign: Campaign = {
  id: 'campaign-kanto-demo',
  name: 'Kanto · La Liga Renacida',
  description: 'Campaña de demostración para el primer prototipo de NeoGénesis.',
  sessionNumber: 8,
  sessions: [
    { id: 'session-8', sessionNumber: 8, title: 'Ruta 7 · Ecos del rival', playedAt: '12/09/2026', summary: 'El grupo llegó a la Ruta 7 y se enfrentó a un entrenador rival.', notes: 'Investigar la organización que está siguiendo al grupo.\nPistas: insignia rota, Charcadet capturado y contacto en Ciudad Azulona.' },
    { id: 'session-7', sessionNumber: 7, title: 'La estación abandonada', playedAt: '05/09/2026', summary: 'Exploración de una estación abandonada y encuentro con un Pokémon extraño.', notes: 'Volver a revisar el almacén del ala norte.' },
  ],
  members: [
    { id: 'member-gm', displayName: 'Mara', role: 'GM' },
    { id: 'member-player-1', displayName: 'Pablo', role: 'PLAYER', character: demoCharacter },
    { id: 'member-player-2', displayName: 'Nico', role: 'PLAYER', character: { ...demoCharacter, id: 'char-nico', name: 'Nico', level: 4, pokemon: demoCharacter.pokemon.slice(0, 2) } },
    { id: 'member-player-3', displayName: 'Sefi', role: 'PLAYER', character: { ...demoCharacter, id: 'char-sefi', name: 'Sefi', level: 6, pokemon: demoCharacter.pokemon.slice(1) } },
  ],
}
