import { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import type { Prisma } from '@/generated/prisma/client'
import type { MergedBeneficiaire } from '../../domain/usager-externe'
import type { beneficiaireFusionneSelect } from './beneficiaire-fusionne.select'

type BeneficiaireFusionneEnBase = Prisma.BeneficiaireGetPayload<{
  select: typeof beneficiaireFusionneSelect
}>

export const versBeneficiaireFusionne = (
  ligne: BeneficiaireFusionneEnBase,
): MergedBeneficiaire => ({
  ...ligne,
  id: BeneficiaireId(ligne.id),
  mediateurId: MediateurId(ligne.mediateurId),
})
