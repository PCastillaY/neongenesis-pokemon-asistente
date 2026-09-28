import { supabase } from '@/lib/supabase/client'
import type { Campaign, CampaignMember, CampaignSession, Character, HistoryEvent, InventoryItem, Pokemon } from '@/lib/neogenesis/types'

type DbCampaign = {
  id: string
  name: string
  description: string
  progression_mode: 'STANDARD' | 'ACCELERATED' | 'SLOW'
  invite_code: string | null
  image_url: string | null
  status: 'PENDING' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'REJECTED'
}

export type CampaignCreationRequest = {
  id: string
  requested_by: string
  name: string
  description: string
  progression_mode: 'STANDARD' | 'ACCELERATED' | 'SLOW'
  image_url: string | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
  reviewed_by: string | null
  reviewed_at: string | null
  review_notes: string
  created_at: string
  requester_display_name?: string | null
}

type DbMember = {
  campaign_id: string
  user_id: string
  role: 'PLAYER' | 'GM'
  display_name: string | null
}

type DbCharacter = {
  id: string
  campaign_id: string
  user_id: string
  name: string
  concept: string
  level: number
  hp: number
  max_hp: number
  action_points: number
  max_action_points: number
  money: number
  classes: string[]
  attributes: Record<string, string>
  stats: Record<string, number>
}

function toCharacter(row: DbCharacter, pokemon: Pokemon[], inventory: InventoryItem[], history: HistoryEvent[]): Character {
  return {
    id: row.id,
    name: row.name,
    concept: row.concept,
    level: row.level,
    hp: row.hp,
    maxHp: row.max_hp,
    actionPoints: row.action_points,
    maxActionPoints: row.max_action_points,
    money: row.money,
    classes: row.classes ?? [],
    attributes: row.attributes ?? {},
    stats: {
      ps: Number(row.stats?.ps ?? row.max_hp ?? 0),
      ataque: Number(row.stats?.ataque ?? 0),
      defensa: Number(row.stats?.defensa ?? 0),
      ataqueEspecial: Number(row.stats?.ataqueEspecial ?? 0),
      defensaEspecial: Number(row.stats?.defensaEspecial ?? 0),
      velocidad: Number(row.stats?.velocidad ?? 0),
    },
    pokemon,
    inventory,
    history,
  }
}

async function loadCharacterData(character: DbCharacter) {
  const [{ data: pokemonRows, error: pokemonError }, { data: inventoryRows, error: inventoryError }, { data: eventRows, error: eventError }] = await Promise.all([
    supabase.from('captured_pokemon').select('id,nickname,level,hp,max_hp,types,ability,moves,nature,image_url,species:pokemon_species(name)').eq('character_id', character.id).order('created_at'),
    supabase.from('character_inventory').select('id,quantity,custom_name,item:items(name,category)').eq('character_id', character.id).order('created_at'),
    supabase.from('campaign_events').select('id,event_type,title,detail,created_at,entity_type,entity_id').eq('campaign_id', character.campaign_id).order('created_at', { ascending: false }).limit(50),
  ])

  if (pokemonError) throw pokemonError
  if (inventoryError) throw inventoryError
  if (eventError) throw eventError

  const pokemon: Pokemon[] = (pokemonRows ?? []).map((row: any) => ({
    id: row.id,
    name: row.nickname || row.species?.name || 'Pokémon',
    species: row.species?.name || 'Especie desconocida',
    level: row.level,
    hp: row.hp,
    maxHp: row.max_hp,
    types: row.types ?? [],
    ability: row.ability,
    moves: row.moves ?? [],
    nature: row.nature ?? undefined,
    imageUrl: row.image_url ?? undefined,
  }))

  const inventory: InventoryItem[] = (inventoryRows ?? []).map((row: any) => ({
    id: row.id,
    name: row.custom_name || row.item?.name || 'Objeto personalizado',
    quantity: row.quantity,
    category: row.item?.category || 'OTHER',
  }))

  const history: HistoryEvent[] = (eventRows ?? [])
    .filter((row: any) => row.entity_type === 'character' && row.entity_id === character.id)
    .map((row: any) => ({
      id: row.id,
      type: row.event_type === 'LEVEL_UP' || row.event_type === 'ITEM_USED' || row.event_type === 'POKEMON_CAPTURED' ? row.event_type : 'NOTE',
      title: row.title,
      detail: row.detail,
      date: new Date(row.created_at).toLocaleDateString('es-PE'),
    }))

  return toCharacter(character, pokemon, inventory, history)
}

