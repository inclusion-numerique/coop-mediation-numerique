import type { SelectOption } from '@app/ui/components/Form/utils/options'
import { prismaClient } from '@app/web/prismaClient'
import type { Prisma } from '@prisma/client'

export const mediateurStructureSelect = () =>
  ({
    nom: true,
    id: true,
    adresse: true,
    codePostal: true,
    commune: true,
  }) satisfies Prisma.StructureSelect

export type LieuActiviteOption = SelectOption<
  string,
  {
    nom: string
    adresse: string
    activites: number
    mostUsed: boolean
  }
>

type LieuActiviteQueryResult = {
  id: string
  nom: string
  adresse: string
  code_postal: string
  commune: string
  activites_count: bigint
}

export const getMediateursLieuxActiviteOptions = async ({
  mediateurIds,
}: {
  mediateurIds: string[]
}): Promise<LieuActiviteOption[]> => {
  if (mediateurIds.length === 0) return []

  const results = await prismaClient.$queryRaw<LieuActiviteQueryResult[]>`
    WITH lieux AS (
      SELECT DISTINCT ON (s.id)
        s.id,
        s.nom,
        s.adresse,
        s.code_postal,
        s.commune,
        COALESCE(activites_count.count, 0) AS activites_count
      FROM mediateurs_en_activite mea
      JOIN structures s ON s.id = mea.structure_id
      LEFT JOIN (
        SELECT structure_id, COUNT(*) as count
        FROM activites
        WHERE mediateur_id = ANY(${mediateurIds}::uuid[])
          AND structure_id IS NOT NULL
          AND suppression IS NULL
        GROUP BY structure_id
      ) activites_count ON activites_count.structure_id = s.id
      WHERE mea.mediateur_id = ANY(${mediateurIds}::uuid[])
        AND mea.suppression IS NULL
        AND mea.fin_activite IS NULL
    )
    SELECT * FROM lieux
    ORDER BY activites_count DESC, nom ASC
  `

  return results.map(
    ({ id, nom, commune, code_postal, adresse, activites_count }, index) => {
      const count = Number(activites_count)
      return {
        value: id,
        label: nom,
        extra: {
          nom,
          adresse: `${adresse}, ${code_postal} ${commune}`,
          activites: count,
          mostUsed: index === 0 && count > 0,
        },
      } satisfies LieuActiviteOption
    },
  )
}
