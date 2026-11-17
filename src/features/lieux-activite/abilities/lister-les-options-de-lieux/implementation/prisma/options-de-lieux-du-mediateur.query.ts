import { prismaClient } from '@app/web/prismaClient'
import { lieuExploitableSql } from '../../../../implementation'
import {
  adresseComplete,
  type LieuActiviteOption,
  optionDeLieu,
} from './option-de-lieu'

type LieuActiviteQueryResult = {
  id: string
  nom: string
  adresse: string
  code_postal: string
  commune: string
  activites_count: bigint
}

export type LieuDuMediateur = {
  readonly id: string
  readonly nom: string
  readonly adresse: string
  readonly lePlusUtilise: boolean
}

const lieuxExploitesPar = async (
  mediateurIds: string[],
): Promise<LieuActiviteQueryResult[]> =>
  mediateurIds.length === 0
    ? []
    : prismaClient.$queryRaw<LieuActiviteQueryResult[]>`
    WITH lieux AS (
      SELECT DISTINCT ON (s.id)
        s.id,
        s.nom,
        s.adresse,
        s.code_postal,
        s.commune,
        COALESCE(activites_count.count, 0) AS activites_count
      FROM mediateurs_en_activite mea
      JOIN lieu_inclusion s ON s.id = mea.structure_id
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
        AND ${lieuExploitableSql('s')}
    )
    SELECT * FROM lieux
    ORDER BY activites_count DESC, nom ASC
  `

export const getMediateursLieuxActiviteOptions = async ({
  mediateurIds,
}: {
  mediateurIds: string[]
}): Promise<LieuActiviteOption[]> =>
  (await lieuxExploitesPar(mediateurIds)).map(
    ({ id, nom, commune, code_postal, adresse, activites_count }, rang) =>
      optionDeLieu(
        { id, nom, adresse, codePostal: code_postal, commune },
        Number(activites_count),
        rang,
      ),
  )

export const lieuxDuMediateur = async (
  mediateurId: string,
): Promise<readonly LieuDuMediateur[]> =>
  (await lieuxExploitesPar([mediateurId])).map(
    ({ id, nom, commune, code_postal, adresse, activites_count }, rang) => ({
      id,
      nom,
      adresse: adresseComplete({ adresse, codePostal: code_postal, commune }),
      lePlusUtilise: rang === 0 && Number(activites_count) > 0,
    }),
  )
