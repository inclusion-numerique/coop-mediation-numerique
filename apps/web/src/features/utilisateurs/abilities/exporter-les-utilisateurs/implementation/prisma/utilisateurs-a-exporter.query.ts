import {
  ligneUtilisateurSelect,
  ligneUtilisateurToDomain,
} from '@app/web/features/utilisateurs/db/ligne-utilisateur.transfer'
import { utilisateursWhere } from '@app/web/features/utilisateurs/db/utilisateurs.where'
import type {
  FiltresUtilisateurs,
  LigneUtilisateur,
} from '@app/web/features/utilisateurs/domain'
import { prismaClient } from '@app/web/prismaClient'

export const utilisateursAExporter = async ({
  mots,
  filtres,
  maintenant,
}: {
  readonly mots: readonly string[]
  readonly filtres: FiltresUtilisateurs
  readonly maintenant: Date
}): Promise<readonly LigneUtilisateur[]> => {
  const lignes = await prismaClient.user.findMany({
    where: utilisateursWhere({ mots, filtres, maintenant }),
    select: ligneUtilisateurSelect,
    orderBy: [{ created: 'desc' }, { lastName: 'asc' }],
  })

  return lignes.map((ligne) => ligneUtilisateurToDomain(ligne, maintenant))
}
