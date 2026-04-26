import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSubscription } from "@/lib/subscription";

export async function GET() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const subscription = await getSubscription(supabase, user.id);
    const remaining =
      subscription.generations_max - subscription.generations_utilisees;

    return NextResponse.json({
      plan: subscription.plan,
      generations_utilisees: subscription.generations_utilisees,
      generations_max: subscription.generations_max,
      remaining,
      periode_fin: subscription.periode_fin,
    });
  } catch (error) {
    console.error("Erreur subscription:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'abonnement" },
      { status: 500 }
    );
  }
}
