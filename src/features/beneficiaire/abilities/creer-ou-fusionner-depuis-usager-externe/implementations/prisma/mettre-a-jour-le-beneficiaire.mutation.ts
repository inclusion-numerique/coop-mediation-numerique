import { prismaClient } from '@/configuration/prisma'
import type { MettreAJourLeBeneficiaire } from '../../domain/ports'
import { beneficiaireFusionneSelect } from './beneficiaire-fusionne.select'
import { sansException } from './echec-technique.adapter'

export const mettreAJourLeBeneficiaire: MettreAJourLeBeneficiaire = ({
  id,
  donnees,
}) =>
  sansException(() =>
    prismaClient.beneficiaire.update({
      where: { id },
      data: donnees,
      select: beneficiaireFusionneSelect,
    }),
  )
