import { NextResponse } from 'next/server'
import { assertSupabaseConfig } from '@/lib/supabase/config'

export async function GET() {
  try {
    const { url, publishableKey } = assertSupabaseConfig()
    const response = await fetch(`${url}/auth/v1/settings`, {
      headers: { apikey: publishableKey },
      cache: 'no-store',
    })

    return NextResponse.json({
      ok: response.ok,
      supabase: response.ok ? 'reachable' : 'unreachable',
      status: response.status,
    }, { status: response.ok ? 200 : 502 })
  } catch (error) {
    return NextResponse.json({
      ok: false,
      supabase: 'not_configured',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
