import { communesDesLieux } from '@app/web/features/lieux-activite'
import type { CommunesDuDepartement } from '../../domain'

export const communesDuDepartement: CommunesDuDepartement = async (
  departement,
) => (await communesDesLieux({ departementCode: departement })).communesOptions
