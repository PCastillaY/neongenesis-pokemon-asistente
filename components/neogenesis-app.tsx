'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Archive,
  Backpack,
  Bot,
  Check,
  Eye,
  EyeOff,

  ChevronRight,
  Copy,
  Crown,
  History,
  Home,
  Settings,

  LogOut,
  Plus,
  Share2,
  Shield,
  Sparkles,
  Trash2,
  UserRound,

  Users,
  X,
  Zap,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import {
  approveCampaignCreationRequest,
  createCampaign,
  createCharacter,
  deleteCampaign,
  joinCampaign,
  loadAdminCampaignCreationRequests,
  loadAdminCampaigns,
  loadCampaign,
  loadCampaigns,
  loadCampaignCreationRequests,
  rejectCampaignCreationRequest,
  submitCampaignCreationRequest,
  updateCampaignStatus,
  searchPlatformUsers,
  setPlatformAdmin,
} from '@/lib/neogenesis/data'
import type { Campaign, CampaignMember, CampaignSession, Character, Pokemon } from '@/lib/neogenesis/types'
import type { CampaignCreationRequest } from '@/lib/neogenesis/data'

const tabs = [
  { id: 'home', label: 'Inicio', icon: Home },
  { id: 'character', label: 'Ficha', icon: UserRound },
  { id: 'pokemon', label: 'Equipo', icon: Zap },
  { id: 'inventory', label: 'Objetos', icon: Backpack },
  { id: 'assistant', label: 'IA', icon: Bot },
] as const

type TabId = (typeof tabs)[number]['id']

function ProgressBar({ value, max }: { value: number; max: number }) {
  const percentage = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0
  return <div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-amber-300 transition-all" style={{ width: percentage + '%' }} /></div>
}

function SectionTitle({ icon: Icon, children }: { icon: typeof Home; children: React.ReactNode }) {
  return <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-amber-200"><Icon className="size-4" />{children}</div>
}

function PokemonCard({ pokemon }: { pokemon: Pokemon }) {
  return <article className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 shadow-lg shadow-black/10">
    <div className="flex items-start justify-between gap-3">
      <div><p className="text-lg font-bold">{pokemon.name}</p><p className="text-xs text-white/50">{pokemon.species} · Nivel {pokemon.level}</p></div>
      <div className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-wider text-white/60">{pokemon.types.join(' / ') || 'Sin tipos'}</div>
    </div>
    <div className="mt-4 space-y-2"><div className="flex justify-between text-xs text-white/60"><span>PS</span><span>{pokemon.hp}/{pokemon.maxHp}</span></div><ProgressBar value={pokemon.hp} max={pokemon.maxHp} /></div>
    <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-white/65">
      <div className="rounded-xl bg-black/15 p-2"><span className="text-white/35">Habilidad</span><br />{pokemon.ability || '—'}</div>
      <div className="rounded-xl bg-black/15 p-2"><span className="text-white/35">Naturaleza</span><br />{pokemon.nature || '—'}</div>
    </div>
    <div className="mt-3 flex flex-wrap gap-1.5">{pokemon.moves.map((move) => <span key={move} className="rounded-full bg-white/7 px-2 py-1 text-[10px] text-white/65">{move}</span>)}</div>
  </article>
}

function PasswordField({ value, onChange, placeholder, autoComplete, required = true }: { value: string; onChange: (value: string) => void; placeholder: string; autoComplete?: string; required?: boolean }) {
  const [visible, setVisible] = useState(false)
  return <div className="relative"><input type={visible ? 'text' : 'password'} value={value} onChange={(e) => onChange(e.target.value)} required={required} minLength={6} autoComplete={autoComplete} className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 pr-12 text-sm outline-none placeholder:text-white/25" placeholder={placeholder} /><button type="button" onClick={() => setVisible(!visible)} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-white/40" aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}>{visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div>
}

