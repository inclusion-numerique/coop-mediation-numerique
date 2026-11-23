import { sourceOptionnelle } from '@/features/activites/implementations/statistiques-en-cours.binding'
import { parCommunePresentes } from '../ui/presenters/par-commune.presenter'
import { compterLesAccompagnementsParCommune } from './prisma/accompagnements-par-commune.query'

export const accompagnementsParCommune = sourceOptionnelle(
  compterLesAccompagnementsParCommune,
  parCommunePresentes,
)
