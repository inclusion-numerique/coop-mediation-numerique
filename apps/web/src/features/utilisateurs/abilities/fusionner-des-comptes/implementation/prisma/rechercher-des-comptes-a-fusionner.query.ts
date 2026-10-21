import { nomAffiche } from '@app/web/features/utilisateurs/domain'
import { prismaClient } from '@app/web/prismaClient'
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

  return comptes.map((compte) => ({
    id: compte.id,
    nom: nomAffiche({
      prenom: compte.firstName,
      nom: compte.lastName,
      nomComplet: compte.name,
      courriel: compte.email,
    }),
    courriel: compte.email,
    supprimeLe: compte.deleted,
  }))
}
