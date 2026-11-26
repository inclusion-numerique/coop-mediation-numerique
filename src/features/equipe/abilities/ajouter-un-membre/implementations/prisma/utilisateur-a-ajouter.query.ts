import { prismaClient } from '@/configuration/prisma'
import { Courriel, MediateurId } from '../../../../domain'
import type {
  CoordinateurExiste,
  LireLUtilisateurAAjouter,
} from '../../domain/ports'

export const lireLUtilisateurAAjouter: LireLUtilisateurAAjouter = async (
  utilisateurId,
) => {
  const utilisateur = await prismaClient.user.findUnique({
    where: { id: utilisateurId },
    select: { email: true, mediateur: { select: { id: true } } },
  })

  if (utilisateur === null) return null

  return utilisateur.mediateur === null
    ? { type: 'NonMediateur' }
    : {
        type: 'Mediateur',
        mediateurId: MediateurId(utilisateur.mediateur.id),
        email: Courriel(utilisateur.email),
      }
}

export const coordinateurExiste: CoordinateurExiste = async (coordinateurId) =>
  (await prismaClient.coordinateur.findUnique({
    where: { id: coordinateurId },
    select: { id: true },
  })) !== null
