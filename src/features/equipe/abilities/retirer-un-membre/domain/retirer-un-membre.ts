import { failure, type Result, success } from '@/libraries/result'
import {
  ActionNonAutorisee,
  archiver,
  type CoordinateurId,
  type Gestionnaire,
  type MediateurId,
  peutGererLEquipe,
  type UtilisateurId,
} from '../../../domain'
import type { EchecDeRetrait } from './errors'
import type { RetirerUnMembrePorts } from './ports'
import type { Retrait } from './retrait'

export const retirerUnMembre =
  ({ lireLesAdhesionsDeLaPaire, archiverLAdhesion }: RetirerUnMembrePorts) =>
  async ({
    mediateurId,
    coordinateurId,
    gestionnaire,
    auteurId,
    maintenant,
  }: {
    readonly mediateurId: MediateurId
    readonly coordinateurId: CoordinateurId
    readonly gestionnaire: Gestionnaire
    readonly auteurId: UtilisateurId
    readonly maintenant: Date
  }): Promise<Result<Retrait, EchecDeRetrait>> => {
    if (!peutGererLEquipe(gestionnaire)(coordinateurId))
      return failure(ActionNonAutorisee())

    const archivage = archiver(
      await lireLesAdhesionsDeLaPaire({ mediateurId, coordinateurId }),
      maintenant,
    )
    if (!archivage.success) return archivage

    const retrait: Retrait = { adhesion: archivage.data, auteurId }

    await archiverLAdhesion(retrait)

    return success(retrait)
  }
