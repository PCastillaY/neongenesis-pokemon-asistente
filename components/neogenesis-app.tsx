'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Backpack,
  Bot,
  ChevronRight,
  CircleHelp,
  Crown,
  History,
  Home,
  Plus,
  Settings,
  Shield,
  Sparkles,
  Swords,
  UserRound,
  Users,
  Zap,
} from 'lucide-react'
import { demoCampaign } from '@/lib/neogenesis/mock-data'
import type { Character, CampaignMember, Pokemon } from '@/lib/neogenesis/types'

const tabs = [
  { id: 'home', label: 'Inicio', icon: Home },
  { id: 'character', label: 'Ficha', icon: UserRound },
  { id: 'pokemon', label: 'Equipo', icon: Zap },
  { id: 'inventory', label: 'Objetos', icon: Backpack },
  { id: 'assistant', label: 'IA', icon: Bot },
] as const

type TabId = (typeof tabs)[number]['id']

function ProgressBar({ value, max }: { value: number; max: number }) {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className="h-2 overflow-hidden rounded-full bg-white/10">
      <div className="h-full rounded-full bg-cyan-300 transition-all" style={{ width: `${percentage}%` }} />
    </div>
  )
}

function SectionTitle({ icon: Icon, children }: { icon: typeof Home; children: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">
      <Icon className="size-4" />
      {children}
    </div>
  )
}

function PokemonCard({ pokemon }: { pokemon: Pokemon }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 shadow-lg shadow-black/10">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-bold">{pokemon.name}</p>
          <p className="text-xs text-white/50">{pokemon.species} · Nivel {pokemon.level}</p>
        </div>
        <div className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-wider text-white/60">
          {pokemon.types.join(' / ')}
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-xs text-white/60"><span>PS</span><span>{pokemon.hp}/{pokemon.maxHp}</span></div>
        <ProgressBar value={pokemon.hp} max={pokemon.maxHp} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-white/65">
        <div className="rounded-xl bg-black/15 p-2"><span className="text-white/35">Habilidad</span><br />{pokemon.ability}</div>
        <div className="rounded-xl bg-black/15 p-2"><span className="text-white/35">Naturaleza</span><br />{pokemon.nature ?? '—'}</div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {pokemon.moves.map((move) => <span key={move} className="rounded-full bg-white/7 px-2 py-1 text-[10px] text-white/65">{move}</span>)}
      </div>
    </article>
  )
}

function HomeTab({ character, isGM, members, onSelectMember }: { character: Character; isGM: boolean; members: CampaignMember[]; onSelectMember: (member: CampaignMember) => void }) {
  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-cyan-300/15 bg-gradient-to-br from-cyan-300/10 via-white/[0.035] to-transparent p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/70">Tu entrenador</p>
            <h2 className="mt-1 text-3xl font-black tracking-tight">{character.name}</h2>
            <p className="mt-1 text-sm text-white/55">{character.concept} · Nivel {character.level}</p>
          </div>
          <div className="rounded-2xl border border-cyan-200/15 bg-cyan-200/10 p-3"><Shield className="size-5 text-cyan-200" /></div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-black/15 p-3"><p className="text-[10px] uppercase text-white/40">Vida</p><p className="mt-1 text-xl font-bold">{character.hp}/{character.maxHp}</p><ProgressBar value={character.hp} max={character.maxHp} /></div>
          <div className="rounded-2xl bg-black/15 p-3"><p className="text-[10px] uppercase text-white/40">Puntos de Acción</p><p className="mt-1 text-xl font-bold">{character.actionPoints}/{character.maxActionPoints}</p><p className="mt-1 text-xs text-white/45">Se recuperan al final de la Escena.</p></div>
        </div>
      </section>

      <section>
        <SectionTitle icon={Zap}>Equipo Pokémon</SectionTitle>
        <div className="space-y-3">{character.pokemon.map((pokemon) => <PokemonCard key={pokemon.id} pokemon={pokemon} />)}</div>
      </section>

      {isGM && <section>
        <SectionTitle icon={Users}>Jugadores de la sala</SectionTitle>
        <div className="space-y-2">{members.filter((member) => member.role === 'PLAYER').map((member) => (
          <button key={member.id} onClick={() => onSelectMember(member)} className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] p-3 text-left transition hover:bg-white/[0.07]">
            <div><p className="font-semibold">{member.displayName}</p><p className="text-xs text-white/45">{member.character?.name} · Nivel {member.character?.level}</p></div>
            <ChevronRight className="size-4 text-white/30" />
          </button>
        ))}</div>
      </section>}
    </div>
  )
}

