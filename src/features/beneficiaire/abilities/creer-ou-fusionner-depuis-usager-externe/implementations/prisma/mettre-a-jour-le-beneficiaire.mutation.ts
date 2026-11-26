import { prismaClient } from '@/configuration/prisma'
import { attraperEnEchecTechnique } from '@/libraries/result'
import type { MettreAJourLeBeneficiaire } from '../../domain/ports'
import { beneficiaireFusionneSelect } from './beneficiaire-fusionne.select'

export const mettreAJourLeBeneficiaire: MettreAJourLeBeneficiaire =
  attraperEnEchecTechnique(({ id, donnees }) =>
    prismaClient.beneficiaire.update({
      where: { id },
      data: donnees,
      select: beneficiaireFusionneSelect,
    }),
  )
