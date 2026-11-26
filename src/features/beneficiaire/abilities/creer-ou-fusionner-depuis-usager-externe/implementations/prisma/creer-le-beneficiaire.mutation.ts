import { v4 } from 'uuid'
import { prismaClient } from '@/configuration/prisma'
import type { CreerLeBeneficiaire } from '../../domain/ports'
import { beneficiaireFusionneSelect } from './beneficiaire-fusionne.select'
import { sansException } from './echec-technique.adapter'

export const creerLeBeneficiaire: CreerLeBeneficiaire = (beneficiaire) =>
  sansException(() =>
    prismaClient.beneficiaire.create({
      data: { id: v4(), ...beneficiaire, anonyme: false },
      select: beneficiaireFusionneSelect,
    }),
  )
