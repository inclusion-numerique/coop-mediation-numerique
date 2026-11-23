import { source } from '@/features/activites/implementations/statistiques-en-cours.binding'
import { parPeriodePresentes } from '../ui/presenters/par-periode.presenter'
import { compterLesAccompagnementsParPeriode } from './prisma/accompagnements-par-periode.query'

export const accompagnementsParPeriode = source(
  compterLesAccompagnementsParPeriode,
  parPeriodePresentes,
)
