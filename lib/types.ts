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

export interface SousEtape {
  id: string;
  titre: string;
  contenu: string;
}

export interface Etape {
  numero: number;
  titre: string;
  contenu: string;
  sousEtapes?: SousEtape[];
  // backward compat
  description?: string;
  ou?: string;
  action?: string;
  valeur?: string;
}

export interface ConseilSuivi {
  titre: string;
  description: string;
}

export interface ICP {
  profil: string;
  probleme: string;
  aspiration: string;
  objections: string[];
  mots: string[];
  declencheur: string;
  presence: string;
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
    etapes: Etape[];
    noteInterface?: string;
    ciblage: {
      age: string;
      zone: string;
      interets: string[];
      exclusions: string;
    };
    budget: {
      total: string;
      repartition: string;
      budgetJournalier: string;
      dureeTest: string;
    };
    format: string;
    conseilsSuivi: ConseilSuivi[];
    conseilsSecteur: string[];
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
