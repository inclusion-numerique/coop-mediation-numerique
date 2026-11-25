import type { Prisma } from '@/generated/prisma/client'
import { enSerie } from '@/libraries/fixtures'

type LieuEmployeur = {
  readonly id: string
  readonly nom: string
  readonly adresse: string
  readonly commune: string
  readonly codePostal: string
  readonly codeInsee: string
}

export type LieuxEmployeurs = {
  readonly structureEmployeuse: LieuEmployeur
  readonly mediateque: LieuEmployeur
}

const siretDeLaStructureEmployeuse = '13002526500013'

const employeuse = (
  lieu: LieuEmployeur,
  siret: string | null,
): Prisma.StructureAdministrativeMainCreateInput & {
  structureCoopId: string
} => ({
  structureCoopId: lieu.id,
  siret,
  denominationSirene: lieu.nom,
  denominationAntenne: lieu.nom,
  adresse: {
    connectOrCreate: {
      where: { codeBan: lieu.id },
      create: {
        codeBan: lieu.id,
        nomVoie: lieu.adresse,
        codePostal: lieu.codePostal,
        codeInsee: lieu.codeInsee,
        nomCommune: lieu.commune,
      },
    },
  },
})

export const semerLesEmployeusesDeDemonstration = (
  transaction: Prisma.TransactionClient,
  lieux: LieuxEmployeurs,
) =>
  enSerie(
    [
      employeuse(lieux.structureEmployeuse, siretDeLaStructureEmployeuse),
      employeuse(lieux.mediateque, null),
    ],
    (ligne) =>
      transaction.structureAdministrativeMain.upsert({
        where: { structureCoopId: ligne.structureCoopId },
        create: ligne,
        update: ligne,
        select: { id: true },
      }),
  )