function CharacterTab({ character }: { character: Character }) {
  const attributes = Object.entries(character.attributes)
  return <div className="space-y-5">
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-wider text-white/40">Progresión</p><p className="text-2xl font-bold">Nivel {character.level}</p></div><div className="rounded-full bg-cyan-300/10 px-3 py-1 text-xs text-cyan-200">Estándar</div></div>
      <div className="mt-4 grid grid-cols-2 gap-2">{character.classes.map((item) => <div key={item} className="rounded-xl bg-black/15 p-3 text-sm">{item}</div>)}</div>
      <p className="mt-3 text-xs text-white/45">PTU NG permite hasta cuatro Clases simultáneas.</p>
    </section>
    <section><SectionTitle icon={UserRound}>Atributos</SectionTitle><div className="grid grid-cols-2 gap-2">{attributes.map(([name, rank]) => <div key={name} className="rounded-xl border border-white/8 bg-white/[0.035] p-3"><p className="text-xs text-white/40">{name}</p><p className="mt-1 text-sm font-semibold">{rank}</p></div>)}</div></section>
    <section><SectionTitle icon={Sparkles}>Stats</SectionTitle><div className="grid grid-cols-3 gap-2">{Object.entries(character.stats).map(([name, value]) => <div key={name} className="rounded-xl bg-white/[0.035] p-3 text-center"><p className="text-[10px] uppercase text-white/35">{name === 'ps' ? 'PS' : name}</p><p className="mt-1 text-xl font-bold">{value}</p></div>)}</div></section>
  </div>
}

function PokemonTab({ character }: { character: Character }) {
  return <div className="space-y-4"><SectionTitle icon={Zap}>Equipo y Pokémon capturados</SectionTitle>{character.pokemon.map((pokemon) => <PokemonCard key={pokemon.id} pokemon={pokemon} />)}<button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 py-4 text-sm text-white/50"><Plus className="size-4" /> Añadir Pokémon</button></div>
}

