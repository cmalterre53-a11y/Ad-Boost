import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const maxDuration = 60;

type Step = "icp" | "section1" | "section2" | "section3";

interface RequestBody {
  step: Step;
  nomActivite: string;
  typeActivite: string;
  zone: string;
  budget: string;
  objectif: string;
  objectifLibre?: string;
  servicePrincipal?: string;
  douleurClient?: string;
  meilleureClient?: string;
  icp?: object;
}

function buildBusinessContext(body: RequestBody): string {
  return `Voici les informations sur l'activité :
- Nom de l'activité : ${body.nomActivite}
- Type d'activité : ${body.typeActivite}
- Zone géographique : ${body.zone}
- Budget pub mensuel : ${body.budget}
- Objectif principal : ${body.objectif === "Autre" ? body.objectifLibre : body.objectif}`;
}

function buildObjectiveRules(body: RequestBody): string {
  const objectifLibre = body.objectifLibre || "";
  const rules: Record<string, string> = {
    "Remplir mon agenda / avoir des appels": `RÈGLES SELON L'OBJECTIF (Remplir mon agenda / avoir des appels) :
- Structure principale : Hook fort → Offre claire → Urgence/Rareté → CTA direct
- Utilise la rareté en priorité sur l'urgence (un planning local est réellement limité — plus crédible)
- Intègre le FOMO : la personne doit sentir qu'elle va rater quelque chose si elle n'agit pas maintenant
- Ancrage de prix : montre ce que ça coûte de ne pas agir (temps perdu, problème qui s'aggrave) avant de donner le prix
- Parle toujours en bénéfices, jamais en fonctionnalités
- CTA très direct et immédiat : "Réservez maintenant", "Appelez aujourd'hui", "Plus que X places cette semaine"
- Ton : direct, percutant, sans fioriture`,

    "Me faire connaître dans ma zone": `RÈGLES SELON L'OBJECTIF (Me faire connaître dans ma zone) :
- Structure principale : Hook curiosité → Storytelling → Valeur/Expertise → CTA doux
- Utilise le storytelling : l'histoire du fondateur, pourquoi il a lancé ce business, un moment marquant
- Contenu éducatif : partage des conseils utiles liés au secteur qui prouvent l'expertise
- Évite absolument les CTA agressifs, l'urgence et le FOMO — trop tôt dans la relation
- Intègre la dimension locale : nomme la ville, le quartier, les références locales connues
- Construis la confiance avant de vendre : le client ne te connaît pas encore
- CTA doux : "Découvrez notre histoire", "Apprenez-en plus", "Suivez-nous"
- Ton : chaleureux, authentique, humain`,

    "Vendre une offre ou un service": `RÈGLES SELON L'OBJECTIF (Vendre une offre ou un service) :
- Structure principale : Hook → Problème reconnaissable → Solution → Offre → CTA
- Mets en avant l'USP dès le début : ce que cette activité fait que personne d'autre ne fait exactement pareil
- Parle uniquement en bénéfices : ce que le client gagne, ressent, économise — jamais les caractéristiques techniques
- Intègre le social proof : nombre de clients, avis, résultats concrets chiffrés si possible
- Ancrage de prix : compare avec une alternative plus chère ou montre la valeur avant d'annoncer le prix
- Utilise la structure AIDA pour les textes longs : Attention → Intérêt → Désir → Action
- CTA orienté conversion : "Profitez-en", "Commandez maintenant", "Réservez votre place"
- Ton : persuasif, concret, orienté résultat`,

    "Convaincre ceux qui hésitent": `RÈGLES SELON L'OBJECTIF (Convaincre ceux qui hésitent) :
- Structure principale : Objection courante du secteur → Réassurance → Preuve concrète → CTA rassurant
- Identifie et répond aux 2-3 objections les plus fréquentes dans ce secteur (trop cher, pas le temps, pas sûr de la qualité)
- Utilise le social proof fort : témoignages clients avec prénom et ville, notes Google, résultats avant/après
- Mets en avant les garanties et engagements : satisfaction, remboursement, premier RDV sans engagement
- Évite l'urgence et le FOMO — la personne hésite déjà, la presser va la faire fuir
- Raconte une histoire d'un client qui hésitait et qui est satisfait aujourd'hui (storytelling de réassurance)
- CTA doux et sans risque : "Essayez sans engagement", "Premier RDV offert", "Posez vos questions"
- Ton : rassurant, empathique, honnête`,

    "Fidéliser mes clients existants": `RÈGLES SELON L'OBJECTIF (Fidéliser mes clients existants) :
- Structure principale : Reconnaissance → Valeur exclusive réservée aux clients fidèles → Invitation → CTA doux
- Parle directement aux clients existants : "vous qui nous faites confiance depuis...", "nos clients fidèles savent que..."
- Crée un sentiment d'exclusivité : offre réservée aux habitués, avant-première, avantage VIP
- Utilise le storytelling communautaire : montre que tes clients font partie de quelque chose
- Encourage le bouche-à-oreille : invite-les à partager, à parrainer un ami, à laisser un avis
- Mix de contenu : 60% engageant (coulisses, remerciements, sondages) / 40% offre exclusive
- CTA communautaire : "Revenez nous voir", "Partagez avec un ami", "Rejoignez notre programme fidélité"
- Ton : reconnaissant, chaleureux, exclusif`,
  };

  if (body.objectif === "Autre") {
    return `RÈGLES SELON L'OBJECTIF (Autre — objectif libre : ${objectifLibre}) :
- Analyse l'objectif décrit par l'utilisateur et détermine à quelle étape du funnel il correspond (notoriété, considération ou conversion)
- Si notoriété : applique les règles de "Me faire connaître" (storytelling, éducatif, CTA doux)
- Si considération : applique les règles de "Convaincre ceux qui hésitent" (social proof, réassurance)
- Si conversion : applique les règles de "Remplir mon agenda" (urgence, rareté, CTA direct)
- Dans tous les cas : parle en bénéfices, intègre l'USP, adapte le ton à l'objectif spécifique décrit
- CTA : choisis le plus pertinent selon l'objectif libre détecté`;
  }

  return rules[body.objectif] || rules["Remplir mon agenda / avoir des appels"];
}

