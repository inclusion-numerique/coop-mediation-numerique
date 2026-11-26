import { failure, type Result, success } from '@/libraries/result'
import {
  adherer,
  type CoordinateurId,
  CoordinateurIntrouvable,
  type Courriel,
  type DejaMembre,
  type LireLesAdhesionsDeLaPaire,
  type MediateurId,
  type UtilisateurId,
} from '../../../domain'
import { UtilisateurIntrouvable, UtilisateurNonMediateur } from './errors'

export type EchecDAjout =
  | UtilisateurIntrouvable
  | UtilisateurNonMediateur
  | CoordinateurIntrouvable
  | DejaMembre

export type UtilisateurAAjouter =
  | {
      readonly type: 'Mediateur'
      readonly mediateurId: MediateurId
      readonly email: Courriel
    }
  | { readonly type: 'NonMediateur' }

export type LireLUtilisateurAAjouter = (
  utilisateurId: UtilisateurId,
) => Promise<UtilisateurAAjouter | null>

export type CoordinateurExiste = (
  coordinateurId: CoordinateurId,
) => Promise<boolean>

export type EnregistrerLAdhesion = (adhesion: {
  readonly mediateurId: MediateurId
  readonly coordinateurId: CoordinateurId
  readonly email: Courriel
  readonly auteurId: UtilisateurId
}) => Promise<void>

export const ajouterUnMembre =
  ({
    lireLUtilisateurAAjouter,
    coordinateurExiste,
    lireLesAdhesionsDeLaPaire,
    enregistrerLAdhesion,
  }: {
    readonly lireLUtilisateurAAjouter: LireLUtilisateurAAjouter
    readonly coordinateurExiste: CoordinateurExiste
    readonly lireLesAdhesionsDeLaPaire: LireLesAdhesionsDeLaPaire
    readonly enregistrerLAdhesion: EnregistrerLAdhesion
  }) =>
  async ({
    utilisateurId,
    coordinateurId,
    auteurId,
  }: {
    readonly utilisateurId: UtilisateurId
    readonly coordinateurId: CoordinateurId
    readonly auteurId: UtilisateurId
  }): Promise<Result<void, EchecDAjout>> => {
    const [utilisateur, coordinateurTrouve] = await Promise.all([
      lireLUtilisateurAAjouter(utilisateurId),
      coordinateurExiste(coordinateurId),
    ])

    if (utilisateur === null) return failure(UtilisateurIntrouvable())
    if (utilisateur.type === 'NonMediateur')
      return failure(UtilisateurNonMediateur())
    if (!coordinateurTrouve) return failure(CoordinateurIntrouvable())

    const { mediateurId, email } = utilisateur

    const adhesion = adherer(
      { mediateurId, coordinateurId },
      await lireLesAdhesionsDeLaPaire({ mediateurId, coordinateurId }),
    )
    if (!adhesion.success) return adhesion

    await enregistrerLAdhesion({ mediateurId, coordinateurId, email, auteurId })

    return success(undefined)
  }
