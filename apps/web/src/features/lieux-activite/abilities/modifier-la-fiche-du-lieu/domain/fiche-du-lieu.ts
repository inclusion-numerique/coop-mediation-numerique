import type { NomAffiche } from '@app/web/libraries/nom-affiche'
import type { Fiche } from '../../../domain/fiche'
import type { Lieu } from '../../../domain/lieu'
import type { PartageDuLieu } from './partage-du-lieu'

export type FicheDuLieu = {
  readonly lieu: Lieu
  readonly auteurDerniereModification: NomAffiche | null
  readonly derniereModificationCoop: Date
  readonly ficheCoop: Fiche
  readonly partage: PartageDuLieu
}
