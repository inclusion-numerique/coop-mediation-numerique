import { prismaClient } from '@app/web/prismaClient'
import type { Beneficiaire } from '@prisma/client'

/**
 * Fusionne deux bénéficiaires en transférant toutes les données du source vers le destination
 * Le source est marqué comme supprimé et lié au destination via fusionVersId
 */
export const fusionnerBeneficiaires = async ({
  source,
  destination,
  mediateurId,
}: {
  source: Pick<Beneficiaire, 'id'>
  destination: Pick<Beneficiaire, 'id'>
  mediateurId: string
}) => {
  const now = new Date()

  const beneficiaireFusionne = await prismaClient.$transaction(
    async (transaction) => {
      // 1. Vérifier que les deux bénéficiaires existent et appartiennent au même médiateur
      const [sourceBeneficiaire, destinationBeneficiaire] = await Promise.all([
        transaction.beneficiaire.findFirst({
          where: {
            id: source.id,
            mediateurId,
            suppression: null,
            anonyme: false,
          },
        }),
        transaction.beneficiaire.findFirst({
          where: {
            id: destination.id,
            mediateurId,
            suppression: null,
            anonyme: false,
          },
        }),
      ])

      if (!sourceBeneficiaire) {
        throw new Error(
          `Bénéficiaire source ${source.id} introuvable ou invalide`,
        )
      }

      if (!destinationBeneficiaire) {
        throw new Error(
          `Bénéficiaire destination ${destination.id} introuvable ou invalide`,
        )
      }

      // 2. Fusionner les données : préserver les données existantes du destination,
      // remplir avec celles du source si destination est null/empty
      const mergedData: Partial<Beneficiaire> = {}

      // Champs textuels : on préfère destination, sinon source si destination est null/empty
      const textFields = [
        'prenom',
        'nom',
        'telephone',
        'email',
        'adresse',
        'commune',
        'communeCodePostal',
        'communeCodeInsee',
        'notes',
      ] as const

      for (const field of textFields) {
        const destValue = destinationBeneficiaire[field]
        const sourceValue = sourceBeneficiaire[field]

        if (
          destValue &&
          destValue.toString().trim() !== '' &&
          destValue.toString().trim() !== '/'
        ) {
          mergedData[field] = destValue
        } else if (
          sourceValue &&
          sourceValue.toString().trim() !== '' &&
          sourceValue.toString().trim() !== '/'
        ) {
          mergedData[field] = sourceValue
        }
      }

      // Champs booléens : préférer destination, sinon source
      if (destinationBeneficiaire.pasDeTelephone !== null) {
        mergedData.pasDeTelephone = destinationBeneficiaire.pasDeTelephone
      } else if (sourceBeneficiaire.pasDeTelephone !== null) {
        mergedData.pasDeTelephone = sourceBeneficiaire.pasDeTelephone
      }

      // Champs numériques : préférer destination, sinon source
      if (destinationBeneficiaire.anneeNaissance !== null) {
        mergedData.anneeNaissance = destinationBeneficiaire.anneeNaissance
      } else if (sourceBeneficiaire.anneeNaissance !== null) {
        mergedData.anneeNaissance = sourceBeneficiaire.anneeNaissance
      }

      if (
        destinationBeneficiaire.rdvServicePublicId !== null &&
        destinationBeneficiaire.rdvServicePublicId !== undefined
      ) {
        mergedData.rdvServicePublicId =
          destinationBeneficiaire.rdvServicePublicId
      } else if (
        sourceBeneficiaire.rdvServicePublicId !== null &&
        sourceBeneficiaire.rdvServicePublicId !== undefined
      ) {
        mergedData.rdvServicePublicId = sourceBeneficiaire.rdvServicePublicId
      }

      if (
        destinationBeneficiaire.rdvUserId === null &&
        sourceBeneficiaire.rdvUserId !== null
      ) {
        mergedData.rdvUserId = sourceBeneficiaire.rdvUserId
      }

      // Enums : préférer destination, sinon source
      if (destinationBeneficiaire.genre !== null) {
        mergedData.genre = destinationBeneficiaire.genre
      } else if (sourceBeneficiaire.genre !== null) {
        mergedData.genre = sourceBeneficiaire.genre
      }

      if (destinationBeneficiaire.trancheAge !== null) {
        mergedData.trancheAge = destinationBeneficiaire.trancheAge
      } else if (sourceBeneficiaire.trancheAge !== null) {
        mergedData.trancheAge = sourceBeneficiaire.trancheAge
      }

      if (destinationBeneficiaire.statutSocial !== null) {
        mergedData.statutSocial = destinationBeneficiaire.statutSocial
      } else if (sourceBeneficiaire.statutSocial !== null) {
        mergedData.statutSocial = sourceBeneficiaire.statutSocial
      }

      // Utiliser la date de création la plus ancienne
      const oldestCreation =
        sourceBeneficiaire.creation < destinationBeneficiaire.creation
          ? sourceBeneficiaire.creation
          : destinationBeneficiaire.creation

      // 3. Mettre à jour le bénéficiaire destination avec les données fusionnées
      const updatedDestination = await transaction.beneficiaire.update({
        where: { id: destination.id },
        data: {
          ...mergedData,
          modification: now,
          // Si le source a une date de création plus ancienne, on la préserve
          creation: oldestCreation,
        },
      })

      // 4. Transférer tous les accompagnements du source vers le destination
      await transaction.accompagnement.updateMany({
        where: {
          beneficiaireId: source.id,
        },
        data: {
          beneficiaireId: destination.id,
        },
      })

      // 5. Mettre à jour tous les bénéficiaires qui avaient fusionVersId = source.id
      // pour qu'ils pointent vers destination.id
      await transaction.$executeRaw`UPDATE beneficiaires 
      SET fusion_vers_id = ${destination.id}::uuid 
      WHERE fusion_vers_id = ${source.id}::uuid 
      AND mediateur_id = ${mediateurId}::uuid 
      AND anonyme = false`

      // 6. Nettoyer le rdvUserId du source
      // 7. Marquer le source comme supprimé et lier au destination
      transaction.beneficiaire.update({
        where: { id: source.id },
        data: {
          suppression: now,
          modification: now,
          rdvUserId: null,
          fusionVersId: destination.id,
        },
      })

      // 8. Update the destination accompagnements to have only the oldest one as premierAccompagnement
      // The oldest accompagnement should have premierAccompagnement = true
      await transaction.$executeRaw`
      UPDATE accompagnements 
      SET premier_accompagnement = false 
      WHERE beneficiaire_id = ${destination.id}::uuid 
      AND premier_accompagnement = true
      `
      await transaction.$executeRaw`
      UPDATE accompagnements 
      SET premier_accompagnement = true 
      WHERE beneficiaire_id = ${destination.id}::uuid 
      AND id = (SELECT id FROM accompagnements WHERE beneficiaire_id = ${destination.id}::uuid ORDER BY date ASC LIMIT 1)
      `

      return updatedDestination
    },
  )

  return {
    beneficiaireFusionne,
  }
}
