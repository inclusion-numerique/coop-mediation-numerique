import { prismaClient } from '@/configuration/prisma'
import {
  etatDuCompte,
  nomAffiche,
  UtilisateurId,
} from '@/features/utilisateurs/domain'
import { identiteToDomain } from '@/features/utilisateurs/implementations/prisma/identite.transfer'
import type { CompteTrouve } from '../../domain'

const contient = (mot: string) =>
  ({ contains: mot, mode: 'insensitive' }) as const

export const rechercherDesComptesAFusionner = async ({
  recherche,
  cibleId,
}: {
  readonly recherche: string
  readonly cibleId: string
}): Promise<readonly CompteTrouve[]> => {
  const comptes = await prismaClient.user.findMany({
    where: {
      id: { not: cibleId },
      AND: recherche
        .split(' ')
        .filter((mot) => mot !== '')
        .map((mot) => ({
          OR: [
            { firstName: contient(mot) },
            { lastName: contient(mot) },
            { name: contient(mot) },
            { email: contient(mot) },
          ],
        })),
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      name: true,
      email: true,
      deleted: true,
    },
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    take: 20,
  })

  return comptes.map((compte) => {
    const identite = identiteToDomain(compte)

    return {
      id: UtilisateurId(compte.id),
      nom: nomAffiche(identite),
      courriel: identite.courriel,
      etat: etatDuCompte(compte.deleted),
    }
  })
}
