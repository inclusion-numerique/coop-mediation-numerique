import { createStopwatch } from '@/libraries/chronometre'
import { usurperUnUtilisateur as usurper } from '../domain/usurper-un-utilisateur'
import { cibleUsurpation } from './prisma/cible-usurpation.query'
import { ouvrirLUsurpation } from './prisma/ouvrir-l-usurpation.mutation'

export const usurperUnUtilisateur = (
  demande: Parameters<ReturnType<typeof usurper>>[0],
) => {
  const chronometre = createStopwatch()

  return usurper({
    lireLaCible: cibleUsurpation,
    ouvrirLUsurpation: (usurpation) =>
      ouvrirLUsurpation({
        ...usurpation,
        duree: () => chronometre.stop().duration,
      }),
  })(demande)
}
