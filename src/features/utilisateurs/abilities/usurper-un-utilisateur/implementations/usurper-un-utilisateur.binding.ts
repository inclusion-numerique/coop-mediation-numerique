import { usurperUnUtilisateur as usurper } from '../domain/usurper-un-utilisateur'
import { cibleUsurpation } from './prisma/cible-usurpation.query'
import { ouvrirLUsurpation } from './prisma/ouvrir-l-usurpation.mutation'

export const usurperUnUtilisateur = usurper({
  lireLaCible: cibleUsurpation,
  ouvrirLUsurpation,
})
