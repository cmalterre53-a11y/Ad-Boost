import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
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

    const { impressions, clics, resultats, budget, jours, typeActivite } = await req.json();

    if (!impressions || !clics || resultats === undefined || !budget) {
      return NextResponse.json(
        { error: "Champs obligatoires manquants" },
        { status: 400 }
      );
    }

    const ctr = ((clics / impressions) * 100).toFixed(2);
    const cpc = (budget / clics).toFixed(2);
    const cpr = resultats > 0 ? (budget / resultats).toFixed(2) : "N/A";

    const prompt = `Tu es un expert en publicité Meta Ads. Analyse ces métriques de campagne et donne un diagnostic structuré.

TYPE D'ACTIVITÉ : ${typeActivite || "Non précisé"}

MÉTRIQUES :
- Impressions : ${impressions}
- Clics : ${clics}
- Résultats (leads/conversions) : ${resultats}
- Budget dépensé : ${budget}€
${jours ? `- Durée : ${jours} jours` : ""}
- Taux de clic calculé : ${ctr}%
- Coût par clic calculé : ${cpc}€
- Coût par contact calculé : ${cpr}${cpr !== "N/A" ? "€" : ""}

SEUILS PAR SECTEUR :
Détecte automatiquement le secteur à partir de "${typeActivite}" et applique les seuils correspondants :

Services à domicile (nettoyage auto, nettoyage maison, jardinage, déménagement) :
- CTR bon > 1.5% / moyen 0.8-1.5% / mauvais < 0.8%
- CPR bon < 15€ / correct 15-35€ / mauvais > 35€
- Panier moyen estimé : 50-150€

Beauté et bien-être (coiffeur, esthéticienne, nail art, massage, coach sportif) :
- CTR bon > 2% / moyen 1-2% / mauvais < 1%
- CPR bon < 8€ / correct 8-20€ / mauvais > 20€
- Panier moyen estimé : 30-80€

Artisanat et bâtiment (plombier, électricien, maçon, peintre, menuisier) :
- CTR bon > 1% / moyen 0.5-1% / mauvais < 0.5%
- CPR bon < 25€ / correct 25-60€ / mauvais > 60€
- Panier moyen estimé : 200-1000€

Restauration (restaurant, traiteur, food truck, boulangerie) :
- CTR bon > 2.5% / moyen 1.5-2.5% / mauvais < 1.5%
- CPR bon < 5€ / correct 5-15€ / mauvais > 15€
- Panier moyen estimé : 15-50€

Santé et médical (kiné, ostéopathe, dentiste, infirmier libéral) :
- CTR bon > 1% / moyen 0.5-1% / mauvais < 0.5%
- CPR bon < 20€ / correct 20-50€ / mauvais > 50€
- Panier moyen estimé : 50-150€

Commerce local (boutique, fleuriste, bijouterie, épicerie) :
- CTR bon > 2% / moyen 1-2% / mauvais < 1%
- CPR bon < 10€ / correct 10-25€ / mauvais > 25€
- Panier moyen estimé : 20-100€

Services professionnels (comptable, avocat, agent immobilier, auto-école) :
- CTR bon > 0.8% / moyen 0.4-0.8% / mauvais < 0.4%
- CPR bon < 40€ / correct 40-100€ / mauvais > 100€
- Panier moyen estimé : 200-2000€

Secteur non reconnu : utilise les seuils génériques CTR > 1% / CPR < 20€

RÈGLES DE DIAGNOSTIC SUPPLÉMENTAIRES (tous secteurs) :
- Moins de 7 jours : toujours dire de patienter, phase d'apprentissage Meta
- 0 résultats mais clics > 10 : problème de destination (formulaire ou numéro)
- 0 clics : problème d'accroche ou de visuel — proposer de régénérer les accroches
- CPR correct mais CTR faible : accroche à améliorer mais conversion correcte
- CTR bon mais CPR élevé : accroche efficace mais destination à optimiser

VERDICT GLOBAL :
- "excellent" si au moins 2 métriques sont bonnes
- "correct" si mix de bon et moyen, ou majorité moyen
- "danger" si au moins 2 métriques sont mauvaises

IMPORTANT : dans le diagnostic et l'action prioritaire, ne jamais utiliser les termes CTR, CPC, CPR, landing page, persona. Remplace par : taux de clic, coût par clic, coût par contact, page de destination, profil client. Le langage doit être compréhensible par quelqu'un qui n'a jamais fait de pub.

Réponds UNIQUEMENT avec un JSON valide (pas de markdown, pas de texte autour) avec cette structure exacte :

{
  "verdict": "excellent" | "correct" | "danger",
  "metriques": {
    "ctr": { "valeur": nombre, "label": "X.XX%", "status": "bon" | "moyen" | "mauvais" },
    "cpc": { "valeur": nombre, "label": "X.XX€", "status": "bon" | "moyen" | "mauvais" },
    "cpr": { "valeur": nombre ou 0, "label": "X.XX€" ou "N/A", "status": "bon" | "moyen" | "mauvais" }
  },
  "diagnostic": "2-3 phrases analysant les performances globales de la campagne",
  "action": "L'action prioritaire concrète à faire maintenant pour améliorer les résultats",
  "conseil": "Un conseil bonus stratégique adapté à cette situation"
}`;

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      return NextResponse.json(
        { error: "Réponse inattendue de l'IA" },
        { status: 500 }
      );
    }

    let jsonText = content.text.trim();
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const parsed = JSON.parse(jsonText);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Erreur API tracking:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'analyse des métriques" },
      { status: 500 }
    );
  }
}
