import { prismaClient } from '@app/web/prismaClient'
import type { Beneficiaire } from '@prisma/client'

const isValuePresent = (value: unknown) => {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim() !== ''
  return true
}

/**
 * Pendant une fusion, on préfère les données du beneficiaire en "destination"
 * mais si la donnée n'existe pas dans la "destination", on la prend dans la "source"
 */
const mergeField = <T, K extends keyof T>({
  source,
  destination,
  key,
  mergedData,
}: {
  source: T
  destination: T
  key: K
  mergedData: Partial<T>
}) => {
  const destValue = destination[key]
  if (isValuePresent(destValue)) {
    mergedData[key] = destValue
    return
  }

  const sourceValue = source[key]
  if (isValuePresent(sourceValue)) {
    mergedData[key] = sourceValue
  }
}

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

      // Champs à fusionner
      const fieldsToMerge = [
        'prenom',
        'nom',
        'telephone',
        'email',
        'adresse',
        'commune',
        'communeCodePostal',
        'communeCodeInsee',
        'notes',
        'pasDeTelephone',
        'anneeNaissance',
        'rdvServicePublicId',
        'rdvUserId',
        'genre',
        'trancheAge',
        'statutSocial',
      ] as const satisfies (keyof Beneficiaire)[]

      for (const field of fieldsToMerge) {
        mergeField({
          source: sourceBeneficiaire,
          destination: destinationBeneficiaire,
          key: field,
          mergedData,
        })
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

      // 4.a. si les beneficiaires avaient participé au meme atelier, il faut supprimer les accompagnements du source
      // pour éviter d'avoir un doublon d'accompagnement
      await transaction.$executeRaw`
      DELETE FROM accompagnements a
      USING accompagnements b
      WHERE a.beneficiaire_id = ${source.id}::uuid
      AND b.beneficiaire_id = ${destination.id}::uuid
      AND a.activite_id = b.activite_id
      `

      // 4.b. Transférer tous les accompagnements du source vers le destination
      await transaction.accompagnement.updateMany({
        where: {
          beneficiaireId: source.id,
        },
        data: {
          beneficiaireId: destination.id,
        },
      })

      // 5. Mettre à jour tous les bénéficiaires qui avaient fusionVersId = source.id
      // pour qu'ils pointent vers destination.id (en cas de fusions successives)
      await transaction.$executeRaw`UPDATE beneficiaires 
      SET fusion_vers_id = ${destination.id}::uuid 
      WHERE fusion_vers_id = ${source.id}::uuid 
      AND mediateur_id = ${mediateurId}::uuid 
      AND anonyme = false`

      // 6. Marquer le source comme supprimé et lier au destination
      await transaction.beneficiaire.update({
        where: { id: source.id },
        data: {
          suppression: now,
          modification: now,
          rdvUserId: null, // on retire le lien vers le RDV Service Public
          fusionVersId: destination.id,
        },
      })

      // 7. Update the destination accompagnements to have only the oldest one as premierAccompagnement
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
      AND id = (
        SELECT a.id 
        FROM accompagnements a 
        JOIN activites act ON act.id = a.activite_id 
        WHERE a.beneficiaire_id = ${destination.id}::uuid 
        ORDER BY act.date ASC, act.creation ASC 
        LIMIT 1
      )
      `

      return updatedDestination
    },
  )

  return {
    beneficiaireFusionne,
  }
}
