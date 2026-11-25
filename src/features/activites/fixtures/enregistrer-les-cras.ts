import type { CrasDeDemonstration } from '@/features/activites/fixtures/cras-de-demonstration'
import type { Prisma } from '@/generated/prisma/client'
import { enSerie } from '@/libraries/fixtures'

export const enregistrerLesCras = async ({
  transaction,
  crasCollectifs,
  crasDemarchesAdministratives,
  crasIndividuels,
}: {
  transaction: Prisma.TransactionClient
  crasIndividuels: CrasDeDemonstration['crasIndividuels']
  crasDemarchesAdministratives: CrasDeDemonstration['crasDemarchesAdministratives']
  crasCollectifs: CrasDeDemonstration['crasCollectifs']
}) => {
  const allCras = [
    ...crasIndividuels,
    ...crasDemarchesAdministratives,
    ...crasCollectifs,
  ]

  const employeusesMain = new Map(
    (
      await transaction.structureAdministrativeMain.findMany({
        where: {
          structureCoopId: {
            in: [
              ...new Set(
                allCras.map(({ employeuseCoopId }) => employeuseCoopId),
              ),
            ],
          },
        },
        select: { id: true, structureCoopId: true },
      })
    ).map(({ id, structureCoopId }) => [structureCoopId, id]),
  )

  // First we upsert all the activites
  await enSerie(allCras, ({ activite, employeuseCoopId }) => {
    const donnees = {
      ...activite,
      structureEmployeuseMainId: employeusesMain.get(employeuseCoopId) ?? null,
    }
    return transaction.activite.upsert({
      where: { id: activite.id },
      create: donnees,
      update: donnees,
    })
  })

  // Then we delete and recreate the accompagnements
  const activiteIds = allCras.map(({ activite }) => activite.id)

  await transaction.accompagnement.deleteMany({
    where: {
      activiteId: {
        in: activiteIds,
      },
    },
  })

  // Delete the anonymous beneficiaires created for the participants anonymes
  // of the cra collectifs
  await transaction.beneficiaire.deleteMany({
    where: {
      anonyme: true,
      attributionsAleatoires: true,
      accompagnements: {
        every: {
          activiteId: {
            in: activiteIds,
          },
        },
      },
    },
  })

  // Recreate the anonymous beneficiaires created for the participants anonymes

  const beneficiairesAnonymesData = crasCollectifs.flatMap(
    ({ beneficiairesAnonymes }) => beneficiairesAnonymes,
  ) as (Prisma.BeneficiaireUncheckedCreateInput & { dejaAccompagne: boolean })[]

  await transaction.beneficiaire.createMany({
    data: beneficiairesAnonymesData.map(
      ({ dejaAccompagne: _, ...beneficiaire }) => beneficiaire,
    ),
  })

  const accompagnementsData = allCras.flatMap(
    ({ accompagnements }) => accompagnements,
  )

  // Recreate the accompagnements
  await transaction.accompagnement.createMany({
    data: accompagnementsData,
  })
}
