import { departementDuCode } from '@app/web/libraries/departement'
import { prismaClient } from '@app/web/prismaClient'
import {
  communeComptee,
  LieuActiviteId,
  NomDeStructure,
} from '../../../../domain'
import type { LieuDesStatistiques, LieuxChoisis } from '../../domain'

const lieuxDActivite = async (
  ids: LieuxChoisis['lieux'],
): Promise<readonly LieuDesStatistiques[]> =>
  ids.length === 0
    ? []
    : (
        await prismaClient.$queryRaw<{ id: string; nom: string }[]>`
          SELECT str.id::text AS id, str.nom
          FROM lieu_inclusion str
          WHERE str.id = ANY(${[...ids]}::uuid[])
          ORDER BY str.nom ASC`
      ).flatMap(({ id, nom }) => {
        const lieuId = LieuActiviteId.safe(id)
        const nomDuLieu = NomDeStructure.safe(nom)
        return lieuId === null || nomDuLieu === null
          ? []
          : [{ genre: 'LieuDActivite' as const, id: lieuId, nom: nomDuLieu }]
      })

const communes = async (
  codes: LieuxChoisis['communes'],
): Promise<readonly LieuDesStatistiques[]> =>
  codes.length === 0
    ? []
    : (
        await prismaClient.$queryRaw<
          {
            code_insee: string
            nom: string | null
            code_postal: string | null
          }[]
        >`
          SELECT code_insee,
            MIN(NULLIF(btrim(nom), '')) AS nom,
            MIN(NULLIF(btrim(code_postal), '')) AS code_postal
          FROM (
            SELECT str.code_insee, str.commune AS nom, str.code_postal
            FROM lieu_inclusion str
            WHERE str.code_insee = ANY(${[...codes]}::text[])
            UNION ALL
            SELECT act.lieu_code_insee, act.lieu_commune, act.lieu_code_postal
            FROM activites act
            WHERE act.lieu_code_insee = ANY(${[...codes]}::text[])
          ) communes
          GROUP BY code_insee
          ORDER BY nom ASC`
      ).flatMap(({ code_insee, nom, code_postal }) => {
        const commune = communeComptee({
          nom,
          codePostal: code_postal,
          codeInsee: code_insee,
        })
        return commune.type === 'Renseignee'
          ? [{ genre: 'Commune' as const, commune: commune.commune }]
          : []
      })

const departements = (
  codes: LieuxChoisis['departements'],
): readonly LieuDesStatistiques[] =>
  codes.flatMap((code) => {
    const departement = departementDuCode(code)
    return departement.success
      ? [{ genre: 'Departement' as const, departement: departement.data }]
      : []
  })

export const nommerLesLieuxChoisis = async (
  choisis: LieuxChoisis,
): Promise<readonly LieuDesStatistiques[]> => {
  const [lieux, desCommunes] = await Promise.all([
    lieuxDActivite(choisis.lieux),
    communes(choisis.communes),
  ])
  return [...lieux, ...desCommunes, ...departements(choisis.departements)]
}
