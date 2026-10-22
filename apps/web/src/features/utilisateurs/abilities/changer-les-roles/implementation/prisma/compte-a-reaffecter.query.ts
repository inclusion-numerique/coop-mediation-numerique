import {
  personneConseillerNumeriqueSelect,
  personneEstConseillerNumerique,
} from '@app/web/features/employeuse/server'
import {
  CoordinateurId,
  dispositifDe,
  MediateurId,
  RoleUtilisateur,
  rattachements,
  UtilisateurId,
} from '@app/web/features/utilisateurs/domain'
import { prismaClient } from '@app/web/prismaClient'
import type { CompteAReaffecter } from '../../domain'

export const compteAReaffecter = async (
  utilisateurId: string,
): Promise<CompteAReaffecter | null> => {
  const id = UtilisateurId.safe(utilisateurId)
  if (id === null) return null

  const row = await prismaClient.user.findUnique({
    where: { id },
    select: {
      id: true,
      role: true,
      deleted: true,
      personneMain: { select: personneConseillerNumeriqueSelect },
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
    role: RoleUtilisateur(row.role),
    supprime: row.deleted !== null,
    dispositif: dispositifDe(personneEstConseillerNumerique(row.personneMain)),
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
