import type { NomAffiche } from '@/libraries/nom-affiche'
import type { Effectif } from '../effectif'
import type { RdvId } from '../identifiants/rdv-id'
import type { LienAgent } from '../rendez-vous/lien-agent'
import type { NomDuMotif } from '../rendez-vous/nom-du-motif'
import type { StatutDeRendezVous } from '../rendez-vous/statut-de-rendez-vous'
import type { TitreDuRendezVous } from '../rendez-vous/titre-du-rendez-vous'
import type { ActiviteConsultee } from './activite-consultee'
import type { CriteresDesActivites } from './criteres-des-activites'

export type RendezVousDeLaChronologie = {
  readonly id: RdvId
  readonly debut: Date
  readonly fin: Date
  readonly statut: StatutDeRendezVous
  readonly motif: {
    readonly nom: NomDuMotif
    readonly collectif: boolean
  } | null
  readonly titre: TitreDuRendezVous | null
  readonly places: Effectif | null
  readonly participants: readonly NomAffiche[]
  readonly lienAgent: LienAgent
}

export type ElementDeChronologie =
  | { readonly _tag: 'Activite'; readonly activite: ActiviteConsultee }
  | {
      readonly _tag: 'RendezVous'
      readonly rendezVous: RendezVousDeLaChronologie
    }

export type ChronologieDesActivites = {
  readonly elements: readonly ElementDeChronologie[]
  readonly total: {
    readonly activites: Effectif
    readonly rendezVous: Effectif
    readonly accompagnements: Effectif
  }
  readonly pages: Effectif
}

export type ContenuDeLaChronologie =
  | 'ActivitesEtRendezVous'
  | 'ActivitesSeules'
  | 'RendezVousSeuls'
  | 'Rien'

export type RendezVousDuCompte =
  | { readonly _tag: 'NonConnecte' }
  | { readonly _tag: 'Connecte'; readonly affichesDansLaListe: boolean }

export const contenuDeLaChronologie = (
  criteres: CriteresDesActivites,
  compte: RendezVousDuCompte,
): ContenuDeLaChronologie => {
  const filtreLesStatuts = criteres.statutsDeRendezVous.length > 0
  const filtreLesTypes = criteres.types.length > 0
  const rendezVous =
    compte._tag === 'Connecte' &&
    (compte.affichesDansLaListe || filtreLesStatuts) &&
    !filtreLesTypes
  const activites = !filtreLesStatuts || filtreLesTypes
  const contenus: Record<`${boolean}-${boolean}`, ContenuDeLaChronologie> = {
    'true-true': 'ActivitesEtRendezVous',
    'true-false': 'ActivitesSeules',
    'false-true': 'RendezVousSeuls',
    'false-false': 'Rien',
  }
  return contenus[`${activites}-${rendezVous}`]
}
