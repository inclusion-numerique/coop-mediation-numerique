import type { OrganisationId } from '../../../domain/organisation-id'
import type { RdvId } from '../../../domain/rdv-id'
import type { StatutPresence } from '../../../domain/statut-presence'

/**
 * Rendez-vous tel que l'accueil l'affiche : de quoi écrire une phrase, pas
 * davantage. Les identités sont des chaînes brutes — l'accueil les concatène
 * pour l'affichage sans rien en déduire.
 */
export type RdvEnUneLigne = {
  readonly id: RdvId
  readonly debut: Date
  readonly fin: Date
  readonly collectif: boolean
  readonly nombreParticipants: number
  readonly premierParticipant: {
    readonly prenom: string
    readonly nom: string
  } | null
  readonly statutPresence: StatutPresence
}

/**
 * Projection de lecture pour l'accueil.
 *
 * `passes` compte les rendez-vous échus sans présence saisie, `honores` ceux
 * déclarés honorés qui attendent encore un compte rendu : deux chiffres que
 * l'écran additionne, et dont la somme n'a de sens qu'ici.
 */
export type DonneesAccueilRdv = {
  readonly aVenir: number
  readonly prochain: RdvEnUneLigne | null
  readonly passes: number
  readonly honores: number
  readonly dernier: RdvEnUneLigne | null
  readonly organisationPrincipale: {
    readonly id: OrganisationId
    readonly nom: string
  } | null
}

/** Total affiché en regard du badge « passés ». */
export const rdvsPassesTotal = (donnees: DonneesAccueilRdv): number =>
  donnees.passes + donnees.honores
