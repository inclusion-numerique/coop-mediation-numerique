import { derivedTrancheAgeSql } from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/_queries/derivedTrancheAgeSql'
import { anneeNaissanceMin } from '@app/web/features/beneficiaires/validation/BeneficiaireValidation'
import { output } from '@app/web/jobs/output'
import { prismaClient } from '@app/web/prismaClient'
import { Prisma } from '@prisma/client'
import { BackfillTrancheAgeJob } from './backfillTrancheAgeJob'

/**
 * One-shot repair of beneficiaires whose stored tranche_age diverged from their
 * birth year (NULL or stale), e.g. fiches imported / merged from RDVSP or fused.
 *
 * Recomputes tranche_age from annee_naissance only where it actually differs.
 * Beneficiaires without a usable birth year (anonymes with a hand-picked
 * tranche) are left untouched. Uses raw SQL on purpose so `modification` is NOT
 * bumped — this is a system correction, not a mediateur edit.
 */
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
