import { getDepartementFromCodeInsee } from '@app/web/utils/getDepartementFromCodeInsee'

export const getUserDepartement = (user: {
  emplois?: { structure: { codeInsee: string | null } }[]
}) => {
  const structure = user.emplois?.at(0)?.structure

  if (!structure?.codeInsee) throw new Error('Unable to get user departement')

  return getDepartementFromCodeInsee(structure.codeInsee)
}
