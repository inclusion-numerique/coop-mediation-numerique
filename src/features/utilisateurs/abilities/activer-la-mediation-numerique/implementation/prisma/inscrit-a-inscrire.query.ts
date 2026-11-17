import {
  inscritDeLaListeSelect,
  inscritDeLaListeToDomain,
} from '@/features/utilisateurs/db/inscrit-de-la-liste.transfer'
import { inscritVivantWhere } from '@/features/utilisateurs/db/inscrit-vivant.where'
import type { InscritDeLaListe } from '@/features/utilisateurs/domain'
import { prismaClient } from '@/prismaClient'

export const inscritAInscrire = async (
  utilisateurId: string,
): Promise<InscritDeLaListe | null> => {
  const ligne = await prismaClient.user.findFirst({
    where: { id: utilisateurId, ...inscritVivantWhere },
    select: inscritDeLaListeSelect,
  })

  return ligne === null ? null : inscritDeLaListeToDomain(ligne)
}
