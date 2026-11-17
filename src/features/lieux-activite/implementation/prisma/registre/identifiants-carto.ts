import type { Prisma } from '@app/web/generated/prisma/client'

export const inscriptionPourLIdentifiantCarto = {
  select: { structureCartographieNationaleId: true },
}

type AvecInscription = {
  readonly inscriptionRegistre: {
    readonly structureCartographieNationaleId: string | null
  } | null
}

export const avecIdentifiantCarto = <T extends AvecInscription>(
  lieu: T,
): Omit<T, 'inscriptionRegistre'> & {
  readonly structureCartographieNationaleId: string | null
} => {
  const { inscriptionRegistre, ...reste } = lieu

  return {
    ...reste,
    structureCartographieNationaleId:
      inscriptionRegistre?.structureCartographieNationaleId ?? null,
  }
}

export const lieuCoopPorteurDeLaCarto = async (
  transaction: Prisma.TransactionClient,
  identifiant: string,
): Promise<{ readonly id: string } | null> =>
  transaction.lieuInclusion.findFirst({
    where: {
      suppression: null,
      inscriptionRegistre: { structureCartographieNationaleId: identifiant },
    },
    select: { id: true },
  })
