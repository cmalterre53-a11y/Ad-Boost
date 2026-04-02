import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import DeleteButton from "./delete-button";

export default async function DashboardPage() {
  const supabase = createClient();

  const { data: strategies } = await supabase
    .from("strategies")
    .select("id, nom_activite, type_activite, objectif, created_at")
    .order("created_at", { ascending: false });

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white">Mes stratégies</h2>
          <p className="text-slate-400 mt-1">
            Retrouvez toutes vos stratégies publicitaires générées par l&apos;IA.
          </p>
        </div>
        <Link
          href="/generate"
          className="px-5 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-violet-500/25 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nouvelle stratégie
        </Link>
      </div>

      {!strategies || strategies.length === 0 ? (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-12 text-center backdrop-blur-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <h3 className="text-xl font-semibold text-white mb-2">
            Aucune stratégie pour le moment
          </h3>
          <p className="text-slate-400 mb-6">
            Créez votre première stratégie publicitaire en quelques clics.
          </p>
          <Link
            href="/generate"
            className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-violet-500/25"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            Créer ma première stratégie
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {strategies.map((strategy) => (
            <Link
              key={strategy.id}
              href={`/results/${strategy.id}`}
              className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm hover:border-violet-500/30 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white group-hover:text-violet-400 transition-colors truncate">
                    {strategy.nom_activite}
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-3 py-1 text-xs bg-violet-500/15 text-violet-300 border border-violet-500/25 rounded-full">
                      {strategy.type_activite}
                    </span>
                    <span className="px-3 py-1 text-xs bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 rounded-full">
                      {strategy.objectif}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">
                    {new Date(strategy.created_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                  <DeleteButton id={strategy.id} />
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-slate-600 group-hover:text-violet-400 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