function AuthScreen() {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot' | 'reset'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') { setMode('reset'); setMessage('') }
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage('')
    try {
      if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: (process.env.NEXT_PUBLIC_SITE_URL || window.location.origin) + '/auth/reset' })
        if (error) throw error
        setMessage('Si existe una cuenta con ese correo, recibirás un enlace para restablecer la contraseña.')
        return
      }
      if (mode === 'reset') {
        if (password !== confirmation) throw new Error('Las contraseñas no coinciden.')
        if (password.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres.')
        const { error } = await supabase.auth.updateUser({ password })
        if (error) throw error
        setPassword(''); setConfirmation(''); setMessage('Contraseña actualizada. Ya puedes continuar usando tu cuenta.'); setMode('signin')
        return
      }
      if (mode === 'signup') {
        if (password !== confirmation) throw new Error('Las contraseñas no coinciden.')
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: siteUrl + '/auth/confirm', data: { display_name: displayName.trim() } } })
        if (error) throw error
        if (!data.session) setMessage('Cuenta creada. Revisa tu correo para confirmar el acceso.')
        return
      }
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (error) throw error
    } catch (error: any) {
      setMessage(error?.message || 'No se pudo completar la operación.')
    } finally { setBusy(false) }
  }

  const title = mode === 'signup' ? 'Crear cuenta' : mode === 'forgot' ? 'Recuperar contraseña' : mode === 'reset' ? 'Nueva contraseña' : 'Entrar'
  const submitLabel = mode === 'signup' ? 'Crear cuenta' : mode === 'forgot' ? 'Enviar enlace' : mode === 'reset' ? 'Guardar contraseña' : 'Entrar'

  return <main className="min-h-dvh bg-[#080D1A] text-white"><div className="mx-auto flex min-h-dvh w-full max-w-md items-center border-x border-white/5 bg-[radial-gradient(circle_at_top,#17233A_0%,#080D1A_42%,#050810_100%)] px-5 py-10"><div className="w-full">
    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-200/70">NeoGénesis</p><h1 className="mt-2 text-4xl font-black tracking-tight">{title}</h1>
    <p className="mt-2 text-sm leading-6 text-white/50">{mode === 'forgot' ? 'Introduce tu correo y te enviaremos un enlace para recuperar el acceso.' : 'Tu cuenta conserva tus salas, personajes, Pokémon e inventario entre dispositivos.'}</p>
    <form onSubmit={submit} className="mt-8 space-y-3">
      {mode === 'signup' && <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required autoComplete="name" className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm outline-none placeholder:text-white/25" placeholder="Nombre visible" />}
      {mode !== 'reset' && <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm outline-none placeholder:text-white/25" placeholder="Correo" />}
      {mode !== 'forgot' && <PasswordField value={password} onChange={setPassword} placeholder="Contraseña" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} />}
      {(mode === 'signup' || mode === 'reset') && <PasswordField value={confirmation} onChange={setConfirmation} placeholder="Confirmar contraseña" autoComplete="new-password" />}
      {message && <p className="rounded-2xl border border-amber-300/10 bg-amber-300/5 p-3 text-xs leading-5 text-amber-100/80">{message}</p>}
      <button disabled={busy} className="w-full rounded-2xl bg-amber-200 px-4 py-3 text-sm font-bold text-slate-950 disabled:opacity-50">{busy ? 'Procesando…' : submitLabel}</button>
    </form>
    {mode === 'signin' && <button onClick={() => { setMode('forgot'); setMessage('') }} className="mt-4 w-full text-center text-xs text-amber-200/70">¿Olvidaste tu contraseña?</button>}
    {mode !== 'reset' && <button onClick={() => { setMode(mode === 'signin' || mode === 'forgot' ? 'signup' : 'signin'); setMessage(''); setPassword(''); setConfirmation('') }} className="mt-3 w-full text-center text-xs text-amber-200/70">{mode === 'signup' || mode === 'forgot' ? 'Ya tengo una cuenta' : '¿No tienes cuenta? Crear una'}</button>}
    {mode === 'reset' && <button type="button" onClick={() => { setMode('signin'); setMessage('') }} className="mt-4 w-full text-center text-xs text-amber-200/70">Volver a iniciar sesión</button>}
  </div></div></main>
}

