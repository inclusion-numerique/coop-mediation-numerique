import { prismaClient } from '@/configuration/prisma'
import { failure, type Result, success } from '@/libraries/result'
import {
  EchecTechnique,
  type PhaseDeRelance,
  type Relance,
  type UtilisateurId,
} from '../../domain'
import { relanceFromDomain } from './relance.transfer'

export const noterLaRelance =
  (phase: PhaseDeRelance) =>
  async (
    utilisateurId: UtilisateurId,
    relance: Relance,
    suppressionAnnoncee: Date | null,
  ): Promise<Result<void, EchecTechnique>> => {
    try {
      await prismaClient.user.update({
        where: { id: utilisateurId },
        data: {
          onboardingStatus: relanceFromDomain(phase, relance),
          suppressionAnnonceeLe: suppressionAnnoncee,
        },
      })
      return success(undefined)
    } catch (erreur) {
      return failure(
        EchecTechnique(
          erreur instanceof Error ? erreur.message : String(erreur),
        ),
      )
    }
  }
