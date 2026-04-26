import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { checkAndIncrementQuota } from "@/lib/subscription";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const maxDuration = 60;

interface RequestBody {
  typePost: string;
  description: string;
  nomActivite?: string;
  zone?: string;
  icpResume?: string;
}

function buildPrompt(body: RequestBody): string {
  const activite = body.nomActivite ? `Activité : ${body.nomActivite}` : "";
  const zone = body.zone ? `Zone : ${body.zone}` : "";
  const icp = body.icpResume ? `ICP résumé : ${body.icpResume}` : "";

  return `Tu es un expert en copywriting pour les réseaux sociaux, spécialisé dans les petites entreprises locales françaises.

Type de post : ${body.typePost}
Description : ${body.description}
${activite}
${zone}
${icp}

Génère 3 légendes différentes pour ce post.
Chaque légende doit :
- Être prête à copier-coller directement sous le post
- Parler directement au client cible en "tu" ou "vous"
- Inclure 2-3 emojis pertinents
- Terminer par un call-to-action adapté au type de post
- Faire entre 3 et 6 lignes maximum
- Être personnalisée avec la zone géographique si disponible

Pour un Avant/Après : commence par une accroche choc sur le résultat
Pour un Témoignage : commence par une citation ou un résultat client
Pour des Coulisses : commence par une anecdote ou une révélation
Pour une Offre : commence par le bénéfice puis l'offre
Pour un Conseil : commence par une question ou un chiffre surprenant
Pour un Post local : commence par une référence locale reconnaissable

IMPORTANT : dans toutes les valeurs texte du JSON, n'utilise JAMAIS de guillemets doubles ("). Utilise des apostrophes (') ou des guillemets français (« ») à la place. Cela garantit un JSON valide.
Échappe toujours les caractères spéciaux dans les chaînes JSON (retours à la ligne avec \\n, tabulations avec \\t).

Réponds uniquement en JSON :
{ "legendes": ["légende 1", "légende 2", "légende 3"] }`;
}

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // ignore
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  // Vérification quota (chaque appel = 1 génération)
  const quota = await checkAndIncrementQuota(supabase, user.id);
  if (!quota.allowed) {
    return NextResponse.json(
      {
        error:
          "Tu as utilisé toutes tes générations ce mois-ci. Passe au plan supérieur pour continuer.",
        quota: {
          plan: quota.subscription.plan,
          generations_utilisees: quota.subscription.generations_utilisees,
          generations_max: quota.subscription.generations_max,
        },
      },
      { status: 403 }
    );
  }

  const body: RequestBody = await req.json();

  if (!body.typePost || !body.description) {
    return NextResponse.json(
      { error: "typePost et description sont requis" },
      { status: 400 }
    );
  }

  const prompt = buildPrompt(body);
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(encoder.encode("{"));
        const anthropicStream = anthropic.messages.stream({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 2048,
          messages: [
            { role: "user", content: prompt },
            { role: "assistant", content: "{" },
          ],
        });

        for await (const event of anthropicStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erreur inconnue";
        controller.enqueue(encoder.encode(`\n__ERROR__${msg}`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
