import { failure, type Result, success } from '@app/web/libraries/result'
import { prismaClient } from '@app/web/prismaClient'
import { addMutationLog } from '@app/web/utils/addMutationLog'
import { lireLesAdhesionsDeLaPaire } from '../../../../db/adhesion.query'
import {
  ActionNonAutorisee,
  type CoordinateurId,
  type Gestionnaire,
  type MediateurId,
  peutGererLEquipe,
  type UtilisateurId,
} from '../../../../domain'
import {
  exigerAncienMembre,
  type PasAncienMembre,
  type ToujoursMembre,
} from '../../domain'

export type EchecDeSuppression =
  | ActionNonAutorisee
  | ToujoursMembre
  | PasAncienMembre

export const supprimerUnAncienMembre = async ({
  mediateurId,
  coordinateurId,
  gestionnaire,
  auteurId,
}: {
  mediateurId: MediateurId
  coordinateurId: CoordinateurId
  gestionnaire: Gestionnaire
  auteurId: UtilisateurId
}): Promise<Result<void, EchecDeSuppression>> => {
  if (!peutGererLEquipe(gestionnaire)(coordinateurId))
    return failure(ActionNonAutorisee())

  const anciennes = exigerAncienMembre(
    await lireLesAdhesionsDeLaPaire({ mediateurId, coordinateurId }),
  )
  if (!anciennes.success) return anciennes

  await prismaClient.mediateurCoordonne.deleteMany({
    where: {
      id: { in: anciennes.data.map(({ id }) => id) },
      suppression: { not: null },
    },
  })

  addMutationLog({
    userId: auteurId,
    nom: 'SupprimerDefinitivementMediateurCoordonne',
    duration: 0,
    data: { mediateurId, coordinateurId },
  })

  return success(undefined)
}
