import { communesDesLieux } from '@/features/lieux-activite'
import type { CommunesDuDepartement } from '../../domain'

export const communesDuDepartement: CommunesDuDepartement = async (
  departement,
) => (await communesDesLieux({ departementCode: departement })).communesOptions
