import { prismaClient } from '@/configuration/prisma'
import { Email } from '@/features/beneficiaire/domain/email'
import { Nom } from '@/features/beneficiaire/domain/nom'
import { Prenom } from '@/features/beneficiaire/domain/prenom'
import { findDuplicatesForBeneficiaire } from '@/features/beneficiaire/implementations/prisma/find-duplicates-for-beneficiaire.query'
import { Telephone } from '@/libraries/telephone'
import type { DetecterLesDoublons } from '../../domain/ports'

export const findDuplicatesForBeneficiaireById: DetecterLesDoublons = async ({
  beneficiaireId,
  mediateurId,
  maintenant,
}) => {
  const beneficiaire = await prismaClient.beneficiaire.findUnique({
    where: { id: beneficiaireId, mediateurId, suppression: null },
    select: { nom: true, prenom: true, telephone: true, email: true },
  })

  if (!beneficiaire) return []

  return findDuplicatesForBeneficiaire({
    beneficiaire: {
      id: beneficiaireId,
      mediateurId,
      nom: beneficiaire.nom ? Nom.safe(beneficiaire.nom) : null,
      prenom: beneficiaire.prenom ? Prenom.safe(beneficiaire.prenom) : null,
      telephone: beneficiaire.telephone
        ? Telephone.safe(beneficiaire.telephone)
        : null,
      email: beneficiaire.email ? Email.safe(beneficiaire.email) : null,
    },
    withConflictingFields: 'include',
    fuzzyMatching: true,
    maintenant,
  })
}
