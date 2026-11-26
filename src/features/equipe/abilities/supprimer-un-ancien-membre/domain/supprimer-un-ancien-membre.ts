import { failure, type Result, success } from '@/libraries/result'
import {
  ActionNonAutorisee,
  type AdhesionArchivee,
  type CoordinateurId,
  type Gestionnaire,
  type LireLesAdhesionsDeLaPaire,
  type MediateurId,
  peutGererLEquipe,
  type UtilisateurId,
} from '../../../domain'
import { exigerAncienMembre } from './ancien-membre'
import type { PasAncienMembre, ToujoursMembre } from './errors'

export type EchecDeSuppression =
  | ActionNonAutorisee
  | ToujoursMembre
  | PasAncienMembre

export type SupprimerLesAdhesionsArchivees = (suppression: {
  readonly adhesions: readonly AdhesionArchivee[]
  readonly mediateurId: MediateurId
  readonly coordinateurId: CoordinateurId
  readonly auteurId: UtilisateurId
}) => Promise<void>

export const supprimerUnAncienMembre =
  ({
    lireLesAdhesionsDeLaPaire,
    supprimerLesAdhesionsArchivees,
  }: {
    readonly lireLesAdhesionsDeLaPaire: LireLesAdhesionsDeLaPaire
    readonly supprimerLesAdhesionsArchivees: SupprimerLesAdhesionsArchivees
  }) =>
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
  }): Promise<Result<void, EchecDeSuppression>> => {
    if (!peutGererLEquipe(gestionnaire)(coordinateurId))
      return failure(ActionNonAutorisee())

    const anciennes = exigerAncienMembre(
      await lireLesAdhesionsDeLaPaire({ mediateurId, coordinateurId }),
    )
    if (!anciennes.success) return anciennes

    await supprimerLesAdhesionsArchivees({
      adhesions: anciennes.data,
      mediateurId,
      coordinateurId,
      auteurId,
    })

    return success(undefined)
  }
