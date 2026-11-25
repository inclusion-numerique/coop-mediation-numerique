import type { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import type { CommuneResidence } from '@/features/beneficiaire/domain/commune-residence'
import type { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import type { Nom } from '@/features/beneficiaire/domain/nom'
import type { Prenom } from '@/features/beneficiaire/domain/prenom'

/**
 * Projection minimale d'un bénéficiaire en vue d'une sélection
 * (autocomplétion de formulaire, pré-remplissage de filtre) : on ne lit que ce
 * qu'un libellé d'option a besoin d'afficher.
 */
export type BeneficiaireTrouve = {
  readonly id: BeneficiaireId
  readonly prenom: Prenom
  readonly nom: Nom
  readonly communeResidence: CommuneResidence | null
}

/**
 * `totalCount` est le nombre total de correspondances (au-delà des
 * `beneficiaires` renvoyés), pour que l'appelant puisse signaler les
 * bénéficiaires non affichés (`totalCount - beneficiaires.length`).
 */
export type BeneficiairesRecherches = {
  readonly beneficiaires: readonly BeneficiaireTrouve[]
  readonly totalCount: number
}

/**
 * Recherche textuelle « live » (combobox) : les bénéficiaires correspondant à
 * la saisie, en excluant ceux déjà sélectionnés.
 */
export type RechercherBeneficiaires = (input: {
  mediateurId: MediateurId
  query: string
  excludeIds?: readonly BeneficiaireId[]
}) => Promise<BeneficiairesRecherches>

/**
 * Pré-remplissage : les bénéficiaires les plus accompagnés, complétés des
 * `includeBeneficiaireIds` déjà sélectionnés (pour que leur libellé soit
 * disponible même hors du haut de liste).
 */
export type ProposerDesBeneficiaires = (input: {
  mediateurId: MediateurId
  includeBeneficiaireIds?: readonly BeneficiaireId[]
}) => Promise<BeneficiairesRecherches>
