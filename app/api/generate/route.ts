import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const maxDuration = 60;

export async function POST(req: NextRequest) {
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

  const { nomActivite, typeActivite, zone, budget, objectif, objectifLibre } =
    await req.json();

  const moisFR = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
  const now = new Date();
  const moisActuel = `${moisFR[now.getMonth()]} ${now.getFullYear()}`;

  const prompt = `Tu es un expert en marketing digital et publicité Meta Ads (Facebook & Instagram) pour les petits entrepreneurs locaux en France.

Voici les informations sur l'activité :
- Nom de l'activité : ${nomActivite}
- Type d'activité : ${typeActivite}
- Zone géographique : ${zone}
- Budget pub mensuel : ${budget}
- Objectif principal : ${objectif === "Autre" ? objectifLibre : objectif}
- Mois en cours : ${moisActuel}

RÈGLES UNIVERSELLES (applicables à tous les objectifs) :

ÉCRITURE :
- Toujours parler en bénéfices, jamais en fonctionnalités
- Commencer par le client, pas par l'entreprise ("Vous en avez marre de..." plutôt que "Notre entreprise propose...")
- S'adresser directement au lecteur avec "vous" ou "tu" — jamais à la 3ème personne
- Phrases courtes — maximum 2 lignes par idée
- Un seul message par pub — ne pas essayer de tout dire en même temps
- Toujours nommer la ville ou la zone dans au moins une accroche

ICP :
- L'ICP généré doit être réutilisé dans TOUS les textes générés
- Utiliser les mots, les problèmes et les aspirations de l'ICP dans chaque accroche
- Chaque texte doit faire ressentir au lecteur "c'est exactement moi ça"

CALENDRIER ÉDITORIAL :
- Respecter le mix : 40% éducatif / 40% engageant / 20% vente
- Alterner les types de posts — jamais 2 posts de vente consécutifs
- Varier les formats : conseil, question, coulisses, témoignage, offre
- Le calendrier commence en ${moisActuel} — tous les posts doivent être contextualisés à cette période
- Intégrer automatiquement les événements saisonniers et moments clés de l'année selon le secteur d'activité :
  Exemples par secteur :
  Nettoyage auto : janvier-février (sel et boue hivernale), avril (pollen), juin (départs en vacances), septembre (rentrée), novembre (premières pluies et feuilles mortes)
  Coiffeur : janvier (nouvelles résolutions/nouveau look), février (Saint-Valentin), mai (fête des mères), juin (mariages et fêtes de fin d'année scolaire), décembre (fêtes de Noël)
  Restaurant : février (Saint-Valentin), mars-avril (Pâques), juin (fête des pères), novembre (Beaujolais nouveau), décembre (repas de Noël et réveillon)
  Fleuriste : février (Saint-Valentin), mars (fête des grands-mères), mai (fête du travail + fête des mères), novembre (Toussaint), décembre (Noël)
  Comptable/Expert-comptable : janvier (clôture exercice), mars-avril (déclarations fiscales), mai (liasse fiscale), septembre (rentrée fiscale), décembre (optimisation fin d'année)
  Diocèse/Religion : calendrier liturgique complet — Avent (novembre-décembre), Noël, Épiphanie (janvier), Carême (février-mars), Pâques, Pentecôte, Toussaint (novembre), fêtes des saints selon le secteur
  Plombier/Chauffagiste : septembre-octobre (révision chaudière avant hiver), novembre-février (urgences gel et pannes), avril (révision climatisation), juin-août (piscines et arrosage)
  Sport/Coach : janvier (résolutions nouvel an), mars (préparation été), juin (objectifs beach body), septembre (rentrée sportive), novembre (préparation fêtes)
- Si le secteur ne correspond à aucun exemple ci-dessus, déduire intelligemment les moments clés de l'année les plus pertinents pour ce type d'activité
- Utiliser les déclencheurs d'achat de l'ICP dans les posts du calendrier quand c'est pertinent
- Intégrer des références locales à ${zone} dans au moins 2 posts par mois
- Adapter le ton des posts à la saison : chaleureux et festif en décembre, dynamique et motivant en janvier, léger et estival en juillet

VISUELS :
- Les prompts image doivent montrer le bénéfice final, pas le service en train d'être réalisé
- Exemple : un client souriant dans une voiture propre, pas quelqu'un en train de nettoyer
- Toujours inclure un élément local reconnaissable si possible (paysage, ambiance de la zone)

RÈGLES SELON L'OBJECTIF :

Si objectif = "Remplir mon agenda / avoir des appels" :
- Structure principale : Hook fort → Offre claire → Urgence/Rareté → CTA direct
- Utilise la rareté en priorité sur l'urgence (un planning local est réellement limité — plus crédible)
- Intègre le FOMO : la personne doit sentir qu'elle va rater quelque chose si elle n'agit pas maintenant
- Ancrage de prix : montre ce que ça coûte de ne pas agir (temps perdu, problème qui s'aggrave) avant de donner le prix
- Parle toujours en bénéfices, jamais en fonctionnalités (pas "nettoyage vapeur" mais "voiture propre sans effort")
- CTA très direct et immédiat : "Réservez maintenant", "Appelez aujourd'hui", "Plus que X places cette semaine"
- Ton : direct, percutant, sans fioriture

Si objectif = "Me faire connaître dans ma zone" :
- Structure principale : Hook curiosité → Storytelling → Valeur/Expertise → CTA doux
- Utilise le storytelling : l'histoire du fondateur, pourquoi il a lancé ce business, un moment marquant
- Contenu éducatif : partage des conseils utiles liés au secteur qui prouvent l'expertise
- Évite absolument les CTA agressifs, l'urgence et le FOMO — trop tôt dans la relation
- Intègre la dimension locale : nomme la ville, le quartier, les références locales connues
- Construis la confiance avant de vendre : le client ne te connaît pas encore
- CTA doux : "Découvrez notre histoire", "Apprenez-en plus", "Suivez-nous"
- Ton : chaleureux, authentique, humain

Si objectif = "Vendre une offre ou un service" :
- Structure principale : Hook → Problème reconnaissable → Solution → Offre → CTA
- Mets en avant l'USP dès le début : ce que cette activité fait que personne d'autre ne fait exactement pareil
- Parle uniquement en bénéfices : ce que le client gagne, ressent, économise — jamais les caractéristiques techniques
- Intègre le social proof : nombre de clients, avis, résultats concrets chiffrés si possible
- Ancrage de prix : compare avec une alternative plus chère ou montre la valeur avant d'annoncer le prix
- Utilise la structure AIDA pour les textes longs : Attention → Intérêt → Désir → Action
- CTA orienté conversion : "Profitez-en", "Commandez maintenant", "Réservez votre place"
- Ton : persuasif, concret, orienté résultat

Si objectif = "Convaincre ceux qui hésitent" :
- Structure principale : Objection courante du secteur → Réassurance → Preuve concrète → CTA rassurant
- Identifie et répond aux 2-3 objections les plus fréquentes dans ce secteur (trop cher, pas le temps, pas sûr de la qualité)
- Utilise le social proof fort : témoignages clients avec prénom et ville, notes Google, résultats avant/après
- Mets en avant les garanties et engagements : satisfaction, remboursement, premier RDV sans engagement
- Évite l'urgence et le FOMO — la personne hésite déjà, la presser va la faire fuir
- Raconte une histoire d'un client qui hésitait et qui est satisfait aujourd'hui (storytelling de réassurance)
- CTA doux et sans risque : "Essayez sans engagement", "Premier RDV offert", "Posez vos questions"
- Ton : rassurant, empathique, honnête

Si objectif = "Fidéliser mes clients existants" :
- Structure principale : Reconnaissance → Valeur exclusive réservée aux clients fidèles → Invitation → CTA doux
- Parle directement aux clients existants : "vous qui nous faites confiance depuis...", "nos clients fidèles savent que..."
- Crée un sentiment d'exclusivité : offre réservée aux habitués, avant-première, avantage VIP
- Utilise le storytelling communautaire : montre que tes clients font partie de quelque chose
- Encourage le bouche-à-oreille : invite-les à partager, à parrainer un ami, à laisser un avis
- Mix de contenu : 60% engageant (coulisses, remerciements, sondages) / 40% offre exclusive
- CTA communautaire : "Revenez nous voir", "Partagez avec un ami", "Rejoignez notre programme fidélité"
- Ton : reconnaissant, chaleureux, exclusif

Si objectif = "Autre" (objectif libre : ${objectifLibre}) :
- Analyse l'objectif décrit par l'utilisateur et détermine à quelle étape du funnel il correspond (notoriété, considération ou conversion)
- Si notoriété : applique les règles de "Me faire connaître" (storytelling, éducatif, CTA doux)
- Si considération : applique les règles de "Convaincre ceux qui hésitent" (social proof, réassurance)
- Si conversion : applique les règles de "Remplir mon agenda" (urgence, rareté, CTA direct)
- Dans tous les cas : parle en bénéfices, intègre l'USP, adapte le ton à l'objectif spécifique décrit
- CTA : choisis le plus pertinent selon l'objectif libre détecté

À partir du type d'activité et de la zone géographique, génère un ICP précis et structuré en 7 dimensions :
1. Profil : qui est cette personne (âge, situation, profession, niveau de vie)
2. Problème : sa douleur principale — ce qui l'énerve, lui prend du temps ou lui coûte de l'argent
3. Aspiration : ce qu'il veut vraiment obtenir comme résultat final
4. Objections : les 2-3 raisons pour lesquelles il n'a pas encore acheté
5. Ses mots : les expressions exactes qu'il utiliserait pour décrire son problème
6. Déclencheur : l'événement ou la situation qui le pousse enfin à passer à l'action (mariage, rendez-vous pro important, visite de famille, honte devant collègues, voiture rendue sale...)
7. Présence en ligne : où il passe son temps sur internet (Facebook groupes locaux, Instagram, entre les deux, autre)

Cet ICP doit ensuite servir de base à TOUS les textes générés — chaque accroche, chaque post, chaque texte pub doit parler directement à cette personne avec ses mots, ses problèmes et ses aspirations.

Génère un plan complet en JSON avec exactement cette structure (pas de texte autour, uniquement du JSON valide) :

{
  "icp": {
    "profil": "âge, situation, profession, niveau de vie",
    "probleme": "sa douleur principale exprimée dans ses propres mots",
    "aspiration": "ce qu'il veut vraiment obtenir comme résultat",
    "objections": ["objection 1", "objection 2", "objection 3"],
    "mots": ["expression 1", "expression 2", "expression 3"],
    "declencheur": "l'événement ou situation qui déclenche l'achat",
    "presence": "où il passe son temps en ligne et comment il consomme le contenu"
  },
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
    "visuels": [
      {
        "titre": "description courte du visuel (ex: Photo avant/après nettoyage)",
        "promptImage": "prompt détaillé pour générer l'image avec un outil IA (Midjourney, DALL-E, etc). Doit décrire précisément la scène, le style, les couleurs, l'ambiance."
      },
      {
        "titre": "description courte du visuel 2",
        "promptImage": "prompt détaillé pour générer l'image 2"
      },
      {
        "titre": "description courte du visuel 3",
        "promptImage": "prompt détaillé pour générer l'image 3"
      }
    ],
    "legendes": ["légende1", "légende2", "légende3", "légende4", "légende5"]
  },
  "section2": {
    "etapes": [
      {
        "numero": 0,
        "titre": "Accéder au Gestionnaire de publicités",
        "contenu": "Comment accéder à Meta Ads pour créer sa première pub.",
        "sousEtapes": [
          { "id": "0a", "titre": "Si vous n'avez pas encore de compte", "contenu": "Créer une Page Facebook pour votre activité (obligatoire pour faire de la pub). Aller sur business.facebook.com et créer un compte Meta Business Suite. Associer votre Page Facebook à votre compte Business." },
          { "id": "0b", "titre": "Si vous avez déjà un compte", "contenu": "Aller sur business.facebook.com ou adsmanager.facebook.com. Se connecter avec le compte Facebook lié à votre Page professionnelle." },
          { "id": "0c", "titre": "Lancer la création", "contenu": "Dans le Gestionnaire de publicités, cliquer sur le bouton vert + Créer. Vous arrivez sur la première page de création de campagne." }
        ]
      },
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
    "noteInterface": "L'interface Meta Ads suit un parcours en 3 pages :\\nPage 1 → Type d'achat + Objectif de campagne\\nPage 2 → Nom de campagne + Budget + Catégories spéciales\\nPage 3 → Tout le reste sur un seul écran scrollable : Conversion, Budget/Calendrier, Audience, Placements, Identité, Format, Contenu pub, Destination, Suivi",
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
        "posts": [{ "jour": "...", "heure": "...", "theme": "...", "typeContenu": "...", "conseilVisuel": "..." }]
      },
      {
        "semaine": 3,
        "posts": [{ "jour": "...", "heure": "...", "theme": "...", "typeContenu": "...", "conseilVisuel": "..." }]
      },
      {
        "semaine": 4,
        "posts": [{ "jour": "...", "heure": "...", "theme": "...", "typeContenu": "...", "conseilVisuel": "..." }]
      }
    ]
  }
}

INSTRUCTIONS IMPORTANTES :
- Chaque semaine doit contenir 3 posts.
- Les textes doivent être en français, concrets et adaptés au secteur.
- Les accroches courtes doivent faire max 40 caractères.
- Les visuels doivent contenir 3 prompts de génération d'image détaillés et adaptés au secteur d'activité. Chaque prompt doit être suffisamment précis pour être copié-collé directement dans un outil de génération d'images IA (Midjourney, DALL-E, etc).
- La section2.etapes doit contenir EXACTEMENT 7 étapes (numérotées de 0 à 6) qui reflètent le vrai parcours de création Meta Ads 2025/2026 :
  0. Accéder au Gestionnaire de publicités : avec 3 sous-étapes (0a pas de compte : créer Page Facebook + compte Meta Business Suite, 0b déjà un compte : aller sur business.facebook.com ou adsmanager.facebook.com, 0c lancer la création : cliquer + Créer).
  1. Créer la campagne (Page 1) : type d'achat → Enchère, objectif → Prospects. Cliquer Suivant.
  2. Budget et stratégie d'enchère (Page 2) : nom de campagne, Advantage+ budget (activé ou non), budget quotidien calculé depuis le budget mensuel, stratégie d'enchère Volume le plus élevé, catégories spéciales si applicable. Cliquer Suivant.
  3. Conversion et objectif de performance (Page 3 - haut) : lieu de conversion (Formulaires instantanés recommandé, ou Appels, Messenger, WhatsApp selon le secteur), objectif de performance (Maximiser prospects).
  4. Audience et placements (Page 3 - milieu) : budget/calendrier si pas au niveau campagne, audience Advantage+ avec contrôles (lieux = zone de l'utilisateur, rayon adapté), informations annonceur UE obligatoires, placements Advantage+ recommandé.
  5. Créer la publicité (Page 3 - bas) : identité (Page Facebook + Instagram), format (Image/Vidéo unique ou Carrousel), contenu publicitaire (texte + titre + description + CTA tirés de la section1), destination (formulaire instantané avec champs adaptés au secteur).
  6. Vérifier, publier et suivre : aperçu, suivi/tracking, publier, délai examen 24h, phase d'apprentissage 7 jours, KPIs à J+3.
- Le champ "contenu" de chaque étape doit être concis : des instructions directes, une action par ligne. Indique les noms exacts des boutons et options tels qu'ils apparaissent dans Meta Ads. Personnalise TOUS les exemples pour l'activité de l'utilisateur.
- La section2.conseilsSuivi doit contenir 3-4 conseils détaillés pour suivre et optimiser la campagne APRÈS la publication.
- Réponds UNIQUEMENT avec le JSON, sans markdown ni explication.`;

  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // Process in background while streaming
  (async () => {
    try {
      const anthropicStream = anthropic.messages.stream({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 16384,
        messages: [{ role: "user", content: prompt }],
      });

      let fullText = "";

      for await (const event of anthropicStream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          fullText += event.delta.text;
          // Send chunk to keep connection alive
          await writer.write(
            encoder.encode(`data: ${JSON.stringify({ type: "chunk" })}\n\n`)
          );
        }
      }

      // Extract JSON
      let jsonText = fullText.trim();
      if (jsonText.startsWith("```")) {
        jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      }
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Aucun JSON valide trouvé dans la réponse");
      }
      const results = JSON.parse(jsonMatch[0]);

      // Save to Supabase
      const { data, error } = await supabase
        .from("strategies")
        .insert({
          user_id: user!.id,
          nom_activite: nomActivite,
          type_activite: typeActivite,
          zone,
          cible: typeof results.icp === "string" ? results.icp : results.icp.profil,
          budget,
          objectif,
          results,
        })
        .select("id")
        .single();

      if (error) {
        console.error("Erreur sauvegarde Supabase:", error);
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ type: "error", error: "Erreur lors de la sauvegarde" })}\n\n`)
        );
      } else {
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ type: "done", id: data.id })}\n\n`)
        );
      }
    } catch (err) {
      console.error("Erreur API:", err);
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      await writer.write(
        encoder.encode(`data: ${JSON.stringify({ type: "error", error: message })}\n\n`)
      );
    } finally {
      await writer.close();
    }
  })();

  return new Response(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
