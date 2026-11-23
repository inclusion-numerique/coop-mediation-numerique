import { sourceOptionnelle } from '@/features/activites/implementations/statistiques-en-cours.binding'
import { parLieuPresentes } from '../ui/presenters/par-lieu.presenter'
import { compterLesAccompagnementsParLieu } from './prisma/accompagnements-par-lieu.query'

export const accompagnementsParLieu = sourceOptionnelle(
  compterLesAccompagnementsParLieu,
  parLieuPresentes,
)
