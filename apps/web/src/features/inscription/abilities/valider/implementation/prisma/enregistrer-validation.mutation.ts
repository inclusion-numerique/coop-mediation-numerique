import { prismaClient } from '@app/web/prismaClient'
import type { EnregistrerValidation } from '../../domain/ports'

/**
 * Pose la validation : `inscriptionValidee`, et les CGU (`acceptationCgu`) si
 * elles n'avaient pas encore été acceptées — flow Dataspace, où les CGU sont
 * acceptées au récapitulatif. Une acceptation déjà posée n'est jamais écrasée
 * (`cguAPoser` nul), donc la date d'origine du parcours standard est préservée.
 */
export const enregistrerValidation: EnregistrerValidation = async ({
  userId,
  aEnregistrer: { inscriptionValidee, cguAPoser },
}) => {
  await prismaClient.user.update({
    where: { id: userId },
    data: {
      inscriptionValidee,
      ...(cguAPoser === null ? {} : { acceptationCgu: cguAPoser }),
    },
  })
}
