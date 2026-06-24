import { Telephone } from '@app/web/features/beneficiaire/domain/telephone'
import { prismaClient } from '@app/web/prismaClient'
import { chunk } from 'lodash-es'
import type { NormaliserTelephones } from '../../domain/normaliser-telephones'

const BATCH_SIZE = 100

// Forme canonique via le VO ; un numéro invalide n'a pas de forme canonique.
const toCanonical = (telephone: string): string | null => {
  try {
    return Telephone(telephone)
  } catch {
    return null
  }
}

export const normaliserTelephones: NormaliserTelephones = async () => {
  const rows = await prismaClient.beneficiaire.findMany({
    where: { telephone: { not: null } },
    select: { id: true, telephone: true },
  })

  const evalues = rows.map(({ id, telephone }) => ({
    id,
    telephone,
    canonical: telephone === null ? null : toCanonical(telephone),
  }))

  const aNormaliser = evalues.filter(
    ({ telephone, canonical }) => canonical !== null && canonical !== telephone,
  )

  const invalides = evalues.filter(
    ({ telephone, canonical }) => telephone !== null && canonical === null,
  )

  await chunk(aNormaliser, BATCH_SIZE).reduce(
    (previous, batch) =>
      previous.then(async () => {
        await Promise.all(
          batch.map(({ id, canonical }) =>
            prismaClient.beneficiaire.update({
              where: { id },
              data: { telephone: canonical },
            }),
          ),
        )
      }),
    Promise.resolve(),
  )

  return { updated: aNormaliser.length, skipped: invalides.length }
}
