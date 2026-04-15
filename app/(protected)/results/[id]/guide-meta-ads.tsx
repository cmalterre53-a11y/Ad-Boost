"use client";

import { useState } from "react";
import type { Results } from "@/lib/types";

const STEP_EMOJIS = ["🔑", "🎯", "💰", "🔄", "👥", "🎨", "🚀"];

function splitIntoCheckableItems(text: string): string[] {
  return text
    .split(/(?<=\.)\s+|\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export default function GuideMetaAds({
  section2,
}: {
  section2: Results["section2"];
}) {
  const totalSteps = section2.etapes.length;
  const [currentStep, setCurrentStep] = useState(0);
  const [checkedItems, setCheckedItems] = useState<Record<number, Set<string>>>(
    {}
  );
  const [subStepChoice, setSubStepChoice] = useState<
    Record<number, string | null>
  >({});
  const [openAccordions, setOpenAccordions] = useState<
    Record<number, Set<string>>
  >({});

  const etape = currentStep < totalSteps ? section2.etapes[currentStep] : null;

  // Build checkable items for the current step
  const getItemsForStep = (stepIndex: number) => {
    const step = section2.etapes[stepIndex];
    if (!step) return [];
    const items: string[] = [];

    // Main content
    if (step.contenu) {
      items.push(...splitIntoCheckableItems(step.contenu));
    }

    // Sub-steps content (for step 0 with choice, only show chosen path)
    if (step.sousEtapes && step.sousEtapes.length > 0) {
      if (stepIndex === 0) {
        const choice = subStepChoice[0];
        if (choice === "existing") {
          // 0b + 0c
          step.sousEtapes
            .filter((s) => s.id === "0b" || s.id === "0c")
            .forEach((sub) => {
              items.push(...splitIntoCheckableItems(sub.contenu));
            });
        } else if (choice === "new") {
          // 0a + 0c
          step.sousEtapes
            .filter((s) => s.id === "0a" || s.id === "0c")
            .forEach((sub) => {
              items.push(...splitIntoCheckableItems(sub.contenu));
            });
        }
      } else {
        // For other steps, include opened accordion sub-steps
        const opened = openAccordions[stepIndex];
        if (opened) {
          step.sousEtapes
            .filter((s) => opened.has(s.id))
            .forEach((sub) => {
              items.push(...splitIntoCheckableItems(sub.contenu));
            });
        }
      }
    }

    return items;
  };

  const currentItems = etape ? getItemsForStep(currentStep) : [];
  const checked = checkedItems[currentStep] ?? new Set<string>();
  const allChecked =
    currentItems.length > 0 && currentItems.every((_, i) => checked.has(String(i)));

  const toggleCheck = (itemIndex: number) => {
    setCheckedItems((prev) => {
      const stepSet = new Set(prev[currentStep] ?? []);
      const key = String(itemIndex);
      if (stepSet.has(key)) {
        stepSet.delete(key);
      } else {
        stepSet.add(key);
      }
      return { ...prev, [currentStep]: stepSet };
    });
  };

  const toggleAccordion = (stepIndex: number, subId: string) => {
    setOpenAccordions((prev) => {
      const stepSet = new Set(prev[stepIndex] ?? []);
      if (stepSet.has(subId)) {
        stepSet.delete(subId);
      } else {
        stepSet.add(subId);
      }
      return { ...prev, [stepIndex]: stepSet };
    });
  };

  const goNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((s) => s + 1);
    }
  };

  const goPrev = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  // Congratulations screen
  if (currentStep >= totalSteps) {
    return (
      <section className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-white mb-3">
            Bravo ! Ta campagne est lancée !
          </h2>
          <p className="text-slate-400 text-lg mb-8">
            Reviens dans 3 jours pour analyser tes premiers résultats.
          </p>
        </div>

        {/* Conseils de suivi */}
        {section2.conseilsSuivi.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Conseils de suivi
            </h3>
            <div className="space-y-3">
              {section2.conseilsSuivi.map((conseil, i) => (
                <div
                  key={i}
                  className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4"
                >
                  <div className="flex items-start gap-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                      />
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
        )}

        {/* Conseils secteur */}
        {section2.conseilsSecteur.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Bonus — Conseils pour ton secteur
            </h3>
            <div className="space-y-2">
              {section2.conseilsSecteur.map((conseil, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 bg-slate-900/50 border border-slate-700/30 rounded-xl px-4 py-3"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
                    />
                  </svg>
                  <p className="text-slate-300 text-sm">{conseil}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Note interface */}
        {section2.noteInterface && (
          <div className="mb-8 bg-violet-500/10 border border-violet-500/20 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                />
              </svg>
              <div>
                <h4 className="text-violet-300 font-semibold text-sm mb-2">
                  Note sur l&apos;interface Meta
                </h4>
                <div className="text-slate-300 text-xs leading-relaxed whitespace-pre-line">
                  {section2.noteInterface}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-between">
          <button
            onClick={goPrev}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white border border-slate-700/50 hover:border-slate-600 transition-all"
          >
            ← Étape précédente
          </button>
          <a
            href="/dashboard"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all"
          >
            Retour au tableau de bord
          </a>
        </div>
      </section>
    );
  }

  // Determine badges for current step
  const renderBadges = () => {
    const badges: { emoji: string; label: string }[] = [];

    if (currentStep === 2) {
      // Budget badges
      if (section2.budget.budgetJournalier)
        badges.push({ emoji: "💰", label: section2.budget.budgetJournalier });
      if (section2.budget.dureeTest)
        badges.push({ emoji: "⏱️", label: section2.budget.dureeTest });
    }

    if (currentStep === 4) {
      // Ciblage badges
      if (section2.ciblage.age)
        badges.push({ emoji: "👥", label: section2.ciblage.age });
      if (section2.ciblage.zone)
        badges.push({ emoji: "📍", label: section2.ciblage.zone });
    }

    if (currentStep === 5) {
      // Format badge
      if (section2.format)
        badges.push({ emoji: "🎨", label: section2.format });
    }

    if (badges.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {badges.map((badge, i) => (
          <span
            key={i}
            className="px-3 py-1.5 text-sm bg-violet-500/15 text-violet-300 border border-violet-500/25 rounded-full"
          >
            {badge.emoji} {badge.label}
          </span>
        ))}
      </div>
    );
  };

  return (
    <section className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-center gap-2 mb-3">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                i === currentStep
                  ? "bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30 scale-110"
                  : i < currentStep
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-slate-700/50 text-slate-500 border border-slate-600/30"
              }`}
            >
              {i < currentStep ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              ) : (
                i + 1
              )}
            </button>
          ))}
        </div>
        <p className="text-center text-sm text-slate-400">
          Étape {currentStep + 1} sur {totalSteps} —{" "}
          {STEP_EMOJIS[currentStep] ?? ""} {etape!.titre}
        </p>
      </div>

      {/* Step title */}
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="text-3xl">{STEP_EMOJIS[currentStep] ?? "📋"}</span>
          {etape!.titre}
        </h2>
      </div>

      {/* Badges */}
      {renderBadges()}

      {/* Step 0: Accordion choice */}
      {currentStep === 0 && etape!.sousEtapes && etape!.sousEtapes.length > 0 && (
        <div className="mb-5">
          <p className="text-sm text-slate-400 mb-3">
            Choisis ta situation pour voir les instructions adaptées :
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setSubStepChoice((prev) => ({ ...prev, 0: "existing" }));
                setCheckedItems((prev) => ({ ...prev, 0: new Set() }));
              }}
              className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold border transition-all ${
                subStepChoice[0] === "existing"
                  ? "bg-violet-500/20 border-violet-500/50 text-violet-300"
                  : "bg-slate-900/50 border-slate-700/30 text-slate-400 hover:text-white hover:border-slate-600"
              }`}
            >
              🔘 J&apos;ai déjà un compte
            </button>
            <button
              onClick={() => {
                setSubStepChoice((prev) => ({ ...prev, 0: "new" }));
                setCheckedItems((prev) => ({ ...prev, 0: new Set() }));
              }}
              className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold border transition-all ${
                subStepChoice[0] === "new"
                  ? "bg-violet-500/20 border-violet-500/50 text-violet-300"
                  : "bg-slate-900/50 border-slate-700/30 text-slate-400 hover:text-white hover:border-slate-600"
              }`}
            >
              🔘 Je n&apos;ai pas de compte
            </button>
          </div>
        </div>
      )}

      {/* Accordion for other steps with sub-steps */}
      {currentStep !== 0 &&
        etape!.sousEtapes &&
        etape!.sousEtapes.length > 0 && (
          <div className="mb-5 space-y-2">
            {etape!.sousEtapes.map((sub) => {
              const isOpen =
                openAccordions[currentStep]?.has(sub.id) ?? false;
              return (
                <div
                  key={sub.id}
                  className="bg-slate-900/50 border border-slate-700/30 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => {
                      toggleAccordion(currentStep, sub.id);
                      // Reset checked items when accordion changes
                      setCheckedItems((prev) => ({
                        ...prev,
                        [currentStep]: new Set(),
                      }));
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-xs font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30 rounded-md">
                        {sub.id}
                      </span>
                      <span className="text-white font-semibold text-sm">
                        {sub.titre}
                      </span>
                    </div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-3 text-slate-300 text-sm leading-relaxed border-t border-slate-700/20 pt-3">
                      {sub.contenu.split("\n").map((line, i) => {
                        if (
                          line.startsWith("IMPORTANT") ||
                          line.startsWith("RÈGLE") ||
                          line.startsWith("CONSEIL")
                        ) {
                          return (
                            <p
                              key={i}
                              className="text-amber-300 font-medium mt-1"
                            >
                              {line}
                            </p>
                          );
                        }
                        if (line.startsWith("•")) {
                          return (
                            <p key={i} className="pl-2 text-slate-300">
                              {line}
                            </p>
                          );
                        }
                        return <p key={i}>{line}</p>;
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      {/* Checkable items */}
      {currentItems.length > 0 && (
        <div className="space-y-2 mb-6">
          {currentItems.map((item, i) => {
            const isChecked = checked.has(String(i));
            return (
              <button
                key={i}
                onClick={() => toggleCheck(i)}
                className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-300 ${
                  isChecked
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : "bg-slate-900/50 border-slate-700/30 hover:border-slate-600/50"
                }`}
              >
                <div
                  className={`w-5 h-5 flex-shrink-0 rounded-md border-2 flex items-center justify-center mt-0.5 transition-all duration-300 ${
                    isChecked
                      ? "bg-emerald-500 border-emerald-500"
                      : "border-slate-600"
                  }`}
                >
                  {isChecked && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-3 h-3 text-white animate-checkmark"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={3}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                  )}
                </div>
                <span
                  className={`text-sm leading-relaxed transition-all duration-300 ${
                    isChecked
                      ? "line-through text-emerald-400"
                      : "text-slate-300"
                  }`}
                >
                  {item}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Show main content if no checkable items yet (step 0 without choice) */}
      {currentItems.length === 0 && etape!.contenu && (
        <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line mb-6">
          {etape!.contenu.split("\n").map((line, i) => {
            if (
              line.startsWith("IMPORTANT") ||
              line.startsWith("RÈGLE") ||
              line.startsWith("CONSEIL")
            ) {
              return (
                <p key={i} className="text-amber-300 font-medium mt-1">
                  {line}
                </p>
              );
            }
            if (line.startsWith("•")) {
              return (
                <p key={i} className="pl-2 text-slate-300">
                  {line}
                </p>
              );
            }
            return <p key={i}>{line}</p>;
          })}
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between items-center pt-4 border-t border-slate-700/30">
        <button
          onClick={goPrev}
          disabled={currentStep === 0}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            currentStep === 0
              ? "text-slate-600 cursor-not-allowed"
              : "text-slate-400 hover:text-white border border-slate-700/50 hover:border-slate-600"
          }`}
        >
          ← Précédente
        </button>

        <span className="text-xs text-slate-500">
          {checked.size}/{currentItems.length} complétées
        </span>

        <button
          onClick={goNext}
          disabled={!allChecked}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            allChecked
              ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
              : "bg-slate-700/50 text-slate-500 cursor-not-allowed"
          }`}
        >
          {currentStep === totalSteps - 1 ? "Terminer 🎉" : "Suivante →"}
        </button>
      </div>
    </section>
  );
}
