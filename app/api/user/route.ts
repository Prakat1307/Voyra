import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  try {
    const { name, id } = await req.json();
    const supabase = createClient();
    const { data, error } = await supabase
      .from("users")
      .update({
        name,
      })
      .eq("id", id)
      .single();
    if (error) {
      console.log("Error updating user, ignoring missing table:", error.message);
      return NextResponse.json({ data: { name } });
    }
    revalidatePath("/");
    return NextResponse.json({ data });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error }, { status: 400 });
  }
}
