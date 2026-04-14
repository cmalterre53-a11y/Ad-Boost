"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function repairJson(json: string): string {
  // 1. Remove trailing commas before } or ]
  json = json.replace(/,\s*([\]}])/g, "$1");

  // 2. Fix unescaped quotes, newlines, and control chars inside string values
  let fixed = "";
  let inString = false;
  let escaped = false;
  for (let i = 0; i < json.length; i++) {
    const ch = json[i];
    if (escaped) {
      fixed += ch;
      escaped = false;
      continue;
    }
    if (ch === "\\") {
      fixed += ch;
      escaped = true;
      continue;
    }
    // Escape real newlines/tabs/control chars inside strings
    if (inString) {
      if (ch === "\n") { fixed += "\\n"; continue; }
      if (ch === "\r") { fixed += "\\r"; continue; }
      if (ch === "\t") { fixed += "\\t"; continue; }
    }
    if (ch === '"') {
      if (!inString) {
        inString = true;
        fixed += ch;
      } else {
        // Look ahead: if next non-whitespace is : , ] } — it's a real string end
        const rest = json.slice(i + 1);
        const nextChar = rest.match(/^\s*(.)/)?.[1];
        if (!nextChar || ":,]}".includes(nextChar)) {
          inString = false;
          fixed += ch;
        } else {
          // Unescaped quote inside string — replace with apostrophe
          fixed += "'";
        }
      }
    } else {
      fixed += ch;
    }
  }

  // 3. Fix truncated JSON — close any open brackets
  let opens = 0;
  let closeBraces = 0;
  let openBrackets = 0;
  let closeBrackets = 0;
  let inStr = false;
  let esc = false;
  for (const c of fixed) {
    if (esc) { esc = false; continue; }
    if (c === "\\") { esc = true; continue; }
    if (c === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (c === "{") opens++;
    if (c === "}") closeBraces++;
    if (c === "[") openBrackets++;
    if (c === "]") closeBrackets++;
  }
  for (let i = 0; i < openBrackets - closeBrackets; i++) fixed += "]";
  for (let i = 0; i < opens - closeBraces; i++) fixed += "}";

  return fixed;
}

type Step = "icp" | "section1" | "section2" | "section3";
type Progress = "idle" | Step | "saving" | "done";

const STEPS: { key: Step; label: string }[] = [
  { key: "icp", label: "Analyse du client cible (ICP)" },
  { key: "section1", label: "Génération des textes de pub" },
  { key: "section2", label: "Guide de configuration Meta Ads" },
  { key: "section3", label: "Calendrier de publication" },
];

const objectifs = [
  { value: "Remplir mon agenda / avoir des appels", label: "Remplir mon agenda / avoir des appels", description: "Tu veux des réservations et des contacts directs cette semaine." },
  { value: "Me faire connaître dans ma zone", label: "Me faire connaître dans ma zone", description: "Tu viens de te lancer ou tu veux toucher de nouveaux quartiers autour de toi." },
  { value: "Vendre une offre ou un service", label: "Vendre une offre ou un service", description: "Tu as une promotion ou un service précis à mettre en avant maintenant." },
  { value: "Convaincre ceux qui hésitent", label: "Convaincre ceux qui hésitent", description: "Les gens te connaissent mais n'ont pas encore sauté le pas." },
  { value: "Fidéliser mes clients existants", label: "Fidéliser mes clients existants", description: "Tu veux que tes anciens clients reviennent et parlent de toi." },
  { value: "Autre", label: "Autre", description: "Tu as un objectif spécifique en tête." },
];

function stepStatus(stepKey: Step, progress: Progress, completedSteps: Set<Step>): "done" | "active" | "pending" {
  if (completedSteps.has(stepKey)) return "done";
  if (progress === stepKey) return "active";
  return "pending";
}

