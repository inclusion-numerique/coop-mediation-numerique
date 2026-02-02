import { trancheAgeFromAnneeNaissance } from '@app/web/beneficiaire/trancheAgeFromAnneeNaissance'
import {
  DuplicateBeneficiaire,
  findDuplicateForBeneficiaire,
} from '@app/web/features/beneficiaires/db/findDuplicateForBeneficiaire'
import { prismaClient } from '@app/web/prismaClient'
import { fixTelephone } from '@app/web/utils/clean-operations'
import type { Beneficiaire, Prisma, RdvUser } from '@prisma/client'
import { v4 } from 'uuid'

export type RdvUserMergedBeneficiaire = Pick<
  Beneficiaire,
  | 'id'
  | 'prenom'
  | 'nom'
  | 'email'
  | 'telephone'
  | 'mediateurId'
  | 'adresse'
  | 'anneeNaissance'
>

export type RdvUserForMerge = Pick<
  RdvUser,
  | 'id'
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'phoneNumber'
  | 'address'
  | 'birthDate'
> & {
  beneficiaire: RdvUserMergedBeneficiaire | null
}

const mergedBeneficiaireSelect = {
  id: true,
  prenom: true,
  nom: true,
  email: true,
  telephone: true,
  mediateurId: true,
  adresse: true,
  anneeNaissance: true,
}

/**
 * This will create or merge a beneficiaire from a rdv user
 * And return the merged beneficiaire if existing
 * The Beneficiaire will be updated if we have some more info from the rdv user (email, phone number, etc.)
 */
export const createOrMergeBeneficiaireFromRdvUser = async ({
  rdvUser,
  mediateurId,
}: {
  rdvUser: RdvUserForMerge
  mediateurId: string
}): Promise<RdvUserMergedBeneficiaire> => {
  let beneficiaireToMerge:
    | RdvUserMergedBeneficiaire
    | DuplicateBeneficiaire
    | null = rdvUser.beneficiaire

  if (!beneficiaireToMerge) {
    // We find a suiting Beneficiaire to avoid duplicates
    // Using 'exclude' to ensure no conflicting fields when merging
    const duplicates = await findDuplicateForBeneficiaire({
      beneficiaire: {
        id: null,
        nom: rdvUser.lastName,
        prenom: rdvUser.firstName,
        telephone: rdvUser.phoneNumber,
        email: rdvUser.email,
        mediateurId,
      },
      withConflictingFields: 'exclude',
    })

    beneficiaireToMerge = duplicates.at(0) ?? null // most recent duplicate
  }

  // If beneficiaire is already linked to the rdv user, we update it if needed
  if (beneficiaireToMerge) {
    const beneficiaireUpdateData: Prisma.BeneficiaireUncheckedUpdateInput = {}

    // We link the beneficiaire to the rdv user if not already linked
    if (!rdvUser.beneficiaire) {
      beneficiaireUpdateData.rdvUserId = rdvUser.id
    }

    // We merge the missing data points from the rdv user
    if (!!rdvUser.email && !beneficiaireToMerge.email)
      beneficiaireUpdateData.email = rdvUser.email

    if (!!rdvUser.phoneNumber && !beneficiaireToMerge.telephone)
      beneficiaireUpdateData.telephone = fixTelephone(rdvUser.phoneNumber, {
        toInternationalFormat: false,
      })

    if (!!rdvUser.firstName && !beneficiaireToMerge.prenom)
      beneficiaireUpdateData.prenom = rdvUser.firstName

    if (!!rdvUser.lastName && !beneficiaireToMerge.nom)
      beneficiaireUpdateData.nom = rdvUser.lastName

    if (!!rdvUser.address && !beneficiaireToMerge.adresse)
      beneficiaireUpdateData.adresse = rdvUser.address

    if (!!rdvUser.birthDate && !beneficiaireToMerge.anneeNaissance) {
      // RDV Api sends birth date as 1900-01-01 if not provided, so we need to handle this case
      const year = rdvUser.birthDate.getFullYear()
      if (year > 1900) {
        beneficiaireUpdateData.anneeNaissance = year
        beneficiaireUpdateData.trancheAge = trancheAgeFromAnneeNaissance(year)
      }
    }

    // Update beneficiaire if needed
    if (Object.keys(beneficiaireUpdateData).length > 0) {
      const updated = await prismaClient.beneficiaire.update({
        where: { id: beneficiaireToMerge.id },
        data: beneficiaireUpdateData,
        select: mergedBeneficiaireSelect,
      })

      return updated
    }

    // No-op, we return the existing beneficiaire
    if (!rdvUser.beneficiaire) {
      // This should not happen as rdvUserId should have been set and updated in above logic
      throw new Error('Did not merge duplicated beneficiaire correcly')
    }
    return rdvUser.beneficiaire
  }

  // We create a new beneficiaire linked to the rdv user
  const anneeNaissance = rdvUser.birthDate?.getFullYear()
  const newBeneficiaire = await prismaClient.beneficiaire.create({
    data: {
      id: v4(),
      rdvUserId: rdvUser.id,
      nom: rdvUser.lastName,
      prenom: rdvUser.firstName,
      telephone: rdvUser.phoneNumber,
      email: rdvUser.email,
      adresse: rdvUser.address,
      anneeNaissance,
      trancheAge: trancheAgeFromAnneeNaissance(anneeNaissance),
      mediateurId,
      anonyme: false,
    },
    select: mergedBeneficiaireSelect,
  })

  return newBeneficiaire
}

/**
 * This will create or merge beneficiaires from rdv users
 * And return already existing beneficiaires if existing
 * The return value is the array of all the beneficiaires regarding the operation done
 */
export const createOrMergeBeneficiairesFromRdvUsers = async ({
  rdvUsers,
  mediateurId,
}: {
  rdvUsers: RdvUserForMerge[]
  mediateurId: string
}): Promise<RdvUserMergedBeneficiaire[]> =>
  Promise.all(
    rdvUsers.map((rdvUser) =>
      createOrMergeBeneficiaireFromRdvUser({ rdvUser, mediateurId }),
    ),
  )

export const createOrMergeBeneficiairesFromRdvUserIds = async ({
  rdvUsers,
  mediateurId,
}: {
  rdvUsers: { id: number }[]
  mediateurId: string
}): Promise<RdvUserMergedBeneficiaire[]> => {
  const rdvUsersToMerge = await prismaClient.rdvUser.findMany({
    where: {
      id: {
        in: rdvUsers.map((rdvUser) => rdvUser.id),
      },
    },
    include: {
      beneficiaires: {
        where: {
          mediateurId,
          suppression: null,
          anonyme: false,
        },
        select: mergedBeneficiaireSelect,
      },
    },
  })

  return createOrMergeBeneficiairesFromRdvUsers({
    rdvUsers: rdvUsersToMerge.map((rdvUser) => ({
      ...rdvUser,
      beneficiaire: rdvUser.beneficiaires.at(0) ?? null,
    })),
    mediateurId,
  })
}