export async function loadCampaigns() {
  const { data: memberRows, error: memberError } = await supabase
    .from('campaign_members')
    .select('campaign_id,user_id,role,display_name,campaign:campaigns(id,name,description,progression_mode,invite_code,image_url,status)')
  if (memberError) throw memberError

  const rows = (memberRows ?? []) as any[]
  const unique = new Map<string, Campaign>()
  for (const row of rows) {
    const campaign = row.campaign as DbCampaign
    if (!campaign || unique.has(campaign.id)) continue
    unique.set(campaign.id, {
      id: campaign.id,
      name: campaign.name,
      description: campaign.description,
      progressionMode: campaign.progression_mode,
      inviteCode: campaign.invite_code ?? undefined,
      imageUrl: campaign.image_url ?? undefined,
      status: campaign.status,
      members: [],
      sessions: [],
      sessionNumber: 0,
    })
  }

  return Array.from(unique.values())
}

export async function loadCampaign(campaignId: string, userId: string): Promise<Campaign> {
  const [{ data: campaignRow, error: campaignError }, { data: memberRows, error: memberError }, { data: characterRows, error: characterError }, { data: sessionRows, error: sessionError }] = await Promise.all([
    supabase.from('campaigns').select('id,name,description,progression_mode,invite_code,image_url,status').eq('id', campaignId).single(),
    supabase.from('campaign_members').select('campaign_id,user_id,role,display_name').eq('campaign_id', campaignId).order('joined_at'),
    supabase.from('characters').select('id,campaign_id,user_id,name,concept,level,hp,max_hp,action_points,max_action_points,money,classes,attributes,stats').eq('campaign_id', campaignId),
    supabase.from('campaign_sessions').select('id,session_number,title,played_at,summary,notes').eq('campaign_id', campaignId).order('session_number', { ascending: false }),
  ])

  if (campaignError) throw campaignError
  if (memberError) throw memberError
  if (characterError) throw characterError
  if (sessionError) throw sessionError

  const chars = (characterRows ?? []) as unknown as DbCharacter[]
  const characters = await Promise.all(chars.map(loadCharacterData))
  const charById = new Map(chars.map((row, index) => [row.id, characters[index]]))

  const members: CampaignMember[] = ((memberRows ?? []) as DbMember[]).map((member) => {
    const ownCharacter = chars.find((row) => row.user_id === member.user_id)
    return {
      id: `${member.campaign_id}:${member.user_id}`,
      displayName: member.display_name || (member.user_id === userId ? 'Tú' : 'Jugador'),
      role: member.role,
      character: ownCharacter ? charById.get(ownCharacter.id) : undefined,
    }
  })

  const sessions: CampaignSession[] = ((sessionRows ?? []) as any[]).map((row) => ({
    id: row.id,
    sessionNumber: row.session_number,
    title: row.title,
    playedAt: row.played_at ? new Date(row.played_at).toLocaleDateString('es-PE') : undefined,
    summary: row.summary,
    notes: row.notes,
  }))

  return {
    id: campaignRow.id,
    name: campaignRow.name,
    description: campaignRow.description,
    progressionMode: campaignRow.progression_mode,
    inviteCode: campaignRow.invite_code ?? undefined,
    imageUrl: campaignRow.image_url ?? undefined,
    status: campaignRow.status,
    members,
    sessions,
    sessionNumber: sessions[0]?.sessionNumber ?? 0,
  }
}

