import type { NomDeFamille } from '../beneficiaires/nom-de-famille'
import type { Prenom } from '../beneficiaires/prenom'
import type { Commune } from '../commune'
import type { Effectif } from '../effectif'
import type { BeneficiaireId } from '../identifiants/beneficiaire-id'
import type { LieuActiviteId } from '../identifiants/lieu-activite-id'
import type { TagId } from '../identifiants/tag-id'
import type { ActiviteDeMediation } from '../mediation/activite-de-mediation'
import type { AdresseDuLieu } from '../mediation/adresse-du-lieu'
import type { NomDeStructure } from '../nom-de-structure'
import type { LienAgent } from '../rendez-vous/lien-agent'
import type { StatutDeRendezVous } from '../rendez-vous/statut-de-rendez-vous'
import type { NomDeTag } from '../tags/nom-de-tag'

export type BeneficiaireSuiviAffiche = {
  readonly id: BeneficiaireId
  readonly prenom: Prenom | null
  readonly nom: NomDeFamille | null
  readonly residence: Commune | null
  readonly nombreDActivites: Effectif
}

type LieuAffiche = {
  readonly id: LieuActiviteId
  readonly nom: NomDeStructure
  readonly adresse: AdresseDuLieu | null
  readonly localite: AdresseDuLieu | null
}

type TagAffiche = {
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
