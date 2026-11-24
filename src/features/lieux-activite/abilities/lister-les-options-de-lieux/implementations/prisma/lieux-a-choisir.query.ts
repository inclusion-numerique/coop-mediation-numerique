import { prismaClient } from '@/configuration/prisma/prisma-client'
import type { Prisma } from '@/generated/prisma/client'
import type { SelectOption } from '@/libraries/ui/components/form/utils/options'
import { lieuExploitable } from '../../../../implementations/prisma/lieu-exploitable.sql'

const lieuSelect = {
  id: true,
  nom: true,
  commune: true,
  codePostal: true,
} satisfies Prisma.LieuInclusionSelect

const optionDuLieu = ({
  id,
  nom,
  commune,
  codePostal,
}: Prisma.LieuInclusionGetPayload<{
  select: typeof lieuSelect
}>): SelectOption => ({
  value: id,
  label: `${nom} · ${codePostal} ${commune}`,
})

const contient = (mot: string) =>
  ({ contains: mot, mode: 'insensitive' }) satisfies Prisma.StringFilter

export const rechercherDesLieuxAChoisir = async ({
  recherche,
  limite,
}: {
  readonly recherche: string
  readonly limite: number
}): Promise<readonly SelectOption[]> =>
  (
    await prismaClient.lieuInclusion.findMany({
      where: {
        ...lieuExploitable,
        AND: recherche
          .split(/\s+/)
          .filter((mot) => mot !== '')
          .map((mot) => ({
            OR: [
              { nom: contient(mot) },
              { commune: contient(mot) },
              { codePostal: { startsWith: mot } },
            ],
          })),
      },
      select: lieuSelect,
      orderBy: [{ activitesCount: 'desc' }, { nom: 'asc' }],
      take: limite,
    })
  ).map(optionDuLieu)

export const lieuxChoisis = async (
  ids: readonly string[],
): Promise<readonly SelectOption[]> =>
  ids.length === 0
    ? []
    : (
        await prismaClient.lieuInclusion.findMany({
          where: { id: { in: [...ids] } },
          select: lieuSelect,
        })
      ).map(optionDuLieu)
