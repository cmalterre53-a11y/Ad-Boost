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

    const { impressions, clics, resultats, budget, jours } = await req.json();

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

MÉTRIQUES :
- Impressions : ${impressions}
- Clics : ${clics}
- Résultats (leads/conversions) : ${resultats}
- Budget dépensé : ${budget}€
${jours ? `- Durée : ${jours} jours` : ""}
- CTR calculé : ${ctr}%
- CPC calculé : ${cpc}€
- CPR calculé : ${cpr}${cpr !== "N/A" ? "€" : ""}

RÈGLES DE DIAGNOSTIC :
- CTR : > 2% = bon, 1-2% = moyen, < 1% = mauvais
- CPC : < 0.50€ = bon, 0.50-1.50€ = moyen, > 1.50€ = mauvais
- CPR : < 5€ = bon, 5-15€ = moyen, > 15€ = mauvais

VERDICT GLOBAL :
- "excellent" si au moins 2 métriques sont bonnes
- "correct" si mix de bon et moyen, ou majorité moyen
- "danger" si au moins 2 métriques sont mauvaises

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
