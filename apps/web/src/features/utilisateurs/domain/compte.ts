import type { AdresseCourriel } from './adresse-courriel'
import type { CoordinateurId } from './coordinateur-id'
import type { LiaisonProConnect } from './liaison-proconnect'
import type { MediateurId } from './mediateur-id'
import type { RoleUtilisateur } from './role-utilisateur'
import type { UtilisateurId } from './utilisateur-id'

/**
 * `users.deleted` (DM-3) : `null` cache un état — « jamais supprimé » — qui
 * commande le refus d'un second effacement par le titulaire, et la reprise d'un
 * effacement laissé incomplet.
 */
export type EtatCompte =
  | { readonly _tag: 'actif' }
  | { readonly _tag: 'supprime'; readonly depuis: Date }

/**
 * Ce que la personne porte (DM-5).
 *
 * `mediateur` et `coordinateur` sont deux relations nullables qui encodent un
 * seul état, et cet état commande quelles charges d'effacement sont dues. Le
 * double rôle n'est pas théorique : le job `fix-users-roles` n'existe que pour
 * le corriger.
 */
export type RattachementsDuCompte =
  | { readonly _tag: 'aucun' }
  | { readonly _tag: 'mediateur'; readonly mediateurId: MediateurId }
  | { readonly _tag: 'coordinateur'; readonly coordinateurId: CoordinateurId }
  | {
      readonly _tag: 'mediateurEtCoordinateur'
      readonly mediateurId: MediateurId
      readonly coordinateurId: CoordinateurId
    }

/**
 * Le compte tel que l'effacement a besoin de le connaître.
 *
 * Les champs d'identité (nom, téléphone, avatar, SIRET…) n'y figurent pas : ils
 * ne sont jamais lus, seulement écrasés. Les charger reviendrait à ramener en
 * mémoire l'identité qu'on cherche à effacer. Même raison pour les jetons :
 * `AccesFournisseur` est un état dérivé au transfert, pas un porteur de secret.
 */
export type CompteASupprimer = {
  readonly id: UtilisateurId
  readonly courriel: AdresseCourriel
  readonly role: RoleUtilisateur
  readonly etat: EtatCompte
  readonly rattachements: RattachementsDuCompte
  readonly liaisons: readonly LiaisonProConnect[]
}

export const mediateurDe = (
  rattachements: RattachementsDuCompte,
): MediateurId | null =>
  rattachements._tag === 'mediateur' ||
  rattachements._tag === 'mediateurEtCoordinateur'
    ? rattachements.mediateurId
    : null

export const coordinateurDe = (
  rattachements: RattachementsDuCompte,
): CoordinateurId | null =>
  rattachements._tag === 'coordinateur' ||
  rattachements._tag === 'mediateurEtCoordinateur'
    ? rattachements.coordinateurId
    : null

/**
 * Les identifiants portés par un compte, projetés depuis ses rattachements.
 *
 * L'union dit ce qui EXISTE et interdit de représenter « ni médiateur ni
 * coordinateur ». Les features qui reçoivent ces identifiants, elles, n'en
 * connaissent pas la forme et travaillent rôle par rôle : elles attendent un
 * couple. La traduction est nommée ici pour n'exister qu'une fois, chez le
 * propriétaire de l'union, plutôt que d'être réécrite par chaque composition.
 */
export type IdentifiantsRattaches = {
  readonly mediateurId: MediateurId | null
  readonly coordinateurId: CoordinateurId | null
}

export const identifiantsDe = (
  rattachements: RattachementsDuCompte,
): IdentifiantsRattaches => ({
  mediateurId: mediateurDe(rattachements),
  coordinateurId: coordinateurDe(rattachements),
})

export const estSupprime = (compte: CompteASupprimer): boolean =>
  compte.etat._tag === 'supprime'
