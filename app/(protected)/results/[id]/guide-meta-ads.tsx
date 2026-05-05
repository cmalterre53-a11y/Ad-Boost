"use client";

import { useState } from "react";
import Link from "next/link";
import type { Results } from "@/lib/types";

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

const BLOCS = [
  { key: "zone" as const, emoji: "\u{1F4CD}", label: "Zone g\u00e9ographique" },
  { key: "audience" as const, emoji: "\u{1F465}", label: "Audience" },
  { key: "budget" as const, emoji: "\u{1F4B0}", label: "Budget" },
  { key: "objectif" as const, emoji: "\u{1F3AF}", label: "Objectif de campagne" },
  { key: "placements" as const, emoji: "\u{1F4F1}", label: "Placements" },
  { key: "contenu" as const, emoji: "\u{1F3A8}", label: "Contenu publicitaire" },
] as const;

export default function GuideMetaAds({
  section2,
}: {
  section2: Results["section2"];
}) {
  return (
    <section className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/20">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">
            Ce que tu dois rentrer dans Ads Manager
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Copie-colle ces infos directement dans ta campagne Facebook &amp; Instagram
          </p>
        </div>
      </div>

      {/* 6 blocs */}
      <div className="space-y-3 mb-8">
        {BLOCS.map(({ key, emoji, label }) => {
          const value = section2?.[key] ?? "";
          return (
            <div
              key={key}
              className="flex items-start gap-3 bg-slate-900/50 border border-slate-700/30 rounded-xl px-4 py-3"
            >
              <span className="text-xl flex-shrink-0 mt-0.5">{emoji}</span>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {label}
                </span>
                <p className="text-slate-100 text-sm mt-1 leading-relaxed whitespace-pre-line">
                  {value}
                </p>
              </div>
              {value && <CopyButton text={value} />}
            </div>
          );
        })}
      </div>

      {/* Encart Suivi */}
      <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">{"\u{1F4CA}"}</span>
          <div className="flex-1">
            <h3 className="text-white font-semibold text-lg mb-1">
              Suivre et am&eacute;liorer ta pub
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              Une fois ta campagne lanc&eacute;e, reviens ici dans 3 jours pour
              analyser tes r&eacute;sultats. On te dira si ta pub marche bien et
              quoi am&eacute;liorer.
            </p>
            <Link
              href="/tracking"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all"
            >
              Acc&eacute;der au suivi de ma pub
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