function StepIndicator({ status }: { status: "done" | "active" | "pending" }) {
  if (status === "done") {
    return (
      <div className="w-8 h-8 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>
    );
  }
  if (status === "active") {
    return (
      <div className="w-8 h-8 rounded-full bg-violet-500/20 border-2 border-violet-500 flex items-center justify-center flex-shrink-0">
        <svg className="animate-spin h-4 w-4 text-violet-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-slate-700/50 border-2 border-slate-600 flex items-center justify-center flex-shrink-0">
      <div className="w-2 h-2 rounded-full bg-slate-500" />
    </div>
  );
}

export default function GeneratePage() {
  const router = useRouter();
  const [progress, setProgress] = useState<Progress>("idle");
  const [completedSteps, setCompletedSteps] = useState<Set<Step>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nomActivite: "",
    typeActivite: "",
    zone: "",
    budget: "",
    objectif: objectifs[0].value,
    objectifLibre: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  async function callStep(step: Step, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    const t0 = performance.now();
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step, ...payload }),
    });

    if (!res.ok || !res.body) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.error || `Erreur serveur (step=${step})`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      fullText += decoder.decode(value, { stream: true });
    }

    if (fullText.includes("__ERROR__")) {
      const errorMsg = fullText.split("__ERROR__").pop() || "Erreur inconnue";
      throw new Error(errorMsg);
    }

    let jsonText = fullText.trim();
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }
    const lastBrace = jsonText.lastIndexOf("}");
    if (lastBrace !== -1 && lastBrace < jsonText.length - 1) {
      jsonText = jsonText.slice(0, lastBrace + 1);
    }
    if (!jsonText.startsWith("{")) throw new Error(`Aucun résultat valide reçu pour ${step}. Réessayez.`);

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      const repaired = repairJson(jsonText);
      parsed = JSON.parse(repaired);
    }

    const elapsed = Math.round(performance.now() - t0);
    console.log(`[Ad-Boost] Step ${step} completed in ${elapsed}ms — keys: ${Object.keys(parsed).join(", ")}`);
    return parsed;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCompletedSteps(new Set());

    const basePayload = {
      nomActivite: formData.nomActivite,
      typeActivite: formData.typeActivite,
      zone: formData.zone,
      budget: formData.budget,
      objectif: formData.objectif,
      objectifLibre: formData.objectifLibre,
    };

    try {
      // Step 1: ICP
      setProgress("icp");
      const icpResult = await callStep("icp", basePayload);
      const icp = icpResult.icp;
      if (!icp) throw new Error("L'ICP n'a pas été généré correctement.");
      setCompletedSteps(new Set<Step>(["icp"]));

      const payloadWithIcp = { ...basePayload, icp };

      // Steps 2-4: section1, section2, section3
      setProgress("section1");
      const s1Result = await callStep("section1", payloadWithIcp);
      setCompletedSteps(new Set<Step>(["icp", "section1"]));

      setProgress("section2");
      const s2Result = await callStep("section2", payloadWithIcp);
      setCompletedSteps(new Set<Step>(["icp", "section1", "section2"]));

      setProgress("section3");
      const s3Result = await callStep("section3", payloadWithIcp);
      setCompletedSteps(new Set<Step>(["icp", "section1", "section2", "section3"]));

      // Merge all results
      const results = {
        icp,
        section1: s1Result.section1,
        section2: s2Result.section2,
        section3: s3Result.section3,
      };
      console.log("[Ad-Boost] All steps completed. Keys:", Object.keys(results));

      // Save to Supabase
      setProgress("saving");
      const saveRes = await fetch("/api/strategies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomActivite: formData.nomActivite,
          typeActivite: formData.typeActivite,
          zone: formData.zone,
          budget: formData.budget,
          objectif: formData.objectif,
          results,
        }),
      });

      const saveData = await saveRes.json();
      if (saveData.error) throw new Error(saveData.error);
      if (!saveData.id) throw new Error("Erreur lors de la sauvegarde.");

      setProgress("done");
      router.push(`/results/${saveData.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
      setProgress("idle");
    }
  };

  const isGenerating = progress !== "idle" && progress !== "done";

  if (isGenerating || progress === "done") {
    return (
      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            {progress === "saving" ? "Sauvegarde en cours..." : progress === "done" ? "Redirection..." : "Génération de votre stratégie"}
          </h2>
          <p className="text-slate-400">
            {progress === "saving"
              ? "Enregistrement de vos résultats..."
              : progress === "done"
              ? "Votre stratégie est prête !"
              : "Chaque étape prend quelques secondes. Ne fermez pas cette page."}
          </p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
          <div className="space-y-4">
            {STEPS.map((s) => {
              const status = stepStatus(s.key, progress, completedSteps);
              return (
                <div key={s.key} className="flex items-center gap-4">
                  <StepIndicator status={status} />
                  <span className={`text-sm font-medium ${
                    status === "done"
                      ? "text-emerald-400"
                      : status === "active"
                      ? "text-white"
                      : "text-slate-500"
                  }`}>
                    {s.label}
                    {status === "active" && "..."}
                  </span>
                </div>
              );
            })}
          </div>

          {progress === "saving" && (
            <div className="mt-6 flex items-center gap-3 text-sm text-slate-400">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Sauvegarde de la stratégie...
            </div>
          )}
        </div>

        {error && (
          <div className="mt-6 bg-red-500/10 border border-red-500/25 rounded-xl p-4 text-red-300 text-sm">
            {error}
            <button
              onClick={() => { setError(null); setProgress("idle"); setCompletedSteps(new Set()); }}
              className="ml-3 underline hover:text-red-200"
            >
              Réessayer
            </button>
          </div>
        )}
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 text-balance">
          Votre stratégie pub Meta Ads
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
            générée par l&apos;IA
          </span>
        </h2>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Remplissez le formulaire ci-dessous et recevez en quelques secondes
          vos textes de pub, un guide Meta Ads personnalisé et votre
          calendrier de publication.
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/25 rounded-xl p-4 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 sm:p-8 space-y-6 backdrop-blur-sm"
      >
        <div className="grid sm:grid-cols-2 gap-6">
          {/* Nom activité */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Nom de l&apos;activité
            </label>
            <input
              type="text"
              name="nomActivite"
              placeholder="Ex : All-Clean - nettoyage de véhicules"
              value={formData.nomActivite}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition"
            />
          </div>

          {/* Type activité */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Type d&apos;activité
            </label>
            <input
              type="text"
              name="typeActivite"
              placeholder="Ex : nettoyage automobile à domicile"
              value={formData.typeActivite}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition"
            />
          </div>

          {/* Zone */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Zone géographique
            </label>
            <input
              type="text"
              name="zone"
              placeholder="Ex : Perpignan et alentours, 20km"
              value={formData.zone}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition"
            />
          </div>

          {/* Budget */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Budget pub mensuel
            </label>
            <input
              type="text"
              name="budget"
              placeholder="Ex : 100€/mois"
              value={formData.budget}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition"
            />
          </div>

          {/* Objectif */}
          <div className="space-y-3 sm:col-span-2">
            <label className="text-sm font-medium text-slate-300">
              Objectif principal
            </label>
            <div className="grid sm:grid-cols-2 gap-3">
              {objectifs.map((obj) => (
                <button
                  key={obj.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, objectif: obj.value })}
                  className={`text-left px-4 py-3 rounded-xl border transition ${
                    formData.objectif === obj.value
                      ? "border-violet-500 bg-violet-500/10 ring-2 ring-violet-500/50"
                      : "border-slate-600/50 bg-slate-900/50 hover:border-slate-500/50"
                  }`}
                >
                  <span className="block text-sm font-medium text-white">{obj.label}</span>
                  <span className="block text-xs text-slate-400 mt-1">{obj.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Objectif libre */}
          {formData.objectif === "Autre" && (
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium text-slate-300">
                Décris ton objectif
              </label>
              <textarea
                name="objectifLibre"
                placeholder="Tu as un objectif spécifique ? Décris-le en quelques mots."
                value={formData.objectifLibre}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition resize-none"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-violet-500/25"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
          </svg>
          Générer ma stratégie publicitaire
        </button>
      </form>
    </main>
  );
}
