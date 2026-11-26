import { findDuplicatesForBeneficiaire } from '@/features/beneficiaire/implementations/prisma/find-duplicates-for-beneficiaire.query'
import type { TrouverUnDoublon } from '../../domain/ports'
import { sansException } from './echec-technique.adapter'

export const trouverUnDoublon: TrouverUnDoublon = ({
  nom,
  prenom,
  telephone,
  email,
  mediateurId,
}) =>
  sansException(async () => {
    const doublons = await findDuplicatesForBeneficiaire({
      beneficiaire: { id: null, nom, prenom, telephone, email, mediateurId },
      withConflictingFields: 'exclude',
    })
    return doublons.at(0) ?? null
  })
