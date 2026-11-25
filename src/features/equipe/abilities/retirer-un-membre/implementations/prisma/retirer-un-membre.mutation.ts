import { addMutationLog } from '@/configuration/prisma'
import { failure, type Result, success } from '@/libraries/result'
import {
  ActionNonAutorisee,
  archiver,
  type CoordinateurId,
  type Gestionnaire,
  type MediateurId,
  type PasMembre,
  peutGererLEquipe,
  type UtilisateurId,
} from '../../../../domain'
import {
  enregistrerLArchivage,
  lireLesAdhesionsDeLaPaire,
} from '../../../../implementations/prisma/adhesion.query'

export type EchecDeRetrait = ActionNonAutorisee | PasMembre

export const retirerUnMembre = async ({
  mediateurId,
  coordinateurId,
  gestionnaire,
  auteurId,
  maintenant = new Date(),
}: {
  mediateurId: MediateurId
  coordinateurId: CoordinateurId
  gestionnaire: Gestionnaire
  auteurId: UtilisateurId
  maintenant?: Date
}): Promise<Result<void, EchecDeRetrait>> => {
  if (!peutGererLEquipe(gestionnaire)(coordinateurId))
    return failure(ActionNonAutorisee())

  const archivage = archiver(
    await lireLesAdhesionsDeLaPaire({ mediateurId, coordinateurId }),
    maintenant,
  )
  if (!archivage.success) return archivage

  await enregistrerLArchivage(archivage.data)

  addMutationLog({
    userId: auteurId,
    nom: 'SupprimerMediateurCoordonne',
    duration: 0,
    data: { mediateurId, coordinateurId },
  })

  return success(undefined)
}
