import { Prisma } from '@/generated/prisma/client'
import { motifDuDepartementDansLeCodeInsee } from '@/libraries/insee'

export const departementCodeFromInseeRegex = Prisma.raw(
  `'${motifDuDepartementDansLeCodeInsee}'`,
)
