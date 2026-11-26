import { prismaClient } from '@/configuration/prisma'
import type { UtilisateurId } from '@/features/utilisateurs/domain'
import { personas } from '@/features/utilisateurs/fixtures/personas'

const estDansLesFixtures = (id: UtilisateurId): boolean =>
  personas.some((fixture) => fixture.id === id)

export const estUneFixture = async (id: UtilisateurId): Promise<boolean> =>
  estDansLesFixtures(id) &&
  (await prismaClient.user.count({ where: { id, isFixture: true } })) > 0
