import { getDepartementCodeFromCodeInsee } from '@app/web/utils/getDepartementFromCodeInsee'

const DEFAULT_DEPARTEMENT_CODE = '75'

// Get departement code from a user's emploi structure or lieu d'activité codeInsee
export const getDepartementCodeForActeur = (acteur: {
  emplois?: { structure: { codeInsee: string | null } }[]
  mediateur?: {
    enActivite?: { structure: { codeInsee: string | null } }[]
  } | null
}): string => {
  // Priority 1: emploi structure
  const emploiCodeInsee = acteur.emplois?.at(0)?.structure.codeInsee
  if (emploiCodeInsee) return getDepartementCodeFromCodeInsee(emploiCodeInsee)

  // Priority 2: lieu d'activité
  const lieuCodeInsee = acteur.mediateur?.enActivite?.at(0)?.structure.codeInsee
  if (lieuCodeInsee) return getDepartementCodeFromCodeInsee(lieuCodeInsee)

  return DEFAULT_DEPARTEMENT_CODE
}
