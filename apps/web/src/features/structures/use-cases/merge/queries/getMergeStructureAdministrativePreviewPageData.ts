import { prismaClient } from '@app/web/prismaClient'
import type { Prisma } from '@prisma/client'

const employeuseSelect = {
  id: true,
  nom: true,
  adresse: true,
  commune: true,
  codePostal: true,
  siret: true,
  rna: true,
  denomination: true,
  nomReferent: true,
  courrielReferent: true,
  telephoneReferent: true,
  _count: { select: { emplois: true, activites: true } },
} satisfies Prisma.StructureAdministrativeSelect

// Aperçu de fusion de deux employeuses (structure_administrative). Convention alignée
// sur la fusion de lieux : la SOURCE (recherchée) sera supprimée, la CIBLE (page d'origine)
// est conservée et voit ses champs d'identité vides complétés depuis la source.
export const getMergeStructureAdministrativePreviewPageData = async (
  sourceId: string,
  targetId: string,
) => {
  const [mergeSource, mergeTarget] = await Promise.all([
    prismaClient.structureAdministrative.findUnique({
      where: { id: sourceId },
      select: employeuseSelect,
    }),
    prismaClient.structureAdministrative.findUnique({
      where: { id: targetId },
      select: employeuseSelect,
    }),
  ])

  if (!mergeSource || !mergeTarget || mergeSource.id === mergeTarget.id) {
    return null
  }

  return { mergeSource, mergeTarget }
}

export type MergeStructureAdministrativeData = NonNullable<
  Awaited<ReturnType<typeof getMergeStructureAdministrativePreviewPageData>>
>
