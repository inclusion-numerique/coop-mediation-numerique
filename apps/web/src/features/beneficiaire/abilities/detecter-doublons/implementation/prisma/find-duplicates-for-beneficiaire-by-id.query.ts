import { findDuplicatesForBeneficiaire } from '@app/web/features/beneficiaire/db/find-duplicates-for-beneficiaire.query'
import { Email } from '@app/web/features/beneficiaire/domain/email'
import { Nom } from '@app/web/features/beneficiaire/domain/nom'
import { Prenom } from '@app/web/features/beneficiaire/domain/prenom'
import { Telephone } from '@app/web/features/beneficiaire/domain/telephone'
import { prismaClient } from '@app/web/prismaClient'
import type { FindDuplicatesForBeneficiaireById } from '../../domain/detecter-doublons'

export const findDuplicatesForBeneficiaireById: FindDuplicatesForBeneficiaireById =
  async ({ beneficiaireId, mediateurId }) => {
    const beneficiaire = await prismaClient.beneficiaire.findUnique({
      // Owner-scopée : seul le médiateur propriétaire détecte les doublons.
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
    })
  }