function InventoryTab({ character }: { character: Character }) {
  return <div className="space-y-4"><div className="flex items-end justify-between"><SectionTitle icon={Backpack}>Inventario</SectionTitle><p className="text-sm font-bold">{character.money.toLocaleString('es-PE')}₽</p></div>{character.inventory.map((item) => <div key={item.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] p-4"><div><p className="font-semibold">{item.name}</p><p className="text-xs text-white/40">{item.category}</p></div><span className="rounded-full bg-cyan-300/10 px-3 py-1 text-sm font-bold text-cyan-200">×{item.quantity}</span></div>)}<div className="rounded-2xl border border-white/8 bg-white/[0.025] p-4 text-xs text-white/45">Cada uso o modificación puede convertirse en un evento del historial de campaña.</div></div>
}

function HistoryTab({ character }: { character: Character }) {
  return <div className="space-y-4"><SectionTitle icon={History}>Historial</SectionTitle>{character.history.map((event) => <article key={event.id} className="border-l-2 border-cyan-300/30 pl-4"><div className="flex justify-between gap-3"><p className="font-semibold">{event.title}</p><span className="text-[10px] text-white/35">{event.date}</span></div><p className="mt-1 text-xs text-white/45">{event.detail}</p></article>)}</div>
}

function AssistantTab({ character }: { character: Character }) {
  const suggestions = ['¿Cuántos PA tengo?', '¿Qué Pokémon tengo?', '¿Qué objetos me quedan?', '¿Cómo funciona una Escena?']
  return <div className="space-y-4"><section className="rounded-3xl border border-cyan-300/15 bg-cyan-300/5 p-5"><div className="flex items-center gap-3"><div className="rounded-2xl bg-cyan-300/10 p-3"><Bot className="size-5 text-cyan-200" /></div><div><p className="font-bold">Asistente NeoGénesis</p><p className="text-xs text-white/45">Contexto: {character.name} · {character.pokemon.length} Pokémon</p></div></div><p className="mt-5 text-sm leading-6 text-white/65">Este prototipo reserva el asistente para responder con contexto de reglas, campaña y personaje. En la siguiente fase se conectará a la base de conocimiento y a la API de IA.</p></section><div className="space-y-2">{suggestions.map((item) => <button key={item} className="w-full rounded-2xl border border-white/10 bg-white/[0.035] p-3 text-left text-sm text-white/65">{item}</button>)}</div><div className="flex gap-2 rounded-2xl border border-white/10 bg-black/15 p-3"><input className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-white/25" placeholder="Pregunta sobre PTU NG..." /><button className="rounded-xl bg-cyan-200 px-3 py-2 text-xs font-bold text-slate-950">Enviar</button></div></div>
}

export default function NeoGenesisApp() {
  const [tab, setTab] = useState<TabId>('home')
  const [isGM, setIsGM] = useState(false)
  const [character, setCharacter] = useState<Character>(demoCampaign.members[1].character!)
  const [selectedMember, setSelectedMember] = useState<CampaignMember | null>(null)

  useEffect(() => {
    const saved = window.localStorage.getItem('neogenesis-demo-character')
    if (saved) {
      try { setCharacter(JSON.parse(saved) as Character) } catch { /* ignore malformed demo state */ }
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem('neogenesis-demo-character', JSON.stringify(character))
  }, [character])

  const currentTitle = useMemo(() => tabs.find((item) => item.id === tab)?.label ?? 'Inicio', [tab])

  const renderTab = () => {
    if (selectedMember?.character) return <div className="space-y-4"><button onClick={() => setSelectedMember(null)} className="text-xs text-cyan-200">← Volver a jugadores</button><CharacterTab character={selectedMember.character} /><HistoryTab character={selectedMember.character} /></div>
    switch (tab) {
      case 'character': return <CharacterTab character={character} />
      case 'pokemon': return <PokemonTab character={character} />
      case 'inventory': return <><InventoryTab character={character} /><HistoryTab character={character} /></>
      case 'assistant': return <AssistantTab character={character} />
      default: return <HomeTab character={character} isGM={isGM} members={demoCampaign.members} onSelectMember={setSelectedMember} />
    }
  }

  return <main className="min-h-dvh bg-[#071018] text-white selection:bg-cyan-200 selection:text-slate-950">
    <div className="mx-auto min-h-dvh w-full max-w-md border-x border-white/5 bg-[radial-gradient(circle_at_top,#123344_0%,#071018_38%,#050a0f_100%)]">
      <header className="sticky top-0 z-20 border-b border-white/8 bg-[#071018]/90 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-200/70">NeoGénesis</p><p className="text-sm font-semibold">{demoCampaign.name}</p></div><button onClick={() => setIsGM((value) => !value)} className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1.5 text-[10px] text-white/65">{isGM ? <Crown className="size-3 text-amber-300" /> : <UserRound className="size-3" />}{isGM ? 'Modo DJ' : 'Jugador'}</button></div>
        <div className="mt-2 flex items-center justify-between text-[10px] text-white/35"><span>Sesión {demoCampaign.sessionNumber}</span><span>{currentTitle}</span></div>
      </header>

      <div className="px-4 pb-28 pt-5">{renderTab()}</div>

      <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md border-t border-white/8 bg-[#071018]/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl">
        <div className="grid grid-cols-5 gap-1">{tabs.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => { setSelectedMember(null); setTab(id) }} className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[9px] ${tab === id && !selectedMember ? 'bg-cyan-300/10 text-cyan-200' : 'text-white/35'}`}><Icon className="size-4" />{label}</button>)}</div>
      </nav>

      {isGM && <div className="pointer-events-none fixed right-3 top-20 hidden max-w-[180px] rounded-2xl border border-amber-300/15 bg-[#11151a]/90 p-3 text-[10px] text-white/45 shadow-xl sm:block"><div className="mb-1 flex items-center gap-1 text-amber-200"><Crown className="size-3" /> Vista DJ</div>Consulta jugadores, revisa fichas y prepara acciones administrativas.</div>}
    </div>
  </main>
}
