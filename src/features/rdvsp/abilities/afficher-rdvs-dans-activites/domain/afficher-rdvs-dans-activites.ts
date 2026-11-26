import { failure, type Result, success } from '@/libraries/result'
import type { UtilisateurCoopId } from '../../../domain/identifiants/utilisateur-coop-id'

export type ErreurAffichageRdvs = { readonly _tag: 'CompteRdvIntrouvable' }

const CompteRdvIntrouvable = (): ErreurAffichageRdvs => ({
  _tag: 'CompteRdvIntrouvable',
})

/**
 * Préférence d'affichage : les rendez-vous RDV Service Public apparaissent-ils
 * dans la liste des activités.
 *
 * Elle est portée par le compte RDV et non par l'utilisateur, ce qui la rend
 * indisponible tant qu'aucun compte n'est connecté — d'où l'échec explicite
 * plutôt qu'un silence.
 */
export type AfficherRdvsDansActivites = (input: {
  readonly utilisateurId: UtilisateurCoopId
  readonly afficher: boolean
}) => Promise<Result<void, ErreurAffichageRdvs>>

export type CompteRdvExiste = (
  utilisateurId: UtilisateurCoopId,
) => Promise<boolean>

export type EnregistrerLAffichage = (input: {
  readonly utilisateurId: UtilisateurCoopId
  readonly afficher: boolean
}) => Promise<void>

export type DependancesAfficherRdvsDansActivites = {
  readonly compteRdvExiste: CompteRdvExiste
  readonly enregistrerLAffichage: EnregistrerLAffichage
}

export const afficherRdvsDansActivites =
  ({
    compteRdvExiste,
    enregistrerLAffichage,
  }: DependancesAfficherRdvsDansActivites): AfficherRdvsDansActivites =>
  async ({ utilisateurId, afficher }) => {
    if (!(await compteRdvExiste(utilisateurId)))
      return failure(CompteRdvIntrouvable())

    await enregistrerLAffichage({ utilisateurId, afficher })

    return success(undefined)
  }
