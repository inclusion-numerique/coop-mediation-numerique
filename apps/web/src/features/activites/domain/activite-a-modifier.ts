import type { ActiviteDeMediation } from './activite-de-mediation'
import type { AdresseDuLieu } from './adresse-du-lieu'
import type { BeneficiaireId } from './beneficiaire-id'
import type { Commune } from './commune'
import type { LieuActiviteId } from './lieu-activite-id'
import type { NomDeFamille } from './nom-de-famille'
import type { NomDeStructure } from './nom-de-structure'
import type { NomDeTag } from './nom-de-tag'
import type { Prenom } from './prenom'
import type { TagId } from './tag-id'

export type BeneficiaireSuiviAffiche = {
  readonly id: BeneficiaireId
  readonly prenom: Prenom
  readonly nom: NomDeFamille
  readonly residence: Commune | null
}

export type LieuAffiche = {
  readonly id: LieuActiviteId
  readonly nom: NomDeStructure
  readonly adresse: AdresseDuLieu | null
}

export type TagAffiche = {
  readonly id: TagId
  readonly nom: NomDeTag
}

export type AffichageDeLActivite = {
  readonly lieu: LieuAffiche | null
  readonly suivis: readonly BeneficiaireSuiviAffiche[]
  readonly tags: readonly TagAffiche[]
}

export type ActiviteAModifier = {
  readonly activite: ActiviteDeMediation
  readonly affichage: AffichageDeLActivite
}
