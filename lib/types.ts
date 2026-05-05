export interface TextePub {
  accroche: string;
  description: string;
  cta: string;
}

export interface VisuelPub {
  titre: string;
  promptImage: string;
}

export interface Post {
  jour: string;
  heure: string;
  theme: string;
  typeContenu: string;
  conseilVisuel: string;
}

export interface Semaine {
  semaine: number;
  posts: Post[];
}

export interface ICP {
  profil: string;
  probleme: string;
  aspiration: string;
  objections: string[];
  mots: string[];
  declencheur: string;
  presence: string;
  icpResume?: string;
  briefStrategique?: string;
}

export interface Results {
  icp: ICP | string;
  section1: {
    accroches: string[];
    textesPub: TextePub[];
    visuels: VisuelPub[];
    legendes: string[];
  };
  section2: {
    zone: string;
    audience: string;
    budget: string;
    objectif: string;
    placements: string;
    contenu: string;
  };
  section3: {
    semaines: Semaine[];
  };
}

export interface FormData {
  nomActivite: string;
  typeActivite: string;
  zone: string;
  budget: string;
  objectif: string;
}

export interface Strategy {
  id: string;
  user_id: string;
  nom_activite: string;
  type_activite: string;
  zone: string;
  cible?: string;
  budget: string;
  objectif: string;
  results: Results;
  created_at: string;
}

export interface TrackingAnalysis {
  verdict: "excellent" | "correct" | "danger";
  metriques: {
    ctr: { valeur: number; label: string; status: "bon" | "moyen" | "mauvais" };
    cpc: { valeur: number; label: string; status: "bon" | "moyen" | "mauvais" };
    cpr: { valeur: number; label: string; status: "bon" | "moyen" | "mauvais" };
  };
  diagnostic: string;
  action: string;
  conseil: string;
}

export interface CampaignTracking {
  id: string;
  user_id: string;
  strategy_id: string;
  impressions: number;
  clics: number;
  resultats: number;
  budget: number;
  jours?: number;
  analysis: TrackingAnalysis;
  created_at: string;
}
