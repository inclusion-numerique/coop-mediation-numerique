import { sourceOptionnelle } from '@/features/activites/implementations/statistiques-en-cours.binding'
import { parTagPresentes } from '../ui/presenters/par-tag.presenter'
import { repartirLesAccompagnementsParTag } from './prisma/accompagnements-par-tag.query'

export const accompagnementsParTag = sourceOptionnelle(
  repartirLesAccompagnementsParTag,
  parTagPresentes,
)
