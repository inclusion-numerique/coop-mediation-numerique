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

type ActivitesComptees<Demande extends DemandeDeComptage> = (
  demande: Demande,
) => Promise<ActivitesEtAccompagnementsComptes>

type PersonnesDeLaDemande<Demande extends DemandeDeComptage> = (
  demande: Demande,
) => Promise<PersonnesComptees>

type NouvellesPersonnesComptees<Demande extends DemandeDeComptage> = (
  demande: Demande,
) => Promise<Effectif>

export type CompterLesAccompagnementsPorts<Demande extends DemandeDeComptage> =
  {
    readonly activitesComptees: ActivitesComptees<Demande>
    readonly personnesComptees: PersonnesDeLaDemande<Demande>
    readonly nouvellesPersonnesComptees: NouvellesPersonnesComptees<Demande>
  }
