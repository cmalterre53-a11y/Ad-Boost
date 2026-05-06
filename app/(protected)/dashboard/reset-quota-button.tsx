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
      className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 hover:border-gray-300 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
    >
      {done
        ? "Quota réinitialisé"
        : loading
        ? "Réinitialisation..."
        : "Réinitialiser le quota"}
    </button>
  );
}
