import type { Analysis } from '@/features/beneficiaire/abilities/importer-beneficiaires/implementations/prisma/analyse-de-l-import'

// Contrat de la réponse d'analyse, partagé entre la route handler (qui la
// produit) et l'UI (qui la stocke puis la relit). Possédé par la feature pour
// éviter une dépendance UI → route app.
export type AnalyseResponse = {
  analysis: Analysis
  id: string
}

const getStorageKey = (id: string) => `beneficiaire-import-analysis-${id}`

export const storeBeneficiaireImportAnalysis = ({
  id,
  analysis,
}: AnalyseResponse) => {
  sessionStorage.setItem(getStorageKey(id), JSON.stringify(analysis))
}

export const getBeneficiaireImportAnalysis = (
  id: string,
): AnalyseResponse | null => {
  const analysis = sessionStorage.getItem(getStorageKey(id))
  return analysis
    ? { analysis: JSON.parse(analysis) as AnalyseResponse['analysis'], id }
    : null
}