function RoomPicker({ campaigns, onSelect, onRequest, onJoin, onSignOut, creationRequests, isAdmin, onAdmin }: {
  campaigns: Campaign[]
  onSelect: (id: string) => void
  onRequest: (name: string, description: string, progressionMode: 'STANDARD' | 'ACCELERATED' | 'SLOW') => Promise<void>
  onJoin: (code: string) => Promise<void>
  onSignOut: () => Promise<void>
  creationRequests: CampaignCreationRequest[]
  isAdmin: boolean
  onAdmin: () => void
}) {
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [progressionMode, setProgressionMode] = useState<'STANDARD' | 'ACCELERATED' | 'SLOW'>('STANDARD')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  async function requestCreation() {
    setBusy(true); setMessage('')
    try { await onRequest(name, description, progressionMode); setName(''); setDescription(''); setShowCreate(false) }
    catch (e: any) { setMessage(e.message || 'No se pudo enviar la solicitud.') }
    finally { setBusy(false) }
  }

  async function join() {
    setBusy(true); setMessage('')
    try { await onJoin(code); setCode(''); setShowJoin(false) }
    catch (e: any) { setMessage(e.message || 'No se pudo unir a la sala.') }
    finally { setBusy(false) }
  }

  return <main className="min-h-dvh bg-[#080D1A] text-white">
    <div className="mx-auto min-h-dvh w-full max-w-md border-x border-white/5 bg-[radial-gradient(circle_at_top,#17233A_0%,#080D1A_38%,#050810_100%)]">
      <div className="px-5 pb-12 pt-10">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-200/70">NeoGénesis</p><h1 className="mt-2 text-4xl font-black tracking-tight">Tus salas</h1></div>
          <div className="flex gap-2">{isAdmin && <button onClick={onAdmin} className="rounded-xl border border-amber-300/15 bg-amber-300/5 p-2 text-amber-200" title="Administración"><Settings className="size-4" /></button>}<button onClick={onSignOut} className="rounded-xl border border-white/10 p-2 text-white/45" title="Cerrar sesión"><LogOut className="size-4" /></button></div>
        </div>
        <p className="mt-2 text-sm leading-6 text-white/50">Cada sala es una campaña completa con personajes, Pokémon, inventario y sesiones.</p>

        <div className="mt-8 space-y-3">
          {campaigns.map((campaign) => <button key={campaign.id} onClick={() => onSelect(campaign.id)} className="w-full rounded-3xl border border-white/10 bg-white/[0.045] p-5 text-left transition hover:border-amber-300/30 hover:bg-white/[0.07]">
            <div className="flex items-start justify-between gap-4"><div><p className="text-xl font-bold">{campaign.name}</p><p className="mt-1 text-sm text-white/45">{campaign.description || 'Sin descripción.'}</p></div><ChevronRight className="mt-1 size-5 shrink-0 text-white/30" /></div>
            <div className="mt-5 flex gap-2 text-[10px] uppercase tracking-wider text-white/40"><span className="rounded-full bg-amber-300/10 px-2.5 py-1 text-amber-200/80">{campaign.progressionMode || 'STANDARD'}</span></div>
          </button>)}
          {campaigns.length === 0 && <div className="rounded-3xl border border-dashed border-white/10 p-6 text-center text-sm text-white/40">Todavía no perteneces a ninguna sala.</div>}
          {creationRequests.some((request) => request.status === 'PENDING') && <div className="rounded-2xl border border-amber-300/15 bg-amber-300/5 p-4 text-xs leading-5 text-amber-100/75">Tienes una solicitud de creación de sala pendiente de revisión.</div>}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button onClick={() => { setShowCreate(!showCreate); setShowJoin(false); setMessage('') }} className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm"><Plus className="size-4" /> Solicitar sala</button>
          <button onClick={() => { setShowJoin(!showJoin); setShowCreate(false); setMessage('') }} className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm"><Share2 className="size-4" /> Unirse</button>
        </div>

        {showCreate && <div className="mt-4 space-y-3 rounded-3xl border border-amber-300/10 bg-amber-300/5 p-4">
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/15 px-3 py-3 text-sm outline-none" placeholder="Nombre de la campaña" />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-24 w-full rounded-xl border border-white/10 bg-black/15 px-3 py-3 text-sm outline-none" placeholder="Descripción para el administrador" />
          <select value={progressionMode} onChange={(e) => setProgressionMode(e.target.value as typeof progressionMode)} className="w-full rounded-xl border border-white/10 bg-[#080D1A] px-3 py-3 text-sm outline-none"><option value="STANDARD">Progresión estándar</option><option value="ACCELERATED">Progresión acelerada</option><option value="SLOW">Progresión lenta</option></select>
          <button disabled={!name.trim() || busy} onClick={requestCreation} className="w-full rounded-xl bg-amber-200 px-3 py-3 text-sm font-bold text-slate-950 disabled:opacity-40">{busy ? 'Enviando…' : 'Enviar solicitud'}</button>
        </div>}

        {showJoin && <div className="mt-4 space-y-3 rounded-3xl border border-amber-300/10 bg-amber-300/5 p-4">
          <p className="text-xs leading-5 text-white/50">Puedes pegar el código de la invitación o abrir directamente el enlace que te envió el DJ.</p>
          <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className="w-full rounded-xl border border-white/10 bg-black/15 px-3 py-3 text-sm uppercase tracking-[0.18em] outline-none" placeholder="CÓDIGO" />
          {message && <p className="text-xs text-rose-200">{message}</p>}
          <button disabled={!code.trim() || busy} onClick={join} className="w-full rounded-xl bg-amber-200 px-3 py-3 text-sm font-bold text-slate-950 disabled:opacity-40">{busy ? 'Uniendo…' : 'Unirse a la sala'}</button>
        </div>}
      </div>
    </div>
  </main>
}

function CharacterTab({ character }: { character: Character }) {
  const attributes = Object.entries(character.attributes)
  return <div className="space-y-5">
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-wider text-white/40">Progresión</p><p className="text-2xl font-bold">Nivel {character.level}</p></div><div className="rounded-full bg-amber-300/10 px-3 py-1 text-xs text-amber-200">Persistente</div></div>
      <div className="mt-4 grid grid-cols-2 gap-2">{character.classes.length ? character.classes.map((item) => <div key={item} className="rounded-xl bg-black/15 p-3 text-sm">{item}</div>) : <div className="col-span-2 rounded-xl bg-black/15 p-3 text-sm text-white/40">Sin clases registradas.</div>}</div>
    </section>
    <section><SectionTitle icon={UserRound}>Atributos</SectionTitle><div className="grid grid-cols-2 gap-2">{attributes.length ? attributes.map(([name, rank]) => <div key={name} className="rounded-xl border border-white/8 bg-white/[0.035] p-3"><p className="text-xs text-white/40">{name}</p><p className="mt-1 text-sm font-semibold">{rank}</p></div>) : <p className="text-sm text-white/35">Aún no hay atributos registrados.</p>}</div></section>
    <section><SectionTitle icon={Sparkles}>Stats</SectionTitle><div className="grid grid-cols-3 gap-2">{Object.entries(character.stats).map(([name, value]) => <div key={name} className="rounded-xl bg-white/[0.035] p-3 text-center"><p className="text-[10px] uppercase text-white/35">{name === 'ps' ? 'PS' : name}</p><p className="mt-1 text-xl font-bold">{value}</p></div>)}</div></section>
  </div>
}

function PokemonTab({ character }: { character: Character }) {
  return <div className="space-y-4"><SectionTitle icon={Zap}>Equipo y Pokémon capturados</SectionTitle>{character.pokemon.length ? character.pokemon.map((pokemon) => <PokemonCard key={pokemon.id} pokemon={pokemon} />) : <div className="rounded-2xl border border-dashed border-white/10 p-5 text-sm text-white/40">No hay Pokémon capturados todavía.</div>}</div>
}

