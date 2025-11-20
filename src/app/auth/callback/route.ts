import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    try {
      // Create a server-side Supabase client
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      // Exchange the code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        return NextResponse.redirect(`${requestUrl.origin}/auth/error?message=${encodeURIComponent('Authentication failed')}`)
      }

      // Create response that will set the session cookie
      const response = NextResponse.redirect(`${requestUrl.origin}/dashboard`)
      
      if (data.session) {
        // Set the session in cookies for client-side access
        response.cookies.set('supabase-auth-token', data.session.access_token, {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: data.session.expires_in
        })
      }

      return response
      
    } catch (error) {
      return NextResponse.redirect(`${requestUrl.origin}/auth/error?message=${encodeURIComponent('Unexpected error occurred')}`)
    }
  }

  // If no code is present, redirect to home
  return NextResponse.redirect(`${requestUrl.origin}/`)
}