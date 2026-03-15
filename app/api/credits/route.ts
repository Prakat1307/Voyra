import { createClient } from "@/utils/supabase/server";
import { getServerUser } from "@/utils/users/server";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function GET(req: Request, res: Response) {
  try {
    const user = await getServerUser();
    const supabase = createClient();
    const { data, error } = await supabase
      .from("users")
      .select("credits")
      .eq("id", user?.id)
      .single();
    if (error || !data) {
      console.log("Error fetching credits (likely missing table), returning fallback", error);
      return NextResponse.json({ credits: 5 });
    }
    revalidatePath("/");
    return NextResponse.json({ credits: data?.credits });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error }, { status: 400 });
  }
}
