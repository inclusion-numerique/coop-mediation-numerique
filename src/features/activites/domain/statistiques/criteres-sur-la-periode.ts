import { CRITERES_VIDES } from '../consultation/criteres-vides'
import type {
  CriteresDesStatistiques,
  PeriodeDesStatistiques,
} from './criteres-des-statistiques'

export const criteresSurLaPeriode = (
  periode: PeriodeDesStatistiques,
): CriteresDesStatistiques => ({ ...CRITERES_VIDES, periode })
