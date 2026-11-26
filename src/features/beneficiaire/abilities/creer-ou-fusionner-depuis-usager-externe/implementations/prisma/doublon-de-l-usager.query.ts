import { findDuplicatesForBeneficiaire } from '@/features/beneficiaire/implementations/prisma/find-duplicates-for-beneficiaire.query'
import { attraperEnEchecTechnique } from '@/libraries/result'
import type { TrouverUnDoublon } from '../../domain/ports'

export const trouverUnDoublon: TrouverUnDoublon = attraperEnEchecTechnique(
  async ({ nom, prenom, telephone, email, mediateurId }) => {
    const doublons = await findDuplicatesForBeneficiaire({
      beneficiaire: { id: null, nom, prenom, telephone, email, mediateurId },
      withConflictingFields: 'exclude',
    })
    return doublons.at(0) ?? null
  },
)
