import { source } from '@/features/activites/implementations/statistiques-en-cours.binding'
import { repartitionPresentee } from '../ui/presenters/repartition.presenter'
import { repartirLesAccompagnements } from './prisma/repartition-des-accompagnements.query'

export const repartitionDesAccompagnements = source(
  repartirLesAccompagnements,
  repartitionPresentee,
)
