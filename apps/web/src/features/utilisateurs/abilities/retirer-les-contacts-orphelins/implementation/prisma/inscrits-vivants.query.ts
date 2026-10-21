import { prismaClient } from '@app/web/prismaClient'

export const inscritsVivantsParmi = async (
  identifiants: readonly string[],
): Promise<ReadonlySet<string>> =>
  new Set(
    (
      await prismaClient.user.findMany({
        where: {
          id: {
            in: identifiants.filter((id) => /^[0-9a-f-]{36}$/i.test(id)),
          },
          deleted: null,
          inscriptionValidee: { not: null },
        },
        select: { id: true },
      })
    ).map(({ id }) => id),
  )
