import type { Result } from '@app/web/libraries/result'
import { success } from '@app/web/libraries/result'
import { addMutationLog } from '@app/web/utils/addMutationLog'
import {
  enregistrerLArchivage,
  lireLesAdhesionsDeLaPaire,
} from '../../../../db/adhesion.query'
import {
  archiver,
  type CoordinateurId,
  type MediateurId,
  type PasMembre,
  type UtilisateurId,
} from '../../../../domain'

export const quitterUneEquipe = async ({
  mediateurId,
  coordinateurId,
  auteurId,
  maintenant = new Date(),
}: {
  mediateurId: MediateurId
  coordinateurId: CoordinateurId
  auteurId: UtilisateurId
  maintenant?: Date
}): Promise<Result<void, PasMembre>> => {
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
