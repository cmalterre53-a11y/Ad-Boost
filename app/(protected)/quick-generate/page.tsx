"use client";

import { useEffect, useState } from "react";

interface StrategyOption {
  id: string;
  nom_activite: string;
  zone: string;
  results: {
    icp?: {
      icpResume?: string;
    };
  };
}

const POST_TYPES = [
  { id: "avant-apres", emoji: "\u{1F4F8}", label: "Avant / Après" },
  { id: "temoignage", emoji: "\u2B50", label: "Témoignage client" },
  { id: "coulisses", emoji: "\u{1F3AC}", label: "Coulisses" },
  { id: "offre", emoji: "\u{1F381}", label: "Offre ou promotion" },
  { id: "conseil", emoji: "\u{1F4A1}", label: "Conseil utile" },
  { id: "local", emoji: "\u{1F4CD}", label: "Post local" },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex-shrink-0 p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/30 transition-all group"
      title="Copier"
    >
      {copied ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
        </svg>
      )}
    </button>
  );
}

function repairJson(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.includes("__ERROR__")) {
    throw new Error(cleaned.split("__ERROR__")[1]);
  }
  // Remove markdown fences
  cleaned = cleaned.replace(/```json\s*/g, "").replace(/```\s*/g, "");
  // Remove trailing commas before } or ]
  cleaned = cleaned.replace(/,\s*([}\]])/g, "$1");
  return cleaned;
}

export default function QuickGeneratePage() {
  const [strategies, setStrategies] = useState<StrategyOption[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState("");
  const [typePost, setTypePost] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [legendes, setLegendes] = useState<string[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchStrategies() {
      try {
        const res = await fetch("/api/strategies");
        if (!res.ok) return;
        const data = await res.json();
        setStrategies(data);
      } catch {
        // ignore
      }
    }
    fetchStrategies();
  }, []);

  const selectedStrat = strategies.find((s) => s.id === selectedStrategy);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!typePost || !description) return;

    setLoading(true);
    setError("");
    setLegendes([]);

    try {
      const postTypeLabel = POST_TYPES.find((p) => p.id === typePost)?.label ?? typePost;

      const payload: Record<string, string> = {
        typePost: postTypeLabel,
        description,
      };

      if (selectedStrat) {
        payload.nomActivite = selectedStrat.nom_activite;
        payload.zone = selectedStrat.zone;
        if (selectedStrat.results?.icp?.icpResume) {
          payload.icpResume = selectedStrat.results.icp.icpResume;
        }
      }

      const res = await fetch("/api/quick-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erreur lors de la génération");

      const raw = await res.text();
      const repaired = repairJson(raw);
      const data = JSON.parse(repaired);

      if (data.legendes && Array.isArray(data.legendes)) {
        setLegendes(data.legendes);
      } else {
        throw new Error("Format de réponse inattendu");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-6 py-10 space-y-8">
      {/* Title */}
      <div className="text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          {"\u26A1"} Générateur{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
            rapide
          </span>
        </h2>
        <p className="text-slate-400 max-w-xl mx-auto">
          Tu as une photo ou une idée de post ? Dis-nous ce que c&apos;est et on écrit le texte pour toi.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1 — Type de post */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-white mb-1">
            Type de post
          </h3>
          <p className="text-sm text-slate-400 mb-4">
            Quel type de contenu veux-tu publier ?
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {POST_TYPES.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setTypePost(type.id)}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                  typePost === type.id
                    ? "bg-amber-600/20 border-amber-500/50 text-amber-300 shadow-md shadow-amber-500/10"
                    : "bg-slate-900/50 border-slate-700/30 text-slate-300 hover:border-slate-600 hover:text-white"
                }`}
              >
                <span className="text-lg">{type.emoji}</span>
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2 — Description */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-white mb-1">
            Décris ce que tu as en quelques mots
          </h3>
          <p className="text-sm text-slate-400 mb-4">
            Donne-nous le contexte pour personnaliser tes légendes.
          </p>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex : photo d'un volant sale puis propre après nettoyage"
            required
            rows={3}
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition resize-none"
          />
        </div>

        {/* Step 3 — Stratégie liée */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-white mb-1">
            Lier à une stratégie existante ?{" "}
            <span className="text-slate-500 font-normal">(optionnel)</span>
          </h3>
          <p className="text-sm text-slate-400 mb-4">
            AdBoost récupère automatiquement ton activité, ta zone et ton client cible pour personnaliser les légendes.
          </p>
          <select
            value={selectedStrategy}
            onChange={(e) => setSelectedStrategy(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition appearance-none"
          >
            <option value="" className="bg-slate-900">
              Aucune stratégie
            </option>
            {strategies.map((s) => (
              <option key={s.id} value={s.id} className="bg-slate-900">
                {s.nom_activite} — {s.zone}
              </option>
            ))}
          </select>
          {selectedStrat && (
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-2.5 py-1 text-xs bg-amber-500/15 text-amber-300 border border-amber-500/25 rounded-full">
                {selectedStrat.nom_activite}
              </span>
              <span className="px-2.5 py-1 text-xs bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 rounded-full">
                {selectedStrat.zone}
              </span>
              {selectedStrat.results?.icp?.icpResume && (
                <span className="px-2.5 py-1 text-xs bg-violet-500/15 text-violet-300 border border-violet-500/25 rounded-full">
                  ICP disponible
                </span>
              )}
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !typePost || !description}
          className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-amber-500/25"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Génération en cours...
            </>
          ) : (
            <>
              Générer mes légendes {"\u2192"}
            </>
          )}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-4 text-center">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Results */}
      {legendes.length > 0 && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-white">
              {"\u2728"} Tes 3 légendes sont prêtes
            </h3>
            <p className="text-slate-400 text-sm mt-1">
              Copie celle qui te plaît et colle-la sous ton post.
            </p>
          </div>

          <div className="space-y-3">
            {legendes.map((legende, i) => (
              <div
                key={i}
                className="flex items-start gap-3 bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-4 backdrop-blur-sm"
              >
                <span className="w-7 h-7 flex-shrink-0 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-bold mt-0.5">
                  {i + 1}
                </span>
                <p className="text-slate-200 flex-1 whitespace-pre-line text-sm leading-relaxed">
                  {legende}
                </p>
                <CopyButton text={legende} />
              </div>
            ))}
          </div>

          {/* Regenerate */}
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={loading}
            className="w-full py-3 bg-slate-800/50 border border-slate-700/50 hover:border-amber-500/50 text-slate-300 hover:text-amber-300 font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
            Générer 3 nouvelles légendes
          </button>
        </div>
      )}
    </main>
  );
}
