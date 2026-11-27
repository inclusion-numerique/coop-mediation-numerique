import { failure, type Result, success } from '@/libraries/result'
import { CompteRdvIntrouvable } from '../../../domain/errors'
import type { UtilisateurCoopId } from '../../../domain/identifiants/utilisateur-coop-id'
import type { EchecDAfficherRdvsDansActivites } from './errors'
import type { AfficherRdvsDansActivitesPorts } from './ports'

export type AffichageDesRdvs = {
  readonly utilisateurId: UtilisateurCoopId
  readonly afficher: boolean
}

export const afficherRdvsDansActivites =
  ({
    compteRdvExiste,
    enregistrerLAffichage,
  }: AfficherRdvsDansActivitesPorts) =>
  async ({
    utilisateurId,
    afficher,
  }: {
    readonly utilisateurId: UtilisateurCoopId
    readonly afficher: boolean
  }): Promise<Result<AffichageDesRdvs, EchecDAfficherRdvsDansActivites>> => {
    if (!(await compteRdvExiste(utilisateurId)))
      return failure(CompteRdvIntrouvable(utilisateurId))

    const affichage: AffichageDesRdvs = { utilisateurId, afficher }

    await enregistrerLAffichage(affichage)

    return success(affichage)
  }
