import { prismaClient } from '@/configuration/prisma/prisma-client'
import { CoordinateurId, nomAffiche } from '@/features/utilisateurs/domain'
import { identiteToDomain } from '@/features/utilisateurs/implementations/prisma/identite.transfer'
import type { Prisma } from '@/generated/prisma/client'
import type { CoordinateurAChoisir } from '../../domain'

const coordinateurSelect = {
  id: true,
  user: {
    select: { firstName: true, lastName: true, name: true, email: true },
  },
} satisfies Prisma.CoordinateurSelect

const toCoordinateurAChoisir = ({
  id,
  user,
}: Prisma.CoordinateurGetPayload<{
  select: typeof coordinateurSelect
}>): CoordinateurAChoisir => ({
  id: CoordinateurId(id),
  nomAffiche: nomAffiche(identiteToDomain(user)),
})

const motWhere = (mot: string): Prisma.UserWhereInput => ({
  OR: [
    { firstName: { contains: mot, mode: 'insensitive' } },
    { lastName: { contains: mot, mode: 'insensitive' } },
    { email: { contains: mot, mode: 'insensitive' } },
  ],
})

export const rechercherDesCoordinateurs = async ({
  recherche,
  limite,
}: {
  readonly recherche: string
  readonly limite: number
}): Promise<readonly CoordinateurAChoisir[]> => {
  const coordinateurs = await prismaClient.coordinateur.findMany({
    where: {
      user: {
        deleted: null,
        AND: recherche
          .split(/\s+/)
          .filter((mot) => mot !== '')
          .map(motWhere),
      },
    },
    select: coordinateurSelect,
    orderBy: [{ user: { lastName: 'asc' } }, { user: { firstName: 'asc' } }],
    take: limite,
  })

  return coordinateurs.map(toCoordinateurAChoisir)
}

export const coordinateursChoisis = async (
  ids: readonly CoordinateurId[],
): Promise<readonly CoordinateurAChoisir[]> =>
  ids.length === 0
    ? []
    : (
        await prismaClient.coordinateur.findMany({
          where: { id: { in: [...ids] } },
          select: coordinateurSelect,
        })
      ).map(toCoordinateurAChoisir)
