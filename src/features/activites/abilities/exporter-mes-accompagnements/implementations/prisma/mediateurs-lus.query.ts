import { prismaClient } from '@/configuration/prisma'
import { nomAffiche } from '@/libraries/nom-affiche'
import { MediateurId } from '../../../../domain'
import { type MediateursLus, NomDeFiltre } from '../../domain'

export const mediateursLus: MediateursLus = async ({ ids, coordinateurId }) =>
  (
    await prismaClient.mediateur.findMany({
      where: { id: { in: [...ids] } },
      select: {
        id: true,
        user: {
          select: { firstName: true, lastName: true, name: true, email: true },
        },
        coordinations: {
          where: coordinateurId === null ? {} : { coordinateurId },
          select: { suppression: true },
        },
      },
      orderBy: [{ user: { lastName: 'asc' } }, { user: { firstName: 'asc' } }],
    })
  ).map(({ id, user, coordinations }) => ({
    mediateurId: MediateurId(id),
    nom: NomDeFiltre(
      nomAffiche({
        prenom: user.firstName,
        nom: user.lastName,
        nomComplet: user.name,
        courriel: user.email,
      }),
    ),
    appartenances: coordinations,
  }))
