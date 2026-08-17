import type { Result } from '@app/web/libraries/result'
import { type CompteRdv, estUtilisable } from '../../../domain/compte-rdv'
import type { OrganisationId } from '../../../domain/organisation-id'
import type { UtilisateurCoopId } from '../../../domain/utilisateur-coop-id'

export type RoleDemandeur = 'User' | 'Admin' | 'Support'

export type Demandeur = {
  readonly id: UtilisateurCoopId
  readonly role: RoleDemandeur
}

/**
 * Qui peut déclencher une synchronisation pour qui.
 *
 * Chacun pour soi, l'assistance pour tous : la synchronisation est aussi un
 * geste de dépannage, et l'écran d'administration existe pour cela. La règle
 * vivait dans le routeur, mêlée à la résolution de l'utilisateur.
 */
export const peutDeclencherPour = (
  demandeur: Demandeur,
  cible: UtilisateurCoopId,
): boolean =>
  demandeur.id === cible ||
  demandeur.role === 'Admin' ||
  demandeur.role === 'Support'

/**
 * Organisations dont les rendez-vous n'arrivent pas d'eux-mêmes, faute de
 * webhook posé.
 */
export const organisationsARattraper = (
  compte: CompteRdv,
): readonly OrganisationId[] => compte.organisationIdsSansWebhook

/**
 * Ce que la passe a effectivement à parcourir.
 *
 * `sansObjet` couvre les deux cas où il n'y a rien à faire — compte sans jetons,
 * ou rattrapage demandé alors que tous les webhooks sont posés — et les sépare de
 * `organisations`, qui restreint la passe. Une liste vide ne doit jamais valoir
 * « tout resynchroniser » : c'est la confusion qu'évite ce type (DM-5).
 */
export type PorteeDeclenchement =
  | { readonly _tag: 'sansObjet' }
  | { readonly _tag: 'toutesOrganisations' }
  | {
      readonly _tag: 'organisations'
      readonly organisationIds: readonly OrganisationId[]
    }

export const porteePour = (
  compte: CompteRdv,
  seulementSansWebhook: boolean,
): PorteeDeclenchement => {
  if (!estUtilisable(compte)) {
    return { _tag: 'sansObjet' }
  }

  if (!seulementSansWebhook) {
    return { _tag: 'toutesOrganisations' }
  }

  const organisationIds = organisationsARattraper(compte)

  return organisationIds.length === 0
    ? { _tag: 'sansObjet' }
    : { _tag: 'organisations', organisationIds }
}

export type ErreurDeclenchement =
  | { readonly _tag: 'NonAutorise' }
  | { readonly _tag: 'CompteRdvIntrouvable' }
  | { readonly _tag: 'SynchronisationEchouee' }

export const NonAutorise = (): ErreurDeclenchement => ({ _tag: 'NonAutorise' })

export const CompteRdvIntrouvable = (): ErreurDeclenchement => ({
  _tag: 'CompteRdvIntrouvable',
})

export const SynchronisationEchouee = (): ErreurDeclenchement => ({
  _tag: 'SynchronisationEchouee',
})

export type ResultatDeclenchement = {
  /** Nombre d'écarts que la passe a corrigés — zéro vaut « rien n'a bougé ». */
  readonly derive: number
  /** Nul quand la passe était sans objet : aucune synchronisation n'a eu lieu. */
  readonly synchroniseeLe: Date | null
}

export type DeclencherSynchronisation = (input: {
  readonly demandeur: Demandeur
  readonly utilisateurId: UtilisateurCoopId
  /**
   * Restreint la passe aux organisations sans webhook. C'est le mode des écrans
   * qui se rafraîchissent au chargement : ils n'ont à rattraper que ce que les
   * notifications n'ont pas rapporté.
   */
  readonly seulementSansWebhook: boolean
}) => Promise<Result<ResultatDeclenchement, ErreurDeclenchement>>

export type CompteACible = (
  utilisateurId: UtilisateurCoopId,
) => Promise<CompteRdv | null>

export type LancerSynchronisation = (input: {
  readonly utilisateurId: UtilisateurCoopId
  readonly organisationIds?: readonly OrganisationId[]
}) => Promise<{ readonly derive: number }>

/** Consigne l'échec sur le compte, pour que l'administration le voie. */
export type MarquerEchecDeSynchronisation = (input: {
  readonly compte: CompteRdv
  readonly message: string
}) => Promise<void>
