import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { username, email, password } = await req.json();
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_URL}/itinerary`,
      },
    });
    
    await supabase.from("users").insert({
      name: username,
      email: email,
      id: authData?.user?.id,
    });
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }
    return NextResponse.json({
      success: true,
      message: "User created successfully",
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error });
  }
}
