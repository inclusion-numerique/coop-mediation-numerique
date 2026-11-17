import { Prisma } from '@app/web/generated/prisma/client'
import type { PerimetreDesStatistiques } from '../domain'
import { dansLaPeriodeDAppartenance } from './periode-d-appartenance.sql'

export const dansLePerimetre = (
  perimetre: PerimetreDesStatistiques,
): Prisma.Sql =>
  perimetre.type === 'National'
    ? Prisma.sql`TRUE`
    : perimetre.type === 'Mediateur'
      ? Prisma.sql`act.mediateur_id = ${perimetre.mediateur}::uuid`
      : Prisma.sql`act.mediateur_id = ANY(${[...perimetre.membres]}::uuid[]) AND ${dansLaPeriodeDAppartenance(perimetre.coordinateur)}`
