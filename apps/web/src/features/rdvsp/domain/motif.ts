import type { NomMotif } from './libelle'
import type { MotifId } from './motif-id'

/**
 * Motif sur lequel le rendez-vous a été pris. Réduit à ce que La Coop exploite :
 * le reste du payload (catégorie, service, règles de réservation) relève du
 * paramétrage interne de RDV Service Public et n'a pas de sens ici (AR-6).
 */
export type Motif = {
  readonly id: MotifId
  readonly nom: NomMotif
}
