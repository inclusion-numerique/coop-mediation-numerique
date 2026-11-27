import { failure, type Result, success } from '@/libraries/result'
import {
  adherer,
  type CoordinateurId,
  CoordinateurIntrouvable,
  type UtilisateurId,
} from '../../../domain'
import type { Ajout } from './ajout'
import {
  type EchecDeAjouterUnMembre,
  UtilisateurIntrouvable,
  UtilisateurNonMediateur,
} from './errors'
import type { AjouterUnMembrePorts } from './ports'

export const ajouterUnMembre =
  ({
    lireLUtilisateurAAjouter,
    coordinateurExiste,
    lireLesAdhesionsDeLaPaire,
    enregistrerLAdhesion,
  }: AjouterUnMembrePorts) =>
  async ({
    utilisateurId,
    coordinateurId,
    auteurId,
  }: {
    readonly utilisateurId: UtilisateurId
    readonly coordinateurId: CoordinateurId
    readonly auteurId: UtilisateurId
  }): Promise<Result<Ajout, EchecDeAjouterUnMembre>> => {
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

    const ajout: Ajout = { mediateurId, coordinateurId, email, auteurId }

    await enregistrerLAdhesion(ajout)

    return success(ajout)
  }
