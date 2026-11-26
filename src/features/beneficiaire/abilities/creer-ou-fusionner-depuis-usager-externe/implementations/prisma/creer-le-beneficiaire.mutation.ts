import { v4 } from 'uuid'
import { prismaClient } from '@/configuration/prisma'
import { attraperEnEchecTechnique } from '@/libraries/result'
import type { CreerLeBeneficiaire } from '../../domain/ports'
import { beneficiaireFusionneSelect } from './beneficiaire-fusionne.select'

export const creerLeBeneficiaire: CreerLeBeneficiaire =
  attraperEnEchecTechnique((beneficiaire) =>
    prismaClient.beneficiaire.create({
      data: { id: v4(), ...beneficiaire, anonyme: false },
      select: beneficiaireFusionneSelect,
    }),
  )
