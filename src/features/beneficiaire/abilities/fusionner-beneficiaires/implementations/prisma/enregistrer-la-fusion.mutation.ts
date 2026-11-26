import { prismaClient } from '@/configuration/prisma'
import type { EnregistrerLaFusion } from '../../domain/fusionner-beneficiaires'
import { mergeBeneficiaireFields } from '../../domain/merge-beneficiaire-fields'

const earliestDate = (a: Date, b: Date) => (a < b ? a : b)

export const enregistrerLaFusion: EnregistrerLaFusion = async ({
  sourceId,
  destinationId,
  source: sourceBeneficiaire,
  destination: destinationBeneficiaire,
  mediateurId,
  maintenant: now,
}) => {
  await prismaClient.$transaction(async (tx) => {
    const mergedData = mergeBeneficiaireFields(
      sourceBeneficiaire,
      destinationBeneficiaire,
    )

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

    await tx.$executeRaw`
      DELETE FROM accompagnements a
      USING accompagnements b
      WHERE a.beneficiaire_id = ${sourceId}::uuid
      AND b.beneficiaire_id = ${destinationId}::uuid
      AND a.activite_id = b.activite_id
    `

    await tx.accompagnement.updateMany({
      where: { beneficiaireId: sourceId },
      data: { beneficiaireId: destinationId },
    })

    await tx.$executeRaw`
      UPDATE beneficiaires
      SET fusion_vers_id = ${destinationId}::uuid
      WHERE fusion_vers_id = ${sourceId}::uuid
      AND mediateur_id = ${mediateurId}::uuid
      AND anonyme = false
    `

    await tx.beneficiaire.update({
      where: { id: sourceId },
      data: {
        suppression: now,
        modification: now,
        rdvUserId: null,
        fusionVersId: destinationId,
      },
    })

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
}