export async function createCampaign(name: string, description: string, userId: string) {
  const code = crypto.randomUUID().replaceAll('-', '').slice(0, 8).toUpperCase()
  const { data, error } = await supabase
    .from('campaigns')
    .insert({ name, description, created_by: userId, invite_code: code, status: 'ACTIVE' })
    .select('id,name')
    .single()
  if (error) throw error
  return data.id
}

export async function submitCampaignCreationRequest(
  name: string,
  description: string,
  progressionMode: 'STANDARD' | 'ACCELERATED' | 'SLOW' = 'STANDARD',
) {
  const { data, error } = await supabase.rpc('submit_campaign_creation_request', {
    request_name: name.trim(),
    request_description: description.trim(),
    request_progression_mode: progressionMode,
    request_image_url: null,
  })
  if (error) throw error
  return data as string
}

export async function loadCampaignCreationRequests() {
  const { data, error } = await supabase
    .from('campaign_creation_requests')
    .select('id,requested_by,name,description,progression_mode,image_url,status,reviewed_by,reviewed_at,review_notes,created_at')
    .order('created_at', { ascending: false })
  if (error) throw error

  const rows = (data ?? []) as CampaignCreationRequest[]
  const ids = Array.from(new Set(rows.map((row) => row.requested_by)))
  if (!ids.length) return rows

  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id,display_name')
    .in('id', ids)
  if (profileError) throw profileError

  const names = new Map<string, string | null>()
  for (const profile of profiles ?? []) names.set(profile.id, profile.display_name)
  return rows.map((row) => ({ ...row, requester_display_name: names.get(row.requested_by) ?? null }))
}

export async function loadAdminCampaignCreationRequests() {
  return loadCampaignCreationRequests()
}

export async function loadAdminCampaigns(): Promise<Campaign[]> {
  const { data, error } = await supabase
    .from('campaigns')
    .select('id,name,description,progression_mode,invite_code,image_url,status,created_by')
    .order('created_at', { ascending: false })
  if (error) throw error
  return ((data ?? []) as Array<DbCampaign & { created_by: string }>).map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    progressionMode: row.progression_mode,
    inviteCode: row.invite_code ?? undefined,
    imageUrl: row.image_url ?? undefined,
    status: row.status,
    members: [],
    sessions: [],
    sessionNumber: 0,
  }))
}

export async function approveCampaignCreationRequest(requestId: string, notes = '') {
  const { data, error } = await supabase.rpc('approve_campaign_creation_request', {
    request_id_input: requestId,
    review_notes_input: notes,
  })
  if (error) throw error
  return data as { request_id: string; campaign_id: string; status: 'APPROVED' }
}

export async function rejectCampaignCreationRequest(requestId: string, notes = '') {
  const { data, error } = await supabase.rpc('reject_campaign_creation_request', {
    request_id_input: requestId,
    review_notes_input: notes,
  })
  if (error) throw error
  return data as { request_id: string; status: 'REJECTED' }
}

export async function updateCampaignStatus(
  campaignId: string,
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED',
) {
  const { error } = await supabase.from('campaigns').update({ status }).eq('id', campaignId)
  if (error) throw error
}

export async function deleteCampaign(campaignId: string) {
  const { error } = await supabase.from('campaigns').delete().eq('id', campaignId)
  if (error) throw error
}

export async function createCharacter(campaignId: string, userId: string, name: string, concept: string) {
  const { data, error } = await supabase.from('characters').insert({
    campaign_id: campaignId,
    user_id: userId,
    name,
    concept,
    level: 1,
    hp: 0,
    max_hp: 0,
    action_points: 0,
    max_action_points: 0,
    money: 0,
    classes: [],
    attributes: {},
    stats: {},
  }).select('id').single()
  if (error) throw error
  return data.id
}

export async function joinCampaign(code: string) {
  const { data, error } = await supabase.rpc('join_campaign_by_invite', {
    invite_code_input: code.trim().toUpperCase(),
  })
  if (error) throw error
  return data as { campaign_id: string; campaign_name: string; role: 'PLAYER' | 'GM'; already_member: boolean }
}
