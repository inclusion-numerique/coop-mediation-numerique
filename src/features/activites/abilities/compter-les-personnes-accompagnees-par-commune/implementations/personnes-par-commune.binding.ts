import { sourceOptionnelle } from '@/features/activites/implementations/statistiques-en-cours.binding'
import { personnesParCommunePresentees } from '../ui/presenters/personnes-par-commune.presenter'
import { compterLesPersonnesAccompagneesParCommune } from './prisma/personnes-par-commune.query'

export const personnesParCommune = sourceOptionnelle(
  compterLesPersonnesAccompagneesParCommune,
  personnesParCommunePresentees,
)
