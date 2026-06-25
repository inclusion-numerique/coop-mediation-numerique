import { derivedTrancheAgeSql } from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/_queries/derivedTrancheAgeSql'
import { ANNEE_NAISSANCE_MIN as anneeNaissanceMin } from '@app/web/features/beneficiaire/domain/annee-naissance'
import { output } from '@app/web/jobs/output'
import { prismaClient } from '@app/web/prismaClient'
import { Prisma } from '@prisma/client'
import { BackfillTrancheAgeJob } from './backfillTrancheAgeJob'

export const executeBackfillTrancheAge = async (
  _job: BackfillTrancheAgeJob,
) => {
  const derived = derivedTrancheAgeSql('annee_naissance', 'tranche_age')

  const updated = await prismaClient.$executeRaw(Prisma.sql`
    UPDATE beneficiaires
    SET tranche_age = (${Prisma.raw(derived)})::tranche_age
    WHERE annee_naissance IS NOT NULL
      AND annee_naissance >= ${anneeNaissanceMin}
      AND annee_naissance <= EXTRACT(YEAR FROM CURRENT_DATE)
      AND tranche_age IS DISTINCT FROM (${Prisma.raw(derived)})::tranche_age
  `)

  output.log(`backfill-tranche-age: updated ${updated} beneficiaires`)

  return { updated }
}
