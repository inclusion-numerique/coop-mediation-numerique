import { addMutationLog } from '@/configuration/prisma/add-mutation-log'
import type { Result } from '@/libraries/result'
import { success } from '@/libraries/result'
import {
  archiver,
  type CoordinateurId,
  type MediateurId,
  type PasMembre,
  type UtilisateurId,
} from '../../../../domain'
import {
  enregistrerLArchivage,
  lireLesAdhesionsDeLaPaire,
} from '../../../../implementations/prisma/adhesion.query'

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
