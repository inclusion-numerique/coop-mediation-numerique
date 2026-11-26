import { failure, type Result, success } from '@/libraries/result'
import {
  ActionNonAutorisee,
  type AdhesionArchivee,
  archiver,
  type CoordinateurId,
  type Gestionnaire,
  type LireLesAdhesionsDeLaPaire,
  type MediateurId,
  type PasMembre,
  peutGererLEquipe,
  type UtilisateurId,
} from '../../../domain'

export type EchecDeRetrait = ActionNonAutorisee | PasMembre

export type ArchiverLAdhesion = (archivage: {
  readonly adhesion: AdhesionArchivee
  readonly auteurId: UtilisateurId
}) => Promise<void>

export const retirerUnMembre =
  ({
    lireLesAdhesionsDeLaPaire,
    archiverLAdhesion,
  }: {
    readonly lireLesAdhesionsDeLaPaire: LireLesAdhesionsDeLaPaire
    readonly archiverLAdhesion: ArchiverLAdhesion
  }) =>
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
  }): Promise<Result<void, EchecDeRetrait>> => {
    if (!peutGererLEquipe(gestionnaire)(coordinateurId))
      return failure(ActionNonAutorisee())

    const archivage = archiver(
      await lireLesAdhesionsDeLaPaire({ mediateurId, coordinateurId }),
      maintenant,
    )
    if (!archivage.success) return archivage

    await archiverLAdhesion({ adhesion: archivage.data, auteurId })

    return success(undefined)
  }
