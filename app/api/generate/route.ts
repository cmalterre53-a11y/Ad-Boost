import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { nomActivite, typeActivite, zone, cible, budget, objectif } =
      await req.json();

    // Mode développement : retourne les données mockées
    if (process.env.USE_MOCK_DATA === "true") {
      const mockDataPath = path.join(process.cwd(), "mock-data.json");
      const mockData = JSON.parse(fs.readFileSync(mockDataPath, "utf-8"));

      console.log("🚀 Mode DEV : Utilisation des données mockées (instantané)");

      // Petit délai pour simuler un appel API (optionnel)
      await new Promise((resolve) => setTimeout(resolve, 500));

      return NextResponse.json(mockData.results);
    }

    const prompt = `Tu es un expert en marketing digital et publicité Meta Ads (Facebook & Instagram) pour les petits entrepreneurs locaux en France.

Voici les informations sur l'activité :
- Nom de l'activité : ${nomActivite}
- Type d'activité : ${typeActivite}
- Zone géographique : ${zone}
- Cible client : ${cible}
- Budget pub mensuel : ${budget}
- Objectif principal : ${objectif}

Génère un plan complet en JSON avec exactement cette structure (pas de texte autour, uniquement du JSON valide) :

{
  "section1": {
    "accroches": ["accroche1 (max 40 car)", "accroche2", "accroche3"],
    "textesPub": [
      {
        "accroche": "titre accrocheur",
        "description": "texte descriptif engageant",
        "cta": "call to action clair"
      },
      {
        "accroche": "titre accrocheur",
        "description": "texte descriptif engageant",
        "cta": "call to action clair"
      },
      {
        "accroche": "titre accrocheur",
        "description": "texte descriptif engageant",
        "cta": "call to action clair"
      }
    ],
    "legendes": ["légende1", "légende2", "légende3", "légende4", "légende5"]
  },
  "section2": {
    "etapes": [
      {
        "numero": 1,
        "titre": "Titre court de l'étape",
        "description": "Explication détaillée de ce qu'il faut faire à cette étape. Indique les boutons exacts à cliquer, les menus à ouvrir, les valeurs à saisir. Sois très précis comme si tu guidais quelqu'un qui n'a jamais ouvert Meta Ads Manager."
      }
    ],
    "ciblage": {
      "age": "tranche d'âge recommandée",
      "zone": "zone géographique et rayon exact à configurer",
      "interets": ["intérêt1", "intérêt2", "intérêt3", "intérêt4", "intérêt5"],
      "exclusions": "ce qu'il faut exclure du ciblage et pourquoi"
    },
    "budget": {
      "total": "budget total recommandé",
      "repartition": "comment répartir le budget entre les campagnes",
      "budgetJournalier": "budget quotidien recommandé",
      "dureeTest": "durée recommandée pour tester avant d'optimiser"
    },
    "format": "format de pub recommandé avec explication détaillée",
    "conseilsSuivi": [
      {
        "titre": "Titre du conseil",
        "description": "Description détaillée du conseil pour suivre et optimiser la campagne"
      }
    ],
    "conseilsSecteur": ["conseil1", "conseil2", "conseil3", "conseil4", "conseil5"]
  },
  "section3": {
    "semaines": [
      {
        "semaine": 1,
        "posts": [
          {
            "jour": "Lundi",
            "heure": "18h00",
            "theme": "thème du post",
            "typeContenu": "photo/vidéo courte/story/carrousel",
            "conseilVisuel": "conseil sur quoi filmer ou photographier"
          }
        ]
      },
      {
        "semaine": 2,
        "posts": [...]
      },
      {
        "semaine": 3,
        "posts": [...]
      },
      {
        "semaine": 4,
        "posts": [...]
      }
    ]
  }
}

INSTRUCTIONS IMPORTANTES :
- Chaque semaine doit contenir 3 posts.
- Les textes doivent être en français, concrets et adaptés au secteur.
- Les accroches courtes doivent faire max 40 caractères.
- La section2.etapes doit contenir EXACTEMENT 11 étapes qui couvrent uniquement le lancement de la campagne (du début jusqu'à la publication) : création du compte Business, accès au Gestionnaire de publicités, choix de l'objectif, configuration de l'audience, paramétrage du budget, choix du placement, création du visuel, rédaction du texte, configuration du formulaire de contact, vérification et publication. NE PAS inclure le suivi après publication dans les étapes. Chaque étape doit mentionner les boutons exacts à cliquer et les valeurs à entrer, personnalisés pour cette activité. Pas d'astuces dans les étapes.
- La section2.conseilsSuivi doit contenir 3-4 conseils détaillés pour suivre et optimiser la campagne APRÈS la publication : comment consulter les résultats, quels KPIs surveiller, quand et comment faire des ajustements, comment récupérer et traiter les prospects.
- Réponds UNIQUEMENT avec le JSON, sans markdown ni explication.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      return NextResponse.json(
        { error: "Réponse inattendue de l'IA" },
        { status: 500 }
      );
    }

    // Remove markdown code blocks if present
    let jsonText = content.text.trim();
    if (jsonText.startsWith("```")) {
      // Remove opening ```json or ``` and closing ```
      jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const parsed = JSON.parse(jsonText);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Erreur API:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération du contenu" },
      { status: 500 }
    );
  }
}
