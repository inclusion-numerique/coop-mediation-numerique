import type { Prisma } from '@/generated/prisma/client'

export const enPosteSelect = {
  conseillerNumeriqueEnPoste: { select: { personneId: true } },
} satisfies Prisma.PersonneMainSelect

const enPoste = {
  conseillerNumeriqueEnPoste: { isNot: null },
} satisfies Prisma.PersonneMainWhereInput

export const enPosteWhere = (
  releveDuDispositif: boolean,
): Prisma.UserWhereInput =>
  releveDuDispositif
    ? { personneMain: { is: enPoste } }
    : { NOT: { personneMain: { is: enPoste } } }
