"use client";

import { useState } from "react";
import type { Results, FormData } from "@/lib/types";
import GuideMetaAds from "./guide-meta-ads";

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

const JOURS_MAP: Record<string, number> = {
  "Lundi": 1, "Mardi": 2, "Mercredi": 3, "Jeudi": 4, "Vendredi": 5, "Samedi": 6, "Dimanche": 0,
};

const MOIS_FR = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];

const SEMAINE_THEMES = [
  "Notoriété",
  "Preuve sociale",
  "Engagement",
  "Conversion",
];

function getPostDate(createdAt: string, weekIndex: number, jourName: string): string {
  const base = new Date(createdAt);
  // Find next Monday after creation date
  const dayOfWeek = base.getDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek);
  const firstMonday = new Date(base);
  firstMonday.setDate(base.getDate() + daysUntilMonday);
  // Add weeks
  const weekStart = new Date(firstMonday);
  weekStart.setDate(firstMonday.getDate() + weekIndex * 7);
  // Add day offset from Monday
  const targetDay = JOURS_MAP[jourName] ?? 1;
  const dayOffset = targetDay === 0 ? 6 : targetDay - 1; // Monday=0 offset
  const postDate = new Date(weekStart);
  postDate.setDate(weekStart.getDate() + dayOffset);
  return `${jourName} ${postDate.getDate()} ${MOIS_FR[postDate.getMonth()]}`;
}

