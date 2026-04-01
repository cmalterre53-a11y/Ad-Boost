import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ResultsDisplay from "./results-display";

export default async function ResultPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: strategy, error } = await supabase
    .from("strategies")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !strategy) {
    notFound();
  }

  const formData = {
    nomActivite: strategy.nom_activite,
    typeActivite: strategy.type_activite,
    zone: strategy.zone,
    cible: strategy.cible,
    budget: strategy.budget,
    objectif: strategy.objectif,
  };

  return <ResultsDisplay results={strategy.results} formData={formData} />;
}
