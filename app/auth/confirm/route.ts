import { createServerClient } from '@supabase/ssr'
import type { EmailOtpType } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const tokenHash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type') as EmailOtpType | null

  if (!tokenHash || type !== 'email') {
    return Response.redirect(new URL('/?auth_error=invalid_confirmation', request.url))
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // The redirect completes the browser flow even when the response cookie API is unavailable.
          }
        },
      },
    },
  )

  const { error } = await supabase.auth.verifyOtp({ type: 'email', token_hash: tokenHash })
  return Response.redirect(
    new URL(error ? '/?auth_error=confirmation_failed' : '/', request.url),
  )
}
