import { Effectif, type PeriodeDesStatistiques } from '../../../domain'

export type TotauxDesAccompagnements = {
  readonly activites: {
    readonly total: Effectif
    readonly individuelles: Effectif
    readonly collectives: Effectif
  }
  readonly accompagnements: {
    readonly total: Effectif
    readonly collectifs: Effectif
  }
  readonly personnes: {
    readonly total: Effectif
    readonly suivies: Effectif
    readonly nouvelles: Effectif
  }
}

export const nouvellesComptees = ({
  du,
  au,
}: PeriodeDesStatistiques): boolean => du !== null && au !== null

export const anonymes = ({ personnes }: TotauxDesAccompagnements): Effectif =>
  Effectif(personnes.total - personnes.suivies)
