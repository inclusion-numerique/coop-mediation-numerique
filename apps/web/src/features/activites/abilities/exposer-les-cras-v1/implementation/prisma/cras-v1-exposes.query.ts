import type { Prisma } from '@app/web/generated/prisma/client'
import { prismaClient } from '@app/web/prismaClient'

const craV1ExposeSelect = {
  id: true,
  importedAt: true,
  v1ConseillerNumeriqueId: true,
  canal: true,
  activite: true,
  nbParticipants: true,
  nbParticipantsRecurrents: true,
  ageMoins12Ans: true,
  ageDe12a18Ans: true,
  ageDe18a35Ans: true,
  ageDe35a60Ans: true,
  agePlus60Ans: true,
  statutEtudiant: true,
  statutSansEmploi: true,
  statutEnEmploi: true,
  statutRetraite: true,
  statutHeterogene: true,
  themes: true,
  sousThemesEquipementInformatique: true,
  sousThemesSante: true,
  sousThemesAccompagner: true,
  sousThemesTraitementTexte: true,
  duree: true,
  dureeMinutes: true,
  accompagnementIndividuel: true,
  accompagnementAtelier: true,
  accompagnementRedirection: true,
  codePostal: true,
  nomCommune: true,
  dateAccompagnement: true,
  codeCommune: true,
  organismes: true,
  annotation: true,
  createdAt: true,
  updatedAt: true,
  structureId: true,
  structureIdPg: true,
  structureType: true,
  structureStatut: true,
  structureNom: true,
  structureSiret: true,
  structureCodePostal: true,
  structureNomCommune: true,
  structureCodeCommune: true,
  structureCodeDepartement: true,
  structureCodeRegion: true,
} satisfies Prisma.CraConseillerNumeriqueV1Select

export type CraV1Expose = Prisma.CraConseillerNumeriqueV1GetPayload<{
  select: typeof craV1ExposeSelect
}>

export const crasV1Exposes = async ({
  take,
  skip,
  creeLe,
}: {
  readonly take: number
  readonly skip: number | undefined
  readonly creeLe: string | undefined
}): Promise<{
  readonly cras: readonly CraV1Expose[]
  readonly total: number
}> => {
  const [cras, total] = await Promise.all([
    prismaClient.craConseillerNumeriqueV1.findMany({
      orderBy: [{ createdAt: 'desc' }],
      take,
      skip,
      cursor: creeLe === undefined ? undefined : { createdAt: creeLe },
      select: craV1ExposeSelect,
    }),
    prismaClient.craConseillerNumeriqueV1.count(),
  ])

  return { cras, total }
}
