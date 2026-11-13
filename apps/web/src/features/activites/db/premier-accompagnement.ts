import type { Prisma } from '@app/web/generated/prisma/client'

type Accompagnement = {
  readonly accompagnement_id: string
  readonly beneficiaire_id: string
}

const parBeneficiaire = (
  accompagnements: readonly Accompagnement[],
): ReadonlyMap<string, string> =>
  new Map(
    accompagnements.map(({ beneficiaire_id, accompagnement_id }) => [
      beneficiaire_id,
      accompagnement_id,
    ]),
  )

export const recalculerLesPremiersAccompagnements = async (
  transaction: Prisma.TransactionClient,
  beneficiaireIds: readonly string[],
): Promise<void> => {
  if (beneficiaireIds.length === 0) return

  const [actuels, plusAnciens] = await Promise.all([
    transaction.$queryRaw<Accompagnement[]>`
      SELECT id AS accompagnement_id, beneficiaire_id
      FROM accompagnements
      WHERE beneficiaire_id = ANY(${beneficiaireIds}::uuid[])
        AND premier_accompagnement = true
    `,
    transaction.$queryRaw<Accompagnement[]>`
      SELECT DISTINCT ON (accompagnement.beneficiaire_id)
        accompagnement.id AS accompagnement_id,
        accompagnement.beneficiaire_id
      FROM accompagnements accompagnement
      INNER JOIN activites activite ON activite.id = accompagnement.activite_id
      WHERE accompagnement.beneficiaire_id = ANY(${beneficiaireIds}::uuid[])
        AND activite.suppression IS NULL
      ORDER BY accompagnement.beneficiaire_id, activite.date ASC, activite.creation ASC, activite.id ASC
    `,
  ])

  const premiers = new Set(parBeneficiaire(plusAnciens).values())
  const aRetirer = actuels
    .map(({ accompagnement_id }) => accompagnement_id)
    .filter((id) => !premiers.has(id))
  const dejaPremiers = new Set(
    actuels.map(({ accompagnement_id }) => accompagnement_id),
  )
  const aAjouter = [...premiers].filter((id) => !dejaPremiers.has(id))

  await Promise.all([
    aRetirer.length === 0
      ? Promise.resolve(0)
      : transaction.$executeRaw`
          UPDATE accompagnements
          SET premier_accompagnement = false
          WHERE id = ANY(${aRetirer}::uuid[])
        `,
    aAjouter.length === 0
      ? Promise.resolve(0)
      : transaction.$executeRaw`
          UPDATE accompagnements
          SET premier_accompagnement = true
          WHERE id = ANY(${aAjouter}::uuid[])
        `,
  ])
}
