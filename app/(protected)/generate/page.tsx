"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const objectifs = [
  { value: "Remplir mon agenda / avoir des appels", label: "⚡ Remplir mon agenda / avoir des appels", description: "Tu veux des réservations et des contacts directs cette semaine." },
  { value: "Me faire connaître dans ma zone", label: "👁️ Me faire connaître dans ma zone", description: "Tu viens de te lancer ou tu veux toucher de nouveaux quartiers autour de toi." },
  { value: "Vendre une offre ou un service", label: "💰 Vendre une offre ou un service", description: "Tu as une promotion ou un service précis à mettre en avant maintenant." },
  { value: "Convaincre ceux qui hésitent", label: "💬 Convaincre ceux qui hésitent", description: "Les gens te connaissent mais n'ont pas encore sauté le pas." },
  { value: "Fidéliser mes clients existants", label: "❤️ Fidéliser mes clients existants", description: "Tu veux que tes anciens clients reviennent et parlent de toi." },
  { value: "Autre", label: "✏️ Autre", description: "Tu as un objectif spécifique en tête." },
];

export default function GeneratePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok || !res.body) {
        throw new Error("Le serveur a renvoyé une réponse invalide. Réessayez dans quelques instants.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullResponse += decoder.decode(value, { stream: true });
      }

      // Find the last "data: {...}" line which contains the result
      const lines = fullResponse.split("\n");
      let resultData = null;
      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i].trim();
        if (line.startsWith("data: ")) {
          try {
            resultData = JSON.parse(line.slice(6));
            break;
          } catch {
            continue;
          }
        }
      }

      if (!resultData) throw new Error("La génération a pris trop de temps. Réessayez.");
      if (resultData.error) throw new Error(resultData.error);
      if (!resultData.id) throw new Error("Aucun résultat reçu.");

      router.push(`/results/${resultData.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

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
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-violet-500/25"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Génération en cours...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
              Générer ma stratégie publicitaire
            </>
          )}
        </button>
      </form>
    </main>
  );
}
