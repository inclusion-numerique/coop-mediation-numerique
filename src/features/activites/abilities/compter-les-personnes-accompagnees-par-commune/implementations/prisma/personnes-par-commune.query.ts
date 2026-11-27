import { prismaClient } from '@/configuration/prisma'
import { Effectif } from '../../../../domain'
import { communeComptee } from '../../../../implementations/prisma/statistiques/commune-comptee.transfer'
import {
  type DemandeDeStatistiques,
  personneAccompagnee,
} from '../../../../implementations/prisma/statistiques/statistiques.sql'
import type { PersonnesParCommune } from '../../domain'
import { premierCodePostal } from '../../domain/premier-code-postal'

type Ligne = {
  readonly nom: string | null
  readonly code_postal: string | null
  readonly code_insee: string | null
  readonly nombre: number
}

export const compterLesPersonnesAccompagneesParCommune = async (
  demande: DemandeDeStatistiques,
): Promise<PersonnesParCommune> =>
  (
    await prismaClient.$queryRaw<Ligne[]>`
      SELECT
        MIN(NULLIF(btrim(ben.commune), '')) AS nom,
        MIN(NULLIF(btrim(ben.commune_code_postal), '')) AS code_postal,
        ben.commune_code_insee AS code_insee,
        COUNT(*)::int AS nombre
      FROM beneficiaires ben
      WHERE ${personneAccompagnee(demande)}
      GROUP BY ben.commune_code_insee
      ORDER BY nombre DESC, nom ASC NULLS LAST, code_insee ASC NULLS LAST`
  ).map(({ nom, code_postal, code_insee, nombre }) => ({
    commune: communeComptee({
      nom,
      codePostal: premierCodePostal(code_postal),
      codeInsee: code_insee,
    }),
    nombre: Effectif(nombre),
  }))