function InventoryTab({ character }: { character: Character }) {
  return <div className="space-y-4"><div className="flex items-end justify-between"><SectionTitle icon={Backpack}>Inventario</SectionTitle><p className="text-sm font-bold">{character.money.toLocaleString('es-PE')}₽</p></div>{character.inventory.length ? character.inventory.map((item) => <div key={item.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] p-4"><div><p className="font-semibold">{item.name}</p><p className="text-xs text-white/40">{item.category}</p></div><span className="rounded-full bg-amber-300/10 px-3 py-1 text-sm font-bold text-amber-200">×{item.quantity}</span></div>) : <div className="rounded-2xl border border-dashed border-white/10 p-5 text-sm text-white/40">Inventario vacío.</div>}</div>
}

function HomeTab({ campaign, character, currentMember, onSelectMember }: { campaign: Campaign; character?: Character; currentMember?: CampaignMember; onSelectMember: (member: CampaignMember) => void }) {
  const isGM = currentMember?.role === 'GM'
  return <div className="space-y-5">
    {character ? <section className="rounded-3xl border border-amber-300/15 bg-gradient-to-br from-amber-300/10 via-white/[0.035] to-transparent p-5">
      <div className="flex items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.2em] text-amber-200/70">Tu entrenador</p><h2 className="mt-1 text-3xl font-black tracking-tight">{character.name}</h2><p className="mt-1 text-sm text-white/55">{character.concept || 'Sin concepto'} · Nivel {character.level}</p></div><div className="rounded-2xl border border-amber-200/15 bg-amber-200/10 p-3"><Shield className="size-5 text-amber-200" /></div></div>
      <div className="mt-6 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-black/15 p-3"><p className="text-[10px] uppercase text-white/40">Vida</p><p className="mt-1 text-xl font-bold">{character.hp}/{character.maxHp}</p><ProgressBar value={character.hp} max={character.maxHp} /></div><div className="rounded-2xl bg-black/15 p-3"><p className="text-[10px] uppercase text-white/40">Puntos de Acción</p><p className="mt-1 text-xl font-bold">{character.actionPoints}/{character.maxActionPoints}</p></div></div>
    </section> : <section className="rounded-3xl border border-dashed border-amber-300/15 bg-amber-300/5 p-5"><p className="text-xs uppercase tracking-[0.2em] text-amber-200/70">Ficha</p><h2 className="mt-1 text-2xl font-black">Crea tu personaje</h2><p className="mt-2 text-sm leading-6 text-white/50">Esta sala ya está conectada. Solo falta crear tu ficha.</p></section>}

    {isGM && <section><SectionTitle icon={Users}>Jugadores de la sala</SectionTitle><div className="space-y-2">{campaign.members.filter((member) => member.role === 'PLAYER').map((member) => <button key={member.id} onClick={() => onSelectMember(member)} className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] p-3 text-left transition hover:bg-white/[0.07]"><div><p className="font-semibold">{member.displayName}</p><p className="text-xs text-white/45">{member.character?.name || 'Sin personaje'}</p></div><ChevronRight className="size-4 text-white/30" /></button>)}</div></section>}
  </div>
}

function InviteCard({ campaign }: { campaign: Campaign }) {
  const [copied, setCopied] = useState(false)
  const code = campaign.inviteCode
  if (!code) return null
  const link = typeof window !== 'undefined' ? window.location.origin + '/?invite=' + encodeURIComponent(code) : ''

  async function copy(value: string) {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return <section className="rounded-3xl border border-amber-300/15 bg-amber-300/5 p-4">
    <div className="flex items-center gap-2 text-amber-200"><Share2 className="size-4" /><p className="text-xs font-bold uppercase tracking-[0.18em]">Invitación</p></div>
    <div className="mt-3 flex items-center justify-between gap-3"><div><p className="text-[10px] uppercase text-white/35">Código</p><p className="text-xl font-black tracking-[0.18em]">{code}</p></div><button onClick={() => copy(code)} className="rounded-xl border border-white/10 p-2 text-white/55"><Copy className="size-4" /></button></div>
    <div className="mt-3 flex gap-2"><button onClick={() => copy(link)} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/8 px-3 py-2 text-xs"><Share2 className="size-3" /> Copiar enlace</button></div>
    {copied && <p className="mt-2 text-[10px] text-amber-200">Copiado.</p>}
  </section>
}

function SessionNotes({ sessions, onSelect }: { sessions: CampaignSession[]; onSelect: (session: CampaignSession) => void }) {
  return <section><SectionTitle icon={History}>Sesiones</SectionTitle>{sessions.length ? <div className="space-y-2">{sessions.map((session) => <button key={session.id} onClick={() => onSelect(session)} className="w-full rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-left transition hover:bg-white/[0.07]"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold">Sesión {session.sessionNumber} · {session.title}</p><p className="mt-1 text-xs text-white/40">{session.playedAt ?? 'Sin fecha'}</p></div><ChevronRight className="size-4 text-white/25" /></div><p className="mt-3 text-xs leading-5 text-white/50">{session.summary || 'Sin resumen.'}</p></button>)}</div> : <p className="text-sm text-white/35">No hay sesiones registradas.</p>}</section>
}

function AssistantTab({ character }: { character?: Character }) {
  return <div className="space-y-4"><section className="rounded-3xl border border-amber-300/15 bg-amber-300/5 p-5"><div className="flex items-center gap-3"><div className="rounded-2xl bg-amber-300/10 p-3"><Bot className="size-5 text-amber-200" /></div><div><p className="font-bold">Asistente NeoGénesis</p><p className="text-xs text-white/45">Contexto: {character?.name || 'sin personaje'} · {character?.pokemon.length || 0} Pokémon</p></div></div><p className="mt-5 text-sm leading-6 text-white/65">El estado estructurado ya proviene de Supabase. La capa de reglas y LLM se conectará sobre estas entidades, sin volver al estado de demostración.</p></section></div>
}

function AdminUsersPanel({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState<Array<{ id: string; email: string | null; display_name: string | null; platform_role: string; email_confirmed: boolean }>>([])
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const search = useCallback(async () => { setBusy(true); setMessage(''); try { setUsers(await searchPlatformUsers(query)) } catch (e: any) { setMessage(e.message || 'No se pudieron cargar los usuarios.') } finally { setBusy(false) } }, [query])
  useEffect(() => { search().catch(() => {}) }, [search])
  async function toggle(userId: string, makeAdmin: boolean) { setBusy(true); setMessage(''); try { await setPlatformAdmin(userId, makeAdmin); await search() } catch (e: any) { setMessage(e.message || 'No se pudo actualizar el administrador.') } finally { setBusy(false) } }
  return <div className="fixed inset-0 z-50 bg-[#050810]/95 p-4 backdrop-blur-xl"><div className="mx-auto flex min-h-full w-full max-w-md flex-col">
    <div className="flex items-center justify-between gap-3 py-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-200/70">Plataforma</p><h2 className="text-2xl font-black">Administradores</h2></div><button onClick={onClose} className="rounded-xl border border-white/10 px-3 py-2 text-xs text-white/60">Cerrar</button></div>
    <div className="mt-3 flex gap-2"><input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') search() }} placeholder="Buscar por nombre o correo" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2.5 text-sm outline-none" /><button onClick={search} disabled={busy} className="rounded-xl bg-amber-200 px-4 py-2 text-xs font-bold text-slate-950">Buscar</button></div>
    {message && <p className="mt-3 rounded-xl border border-rose-300/15 bg-rose-300/5 p-3 text-xs text-rose-100">{message}</p>}
    <div className="mt-4 flex-1 space-y-2 overflow-y-auto pb-6">{users.map((user) => <article key={user.id} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate font-semibold">{user.display_name || 'Sin nombre'}</p><p className="truncate text-xs text-white/45">{user.email || 'Sin correo'}</p><p className="mt-1 text-[10px] text-white/30">{user.email_confirmed ? 'Correo confirmado' : 'Correo pendiente'}</p></div><span className="shrink-0 rounded-full bg-white/5 px-2 py-1 text-[10px] uppercase text-white/45">{user.platform_role}</span></div><button disabled={busy} onClick={() => toggle(user.id, user.platform_role !== 'PLATFORM_ADMIN')} className="mt-3 w-full rounded-xl border border-amber-300/10 bg-amber-300/5 px-3 py-2 text-xs text-amber-200 disabled:opacity-40">{user.platform_role === 'PLATFORM_ADMIN' ? 'Quitar administrador' : 'Nombrar administrador'}</button></article>)}{!busy && users.length === 0 && <p className="rounded-2xl border border-dashed border-white/10 p-5 text-center text-sm text-white/40">No se encontraron usuarios.</p>}</div>
  </div></div>
}

function AdminPanel({ requests, campaigns, onBack, onRefresh, onApprove, onReject, onStatus, onDelete, onCreate }: {
  requests: CampaignCreationRequest[]
  campaigns: Campaign[]
  onBack: () => void
  onRefresh: () => Promise<void>
  onApprove: (id: string) => Promise<void>
  onReject: (id: string) => Promise<void>
  onStatus: (id: string, status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED') => Promise<void>
  onDelete: (id: string) => Promise<void>
  onCreate: (name: string, description: string) => Promise<void>
}) {
  const [section, setSection] = useState<'requests' | 'campaigns'>('requests')
  const [showUsers, setShowUsers] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  async function create() {
    setBusy(true); setMessage('')
    try { await onCreate(name.trim(), description.trim()); setName(''); setDescription('') }
    catch (e: any) { setMessage(e.message || 'No se pudo crear la campaña.') }
    finally { setBusy(false) }
  }

  async function run(action: () => Promise<void>) {
    setBusy(true); setMessage('')
    try { await action(); await onRefresh() }
    catch (e: any) { setMessage(e.message || 'No se pudo completar la operación.') }
    finally { setBusy(false) }
  }

  return <main className="min-h-dvh bg-[#080D1A] text-white">
    <div className="mx-auto min-h-dvh w-full max-w-md border-x border-white/5 bg-[radial-gradient(circle_at_top,#17233A_0%,#080D1A_38%,#050810_100%)] px-4 pb-10 pt-6">
      <div className="flex items-center justify-between gap-3">
        <div><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-200/70">NeoGénesis</p><h1 className="mt-1 text-3xl font-black">Administración</h1></div>
        <div className="flex gap-2"><button onClick={() => setShowUsers(true)} className="rounded-xl border border-amber-300/15 bg-amber-300/5 px-3 py-2 text-xs text-amber-200">Administradores</button><button onClick={onBack} className="rounded-xl border border-white/10 px-3 py-2 text-xs text-white/60">Volver</button></div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-2"><button onClick={() => setSection('requests')} className={'rounded-xl px-3 py-3 text-xs ' + (section === 'requests' ? 'bg-amber-300/10 text-amber-200' : 'bg-white/[0.04] text-white/45')}>Solicitudes {requests.filter(r => r.status === 'PENDING').length ? '(' + requests.filter(r => r.status === 'PENDING').length + ')' : ''}</button><button onClick={() => setSection('campaigns')} className={'rounded-xl px-3 py-3 text-xs ' + (section === 'campaigns' ? 'bg-amber-300/10 text-amber-200' : 'bg-white/[0.04] text-white/45')}>Salas ({campaigns.length})</button></div>
      {message && <p className="mt-4 rounded-xl border border-rose-300/15 bg-rose-300/5 p-3 text-xs text-rose-100">{message}</p>}
      {section === 'requests' ? <div className="mt-5 space-y-3">{requests.length ? requests.map((request) => <article key={request.id} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
        <div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{request.name}</p><p className="mt-1 text-xs text-white/40">Solicitante: {request.requester_display_name || request.requested_by.slice(0, 8) + '…'}</p></div><span className="rounded-full bg-white/5 px-2 py-1 text-[10px] uppercase text-white/45">{request.status}</span></div>
        <p className="mt-3 text-sm leading-6 text-white/55">{request.description || 'Sin descripción.'}</p>
        <p className="mt-2 text-[10px] uppercase tracking-wider text-white/30">Progresión: {request.progression_mode}</p>
        {request.status === 'PENDING' && <div className="mt-4 grid grid-cols-2 gap-2"><button disabled={busy} onClick={() => run(() => onApprove(request.id))} className="flex items-center justify-center gap-2 rounded-xl bg-amber-200 px-3 py-2 text-xs font-bold text-slate-950"><Check className="size-3" /> Aprobar</button><button disabled={busy} onClick={() => run(() => onReject(request.id))} className="flex items-center justify-center gap-2 rounded-xl border border-rose-300/15 bg-rose-300/5 px-3 py-2 text-xs text-rose-100"><X className="size-3" /> Rechazar</button></div>}
      </article>) : <p className="rounded-2xl border border-dashed border-white/10 p-5 text-sm text-white/40">No hay solicitudes.</p>}</div>
      : <div className="mt-5 space-y-3">
        <section className="rounded-2xl border border-amber-300/10 bg-amber-300/5 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-amber-200">Crear sala directamente</p><p className="mt-1 text-xs leading-5 text-white/45">Solo disponible para administración de plataforma.</p><div className="mt-3 space-y-2"><input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre" className="w-full rounded-xl border border-white/10 bg-black/15 px-3 py-2.5 text-sm outline-none" /><textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Descripción" className="min-h-20 w-full rounded-xl border border-white/10 bg-black/15 px-3 py-2.5 text-sm outline-none" /><button disabled={!name.trim() || busy} onClick={create} className="w-full rounded-xl bg-amber-200 px-3 py-2.5 text-xs font-bold text-slate-950 disabled:opacity-40">Crear sala</button></div></section>
        {campaigns.map(campaign => <article key={campaign.id} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{campaign.name}</p><p className="text-xs text-white/40">{campaign.status || 'ACTIVE'}</p></div><span className="text-[10px] text-white/30">{campaign.id.slice(0, 8)}…</span></div><div className="mt-3 flex gap-2">{campaign.status === 'ARCHIVED' ? <button onClick={() => run(() => onStatus(campaign.id, 'ACTIVE'))} className="rounded-xl bg-amber-300/10 px-3 py-2 text-xs text-amber-200">Reactivar</button> : <button onClick={() => run(() => onStatus(campaign.id, 'ARCHIVED'))} className="flex items-center gap-1 rounded-xl bg-white/5 px-3 py-2 text-xs text-white/60"><Archive className="size-3" /> Archivar</button>}<button onClick={() => { if (window.confirm('Esta acción eliminará permanentemente la sala y sus datos. ¿Continuar?')) run(() => onDelete(campaign.id)) }} className="flex items-center gap-1 rounded-xl bg-rose-300/5 px-3 py-2 text-xs text-rose-100"><Trash2 className="size-3" /> Borrar</button></div></article>)}
      </div>}
    </div>
    {showUsers && <AdminUsersPanel onClose={() => setShowUsers(false)} />}
  </main>
}

function SessionDetail({ session, onBack }: { session: CampaignSession; onBack: () => void }) {
  return <div className="space-y-4"><button onClick={onBack} className="text-xs text-amber-200">← Volver a sesiones</button><section className="rounded-3xl border border-amber-300/15 bg-amber-300/5 p-5"><p className="text-[10px] uppercase tracking-[0.2em] text-amber-200/70">Sesión {session.sessionNumber}</p><h2 className="mt-1 text-2xl font-black">{session.title}</h2><p className="mt-1 text-xs text-white/40">{session.playedAt ?? 'Sin fecha'}</p><p className="mt-5 text-sm leading-6 text-white/65">{session.summary || 'Sin resumen.'}</p></section><section className="rounded-3xl border border-white/10 bg-white/[0.035] p-5"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">Notas</p><p className="mt-3 whitespace-pre-line text-sm leading-7 text-white/60">{session.notes || 'No hay notas todavía.'}</p></section></div>
}

export default function NeoGenesisApp() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null)
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [selectedSession, setSelectedSession] = useState<CampaignSession | null>(null)
  const [selectedMember, setSelectedMember] = useState<CampaignMember | null>(null)
  const [tab, setTab] = useState<TabId>('home')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [platformRole, setPlatformRole] = useState<'USER' | 'PLATFORM_ADMIN'>('USER')
  const [creationRequests, setCreationRequests] = useState<CampaignCreationRequest[]>([])
  const [adminCampaigns, setAdminCampaigns] = useState<Campaign[]>([])
  const [adminOpen, setAdminOpen] = useState(false)

  const refreshCampaigns = useCallback(async () => {
    const rows = await loadCampaigns()
    setCampaigns(rows)
  }, [])

  const refreshCreationRequests = useCallback(async () => {
    const rows = await loadCampaignCreationRequests()
    setCreationRequests(rows)
  }, [])

  const refreshAdmin = useCallback(async () => {
    const [requests, rooms] = await Promise.all([loadAdminCampaignCreationRequests(), loadAdminCampaigns()])
    setCreationRequests(requests)
    setAdminCampaigns(rooms)
  }, [])

  const refreshCampaign = useCallback(async (campaignId: string, userId: string) => {
    setLoading(true)
    setError('')
    try {
      setCampaign(await loadCampaign(campaignId, userId))
    } catch (e: any) {
      setError(e.message || 'No se pudo cargar la sala.')
      setCampaign(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return
      setUser(data.user ? { id: data.user.id, email: data.user.email } : null)
      setAuthLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { id: session.user.id, email: session.user.email } : null)
      setAuthLoading(false)
    })
    return () => { active = false; listener.subscription.unsubscribe() }
  }, [])

  useEffect(() => {
    if (!user) { setCampaigns([]); setCreationRequests([]); setAdminCampaigns([]); setPlatformRole('USER'); setSelectedCampaignId(null); setCampaign(null); return }
    Promise.all([
      refreshCampaigns(),
      refreshCreationRequests(),
      supabase.from('profiles').select('platform_role').eq('id', user.id).maybeSingle(),
    ]).then(([, , profileResult]) => {
      setPlatformRole(profileResult.data?.platform_role === 'PLATFORM_ADMIN' ? 'PLATFORM_ADMIN' : 'USER')
    }).catch((e) => setError(e.message || 'No se pudieron cargar tus datos.'))
  }, [user, refreshCampaigns, refreshCreationRequests])

  useEffect(() => {
    if (!user || !selectedCampaignId) return
    refreshCampaign(selectedCampaignId, user.id)
  }, [user, selectedCampaignId, refreshCampaign])

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('invite')
    if (code) window.localStorage.setItem('neogenesis_pending_invite', code.trim().toUpperCase())
  }, [])

  useEffect(() => {
    if (!user) return
    const code = window.localStorage.getItem('neogenesis_pending_invite')
    if (!code) return
    joinCampaign(code).then((result) => {
      window.localStorage.removeItem('neogenesis_pending_invite')
      window.history.replaceState({}, '', window.location.pathname)
      setSelectedCampaignId(result.campaign_id)
      refreshCampaigns().catch(() => {})
    }).catch((e) => setError(e.message || 'La invitación no es válida o ha expirado.'))
  }, [user, refreshCampaigns])

  const currentMember = useMemo(() => campaign?.members.find((member) => member.id === campaign.id + ':' + user?.id), [campaign, user])
  const character = currentMember?.character
  const currentTitle = useMemo(() => tabs.find((item) => item.id === tab)?.label ?? 'Inicio', [tab])

  async function handleRequestCreation(name: string, description: string, progressionMode: 'STANDARD' | 'ACCELERATED' | 'SLOW') {
    await submitCampaignCreationRequest(name, description, progressionMode)
    await refreshCreationRequests()
  }

  async function handleAdminRefresh() {
    await refreshAdmin()
    await refreshCampaigns()
  }

  async function handleAdminCreate(name: string, description: string) {
    if (!user) return
    await createCampaign(name, description, user.id)
    await handleAdminRefresh()
  }

  async function handleJoin(code: string) {
    const result = await joinCampaign(code)
    await refreshCampaigns()
    setSelectedCampaignId(result.campaign_id)
  }

  async function handleCreateCharacter(name: string, concept: string) {
    if (!user || !campaign) return
    await createCharacter(campaign.id, user.id, name.trim(), concept.trim())
    await refreshCampaign(campaign.id, user.id)
  }

  if (authLoading) return <main className="min-h-dvh bg-[#080D1A] text-white grid place-items-center text-sm text-white/40">Cargando sesión…</main>
  if (!user) return <AuthScreen />

  if (adminOpen && platformRole === 'PLATFORM_ADMIN') {
    return <AdminPanel requests={creationRequests} campaigns={adminCampaigns} onBack={() => setAdminOpen(false)} onRefresh={handleAdminRefresh} onApprove={async (id) => { await approveCampaignCreationRequest(id); await handleAdminRefresh() }} onReject={async (id) => { await rejectCampaignCreationRequest(id); await handleAdminRefresh() }} onStatus={async (id, status) => { await updateCampaignStatus(id, status); await handleAdminRefresh() }} onDelete={async (id) => { await deleteCampaign(id); await handleAdminRefresh() }} onCreate={handleAdminCreate} />
  }

  if (!campaign) {
    return <>
      <RoomPicker campaigns={campaigns} onSelect={setSelectedCampaignId} onRequest={handleRequestCreation} onJoin={handleJoin} onSignOut={async () => { await supabase.auth.signOut() }} creationRequests={creationRequests} isAdmin={platformRole === 'PLATFORM_ADMIN'} onAdmin={async () => { await refreshAdmin(); setAdminOpen(true) }} />
      {error && <div className="fixed inset-x-4 bottom-4 mx-auto max-w-md rounded-2xl border border-rose-300/15 bg-rose-300/10 p-3 text-xs text-rose-100">{error}</div>}
    </>
  }

  if (selectedSession) return <main className="min-h-dvh bg-[#080D1A] text-white"><div className="mx-auto min-h-dvh w-full max-w-md px-4 pb-10 pt-6"><SessionDetail session={selectedSession} onBack={() => setSelectedSession(null)} /></div></main>

  const renderTab = () => {
    if (selectedMember?.character) return <div className="space-y-4"><button onClick={() => setSelectedMember(null)} className="text-xs text-amber-200">← Volver a jugadores</button><CharacterTab character={selectedMember.character} /></div>
    switch (tab) {
      case 'character':
        return character ? <CharacterTab character={character} /> : <CreateCharacterForm busy={loading} onCreate={handleCreateCharacter} />
      case 'pokemon': return character ? <PokemonTab character={character} /> : <EmptyCharacter />
      case 'inventory': return character ? <InventoryTab character={character} /> : <EmptyCharacter />
      case 'assistant': return <AssistantTab character={character} />
      default:
        return <div className="space-y-6"><HomeTab campaign={campaign} character={character} currentMember={currentMember} onSelectMember={setSelectedMember} />{currentMember?.role === 'GM' && <InviteCard campaign={campaign} />}<SessionNotes sessions={campaign.sessions} onSelect={setSelectedSession} /></div>
    }
  }

  return <main className="min-h-dvh bg-[#080D1A] text-white selection:bg-amber-200 selection:text-slate-950">
    <div className="mx-auto min-h-dvh w-full max-w-md border-x border-white/5 bg-[radial-gradient(circle_at_top,#17233A_0%,#080D1A_38%,#050810_100%)]">
      <header className="sticky top-0 z-20 border-b border-white/8 bg-[#080D1A]/90 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-200/70">NeoGénesis</p><p className="text-sm font-semibold">{campaign.name}</p></div><button onClick={() => { setSelectedCampaignId(null); setCampaign(null); setSelectedSession(null) }} className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1.5 text-[10px] text-white/65">Cambiar sala</button></div>
        <div className="mt-2 flex items-center justify-between text-[10px] text-white/35"><span>{currentMember?.role === 'GM' ? 'DJ' : 'Jugador'}</span><span>Sesión {campaign.sessionNumber || '—'}</span><span>{currentTitle}</span></div>
      </header>
      <div className="px-4 pb-28 pt-5">{loading ? <div className="py-10 text-center text-sm text-white/35">Cargando datos de la sala…</div> : renderTab()}</div>
      {error && <div className="fixed inset-x-4 bottom-24 z-40 mx-auto max-w-md rounded-2xl border border-rose-300/15 bg-rose-300/10 p-3 text-xs text-rose-100">{error}</div>}
      <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md border-t border-white/8 bg-[#080D1A]/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl"><div className="grid grid-cols-5 gap-1">{tabs.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => { setSelectedMember(null); setTab(id) }} className={'flex flex-col items-center gap-1 rounded-xl py-2 text-[9px] ' + (tab === id && !selectedMember ? 'bg-amber-300/10 text-amber-200' : 'text-white/35')}><Icon className="size-4" />{label}</button>)}</div></nav>
    </div>
  </main>
}

function EmptyCharacter() {
  return <div className="rounded-2xl border border-dashed border-white/10 p-5 text-sm text-white/40">Primero crea tu personaje para gestionar esta sección.</div>
}

function CreateCharacterForm({ busy, onCreate }: { busy: boolean; onCreate: (name: string, concept: string) => Promise<void> }) {
  const [name, setName] = useState('')
  const [concept, setConcept] = useState('')
  const [message, setMessage] = useState('')
  async function submit() {
    if (!name.trim()) return
    setMessage('')
    try { await onCreate(name, concept) } catch (e: any) { setMessage(e.message || 'No se pudo crear el personaje.') }
  }
  return <section className="rounded-3xl border border-amber-300/15 bg-amber-300/5 p-5">
    <SectionTitle icon={UserRound}>Crear personaje</SectionTitle>
    <div className="space-y-3"><input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/15 px-3 py-3 text-sm outline-none" placeholder="Nombre del entrenador" /><textarea value={concept} onChange={(e) => setConcept(e.target.value)} className="min-h-24 w-full rounded-xl border border-white/10 bg-black/15 px-3 py-3 text-sm outline-none" placeholder="Concepto del personaje" />{message && <p className="text-xs text-rose-200">{message}</p>}<button disabled={!name.trim() || busy} onClick={submit} className="w-full rounded-xl bg-amber-200 px-3 py-3 text-sm font-bold text-slate-950 disabled:opacity-40">{busy ? 'Guardando…' : 'Crear personaje'}</button></div>
  </section>
}
