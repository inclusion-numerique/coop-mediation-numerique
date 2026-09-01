import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const FournisseurIdentite = defineModel(
  z.string().trim().min(1).brand('FournisseurIdentite'),
)
export type FournisseurIdentite = Model.TypeOf<typeof FournisseurIdentite>

export const IdentifiantFournisseur = defineModel(
  z.string().trim().min(1).brand('IdentifiantFournisseur'),
)
export type IdentifiantFournisseur = Model.TypeOf<typeof IdentifiantFournisseur>

/**
 * État des jetons d'une liaison (DM-3).
 *
 * Cinq colonnes nullables en base — `access_token`, `refresh_token`, `id_token`,
 * `expires_at`, `session_state` — encodent UN seul état. Les modéliser
 * séparément permettrait d'en oublier une : c'est précisément le défaut actuel,
 * où la suppression de compte n'en touche aucune et laisse des accès vivants.
 */
export type AccesFournisseur =
  | { readonly _tag: 'actif' }
  | { readonly _tag: 'revoque' }

/**
 * Liaison entre un compte et son fournisseur d'identité.
 *
 * C'est ici que vit le contrat de résurrection. `fournisseur` et
 * `identifiantChezLeFournisseur` sont présents dans LES DEUX états : le domaine
 * n'a aucun moyen d'exprimer « liaison supprimée ». Révoquer est un changement
 * d'état, jamais une disparition — et c'est ce qui garantit qu'une reconnexion
 * ProConnect retrouve la personne, l'adaptateur NextAuth la cherchant par
 * `@@unique([provider, providerAccountId])` et non par courriel.
 */
export type LiaisonProConnect = {
  readonly fournisseur: FournisseurIdentite
  readonly identifiantChezLeFournisseur: IdentifiantFournisseur
  readonly acces: AccesFournisseur
}

/** Coupe l'accès sans toucher à l'identité de la liaison. */
export const revoquer = (liaison: LiaisonProConnect): LiaisonProConnect => ({
  ...liaison,
  acces: { _tag: 'revoque' },
})

export const estRevoquee = (liaison: LiaisonProConnect): boolean =>
  liaison.acces._tag === 'revoque'
