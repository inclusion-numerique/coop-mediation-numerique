import type { Prisma } from '@app/web/generated/prisma/client'

type Client = Pick<Prisma.TransactionClient, '$executeRaw'>

export const garderUnSeulCodePostal = (
  client: Client,
  beneficiaires: Prisma.Sql,
): Promise<number> =>
  client.$executeRaw`
    UPDATE beneficiaires
    SET commune_code_postal = split_part(
      regexp_replace(commune_code_postal, '[[:space:]]', '', 'g'), ',', 1
    )
    WHERE (${beneficiaires}) AND commune_code_postal LIKE '%,%'
  `
