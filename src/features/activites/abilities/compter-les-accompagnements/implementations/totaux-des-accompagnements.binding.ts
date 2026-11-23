import { source } from '@/features/activites/implementations/statistiques-en-cours.binding'
import { totauxPresentes } from '../ui/presenters/totaux.presenter'
import { compterLesAccompagnements } from './prisma/totaux-des-accompagnements.query'

export const totauxDesAccompagnements = source(
  compterLesAccompagnements,
  totauxPresentes,
)
