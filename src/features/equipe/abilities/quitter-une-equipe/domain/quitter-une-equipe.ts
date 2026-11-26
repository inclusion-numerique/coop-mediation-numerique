import { type Result, success } from '@/libraries/result'
import {
  archiver,
  type CoordinateurId,
  type MediateurId,
  type UtilisateurId,
} from '../../../domain'
import type { Depart } from './depart'
import type { EchecDeDepart } from './errors'
import type { QuitterUneEquipePorts } from './ports'

export const quitterUneEquipe =
  ({ lireLesAdhesionsDeLaPaire, enregistrerLeDepart }: QuitterUneEquipePorts) =>
  async ({
    mediateurId,
    coordinateurId,
    auteurId,
    maintenant,
  }: {
    readonly mediateurId: MediateurId
    readonly coordinateurId: CoordinateurId
    readonly auteurId: UtilisateurId
    readonly maintenant: Date
  }): Promise<Result<Depart, EchecDeDepart>> => {
    const archivage = archiver(
      await lireLesAdhesionsDeLaPaire({ mediateurId, coordinateurId }),
      maintenant,
    )
    if (!archivage.success) return archivage

    const depart: Depart = { adhesion: archivage.data, auteurId }

    await enregistrerLeDepart(depart)

    return success(depart)
  }
