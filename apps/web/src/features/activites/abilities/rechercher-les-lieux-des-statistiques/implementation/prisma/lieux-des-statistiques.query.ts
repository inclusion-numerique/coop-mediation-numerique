import { departements as REFERENTIEL_DES_DEPARTEMENTS } from '@app/web/data/collectivites-territoriales/departements'
import { Prisma } from '@app/web/generated/prisma/client'
import {
  type Departement,
  departementDuCode,
} from '@app/web/libraries/departement'
import { prismaClient } from '@app/web/prismaClient'
import { dansLePerimetre } from '../../../../db/perimetre-des-statistiques.sql'
import {
  communeComptee,
  LieuActiviteId,
  NomDeStructure,
  type PerimetreDesStatistiques,
} from '../../../../domain'
import type { GenreDeLieu, LieuDesStatistiques } from '../../domain'

const LES_PLUS_UTILISES = 10
const RESULTATS_D_UNE_RECHERCHE = 20

const limite = (recherche: string): number =>
  recherche === '' ? LES_PLUS_UTILISES : RESULTATS_D_UNE_RECHERCHE

const sansJoker = (recherche: string): string =>
  recherche.replace(/[\\%_]/g, (caractere) => `\\${caractere}`)

const contient = (colonne: Prisma.Sql, recherche: string): Prisma.Sql =>
  recherche === ''
    ? Prisma.sql`TRUE`
    : Prisma.sql`unaccent(${colonne}) ILIKE unaccent(${`%${sansJoker(recherche)}%`})`

const sansAccent = (texte: string): string =>
  texte
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

const codeDeLaCommune = Prisma.sql`COALESCE(str.code_insee, act.lieu_code_insee)`

const lieuxDActivite = async (
  perimetre: PerimetreDesStatistiques,
  recherche: string,
): Promise<readonly LieuDesStatistiques[]> =>
  (
    await prismaClient.$queryRaw<{ id: string; nom: string }[]>`
      SELECT str.id::text AS id, str.nom
      FROM activites act
        INNER JOIN lieu_inclusion str ON str.id = act.structure_id
      WHERE act.suppression IS NULL
        AND ${dansLePerimetre(perimetre)}
        AND ${contient(Prisma.sql`str.nom`, recherche)}
      GROUP BY str.id, str.nom
      ORDER BY COUNT(*) DESC, str.nom ASC
      LIMIT ${limite(recherche)}`
  ).flatMap(({ id, nom }) => {
    const lieuId = LieuActiviteId.safe(id)
    const nomDuLieu = NomDeStructure.safe(nom)
    return lieuId === null || nomDuLieu === null
      ? []
      : [{ genre: 'LieuDActivite' as const, id: lieuId, nom: nomDuLieu }]
  })

const communes = async (
  perimetre: PerimetreDesStatistiques,
  recherche: string,
): Promise<readonly LieuDesStatistiques[]> =>
  (
    await prismaClient.$queryRaw<
      { code_insee: string; nom: string | null; code_postal: string | null }[]
    >`
      SELECT ${codeDeLaCommune} AS code_insee,
        MIN(NULLIF(btrim(COALESCE(str.commune, act.lieu_commune)), '')) AS nom,
        MIN(NULLIF(btrim(COALESCE(str.code_postal, act.lieu_code_postal)), '')) AS code_postal
      FROM activites act
        LEFT JOIN lieu_inclusion str ON str.id = act.structure_id
      WHERE act.suppression IS NULL
        AND ${codeDeLaCommune} IS NOT NULL
        AND ${dansLePerimetre(perimetre)}
        AND ${contient(Prisma.sql`COALESCE(str.commune, act.lieu_commune)`, recherche)}
      GROUP BY ${codeDeLaCommune}
      ORDER BY COUNT(*) DESC, nom ASC NULLS LAST
      LIMIT ${limite(recherche)}`
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

const correspond =
  (recherche: string) =>
  ({ departement }: { readonly departement: Departement }): boolean =>
    recherche === '' ||
    departement.code.startsWith(recherche.toUpperCase()) ||
    sansAccent(departement.nom).includes(sansAccent(recherche))

const departementsDuReferentiel = (
  recherche: string,
): readonly LieuDesStatistiques[] =>
  REFERENTIEL_DES_DEPARTEMENTS.flatMap(({ code }) => {
    const departement = departementDuCode(code)
    return departement.success
      ? [{ genre: 'Departement' as const, departement: departement.data }]
      : []
  })
    .filter(correspond(recherche))
    .slice(0, limite(recherche))

const departementsDesActivites = async (
  perimetre: PerimetreDesStatistiques,
  recherche: string,
): Promise<readonly LieuDesStatistiques[]> =>
  (
    await prismaClient.$queryRaw<{ code: string }[]>`
      SELECT CASE
          WHEN ${codeDeLaCommune} ~ '^9[78]' THEN LEFT(${codeDeLaCommune}, 3)
          ELSE LEFT(${codeDeLaCommune}, 2)
        END AS code
      FROM activites act
        LEFT JOIN lieu_inclusion str ON str.id = act.structure_id
      WHERE act.suppression IS NULL
        AND ${codeDeLaCommune} IS NOT NULL
        AND ${dansLePerimetre(perimetre)}
      GROUP BY 1
      ORDER BY COUNT(*) DESC, 1 ASC`
  )
    .flatMap(({ code }) => {
      const departement = departementDuCode(code)
      return departement.success
        ? [{ genre: 'Departement' as const, departement: departement.data }]
        : []
    })
    .filter(correspond(recherche))
    .slice(0, limite(recherche))

const departements = async (
  perimetre: PerimetreDesStatistiques,
  recherche: string,
): Promise<readonly LieuDesStatistiques[]> =>
  perimetre.type === 'National'
    ? departementsDuReferentiel(recherche)
    : departementsDesActivites(perimetre, recherche)

export const rechercherLesLieuxDesStatistiques = ({
  perimetre,
  genre,
  recherche,
}: {
  readonly perimetre: PerimetreDesStatistiques
  readonly genre: GenreDeLieu
  readonly recherche: string
}): Promise<readonly LieuDesStatistiques[]> =>
  genre === 'LieuDActivite'
    ? lieuxDActivite(perimetre, recherche.trim())
    : genre === 'Commune'
      ? communes(perimetre, recherche.trim())
      : departements(perimetre, recherche.trim())
