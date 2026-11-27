import { prismaClient } from '@/configuration/prisma'
import type { UtilisateurId } from '@/features/utilisateurs/domain'
import { personas } from '@/features/utilisateurs/fixtures/personas'
import type { LireLeMarquageFixture } from '../../domain/ports'

export const lireLeMarquageFixture: LireLeMarquageFixture = async (
  id: UtilisateurId,
) => ({
  persona: personas.some((fixture) => fixture.id === id),
  marqueCommeFixture:
    (await prismaClient.user.count({ where: { id, isFixture: true } })) > 0,
})
