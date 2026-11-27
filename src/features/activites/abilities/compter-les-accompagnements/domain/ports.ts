import type { Effectif, PeriodeDesStatistiques } from '../../../domain'
import type { TotauxDesAccompagnements } from './totaux-des-accompagnements'

export type DemandeDeComptage = {
  readonly criteres: { readonly periode: PeriodeDesStatistiques }
}

export type ActivitesEtAccompagnementsComptes = Pick<
  TotauxDesAccompagnements,
  'activites' | 'accompagnements'
>

export type PersonnesComptees = {
  readonly total: Effectif
  readonly suivies: Effectif
}

export type CompterLesAccompagnementsPorts<Demande extends DemandeDeComptage> =
  {
    readonly activitesComptees: (
      demande: Demande,
    ) => Promise<ActivitesEtAccompagnementsComptes>
    readonly personnesComptees: (demande: Demande) => Promise<PersonnesComptees>
    readonly nouvellesPersonnesComptees: (demande: Demande) => Promise<Effectif>
  }
