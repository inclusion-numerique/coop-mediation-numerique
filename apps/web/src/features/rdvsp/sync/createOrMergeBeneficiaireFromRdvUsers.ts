import { trancheAgeFromAnneeNaissance } from '@app/web/beneficiaire/trancheAgeFromAnneeNaissance'
import type { DuplicateBeneficiaire } from '@app/web/features/beneficiaire/abilities/detecter-doublons/domain/types'
import { findDuplicatesForBeneficiaire } from '@app/web/features/beneficiaire/abilities/detecter-doublons/implementation'
import { Email } from '@app/web/features/beneficiaire/domain/email'
import { MediateurId } from '@app/web/features/beneficiaire/domain/mediateur-id'
import { Nom } from '@app/web/features/beneficiaire/domain/nom'
import { Prenom } from '@app/web/features/beneficiaire/domain/prenom'
import { Telephone } from '@app/web/features/beneficiaire/domain/telephone'
import { prismaClient } from '@app/web/prismaClient'
import { fixTelephone } from '@app/web/utils/clean-operations'
import type { Beneficiaire, Prisma, RdvUser } from '@prisma/client'
import { v4 } from 'uuid'
import { communeFieldsFromRdvAddress } from './communeFieldsFromRdvAddress'

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
  | 'commune'
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
  commune: true,
} satisfies Prisma.BeneficiaireSelect

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
    const duplicates = await findDuplicatesForBeneficiaire({
      beneficiaire: {
        id: null,
        nom: rdvUser.lastName ? Nom(rdvUser.lastName) : null,
        prenom: rdvUser.firstName ? Prenom(rdvUser.firstName) : null,
        telephone: rdvUser.phoneNumber ? Telephone(rdvUser.phoneNumber) : null,
        email: rdvUser.email ? Email(rdvUser.email) : null,
        mediateurId: MediateurId(mediateurId),
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
      beneficiaireUpdateData.telephone = fixTelephone(rdvUser.phoneNumber)

    if (!!rdvUser.firstName && !beneficiaireToMerge.prenom)
      beneficiaireUpdateData.prenom = rdvUser.firstName

    if (!!rdvUser.lastName && !beneficiaireToMerge.nom)
      beneficiaireUpdateData.nom = rdvUser.lastName

    if (
      !!rdvUser.address &&
      !(
        'communeResidence' in beneficiaireToMerge &&
        beneficiaireToMerge.communeResidence
      )
    )
      beneficiaireUpdateData.adresse = rdvUser.address

    if (!!rdvUser.birthDate && !beneficiaireToMerge.anneeNaissance) {
      // RDV Api sends birth date as 1900-01-01 if not provided, so we need to handle this case
      const year = rdvUser.birthDate.getFullYear()
      if (year > 1900) {
        beneficiaireUpdateData.anneeNaissance = year
        beneficiaireUpdateData.trancheAge = trancheAgeFromAnneeNaissance(year)
      }
    }

    if (
      !!rdvUser.address &&
      !('commune' in beneficiaireToMerge
        ? beneficiaireToMerge.commune
        : beneficiaireToMerge.communeResidence)
    ) {
      const communeFields = await communeFieldsFromRdvAddress(rdvUser.address)
      if (communeFields) {
        beneficiaireUpdateData.commune = communeFields.commune
        beneficiaireUpdateData.communeCodePostal =
          communeFields.communeCodePostal
        beneficiaireUpdateData.communeCodeInsee = communeFields.communeCodeInsee
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
  const communeFields = await communeFieldsFromRdvAddress(rdvUser.address)
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
      commune: communeFields?.commune ?? null,
      communeCodePostal: communeFields?.communeCodePostal ?? null,
      communeCodeInsee: communeFields?.communeCodeInsee ?? null,
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
