import type { ActiviteDeMediation } from './activite-de-mediation'
import type { AdresseDuLieu } from './adresse-du-lieu'
import type { BeneficiaireId } from './beneficiaire-id'
import type { Commune } from './commune'
import type { Effectif } from './effectif'
import type { LienAgent } from './lien-agent'
import type { LieuActiviteId } from './lieu-activite-id'
import type { NomDeFamille } from './nom-de-famille'
import type { NomDeStructure } from './nom-de-structure'
import type { NomDeTag } from './nom-de-tag'
import type { Prenom } from './prenom'
import type { StatutDeRendezVous } from './statut-de-rendez-vous'
import type { TagId } from './tag-id'

export type BeneficiaireSuiviAffiche = {
  readonly id: BeneficiaireId
  readonly prenom: Prenom
  readonly nom: NomDeFamille
  readonly residence: Commune | null
  readonly nombreDActivites: Effectif
}

export type LieuAffiche = {
  readonly id: LieuActiviteId
  readonly nom: NomDeStructure
  readonly adresse: AdresseDuLieu | null
  readonly localite: AdresseDuLieu | null
}

export type TagAffiche = {
  readonly id: TagId
  readonly nom: NomDeTag
}

export type RendezVousAffiche = {
  readonly statut: StatutDeRendezVous
  readonly lienAgent: LienAgent
}

export type AffichageDeLActivite = {
  readonly lieu: LieuAffiche | null
  readonly suivis: readonly BeneficiaireSuiviAffiche[]
  readonly tags: readonly TagAffiche[]
  readonly rendezVous: RendezVousAffiche | null
}

export type ActiviteConsultee = {
  readonly activite: ActiviteDeMediation
  readonly affichage: AffichageDeLActivite
}
