import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    // Auth check
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

    const { nomActivite, typeActivite, zone, cible, budget, objectif } =
      await req.json();

    let results;

    // Mode développement : retourne les données mockées
    if (process.env.USE_MOCK_DATA === "true") {
      const mockDataPath = path.join(process.cwd(), "mock-data.json");
      const mockData = JSON.parse(fs.readFileSync(mockDataPath, "utf-8"));

      console.log("🚀 Mode DEV : Utilisation des données mockées (instantané)");

      // Petit délai pour simuler un appel API (optionnel)
      await new Promise((resolve) => setTimeout(resolve, 500));

      results = mockData.results;
    } else {
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
        "titre": "Accéder au Gestionnaire de publicités",
        "contenu": "Instructions courtes et directes pour cette étape. Chaque ligne = une action. Mentionne les boutons exacts."
      },
      {
        "numero": 2,
        "titre": "Choisir l'objectif (Niveau Campagne)",
        "contenu": "Instructions pour le choix d'objectif, nommage de la campagne, etc."
      },
      {
        "numero": 3,
        "titre": "Configurer l'ensemble de publicités",
        "contenu": "Phrase d'intro courte sur ce que contient cet écran.",
        "sousEtapes": [
          { "id": "3a", "titre": "Objectif de conversion", "contenu": "Choix du type de contact (formulaire, appels, messenger)." },
          { "id": "3b", "titre": "Budget et calendrier", "contenu": "Budget quotidien recommandé, règle du 5x, dates." },
          { "id": "3c", "titre": "Audience", "contenu": "Localisation, rayon, âge, ciblage détaillé, taille audience." },
          { "id": "3d", "titre": "Emplacements", "contenu": "Advantage+ Placements ou sélection manuelle." }
        ]
      },
      {
        "numero": 4,
        "titre": "Créer la publicité (Niveau Pub)",
        "contenu": "Phrase d'intro courte.",
        "sousEtapes": [
          { "id": "4a", "titre": "Identité", "contenu": "Sélection page Facebook et compte Instagram." },
          { "id": "4b", "titre": "Format et visuel", "contenu": "Image unique recommandée, specs, conseils photo." },
          { "id": "4c", "titre": "Texte de l'annonce", "contenu": "Texte principal, titre, description." },
          { "id": "4d", "titre": "Destination / Bouton d'action", "contenu": "Formulaire instantané, champs, message de remerciement." }
        ]
      },
      {
        "numero": 5,
        "titre": "Vérifier et publier",
        "contenu": "Vérification aperçu, points de contrôle, publication, délai d'examen."
      },
      {
        "numero": 6,
        "titre": "Suivre les résultats (à partir de J+3)",
        "contenu": "KPIs à surveiller (coût par lead, CTR, fréquence), phase d'apprentissage, première analyse."
      }
    ],
    "noteInterface": "L'interface Meta suit toujours cette structure en 3 niveaux :\n1. CAMPAGNE → objectif global\n2. ENSEMBLE DE PUBLICITÉS → audience + budget + emplacements\n3. PUBLICITÉ → contenu visuel + texte + CTA\nTout est configurable dans cet ordre, de haut en bas sur un seul écran scrollable (interface guided creation de Meta 2025).",
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
- La section2.etapes doit contenir EXACTEMENT 6 étapes dans cet ordre qui reflète l'interface Meta Ads 2025/2026 :
  1. Accéder au Gestionnaire de publicités (business.facebook.com → bouton + Créer)
  2. Choisir l'objectif — Niveau Campagne (sélectionner Prospects, nommer la campagne, décocher ACB)
  3. Configurer l'ensemble de publicités — avec 4 sousEtapes : 3a Objectif de conversion (formulaire/appels/messenger), 3b Budget et calendrier (budget quotidien, règle du 5x le coût par lead), 3c Audience (localisation + rayon 30-50km, âge, ciblage détaillé ou Advantage Audience), 3d Emplacements (Advantage+ Placements recommandé)
  4. Créer la publicité — avec 4 sousEtapes : 4a Identité (page Facebook + Instagram), 4b Format et visuel (image unique 1080x1080 ou 1080x1350, conseils photo adaptés au secteur), 4c Texte de l'annonce (texte principal + titre + description personnalisés), 4d Destination / Bouton d'action (formulaire instantané avec champs adaptés au secteur)
  5. Vérifier et publier (aperçu mobile/desktop, points de contrôle, publication, délai examen)
  6. Suivre les résultats à partir de J+3 (coût par lead, CTR > 1.5%, fréquence < 3, ne pas toucher pendant 7 jours, analyse après 14 jours)
- Le champ "contenu" de chaque étape doit être concis : des instructions directes, une action par ligne. Personnalise TOUS les exemples pour l'activité de l'utilisateur (nom, zone, type de service, visuels suggérés).
- Ajoute le champ "noteInterface" avec l'explication des 3 niveaux (Campagne → Ensemble de pubs → Pub).
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
        jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      }

      results = JSON.parse(jsonText);
    }

    // Save to Supabase
    const { data, error } = await supabase
      .from("strategies")
      .insert({
        user_id: user.id,
        nom_activite: nomActivite,
        type_activite: typeActivite,
        zone,
        cible,
        budget,
        objectif,
        results,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Erreur sauvegarde Supabase:", error);
      return NextResponse.json(
        { error: "Erreur lors de la sauvegarde" },
        { status: 500 }
      );
    }

    return NextResponse.json({ id: data.id, ...results });
  } catch (error) {
    console.error("Erreur API:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération du contenu" },
      { status: 500 }
    );
  }
}
