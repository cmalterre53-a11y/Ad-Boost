"use client";

import { useEffect, useState, useCallback } from "react";
import type { TrackingAnalysis, CampaignTracking } from "@/lib/types";

interface StrategyOption {
  id: string;
  nom_activite: string;
  type_activite: string;
  zone: string;
  budget: string;
  objectif: string;
  created_at: string;
}

function verdictConfig(verdict: TrackingAnalysis["verdict"]) {
  switch (verdict) {
    case "excellent":
      return { emoji: "\u{1F680}", label: "Excellent", color: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/25" };
    case "correct":
      return { emoji: "\u{1F44D}", label: "Correct", color: "text-amber-400", bg: "bg-amber-500/15", border: "border-amber-500/25" };
    case "danger":
      return { emoji: "\u{1F6A8}", label: "Danger", color: "text-red-400", bg: "bg-red-500/15", border: "border-red-500/25" };
  }
}

function statusColor(status: "bon" | "moyen" | "mauvais") {
  switch (status) {
    case "bon":
      return "bg-emerald-500/15 text-emerald-300 border-emerald-500/25";
    case "moyen":
      return "bg-amber-500/15 text-amber-300 border-amber-500/25";
    case "mauvais":
      return "bg-red-500/15 text-red-300 border-red-500/25";
  }
}

export default function TrackingPage() {
  const [strategies, setStrategies] = useState<StrategyOption[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStrategies, setLoadingStrategies] = useState(true);
  const [analysis, setAnalysis] = useState<TrackingAnalysis | null>(null);
  const [history, setHistory] = useState<CampaignTracking[]>([]);
  const [form, setForm] = useState({
    impressions: "",
    clics: "",
    resultats: "",
    budget: "",
    jours: "",
  });

  // Charger les stratégies depuis Supabase
  useEffect(() => {
    async function fetchStrategies() {
      try {
        const res = await fetch("/api/strategies");
        if (!res.ok) return;
        const data = await res.json();
        setStrategies(data);
        if (data.length > 0) {
          setSelectedStrategy(data[0].id);
        }
      } finally {
        setLoadingStrategies(false);
      }
    }
    fetchStrategies();
  }, []);

  // Charger l'historique quand la stratégie change
  const fetchHistory = useCallback(async (strategyId: string) => {
    if (!strategyId) return;
    try {
      const res = await fetch(`/api/tracking/history?strategy_id=${strategyId}`);
      if (!res.ok) return;
      const data = await res.json();
      setHistory(data);
    } catch {
      setHistory([]);
    }
  }, []);

  useEffect(() => {
    if (selectedStrategy) {
      fetchHistory(selectedStrategy);
      setAnalysis(null);
    }
  }, [selectedStrategy, fetchHistory]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAnalysis(null);

    try {
      const payload = {
        impressions: parseInt(form.impressions),
        clics: parseInt(form.clics),
        resultats: parseInt(form.resultats),
        budget: parseFloat(form.budget),
        jours: form.jours ? parseInt(form.jours) : undefined,
      };

      // 1. Appel AdBoost pour l'analyse
      const res = await fetch("/api/tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          typeActivite: selectedStrat?.type_activite,
        }),
      });

      if (!res.ok) throw new Error("Erreur lors de l'analyse");

      const data: TrackingAnalysis = await res.json();
      setAnalysis(data);

      // 2. Sauvegarde dans Supabase
      await fetch("/api/tracking/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          strategy_id: selectedStrategy,
          ...payload,
          analysis: data,
        }),
      });

      // 3. Refresh historique
      await fetchHistory(selectedStrategy);
    } catch {
      alert("Une erreur est survenue lors de l'analyse. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const selectedStrat = strategies.find((s) => s.id === selectedStrategy);

  if (loadingStrategies) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin h-8 w-8 border-2 border-violet-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
      {/* Title */}
      <div className="text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Suivi de{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
            campagne
          </span>
        </h2>
        <p className="text-slate-400 max-w-xl mx-auto">
          Entrez vos métriques Meta Ads et obtenez un diagnostic AdBoost avec des
          recommandations concrètes.
        </p>
      </div>

      {strategies.length === 0 ? (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 text-center backdrop-blur-sm">
          <div className="w-16 h-16 rounded-2xl bg-slate-700/50 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Aucune stratégie sauvegardée
          </h3>
          <p className="text-slate-400 text-sm mb-6">
            Générez d&apos;abord une stratégie publicitaire pour pouvoir suivre ses performances.
          </p>
          <a
            href="/generate"
            className="inline-block px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-violet-500/25"
          >
            Créer une stratégie
          </a>
        </div>
      ) : (
        <>
          {/* Strategy selector */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
            <label className="text-sm font-medium text-slate-300 block mb-2">
              Stratégie à suivre
            </label>
            <select
              value={selectedStrategy}
              onChange={(e) => setSelectedStrategy(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition appearance-none"
            >
              {strategies.map((s) => (
                <option key={s.id} value={s.id} className="bg-slate-900">
                  {s.nom_activite} — {s.type_activite} ({new Date(s.created_at).toLocaleDateString("fr-FR")})
                </option>
              ))}
            </select>
            {selectedStrat && (
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="px-2.5 py-1 text-xs bg-violet-500/15 text-violet-300 border border-violet-500/25 rounded-full">
                  {selectedStrat.zone}
                </span>
                <span className="px-2.5 py-1 text-xs bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 rounded-full">
                  {selectedStrat.budget}
                </span>
                <span className="px-2.5 py-1 text-xs bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 rounded-full">
                  {selectedStrat.objectif}
                </span>
              </div>
            )}
          </div>

          {/* Metrics form */}
          <form
            onSubmit={handleSubmit}
            className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 sm:p-8 backdrop-blur-sm"
          >
            <h3 className="text-lg font-semibold text-white mb-1">
              Métriques de la campagne
            </h3>
            <p className="text-sm text-slate-400 mb-6">
              Retrouvez ces chiffres dans le Gestionnaire de publicités Meta.
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Impressions</label>
                <input
                  type="number"
                  name="impressions"
                  placeholder="Ex : 5000"
                  value={form.impressions}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Clics</label>
                <input
                  type="number"
                  name="clics"
                  placeholder="Ex : 150"
                  value={form.clics}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Résultats (leads / conversions)</label>
                <input
                  type="number"
                  name="resultats"
                  placeholder="Ex : 12"
                  value={form.resultats}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Budget dépensé (€)</label>
                <input
                  type="number"
                  name="budget"
                  placeholder="Ex : 50"
                  value={form.budget}
                  onChange={handleChange}
                  required
                  min="0.01"
                  step="0.01"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-slate-300">
                  Nombre de jours <span className="text-slate-500">(optionnel)</span>
                </label>
                <input
                  type="number"
                  name="jours"
                  placeholder="Ex : 7"
                  value={form.jours}
                  onChange={handleChange}
                  min="1"
                  className="w-full sm:w-1/2 px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-violet-500/25"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Analyse en cours...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                  Analyser mes résultats
                </>
              )}
            </button>
          </form>

          {/* Analysis result */}
          {analysis && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 sm:p-8 backdrop-blur-sm space-y-6">
              {/* Verdict */}
              {(() => {
                const v = verdictConfig(analysis.verdict);
                return (
                  <div className={`text-center p-6 rounded-xl ${v.bg} border ${v.border}`}>
                    <div className="text-5xl mb-2">{v.emoji}</div>
                    <h3 className={`text-2xl font-bold ${v.color}`}>{v.label}</h3>
                  </div>
                );
              })()}

              {/* Metric badges */}
              <div className="grid grid-cols-3 gap-3">
                {(["ctr", "cpc", "cpr"] as const).map((key) => {
                  const m = analysis.metriques[key];
                  return (
                    <div key={key} className={`text-center p-4 rounded-xl border ${statusColor(m.status)}`}>
                      <div className="text-xs font-semibold uppercase tracking-wider mb-1 opacity-80">
                        {key.toUpperCase()}
                      </div>
                      <div className="text-lg font-bold">{m.label}</div>
                      <div className="text-xs capitalize mt-0.5">{m.status}</div>
                    </div>
                  );
                })}
              </div>

              {/* Diagnostic */}
              <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-5">
                <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Diagnostic</h4>
                <p className="text-slate-200 leading-relaxed">{analysis.diagnostic}</p>
              </div>

              {/* Action */}
              <div className="bg-violet-500/10 border border-violet-500/25 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-semibold text-violet-300 uppercase tracking-wider mb-1">Action prioritaire</h4>
                    <p className="text-slate-200 leading-relaxed">{analysis.action}</p>
                  </div>
                </div>
              </div>

              {/* Conseil */}
              <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-semibold text-amber-300 uppercase tracking-wider mb-1">Conseil bonus</h4>
                    <p className="text-slate-300 leading-relaxed">{analysis.conseil}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-white">Historique des analyses</h3>
              </div>

              <div className="space-y-3">
                {history.map((entry) => {
                  const v = verdictConfig(entry.analysis.verdict);
                  return (
                    <div key={entry.id} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{v.emoji}</span>
                          <span className={`text-sm font-semibold ${v.color}`}>{v.label}</span>
                        </div>
                        <span className="text-xs text-slate-500">
                          {new Date(entry.created_at).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className={`px-2 py-0.5 text-xs rounded-full border ${statusColor(entry.analysis.metriques.ctr.status)}`}>
                          CTR {entry.analysis.metriques.ctr.label}
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded-full border ${statusColor(entry.analysis.metriques.cpc.status)}`}>
                          CPC {entry.analysis.metriques.cpc.label}
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded-full border ${statusColor(entry.analysis.metriques.cpr.status)}`}>
                          CPR {entry.analysis.metriques.cpr.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {entry.impressions.toLocaleString("fr-FR")} imp. · {entry.clics} clics · {entry.resultats} résultats · {entry.budget}€
                        {entry.jours ? ` · ${entry.jours}j` : ""}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}
