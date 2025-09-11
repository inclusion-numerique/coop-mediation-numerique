import { prismaClient } from '@app/web/prismaClient'
import { isDefinedAndNotNull } from '@app/web/utils/isDefinedAndNotNull'
import { Prisma } from '@prisma/client'
import { fixtureCras } from './activites'
import { fixtureBeneficiaires } from './beneficiaires'

/**
 * Fixtures insert data bypassing the business logic.
 * We have to recreate the computed fields to avoid inconsistencies.
 */

export const refreshFixturesComputedFields = async () => {
  // Update mediateurs beneficiaires count
  const fixtureBeneficiairesMediateurs = new Set(
    fixtureBeneficiaires.map((beneficiaire) => beneficiaire.mediateurId),
  )

  if (fixtureBeneficiairesMediateurs.size > 0) {
    const beneficiairesMediateurIdParams = [
      ...fixtureBeneficiairesMediateurs,
    ].map((id) => Prisma.sql`${id}::uuid`)
    await prismaClient.$executeRaw`
      UPDATE mediateurs
      SET beneficiaires_count = (
        SELECT COUNT(*)
        FROM beneficiaires
        WHERE beneficiaires.mediateur_id = mediateurs.id
          AND beneficiaires.suppression IS NULL
      )
      WHERE mediateurs.id IN (${Prisma.join(beneficiairesMediateurIdParams)})
    `
  }

  const beneficiaireIdParams = fixtureBeneficiaires.map(
    ({ id }) => Prisma.sql`${id}::uuid`,
  )
  // Update beneficiaires accompagnements count
  await prismaClient.$queryRaw`
      UPDATE beneficiaires
      SET accompagnements_count = (
          SELECT COUNT(*)
          FROM accompagnements
          INNER JOIN activites
               ON activites.id = accompagnements.activite_id
               AND activites.suppression IS NULL
          WHERE accompagnements.beneficiaire_id = beneficiaires.id
      )
      WHERE beneficiaires.id IN (${Prisma.join(beneficiaireIdParams)})
    `

  // Update structures activites count
  const fixturesStructures = new Set(
    fixtureCras
      .map((cra) =>
        'structureId' in cra.activite ? cra.activite.structureId : null,
      )
      .filter(isDefinedAndNotNull),
  )

  const structureIdParams = [...fixturesStructures].map(
    (id) => Prisma.sql`${id}::uuid`,
  )

  await prismaClient.$executeRaw`
      UPDATE structures
      SET activites_count = (SELECT COUNT(*) FROM activites WHERE activites.structure_id = structures.id AND activites.suppression IS NULL)
      WHERE structures.id IN (${Prisma.join(structureIdParams)})
    `

  const fixtureMediateurIds = new Set(
    fixtureCras.map((cra) => cra.activite.mediateurId),
  )

  // Update mediateur activites and accompagnements count
  if (fixtureMediateurIds.size > 0) {
    const mediateurIdParams = [...fixtureMediateurIds].map(
      (id) => Prisma.sql`${id}::uuid`,
    )
    await prismaClient.$executeRaw`
      UPDATE mediateurs
      SET activites_count = (
            SELECT COUNT(*)
            FROM activites
            WHERE activites.mediateur_id = mediateurs.id
              AND activites.suppression IS NULL
          ),
          accompagnements_count = (
            SELECT COALESCE(SUM(activites.accompagnements_count), 0)
            FROM activites
            WHERE activites.mediateur_id = mediateurs.id
              AND activites.suppression IS NULL
          )
      WHERE mediateurs.id IN (${Prisma.join(mediateurIdParams)})
    `
  }
}
