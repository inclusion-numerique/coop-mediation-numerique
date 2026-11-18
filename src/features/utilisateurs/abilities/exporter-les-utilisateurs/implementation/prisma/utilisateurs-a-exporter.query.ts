import { prismaClient } from '@/configuration/prisma/prismaClient'
import {
  ligneUtilisateurSelect,
  ligneUtilisateurToDomain,
} from '@/features/utilisateurs/db/ligne-utilisateur.transfer'
import { utilisateursWhere } from '@/features/utilisateurs/db/utilisateurs.where'
import type {
  FiltresUtilisateurs,
  LigneUtilisateur,
} from '@/features/utilisateurs/domain'

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
