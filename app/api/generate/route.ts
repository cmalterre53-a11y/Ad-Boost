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
        "titre": "Créer la campagne (Page 1)",
        "contenu": "Instructions pour la première page : type d'achat (Enchère ou Réservation → choisir Enchère), objectif de campagne (sélectionner Prospects). Cliquer Suivant. Sur la page suivante : nommer la campagne, catégories publicitaires spéciales, test A/B."
      },
      {
        "numero": 2,
        "titre": "Budget et stratégie d'enchère (Page 2)",
        "contenu": "Configuration du budget : Advantage+ campaign budget activé ou non, budget quotidien ou global, stratégie d'enchère (Volume le plus élevé).",
        "sousEtapes": [
          { "id": "2a", "titre": "Mode budget", "contenu": "Choisir entre Budget de la campagne (Advantage+) ou Budget de l'ensemble de publicités. Recommandation personnalisée." },
          { "id": "2b", "titre": "Montant et stratégie", "contenu": "Budget quotidien recommandé selon le budget mensuel de l'utilisateur, stratégie d'enchère Volume le plus élevé." },
          { "id": "2c", "titre": "Catégories spéciales", "contenu": "Vérifier si l'activité nécessite une catégorie spéciale (services financiers, emploi, logement, politique). Sinon ne rien cocher." }
        ]
      },
      {
        "numero": 3,
        "titre": "Conversion et objectif de performance (Page 3 - haut)",
        "contenu": "Configuration du lieu de conversion et de l'objectif de performance.",
        "sousEtapes": [
          { "id": "3a", "titre": "Lieu de conversion", "contenu": "Choisir entre Multiples (Site Web et formulaires, Site Web et appels, Formulaires et Messenger) ou Unique (Site Web, Formulaires instantanés, Messenger, Instagram, WhatsApp, Appels, Application). Recommandation personnalisée selon l'activité." },
          { "id": "3b", "titre": "Objectif de performance", "contenu": "Choisir entre Maximiser le nombre de prospects ou Maximiser le nombre de prospects de conversions. Recommandation personnalisée." },
          { "id": "3c", "titre": "Contenu publicitaire dynamique", "contenu": "Laisser désactivé pour commencer, ou activer si pertinent." }
        ]
      },
      {
        "numero": 4,
        "titre": "Audience et placements (Page 3 - milieu)",
        "contenu": "Configuration de l'audience cible et des placements.",
        "sousEtapes": [
          { "id": "4a", "titre": "Budget et calendrier", "contenu": "Si budget au niveau ensemble de publicités : définir le budget quotidien. Choisir la date de début. Conseil sur la date de fin." },
          { "id": "4b", "titre": "Audience", "contenu": "Advantage+ audience activé ou contrôles manuels. Lieux (zone géographique + rayon). Suggestions d'audiences personnalisées. Recommandations adaptées à l'activité." },
          { "id": "4c", "titre": "Informations annonceur UE", "contenu": "Remplir le nom de l'annonceur (obligatoire pour diffuser dans l'UE). Indiquer si le payeur est différent." },
          { "id": "4d", "titre": "Placements", "contenu": "Advantage+ placements recommandé (Meta diffuse automatiquement là où ça performe). Ou contrôles manuels avec exclusions si besoin." }
        ]
      },
      {
        "numero": 5,
        "titre": "Créer la publicité (Page 3 - bas)",
        "contenu": "Configuration du contenu publicitaire.",
        "sousEtapes": [
          { "id": "5a", "titre": "Identité", "contenu": "Sélectionner la Page Facebook et le profil Instagram liés à l'activité." },
          { "id": "5b", "titre": "Format", "contenu": "Choisir Image/Vidéo unique ou Carrousel. Recommandation personnalisée avec conseils visuels adaptés au secteur." },
          { "id": "5c", "titre": "Contenu publicitaire", "contenu": "Configurer le texte principal, le titre, la description et le CTA. Utiliser les textes générés dans la Section 1." },
          { "id": "5d", "titre": "Destination", "contenu": "Formulaire instantané : créer le formulaire avec les champs adaptés (nom, téléphone, email, message). Ou autre destination selon le lieu de conversion choisi à l'étape 3." }
        ]
      },
      {
        "numero": 6,
        "titre": "Vérifier, publier et suivre",
        "contenu": "Vérifier l'aperçu mobile/desktop. Vérifier le suivi (évènements CRM, site Web, paramètres URL). Cliquer Publier. Délai d'examen Meta : 24h. Ne pas toucher pendant 7 jours (phase d'apprentissage). Premiers KPIs à surveiller à J+3."
      }
    ],
    "noteInterface": "L'interface Meta Ads suit un parcours en 3 pages :\nPage 1 → Type d'achat + Objectif de campagne\nPage 2 → Nom de campagne + Budget + Catégories spéciales\nPage 3 → Tout le reste sur un seul écran scrollable : Conversion, Budget/Calendrier, Audience, Placements, Identité, Format, Contenu pub, Destination, Suivi",
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
- La section2.etapes doit contenir EXACTEMENT 6 étapes qui reflètent le vrai parcours de création Meta Ads 2025/2026 :
  1. Créer la campagne (Page 1) : type d'achat → Enchère, objectif → Prospects. Cliquer Suivant.
  2. Budget et stratégie d'enchère (Page 2) : nom de campagne, Advantage+ budget (activé ou non), budget quotidien calculé depuis le budget mensuel, stratégie d'enchère Volume le plus élevé, catégories spéciales si applicable. Cliquer Suivant.
  3. Conversion et objectif de performance (Page 3 - haut) : lieu de conversion (Formulaires instantanés recommandé, ou Appels, Messenger, WhatsApp selon le secteur), objectif de performance (Maximiser prospects).
  4. Audience et placements (Page 3 - milieu) : budget/calendrier si pas au niveau campagne, audience Advantage+ avec contrôles (lieux = zone de l'utilisateur, rayon adapté), informations annonceur UE obligatoires, placements Advantage+ recommandé.
  5. Créer la publicité (Page 3 - bas) : identité (Page Facebook + Instagram), format (Image/Vidéo unique ou Carrousel), contenu publicitaire (texte + titre + description + CTA tirés de la section1), destination (formulaire instantané avec champs adaptés au secteur).
  6. Vérifier, publier et suivre : aperçu, suivi/tracking, publier, délai examen 24h, phase d'apprentissage 7 jours, KPIs à J+3.
- Le champ "contenu" de chaque étape doit être concis : des instructions directes, une action par ligne. Indique les noms exacts des boutons et options tels qu'ils apparaissent dans Meta Ads. Personnalise TOUS les exemples pour l'activité de l'utilisateur.
- La section2.conseilsSuivi doit contenir 3-4 conseils détaillés pour suivre et optimiser la campagne APRÈS la publication.
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
