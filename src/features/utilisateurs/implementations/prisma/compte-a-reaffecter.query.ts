import { prismaClient } from '@/configuration/prisma'
import {
  type CompteAReaffecter,
  CoordinateurId,
  MediateurId,
  rattachements,
  type UtilisateurId,
} from '@/features/utilisateurs/domain'
import { roleLu } from './role.transfer'

export const compteAReaffecter = async (
  id: UtilisateurId,
): Promise<CompteAReaffecter | null> => {
  const row = await prismaClient.user.findUnique({
    where: { id },
    select: {
      id: true,
      role: true,
      deleted: true,
      mediateur: {
        select: {
          id: true,
          _count: { select: { activites: true, beneficiaires: true } },
        },
      },
      coordinateur: {
        select: {
          id: true,
          _count: {
            select: {
              mediateursCoordonnes: { where: { suppression: null } },
              ActiviteCoordination: true,
              invitations: { where: { acceptee: null, refusee: null } },
            },
          },
        },
      },
    },
  })

  if (row === null) return null

  return {
    id,
    role: roleLu(row.role),
    supprime: row.deleted !== null,
    rattachements: rattachements(
      row.mediateur === null
        ? null
        : {
            id: MediateurId(row.mediateur.id),
            activites: row.mediateur._count.activites > 0,
            beneficiaires: row.mediateur._count.beneficiaires > 0,
          },
      row.coordinateur === null
        ? null
        : {
            id: CoordinateurId(row.coordinateur.id),
            equipe: row.coordinateur._count.mediateursCoordonnes > 0,
            activitesCoordination:
              row.coordinateur._count.ActiviteCoordination > 0,
            invitationsEnAttente: row.coordinateur._count.invitations > 0,
          },
    ),
  }
}
