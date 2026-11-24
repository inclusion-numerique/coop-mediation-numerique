import type {
  CriteresDesStatistiques,
  PeriodeDesStatistiques,
} from './criteres-des-statistiques'

export const criteresSurLaPeriode = (
  periode: PeriodeDesStatistiques,
): CriteresDesStatistiques => ({
  periode,
  types: [],
  statutsDeRendezVous: [],
  mediateurs: [],
  beneficiaires: [],
  communes: [],
  departements: [],
  lieux: [],
  thematiques: [],
  demarche: null,
  tags: [],
  employeuses: [],
  dispositif: null,
  origine: null,
  source: null,
})
