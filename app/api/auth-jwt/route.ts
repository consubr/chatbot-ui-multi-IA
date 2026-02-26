import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    // We use the regular supabase-js client here because we just want to
    // authenticate and get a token back, not set cookies for the Next.js session
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: "Supabase environment variables are missing" },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status || 400 }
      )
    }

    // Fetch the user's profile to get their role
    let role = "user" // Default fallback
    if (data.session?.user?.id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", data.session.user.id)
        .single()

      if (profile?.role) {
        role = profile.role
      }
    }

    // Return the session data supplemented with the user's role
    return NextResponse.json({
      ...data.session,
      user: {
        ...data.session?.user,
        profile_role: role
      }
    })
  } catch (error: any) {
    console.error("Auth test endpoint error:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