export default function ResultsDisplay({
  results,
  formData,
  createdAt,
}: {
  results: Results;
  formData: FormData;
  createdAt: string;
}) {
  const [activeTab, setActiveTab] = useState<"textes" | "guide" | "calendrier">("textes");
  const [showFullIcp, setShowFullIcp] = useState(false);

  const tabs = [
    { id: "textes" as const, label: "Textes de pub", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    )},
    { id: "guide" as const, label: "Guide Meta Ads", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
      </svg>
    )},
    { id: "calendrier" as const, label: "Calendrier", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    )},
  ];

  return (
    <main className="max-w-5xl mx-auto px-6 py-10 space-y-6">
      {/* Recap */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-white mb-3">
          Stratégie pour{" "}
          <span className="text-violet-400">{formData.nomActivite}</span>
        </h2>
        <div className="flex flex-wrap gap-3 mb-4">
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
        {results.icp && (
          <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl px-4 py-3">
            <div className="flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              <div className="flex-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Client cible (ICP)</span>
                {typeof results.icp === "string" ? (
                  <p className="text-slate-300 text-sm mt-1">{results.icp}</p>
                ) : (
                  <>
                    {/* Version courte */}
                    <p className="text-slate-300 text-sm mt-2 leading-relaxed">
                      {results.icp?.icpResume
                        ? results.icp.icpResume
                        : `Ton client idéal : ${results.icp?.profil || ""}. Son problème principal : ${results.icp?.probleme || ""}. Ce qui le déclenche : ${results.icp?.declencheur || ""}. Où le toucher : ${results.icp?.presence || ""}.`
                      }
                    </p>

                    {/* Toggle button */}
                    <button
                      type="button"
                      onClick={() => setShowFullIcp(!showFullIcp)}
                      className="mt-2 text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors"
                    >
                      {showFullIcp ? "- Masquer le profil complet" : "+ Voir le profil complet"}
                    </button>

                    {/* Version complète */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        showFullIcp ? "max-h-[1000px] opacity-100 mt-3" : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="border-l-2 border-violet-500/30 pl-4 space-y-2 text-sm">
                        {results.icp?.profil && <p className="text-slate-300"><span className="text-slate-400 font-medium">Profil :</span> {results.icp.profil}</p>}
                        {results.icp?.probleme && <p className="text-slate-300"><span className="text-slate-400 font-medium">Problème :</span> {results.icp.probleme}</p>}
                        {results.icp?.aspiration && <p className="text-slate-300"><span className="text-slate-400 font-medium">Aspiration :</span> {results.icp.aspiration}</p>}
                        {Array.isArray(results.icp?.objections) && <p className="text-slate-300"><span className="text-slate-400 font-medium">Objections :</span> {results.icp.objections.join(" · ")}</p>}
                        {Array.isArray(results.icp?.mots) && <p className="text-slate-300"><span className="text-slate-400 font-medium">Ses mots :</span> {results.icp.mots.map((m) => `"${m}"`).join(", ")}</p>}
                        {results.icp?.declencheur && <p className="text-slate-300"><span className="text-slate-400 font-medium">Déclencheur :</span> {results.icp.declencheur}</p>}
                        {results.icp?.presence && <p className="text-slate-300"><span className="text-slate-400 font-medium">Présence en ligne :</span> {results.icp.presence}</p>}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-800/50 border border-slate-700/50 rounded-xl p-1.5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/25"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Section 1 — Textes de pub */}
      {activeTab === "textes" && (
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
            {(results.section1?.accroches ?? []).map((accroche, i) => (
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

        {/* Visuels (prompts image) */}
        {results.section1.visuels && results.section1.visuels.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Visuels — Prompts de génération d&apos;image
          </h3>
          <div className="space-y-4">
            {results.section1.visuels.map((visuel, i) => (
              <div key={i} className="space-y-2">
                {/* Titre / texte du visuel */}
                <div className="flex items-center gap-3 bg-slate-900/50 border border-slate-700/30 rounded-xl px-4 py-3">
                  <span className="w-6 h-6 flex-shrink-0 rounded-full bg-cyan-500/20 text-cyan-400 text-xs flex items-center justify-center font-bold">
                    {i + 1}
                  </span>
                  <p className="text-white font-medium text-sm flex-1">{visuel.titre}</p>
                  <CopyButton text={visuel.titre} />
                </div>
                {/* Prompt image */}
                <div className="flex items-center gap-3 bg-slate-900/50 border border-slate-700/30 rounded-xl px-4 py-3 ml-4">
                  <span className="text-xs font-semibold text-cyan-400/70 uppercase tracking-wider flex-shrink-0">Prompt</span>
                  <p className="text-slate-400 text-xs flex-1">{visuel.promptImage}</p>
                  <CopyButton text={visuel.promptImage} />
                </div>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* Textes de pub */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Textes de pub
          </h3>
          <div className="space-y-2">
            {(results.section1?.textesPub ?? []).map((pub, i) => (
              <div key={i} className="space-y-2">
                {/* Accroche */}
                <div className="flex items-center gap-3 bg-slate-900/50 border border-slate-700/30 rounded-xl px-4 py-3">
                  <span className="w-6 h-6 flex-shrink-0 rounded-full bg-violet-500/20 text-violet-400 text-xs flex items-center justify-center font-bold">
                    {i + 1}
                  </span>
                  <p className="text-white font-medium flex-1">{pub.accroche}</p>
                  <CopyButton text={pub.accroche} />
                </div>
                {/* Description */}
                <div className="flex items-start gap-3 bg-slate-900/50 border border-slate-700/30 rounded-xl px-4 py-3 ml-4">
                  <p className="text-slate-300 text-sm flex-1 whitespace-pre-line">{pub.description}</p>
                  <CopyButton text={pub.description} />
                </div>
                {/* CTA */}
                <div className="flex items-center gap-3 bg-slate-900/50 border border-slate-700/30 rounded-xl px-4 py-3 ml-4 mb-4">
                  <p className="text-violet-400 font-medium text-sm flex-1">{pub.cta}</p>
                  <CopyButton text={pub.cta} />
                </div>
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
            {(results.section1?.legendes ?? []).map((legende, i) => (
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
      )}

      {/* Section 2 — Guide Meta Ads */}
      {activeTab === "guide" && <GuideMetaAds section2={results.section2} />}

      {/* Section 3 — Calendrier */}
      {activeTab === "calendrier" && (
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
          {(results.section3?.semaines ?? []).map((semaine, idx) => (
            <div key={semaine?.semaine ?? idx}>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-violet-500/20 text-violet-400 text-sm flex items-center justify-center font-bold">
                  S{semaine?.semaine ?? idx + 1}
                </span>
                <span>Semaine {semaine?.semaine ?? idx + 1}</span>
                {SEMAINE_THEMES[idx] && (
                  <span className="px-2 py-0.5 text-xs bg-violet-500/15 text-violet-300 border border-violet-500/25 rounded-full">
                    {SEMAINE_THEMES[idx]}
                  </span>
                )}
              </h3>
              <div className="grid sm:grid-cols-3 gap-3">
                {(Array.isArray(semaine?.posts) ? semaine.posts : []).map((post, j) => (
                  <div
                    key={j}
                    className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white">
                        {createdAt ? getPostDate(createdAt, idx, post?.jour ?? "Lundi") : (post?.jour ?? "—")}
                      </span>
                      <span className="text-xs text-slate-500">
                        {post?.heure ?? ""}
                      </span>
                    </div>
                    <p className="text-sm text-violet-400 font-medium">
                      {post?.theme ?? ""}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 text-xs bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 rounded-full">
                        {post?.typeContenu ?? ""}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{post?.conseilVisuel ?? ""}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      )}
    </main>
  );
}
