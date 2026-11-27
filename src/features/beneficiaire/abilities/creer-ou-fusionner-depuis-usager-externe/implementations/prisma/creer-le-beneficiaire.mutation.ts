import { v4 } from 'uuid'
import { prismaClient } from '@/configuration/prisma'
import { attraperEnEchecTechnique } from '@/libraries/result'
import type { CreerLeBeneficiaire } from '../../domain/ports'
import { beneficiaireFusionneSelect } from './beneficiaire-fusionne.select'
import { versBeneficiaireFusionne } from './beneficiaire-fusionne.transfer'
import { signalerLesValeursInvalides } from './valeurs-invalides.adapter'

export const creerLeBeneficiaire: CreerLeBeneficiaire =
  attraperEnEchecTechnique(async (beneficiaire) =>
    signalerLesValeursInvalides(
      versBeneficiaireFusionne(
        await prismaClient.beneficiaire.create({
          data: { id: v4(), ...beneficiaire, anonyme: false },
          select: beneficiaireFusionneSelect,
        }),
        new Date(),
      ),
    ),
  )
