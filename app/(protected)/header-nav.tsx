"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HeaderNav({ email }: { email: string }) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="border-b border-slate-700/50 px-6 py-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">
            Ad<span className="text-violet-400">Boost</span>
          </h1>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/tracking"
            className="px-4 py-2 text-sm text-slate-400 hover:text-white border border-slate-600/50 hover:border-slate-500 rounded-lg transition"
          >
            Suivi
          </Link>
          <span className="text-sm text-slate-400 hidden sm:block">{email}</span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white border border-slate-600/50 hover:border-slate-500 rounded-lg transition"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </header>
  );
}
