import { source } from '@/features/activites/implementations/statistiques-en-cours.binding'
import { profilPresente } from '../ui/presenters/profil.presenter'
import { decrireLesPersonnesAccompagnees } from './prisma/profil-des-personnes-accompagnees.query'

export const profilDesPersonnesAccompagnees = source(
  decrireLesPersonnesAccompagnees,
  profilPresente,
)