function buildIcpRecap(icp: object): string {
  const i = icp as Record<string, unknown>;
  return `VOICI L'ICP (Client Cible Idéal) déjà généré — utilise-le comme base pour TOUT le contenu :
- Profil : ${i.profil}
- Problème : ${i.probleme}
- Aspiration : ${i.aspiration}
- Objections : ${Array.isArray(i.objections) ? i.objections.join(", ") : i.objections}
- Ses mots : ${Array.isArray(i.mots) ? i.mots.join(", ") : i.mots}
- Déclencheur : ${i.declencheur}
- Présence en ligne : ${i.presence}`;
}

function buildPrompt(body: RequestBody): string {
  const role = `Tu es un expert en marketing digital et publicité Meta Ads (Facebook & Instagram) pour les petits entrepreneurs locaux en France.`;
  const biz = buildBusinessContext(body);

  switch (body.step) {
    case "icp": {
      const hasHints = body.servicePrincipal || body.douleurClient || body.meilleureClient;

      const strategyBlock = hasHints
        ? `\nGénère un ICP complet et riche en combinant deux sources :
1. Les informations fournies par le client (prioritaires et doivent apparaître dans l'ICP) :${body.servicePrincipal ? ` service principal = ${body.servicePrincipal},` : ""}${body.douleurClient ? ` douleur client = ${body.douleurClient},` : ""}${body.meilleureClient ? ` meilleur client = ${body.meilleureClient}.` : ""}
2. Tes propres déductions intelligentes à partir du type d'activité et de la zone géographique — complète avec tous les éléments que le client n'a pas mentionnés : références aux enfants, valeur résiduelle du véhicule, bouche-à-oreille, événements déclencheurs supplémentaires, présence en ligne détaillée.
L'ICP final doit être complet, précis et riche — il doit contenir TOUTES les informations pertinentes, celles du client ET celles que tu déduis. Ne sacrifie pas les déductions intelligentes au profit des infos client — combine les deux.\n`
        : "";

      return `${role}

${biz}
${strategyBlock}
À partir du type d'activité et de la zone géographique, génère un ICP (Client Cible Idéal) précis et structuré en 7 dimensions :
1. Profil : qui est cette personne (âge, situation, profession, niveau de vie)
2. Problème : sa douleur principale — ce qui l'énerve, lui prend du temps ou lui coûte de l'argent
3. Aspiration : ce qu'il veut vraiment obtenir comme résultat final
4. Objections : les 2-3 raisons pour lesquelles il n'a pas encore acheté
5. Ses mots : les expressions exactes qu'il utiliserait pour décrire son problème
6. Déclencheur : l'événement ou la situation qui le pousse enfin à passer à l'action
7. Présence en ligne : où il passe son temps sur internet (Facebook groupes locaux, Instagram, entre les deux, autre)

Génère UNIQUEMENT du JSON valide avec cette structure exacte (pas de texte autour) :

{
  "icp": {
    "profil": "âge, situation, profession, niveau de vie",
    "probleme": "sa douleur principale exprimée dans ses propres mots",
    "aspiration": "ce qu'il veut vraiment obtenir comme résultat",
    "objections": ["objection 1", "objection 2", "objection 3"],
    "mots": ["expression 1", "expression 2", "expression 3"],
    "declencheur": "l'événement ou situation qui déclenche l'achat",
    "presence": "où il passe son temps en ligne et comment il consomme le contenu",
    "icpResume": "Résumé en 3-4 lignes de l'ICP. Format : Ton client idéal : [profil en une ligne]. Son problème principal : [problème en une ligne]. Ce qui le déclenche : [déclencheur en une ligne]. Où le toucher : [présence en ligne en une ligne]."
  }
}

IMPORTANT : dans toutes les valeurs texte du JSON, n'utilise JAMAIS de guillemets doubles ("). Utilise des apostrophes (') ou des guillemets français (« ») à la place. Cela garantit un JSON valide.
Échappe toujours les caractères spéciaux dans les chaînes JSON (retours à la ligne avec \\n, tabulations avec \\t).
Réponds UNIQUEMENT avec le JSON, sans markdown ni explication.`;
    }

    case "section1": {
      const objectiveRules = buildObjectiveRules(body);
      const icpRecap = buildIcpRecap(body.icp!);

      return `${role}

${biz}

${icpRecap}

${objectiveRules}

RÈGLES D'ÉCRITURE :
- Toujours parler en bénéfices, jamais en fonctionnalités
- Commencer par le client, pas par l'entreprise ("Vous en avez marre de..." plutôt que "Notre entreprise propose...")
- S'adresser directement au lecteur avec "vous" ou "tu" — jamais à la 3ème personne
- Phrases courtes — maximum 2 lignes par idée
- Un seul message par pub — ne pas essayer de tout dire en même temps
- Toujours nommer la ville ou la zone dans au moins une accroche
- Utiliser les mots, les problèmes et les aspirations de l'ICP dans chaque accroche
- Chaque texte doit faire ressentir au lecteur "c'est exactement moi ça"

REGISTRE ET TON OBLIGATOIRES :
- Registre professionnel mais accessible — chaleureux, direct, humain
- INTERDIT d'utiliser des mots familiers, vulgaires ou péjoratifs : "dégueulasse", "flemme", "crado", "nul", "pourri", "galère", ou tout terme qui pourrait sembler irrespectueux envers le client ou son problème
- À la place, utilise des formulations positives et engageantes : "un intérieur impeccable", "un résultat bluffant", "sans effort de votre part", "en toute tranquillité", etc.
- Le ton doit donner envie, pas choquer

VISUELS :
- Les prompts image doivent montrer le bénéfice final, pas le service en train d'être réalisé
- Exemple : un client souriant dans une voiture propre, pas quelqu'un en train de nettoyer
- Toujours inclure un élément local reconnaissable si possible (paysage, ambiance de la zone)

Génère UNIQUEMENT du JSON valide avec cette structure exacte (pas de texte autour) :

{
  "section1": {
    "accroches": ["accroche1 (max 40 car)", "accroche2", "accroche3", "accroche4", "accroche5"],
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
        "titre": "description courte du visuel",
        "promptImage": "prompt détaillé pour générer l'image avec un outil de création visuelle (Midjourney, DALL-E, etc). Doit décrire précisément la scène, le style, les couleurs, l'ambiance."
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
  }
}

INSTRUCTIONS :
- QUANTITÉS EXACTES OBLIGATOIRES : génère exactement 5 accroches courtes (max 40 caractères chacune), 3 textes de pub complets (accroche + description + CTA), 3 visuels (titre + promptImage), et 5 légendes pour posts organiques. Ni plus, ni moins.
- Les visuels doivent contenir 3 prompts de génération d'image détaillés et adaptés au secteur d'activité. Chaque prompt doit être suffisamment précis pour être copié-collé directement dans un outil de génération d'images.
- Les textes doivent être en français, concrets et adaptés au secteur.
- IMPORTANT : dans toutes les valeurs texte du JSON, n'utilise JAMAIS de guillemets doubles ("). Utilise des apostrophes (') ou des guillemets français (« ») à la place.
- Échappe toujours les caractères spéciaux dans les chaînes JSON (retours à la ligne avec \\n, tabulations avec \\t).
- Réponds UNIQUEMENT avec le JSON, sans markdown ni explication.`;
    }

    case "section2": {
      const icpRecap = buildIcpRecap(body.icp!);

      return `${role}

${biz}

${icpRecap}

Génère un guide complet de configuration Meta Ads personnalisé pour cette activité.

La section2.etapes doit contenir EXACTEMENT 7 étapes (numérotées de 0 à 6) qui reflètent le vrai parcours de création Meta Ads 2025/2026 :
  0. Accéder au Gestionnaire de publicités : avec 3 sous-étapes (0a pas de compte : créer Page Facebook + compte Meta Business Suite, 0b déjà un compte : aller sur business.facebook.com ou adsmanager.facebook.com, 0c lancer la création : cliquer + Créer).
  1. Créer la campagne (Page 1) : type d'achat → Enchère, objectif → Prospects. Cliquer Suivant.
  2. Budget et stratégie d'enchère (Page 2) : nom de campagne, Advantage+ budget (activé ou non), budget quotidien calculé depuis le budget mensuel, stratégie d'enchère Volume le plus élevé, catégories spéciales si applicable. Cliquer Suivant.
  3. Conversion et objectif de performance (Page 3 - haut) : lieu de conversion (Formulaires instantanés recommandé, ou Appels, Messenger, WhatsApp selon le secteur), objectif de performance (Maximiser prospects).
  4. Audience et placements (Page 3 - milieu) : budget/calendrier si pas au niveau campagne, audience Advantage+ avec contrôles (lieux = zone de l'utilisateur, rayon adapté), informations annonceur UE obligatoires, placements Advantage+ recommandé.
  5. Créer la publicité (Page 3 - bas) : identité (Page Facebook + Instagram), format (Image/Vidéo unique ou Carrousel), contenu publicitaire (texte + titre + description + CTA), destination (formulaire instantané avec champs adaptés au secteur).
  6. Vérifier, publier et suivre : aperçu, suivi/tracking, publier, délai examen 24h, phase d'apprentissage 7 jours, KPIs à J+3.

Le champ "contenu" de chaque étape doit être concis : des instructions directes, une action par ligne. Indique les noms exacts des boutons et options tels qu'ils apparaissent dans Meta Ads. Personnalise TOUS les exemples pour l'activité de l'utilisateur.

Génère UNIQUEMENT du JSON valide avec cette structure exacte (pas de texte autour) :

{
  "section2": {
    "etapes": [
      {
        "numero": 0,
        "titre": "Accéder au Gestionnaire de publicités",
        "contenu": "Comment accéder à Meta Ads pour créer sa première pub.",
        "sousEtapes": [
          { "id": "0a", "titre": "Si vous n'avez pas encore de compte", "contenu": "..." },
          { "id": "0b", "titre": "Si vous avez déjà un compte", "contenu": "..." },
          { "id": "0c", "titre": "Lancer la création", "contenu": "..." }
        ]
      },
      { "numero": 1, "titre": "Créer la campagne (Page 1)", "contenu": "..." },
      {
        "numero": 2,
        "titre": "Budget et stratégie d'enchère (Page 2)",
        "contenu": "...",
        "sousEtapes": [
          { "id": "2a", "titre": "Mode budget", "contenu": "..." },
          { "id": "2b", "titre": "Montant et stratégie", "contenu": "..." },
          { "id": "2c", "titre": "Catégories spéciales", "contenu": "..." }
        ]
      },
      {
        "numero": 3,
        "titre": "Conversion et objectif de performance (Page 3 - haut)",
        "contenu": "...",
        "sousEtapes": [
          { "id": "3a", "titre": "Lieu de conversion", "contenu": "..." },
          { "id": "3b", "titre": "Objectif de performance", "contenu": "..." },
          { "id": "3c", "titre": "Contenu publicitaire dynamique", "contenu": "..." }
        ]
      },
      {
        "numero": 4,
        "titre": "Audience et placements (Page 3 - milieu)",
        "contenu": "...",
        "sousEtapes": [
          { "id": "4a", "titre": "Budget et calendrier", "contenu": "..." },
          { "id": "4b", "titre": "Audience", "contenu": "..." },
          { "id": "4c", "titre": "Informations annonceur UE", "contenu": "..." },
          { "id": "4d", "titre": "Placements", "contenu": "..." }
        ]
      },
      {
        "numero": 5,
        "titre": "Créer la publicité (Page 3 - bas)",
        "contenu": "...",
        "sousEtapes": [
          { "id": "5a", "titre": "Identité", "contenu": "..." },
          { "id": "5b", "titre": "Format", "contenu": "..." },
          { "id": "5c", "titre": "Contenu publicitaire", "contenu": "..." },
          { "id": "5d", "titre": "Destination", "contenu": "..." }
        ]
      },
      { "numero": 6, "titre": "Vérifier, publier et suivre", "contenu": "..." }
    ],
    "noteInterface": "L'interface Meta Ads suit un parcours en 3 pages...",
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
      { "titre": "Titre du conseil", "description": "Description détaillée du conseil" }
    ],
    "conseilsSecteur": ["conseil1", "conseil2", "conseil3", "conseil4", "conseil5"]
  }
}

INSTRUCTIONS :
- La section2.conseilsSuivi doit contenir 3-4 conseils détaillés pour suivre et optimiser la campagne APRÈS la publication.
- IMPORTANT : dans toutes les valeurs texte du JSON, n'utilise JAMAIS de guillemets doubles ("). Utilise des apostrophes (') ou des guillemets français (« ») à la place.
- Échappe toujours les caractères spéciaux dans les chaînes JSON (retours à la ligne avec \\n, tabulations avec \\t).
- Réponds UNIQUEMENT avec le JSON, sans markdown ni explication.`;
    }

    case "section3": {
      const moisFR = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
      const joursFR = ["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"];
      const now = new Date();
      const moisActuel = `${moisFR[now.getMonth()]} ${now.getFullYear()}`;
      const dateComplete = `${joursFR[now.getDay()]} ${now.getDate()} ${moisFR[now.getMonth()]} ${now.getFullYear()}`;
      const icpRecap = buildIcpRecap(body.icp!);

      return `${role}

${biz}
- Date du jour : ${dateComplete}
- Mois en cours : ${moisActuel}

${icpRecap}

PROGRESSION NARRATIVE SUR 4 SEMAINES :
Le calendrier doit suivre une progression logique et stratégique :
- Semaine 1 — NOTORIÉTÉ : se présenter, créer la confiance, contenu éducatif. Ton chaleureux et accessible.
- Semaine 2 — PREUVE SOCIALE : témoignages, avant/après, résultats concrets, chiffres. Ton factuel et rassurant.
- Semaine 3 — ENGAGEMENT : questions, sondages, coulisses, interaction directe avec la communauté. Ton conversationnel et humain.
- Semaine 4 — CONVERSION : offre, urgence, CTA direct, remplir l'agenda. Ton percutant et orienté action.
Chaque semaine garde 3 posts mais le ton et le type de contenu évoluent selon cette progression.

RÈGLES DU CALENDRIER ÉDITORIAL :
- Le calendrier commence la semaine suivant le ${dateComplete} — tous les posts doivent être contextualisés à cette période
- Varier les formats : conseil, question, coulisses, témoignage, offre
- Intégrer automatiquement les événements saisonniers et moments clés de l'année selon le secteur d'activité :
  Exemples par secteur :
  Nettoyage auto : janvier-février (sel et boue hivernale), avril (pollen), juin (départs en vacances), septembre (rentrée), novembre (premières pluies et feuilles mortes)
  Coiffeur : janvier (nouvelles résolutions/nouveau look), février (Saint-Valentin), mai (fête des mères), juin (mariages et fêtes de fin d'année scolaire), décembre (fêtes de Noël)
  Restaurant : février (Saint-Valentin), mars-avril (Pâques), juin (fête des pères), novembre (Beaujolais nouveau), décembre (repas de Noël et réveillon)
  Fleuriste : février (Saint-Valentin), mars (fête des grands-mères), mai (fête du travail + fête des mères), novembre (Toussaint), décembre (Noël)
  Comptable/Expert-comptable : janvier (clôture exercice), mars-avril (déclarations fiscales), mai (liasse fiscale), septembre (rentrée fiscale), décembre (optimisation fin d'année)
  Diocèse/Religion : calendrier liturgique complet — Avent, Noël, Épiphanie, Carême, Pâques, Pentecôte, Toussaint
  Plombier/Chauffagiste : septembre-octobre (révision chaudière avant hiver), novembre-février (urgences gel et pannes), avril (révision climatisation), juin-août (piscines et arrosage)
  Sport/Coach : janvier (résolutions nouvel an), mars (préparation été), juin (objectifs beach body), septembre (rentrée sportive), novembre (préparation fêtes)
- Si le secteur ne correspond à aucun exemple ci-dessus, déduire intelligemment les moments clés
- Utiliser les déclencheurs d'achat de l'ICP dans les posts du calendrier quand c'est pertinent
- Intégrer des références locales à ${body.zone} dans au moins 2 posts par mois
- Adapter le ton des posts à la saison

Génère UNIQUEMENT du JSON valide avec cette structure exacte (pas de texte autour) :

{
  "section3": {
    "semaines": [
      {
        "semaine": 1,
        "posts": [
          { "jour": "Lundi", "heure": "18h00", "theme": "thème du post", "typeContenu": "photo/vidéo courte/story/carrousel", "conseilVisuel": "conseil sur quoi filmer ou photographier" },
          { "jour": "Mercredi", "heure": "12h00", "theme": "thème du post", "typeContenu": "photo/vidéo courte/story/carrousel", "conseilVisuel": "conseil visuel" },
          { "jour": "Vendredi", "heure": "18h00", "theme": "thème du post", "typeContenu": "photo/vidéo courte/story/carrousel", "conseilVisuel": "conseil visuel" }
        ]
      },
      {
        "semaine": 2,
        "posts": [
          { "jour": "Lundi", "heure": "18h00", "theme": "thème", "typeContenu": "format", "conseilVisuel": "conseil" },
          { "jour": "Mercredi", "heure": "12h00", "theme": "thème", "typeContenu": "format", "conseilVisuel": "conseil" },
          { "jour": "Vendredi", "heure": "18h00", "theme": "thème", "typeContenu": "format", "conseilVisuel": "conseil" }
        ]
      },
      {
        "semaine": 3,
        "posts": [
          { "jour": "Lundi", "heure": "18h00", "theme": "thème", "typeContenu": "format", "conseilVisuel": "conseil" },
          { "jour": "Mercredi", "heure": "12h00", "theme": "thème", "typeContenu": "format", "conseilVisuel": "conseil" },
          { "jour": "Vendredi", "heure": "18h00", "theme": "thème", "typeContenu": "format", "conseilVisuel": "conseil" }
        ]
      },
      {
        "semaine": 4,
        "posts": [
          { "jour": "Lundi", "heure": "18h00", "theme": "thème", "typeContenu": "format", "conseilVisuel": "conseil" },
          { "jour": "Mercredi", "heure": "12h00", "theme": "thème", "typeContenu": "format", "conseilVisuel": "conseil" },
          { "jour": "Vendredi", "heure": "18h00", "theme": "thème", "typeContenu": "format", "conseilVisuel": "conseil" }
        ]
      }
    ]
  }
}

INSTRUCTIONS :
- Chaque semaine doit contenir exactement 3 posts.
- Les textes doivent être en français, concrets et adaptés au secteur.
- IMPORTANT : dans toutes les valeurs texte du JSON, n'utilise JAMAIS de guillemets doubles ("). Utilise des apostrophes (') ou des guillemets français (« ») à la place.
- Échappe toujours les caractères spéciaux dans les chaînes JSON (retours à la ligne avec \\n, tabulations avec \\t).
- Réponds UNIQUEMENT avec le JSON, sans markdown ni explication.`;
    }
  }
}

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

  const body: RequestBody = await req.json();
  const { step } = body;

  if (!step || !["icp", "section1", "section2", "section3"].includes(step)) {
    return NextResponse.json({ error: "Paramètre 'step' invalide" }, { status: 400 });
  }

  console.log(`[Ad-Boost] Step: ${step} | ${body.nomActivite} (${body.typeActivite})`);

  const prompt = buildPrompt(body);
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(encoder.encode("{"));
        const anthropicStream = anthropic.messages.stream({
          model: "claude-haiku-4-5-20251001",
          max_tokens: step === "section2" ? 8192 : 4096,
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
