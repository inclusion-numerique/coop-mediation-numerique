import { BeneficiaireId } from '@app/web/features/beneficiaire/domain/beneficiaire-id'
import { failure, success } from '@app/web/libraries/result'
import { prismaClient } from '@app/web/prismaClient'
import type { Beneficiaire } from '@prisma/client'
import {
  BeneficiaireDestinationIntrouvable,
  BeneficiaireSourceIntrouvable,
} from '../../domain/errors'
import type { FusionnerBeneficiaires } from '../../domain/port'

const isValuePresent = (value: unknown) => {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim() !== ''
  return true
}

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
] as const satisfies readonly (keyof Beneficiaire)[]

const mergeFields = (
  source: Beneficiaire,
  destination: Beneficiaire,
): Partial<Beneficiaire> =>
  fieldsToMerge.reduce<Partial<Beneficiaire>>(
    (merged, field) => ({
      ...merged,
      ...(isValuePresent(destination[field])
        ? { [field]: destination[field] }
        : isValuePresent(source[field])
          ? { [field]: source[field] }
          : {}),
    }),
    {},
  )

const earliestDate = (a: Date, b: Date) => (a < b ? a : b)

export const fusionnerBeneficiaires: FusionnerBeneficiaires = async ({
  sourceId,
  destinationId,
  mediateurId,
}) => {
  const now = new Date()

  const [sourceBeneficiaire, destinationBeneficiaire] = await Promise.all([
    prismaClient.beneficiaire.findFirst({
      where: {
        id: sourceId,
        mediateurId,
        suppression: null,
        anonyme: false,
      },
    }),
    prismaClient.beneficiaire.findFirst({
      where: {
        id: destinationId,
        mediateurId,
        suppression: null,
        anonyme: false,
      },
    }),
  ])

  if (!sourceBeneficiaire)
    return failure(BeneficiaireSourceIntrouvable(sourceId))
  if (!destinationBeneficiaire)
    return failure(BeneficiaireDestinationIntrouvable(destinationId))

  await prismaClient.$transaction(async (tx) => {
    const mergedData = mergeFields(sourceBeneficiaire, destinationBeneficiaire)

    await tx.beneficiaire.update({
      where: { id: destinationId },
      data: {
        ...mergedData,
        modification: now,
        creation: earliestDate(
          sourceBeneficiaire.creation,
          destinationBeneficiaire.creation,
        ),
      },
    })

    // Supprimer les accompagnements en doublon (même activité)
    await tx.$executeRaw`
      DELETE FROM accompagnements a
      USING accompagnements b
      WHERE a.beneficiaire_id = ${sourceId}::uuid
      AND b.beneficiaire_id = ${destinationId}::uuid
      AND a.activite_id = b.activite_id
    `

    // Transférer les accompagnements restants
    await tx.accompagnement.updateMany({
      where: { beneficiaireId: sourceId },
      data: { beneficiaireId: destinationId },
    })

    // Recalculer le compteur
    const accompagnementsCount = await tx.accompagnement.count({
      where: { beneficiaireId: destinationId },
    })
    await tx.beneficiaire.update({
      where: { id: destinationId },
      data: { accompagnementsCount },
    })

    // Rediriger les fusions successives
    await tx.$executeRaw`
      UPDATE beneficiaires
      SET fusion_vers_id = ${destinationId}::uuid
      WHERE fusion_vers_id = ${sourceId}::uuid
      AND mediateur_id = ${mediateurId}::uuid
      AND anonyme = false
    `

    // Marquer le source comme fusionné
    await tx.beneficiaire.update({
      where: { id: sourceId },
      data: {
        suppression: now,
        modification: now,
        rdvUserId: null,
        fusionVersId: destinationId,
      },
    })

    // Recalculer le premier accompagnement
    await tx.$executeRaw`
      UPDATE accompagnements
      SET premier_accompagnement = false
      WHERE beneficiaire_id = ${destinationId}::uuid
      AND premier_accompagnement = true
    `
    await tx.$executeRaw`
      UPDATE accompagnements
      SET premier_accompagnement = true
      WHERE beneficiaire_id = ${destinationId}::uuid
      AND id = (
        SELECT a.id
        FROM accompagnements a
        JOIN activites act ON act.id = a.activite_id
        WHERE a.beneficiaire_id = ${destinationId}::uuid
        ORDER BY act.date ASC, act.creation ASC
        LIMIT 1
      )
    `
  })

  return success({ beneficiaireFusionneId: BeneficiaireId(destinationId) })
}
