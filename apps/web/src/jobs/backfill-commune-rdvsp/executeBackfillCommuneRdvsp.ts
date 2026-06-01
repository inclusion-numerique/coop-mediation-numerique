import { communeFieldsFromRdvAddress } from '@app/web/features/rdvsp/sync/communeFieldsFromRdvAddress'
import { output } from '@app/web/jobs/output'
import { prismaClient } from '@app/web/prismaClient'
import { BackfillCommuneRdvspJob } from './backfillCommuneRdvspJob'

export const executeBackfillCommuneRdvsp = async (
  job: BackfillCommuneRdvspJob,
) => {
  const candidates = await prismaClient.beneficiaire.findMany({
    where: {
      rdvUserId: { not: null },
      suppression: null,
      commune: null,
      adresse: { not: null },
    },
    select: { id: true, adresse: true },
    orderBy: { creation: 'asc' },
    ...(job.payload?.limit ? { take: job.payload.limit } : {}),
  })

  output.log(`backfill-commune-rdvsp: ${candidates.length} candidates`)

  const updated = await candidates.reduce(
    async (accumulator, { id, adresse }) => {
      const count = await accumulator

      const communeFields = await communeFieldsFromRdvAddress(adresse)
      if (!communeFields) return count

      await prismaClient.beneficiaire.update({
        where: { id },
        data: {
          commune: communeFields.commune,
          communeCodePostal: communeFields.communeCodePostal,
          communeCodeInsee: communeFields.communeCodeInsee,
        },
      })

      return count + 1
    },
    Promise.resolve(0),
  )

  output.log(
    `backfill-commune-rdvsp: updated ${updated}/${candidates.length} beneficiaires`,
  )

  return { candidates: candidates.length, updated }
}
