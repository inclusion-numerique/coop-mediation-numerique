import { prismaClient } from '@/configuration/prisma'
import { attraperEnEchecTechnique } from '@/libraries/result'
import type { MettreAJourLeBeneficiaire } from '../../domain/ports'
import { beneficiaireFusionneSelect } from './beneficiaire-fusionne.select'
import { versBeneficiaireFusionne } from './beneficiaire-fusionne.transfer'
import { signalerLesValeursInvalides } from './valeurs-invalides.adapter'

export const mettreAJourLeBeneficiaire: MettreAJourLeBeneficiaire =
  attraperEnEchecTechnique(async ({ id, mediateurId, donnees, maintenant }) =>
    signalerLesValeursInvalides(
      versBeneficiaireFusionne(
        await prismaClient.beneficiaire.update({
          where: { id, mediateurId, suppression: null },
          data: donnees,
          select: beneficiaireFusionneSelect,
        }),
        maintenant,
      ),
    ),
  )
