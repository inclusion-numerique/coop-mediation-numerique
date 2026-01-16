import { getDepartementCodeFromCodeInsee } from '@app/web/utils/getDepartementFromCodeInsee'

const DEFAULT_DEPARTEMENT_CODE = '75'

export const getDepartementCodeForLieu = (lieu: {
  codeInsee: string | null
}): string => {
  if (!lieu.codeInsee) return DEFAULT_DEPARTEMENT_CODE
  return getDepartementCodeFromCodeInsee(lieu.codeInsee)
}
