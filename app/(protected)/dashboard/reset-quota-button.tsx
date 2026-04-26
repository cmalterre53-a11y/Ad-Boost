"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetQuotaButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleReset = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/subscription/reset", { method: "POST" });
      if (res.ok) {
        setDone(true);
        router.refresh();
        setTimeout(() => setDone(false), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleReset}
      disabled={loading}
      className="text-xs text-slate-600 hover:text-slate-400 border border-slate-700/50 hover:border-slate-600 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
    >
      {done
        ? "Quota réinitialisé"
        : loading
        ? "Réinitialisation..."
        : "Réinitialiser le quota"}
    </button>
  );
}
