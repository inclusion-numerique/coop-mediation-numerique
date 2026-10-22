import { prismaClient } from '@app/web/prismaClient'
import type { PhaseDeRelance, Relance, UtilisateurId } from '../domain'
import { relanceFromDomain } from './relance.transfer'

export const noterLaRelance =
  (phase: PhaseDeRelance) =>
  async (utilisateurId: UtilisateurId, relance: Relance): Promise<void> => {
    await prismaClient.user.update({
      where: { id: utilisateurId },
      data: { onboardingStatus: relanceFromDomain(phase, relance) },
    })
  }
