import { type Departement } from '@app/web/data/collectivites-territoriales/departements'
import { getDepartementFromCodeInsee } from '@app/web/utils/getDepartementFromCodeInsee'

export const getUserDepartement = (user: {
  emplois?: { structure: { codeInsee: string | null } }[]
}): Departement | null => {
  const structure = user.emplois?.at(0)?.structure

  if (!structure?.codeInsee) {
    return null
  }

  return getDepartementFromCodeInsee(structure.codeInsee)
}
