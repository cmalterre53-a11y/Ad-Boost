"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface TextePub {
  accroche: string;
  description: string;
  cta: string;
}

interface Post {
  jour: string;
  heure: string;
  theme: string;
  typeContenu: string;
  conseilVisuel: string;
}

interface Semaine {
  semaine: number;
  posts: Post[];
}

interface Etape {
  numero: number;
  titre: string;
  description: string;
}

interface ConseilSuivi {
  titre: string;
  description: string;
}

interface Results {
  section1: {
    accroches: string[];
    textesPub: TextePub[];
    legendes: string[];
  };
  section2: {
    etapes: Etape[];
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

interface FormData {
  nomActivite: string;
  typeActivite: string;
  zone: string;
  cible: string;
  budget: string;
  objectif: string;
}

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

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-4 mb-6">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/20">
        {icon}
      </div>
      <div>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <p className="text-slate-400 text-sm mt-1">{subtitle}</p>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<Results | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("adboost_results");
    const storedForm = sessionStorage.getItem("adboost_form");
    if (!stored || !storedForm) {
      router.push("/");
      return;
    }
    setResults(JSON.parse(stored));
    setFormData(JSON.parse(storedForm));
  }, [router]);

  if (!results || !formData) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-violet-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a]">
      {/* Header */}
      <header className="border-b border-slate-700/50 px-6 py-5 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">
              Ad<span className="text-violet-400">Boost</span>
            </h1>
          </div>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white border border-slate-600/50 hover:border-slate-500 rounded-lg transition"
          >
            Nouvelle stratégie
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-10">
        {/* Recap */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-white mb-3">
            Stratégie pour{" "}
            <span className="text-violet-400">{formData.nomActivite}</span>
          </h2>
          <div className="flex flex-wrap gap-3">
            <span className="px-3 py-1 text-xs bg-violet-500/15 text-violet-300 border border-violet-500/25 rounded-full">
              {formData.typeActivite}
            </span>
            <span className="px-3 py-1 text-xs bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/25 rounded-full">
              {formData.zone}
            </span>
            <span className="px-3 py-1 text-xs bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 rounded-full">
              {formData.budget}
            </span>
            <span className="px-3 py-1 text-xs bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 rounded-full">
              {formData.objectif}
            </span>
          </div>
        </div>

        {/* Section 1 — Textes de pub */}
        <section className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
          <SectionHeader
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
            }
            title="Textes de pub"
            subtitle="Accroches, textes complets et légendes pour vos posts"
          />

          {/* Accroches courtes */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Accroches courtes (max 40 car.)
            </h3>
            <div className="space-y-2">
              {results.section1.accroches.map((accroche, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-slate-900/50 border border-slate-700/30 rounded-xl px-4 py-3"
                >
                  <span className="w-6 h-6 flex-shrink-0 rounded-full bg-violet-500/20 text-violet-400 text-xs flex items-center justify-center font-bold">
                    {i + 1}
                  </span>
                  <p className="text-slate-100 flex-1">{accroche}</p>
                  <CopyButton text={accroche} />
                </div>
              ))}
            </div>
          </div>

          {/* Textes complets */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Textes de pub complets
            </h3>
            <div className="space-y-4">
              {results.section1.textesPub.map((pub, i) => (
                <div
                  key={i}
                  className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-5"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h4 className="text-lg font-semibold text-white">
                      {pub.accroche}
                    </h4>
                    <CopyButton
                      text={`${pub.accroche}\n\n${pub.description}\n\n${pub.cta}`}
                    />
                  </div>
                  <p className="text-slate-300 mb-3 whitespace-pre-line">{pub.description}</p>
                  <p className="text-violet-400 font-medium">{pub.cta}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Légendes */}
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Idées de légendes pour posts organiques
            </h3>
            <div className="space-y-2">
              {results.section1.legendes.map((legende, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 bg-slate-900/50 border border-slate-700/30 rounded-xl px-4 py-3"
                >
                  <span className="w-6 h-6 flex-shrink-0 rounded-full bg-fuchsia-500/20 text-fuchsia-400 text-xs flex items-center justify-center font-bold mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-slate-300 flex-1">{legende}</p>
                  <CopyButton text={legende} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 2 — Guide Meta Ads */}
        <section className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
          <SectionHeader
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
              </svg>
            }
            title="Guide de configuration Meta Ads"
            subtitle="Étape par étape pour lancer votre campagne, même si vous n'avez jamais utilisé Meta Ads"
          />

          {/* Étapes détaillées */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Étapes pour lancer votre campagne
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {results.section2.etapes.map((etape) => (
                <div
                  key={etape.numero}
                  className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 flex-shrink-0 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white text-xs flex items-center justify-center font-bold shadow-lg shadow-violet-500/20">
                      {etape.numero}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-semibold text-sm mb-1">
                        {etape.titre}
                      </h4>
                      <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-line">
                        {etape.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Conseils de suivi */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Suivi et optimisation de votre campagne
            </h3>
            <div className="space-y-3">
              {results.section2.conseilsSuivi.map((conseil, i) => (
                <div
                  key={i}
                  className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4"
                >
                  <div className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                    </svg>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold text-sm mb-1">
                        {conseil.titre}
                      </h4>
                      <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-line">
                        {conseil.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Récap ciblage, budget, format */}
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            {/* Ciblage */}
            <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-fuchsia-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
                <h3 className="font-semibold text-white">Ciblage recommandé</h3>
              </div>
              <div className="space-y-1.5 text-sm">
                <p className="text-slate-300">
                  <span className="text-slate-500">Âge :</span> {results.section2.ciblage.age}
                </p>
                <p className="text-slate-300">
                  <span className="text-slate-500">Zone :</span> {results.section2.ciblage.zone}
                </p>
                <p className="text-slate-300">
                  <span className="text-slate-500">Exclusions :</span> {results.section2.ciblage.exclusions}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {results.section2.ciblage.interets.map((interet, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 text-xs bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/25 rounded-full"
                    >
                      {interet}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Budget */}
            <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                </svg>
                <h3 className="font-semibold text-white">Budget & répartition</h3>
              </div>
              <div className="space-y-1.5 text-sm">
                <p className="text-slate-300">
                  <span className="text-slate-500">Total :</span> {results.section2.budget.total}
                </p>
                <p className="text-slate-300">
                  <span className="text-slate-500">Par jour :</span> {results.section2.budget.budgetJournalier}
                </p>
                <p className="text-slate-300">
                  <span className="text-slate-500">Répartition :</span>{" "}
                  {results.section2.budget.repartition}
                </p>
                <p className="text-slate-300">
                  <span className="text-slate-500">Phase de test :</span>{" "}
                  {results.section2.budget.dureeTest}
                </p>
              </div>
            </div>

            {/* Format */}
            <div className="sm:col-span-2 bg-slate-900/50 border border-slate-700/30 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5A1.5 1.5 0 003.75 21z" />
                </svg>
                <h3 className="font-semibold text-white">Format recommandé</h3>
              </div>
              <p className="text-slate-300 text-sm">{results.section2.format}</p>
            </div>
          </div>

          {/* Conseils secteur */}
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Conseils spécifiques à votre secteur
            </h3>
            <div className="space-y-2">
              {results.section2.conseilsSecteur.map((conseil, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 bg-slate-900/50 border border-slate-700/30 rounded-xl px-4 py-3"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                  </svg>
                  <p className="text-slate-300 text-sm">{conseil}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3 — Calendrier */}
        <section className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
          <SectionHeader
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            }
            title="Calendrier de publication"
            subtitle="Planning sur 4 semaines pour vos réseaux sociaux"
          />

          <div className="space-y-6">
            {results.section3.semaines.map((semaine) => (
              <div key={semaine.semaine}>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-violet-500/20 text-violet-400 text-sm flex items-center justify-center font-bold">
                    S{semaine.semaine}
                  </span>
                  Semaine {semaine.semaine}
                </h3>
                <div className="grid sm:grid-cols-3 gap-3">
                  {semaine.posts.map((post, j) => (
                    <div
                      key={j}
                      className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white">
                          {post.jour}
                        </span>
                        <span className="text-xs text-slate-500">
                          {post.heure}
                        </span>
                      </div>
                      <p className="text-sm text-violet-400 font-medium">
                        {post.theme}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 text-xs bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 rounded-full">
                          {post.typeContenu}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{post.conseilVisuel}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
