import { prismaClient } from '@/configuration/prisma'
import type { InscritDeLaListe } from '@/features/utilisateurs/domain'
import {
  inscritDeLaListeSelect,
  inscritDeLaListeToDomain,
} from '@/features/utilisateurs/implementations/prisma/inscrit-de-la-liste.transfer'
import { inscritVivantWhere } from '@/features/utilisateurs/implementations/prisma/inscrit-vivant.where'

export const inscritAInscrire = async (
  utilisateurId: string,
): Promise<InscritDeLaListe | null> => {
  const ligne = await prismaClient.user.findFirst({
    where: { id: utilisateurId, ...inscritVivantWhere },
    select: inscritDeLaListeSelect,
  })

  return ligne === null ? null : inscritDeLaListeToDomain(ligne)
}
