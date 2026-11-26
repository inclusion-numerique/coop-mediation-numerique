import { failure, type Result, success } from '@/libraries/result'
import {
  ActionNonAutorisee,
  type CoordinateurId,
  type Gestionnaire,
  type MediateurId,
  peutGererLEquipe,
  type UtilisateurId,
} from '../../../domain'
import { exigerAncienMembre } from './ancien-membre'
import type { EchecDeSuppression } from './errors'
import type { SupprimerUnAncienMembrePorts } from './ports'
import type { SuppressionDesArchives } from './suppression-des-archives'

export const supprimerUnAncienMembre =
  ({
    lireLesAdhesionsDeLaPaire,
    supprimerLesAdhesionsArchivees,
  }: SupprimerUnAncienMembrePorts) =>
  async ({
    mediateurId,
    coordinateurId,
    gestionnaire,
    auteurId,
  }: {
    readonly mediateurId: MediateurId
    readonly coordinateurId: CoordinateurId
    readonly gestionnaire: Gestionnaire
    readonly auteurId: UtilisateurId
  }): Promise<Result<SuppressionDesArchives, EchecDeSuppression>> => {
    if (!peutGererLEquipe(gestionnaire)(coordinateurId))
      return failure(ActionNonAutorisee())

    const anciennes = exigerAncienMembre(
      await lireLesAdhesionsDeLaPaire({ mediateurId, coordinateurId }),
    )
    if (!anciennes.success) return anciennes

    const suppression: SuppressionDesArchives = {
      adhesions: anciennes.data,
      mediateurId,
      coordinateurId,
      auteurId,
    }

    await supprimerLesAdhesionsArchivees(suppression)

    return success(suppression)
  }
