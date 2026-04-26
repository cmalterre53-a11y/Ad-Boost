import { SupabaseClient } from "@supabase/supabase-js";

export interface Subscription {
  id: string;
  user_id: string;
  plan: "starter" | "essentiel" | "pro" | "premium";
  generations_utilisees: number;
  generations_max: number;
  periode_debut: string;
  periode_fin: string;
  created_at: string;
}

export interface QuotaResult {
  allowed: boolean;
  subscription: Subscription;
  remaining: number;
}

/**
 * Récupère l'abonnement d'un utilisateur.
 * - Si aucun abonnement → crée automatiquement un plan "starter"
 * - Si la période est expirée → reset le compteur et recalcule la période
 */
export async function getSubscription(
  supabase: SupabaseClient,
  userId: string
): Promise<Subscription> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (data) {
    // Période expirée → reset
    if (new Date(data.periode_fin) < new Date()) {
      const now = new Date();
      const periodeFin = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const { data: updated, error: updateError } = await supabase
        .from("subscriptions")
        .update({
          generations_utilisees: 0,
          periode_debut: now.toISOString(),
          periode_fin: periodeFin.toISOString(),
        })
        .eq("user_id", userId)
        .select()
        .single();

      if (updateError) throw updateError;
      return updated as Subscription;
    }

    return data as Subscription;
  }

  // Aucun abonnement trouvé (PGRST116 = no rows) → créer starter
  if (error?.code === "PGRST116") {
    const now = new Date();
    const periodeFin = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const { data: newSub, error: insertError } = await supabase
      .from("subscriptions")
      .insert({
        user_id: userId,
        plan: "starter",
        generations_utilisees: 0,
        generations_max: 1,
        periode_debut: now.toISOString(),
        periode_fin: periodeFin.toISOString(),
      })
      .select()
      .single();

    if (insertError) throw insertError;
    return newSub as Subscription;
  }

  throw error;
}

/**
 * Vérifie le quota et incrémente le compteur si autorisé.
 * - Premium → toujours autorisé (incrémente quand même pour le suivi)
 * - Autres plans → vérifie generations_utilisees < generations_max
 */
export async function checkAndIncrementQuota(
  supabase: SupabaseClient,
  userId: string
): Promise<QuotaResult> {
  const subscription = await getSubscription(supabase, userId);

  // Premium = pas de limite
  if (subscription.plan === "premium") {
    await supabase
      .from("subscriptions")
      .update({
        generations_utilisees: subscription.generations_utilisees + 1,
      })
      .eq("user_id", userId);

    return {
      allowed: true,
      subscription: {
        ...subscription,
        generations_utilisees: subscription.generations_utilisees + 1,
      },
      remaining: subscription.generations_max - subscription.generations_utilisees - 1,
    };
  }

  // Quota atteint
  if (subscription.generations_utilisees >= subscription.generations_max) {
    return {
      allowed: false,
      subscription,
      remaining: 0,
    };
  }

  // Incrémenter
  const { data: updated, error } = await supabase
    .from("subscriptions")
    .update({
      generations_utilisees: subscription.generations_utilisees + 1,
    })
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;

  const updatedSub = updated as Subscription;
  return {
    allowed: true,
    subscription: updatedSub,
    remaining: updatedSub.generations_max - updatedSub.generations_utilisees,
  };
}
