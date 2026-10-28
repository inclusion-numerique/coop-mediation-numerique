import { Prisma } from '@app/web/generated/prisma/client'
import {
  type Acteur,
  coordinateurDe,
  mediateurDe,
  type TypeDePortee,
} from '../domain'

export const TAGS = Prisma.raw('tags t')

export const COLONNES_DU_TAG = Prisma.raw(
  't.id, t.nom, t.description, t.mediateur_id AS "mediateurId", t.coordinateur_id AS "coordinateurId", t.departement, t.equipe',
)

const uuids = (ids: readonly string[]): Prisma.Sql =>
  Prisma.join(ids.map((id) => Prisma.sql`${id}::UUID`))

export const sansProprietaire = Prisma.sql`t.mediateur_id IS NULL AND t.coordinateur_id IS NULL`

const equipesDe = (acteur: Acteur): readonly string[] => [
  ...new Set([
    ...acteur.equipes.map(({ coordinateurId }) => coordinateurId),
    ...[coordinateurDe(acteur)].flatMap((id) => (id === null ? [] : [id])),
  ]),
]

export const tagVisiblePar = (acteur: Acteur): Prisma.Sql => {
  const equipes = equipesDe(acteur)
  const mediateurId = mediateurDe(acteur)
  const coordinateurId = coordinateurDe(acteur)

  const conditions = [
    ...(mediateurId === null
      ? []
      : [Prisma.sql`t.mediateur_id = ${mediateurId}::UUID`]),
    ...(coordinateurId === null
      ? []
      : [
          Prisma.sql`(t.mediateur_id IS NULL AND t.coordinateur_id = ${coordinateurId}::UUID AND t.equipe IS NOT TRUE)`,
        ]),
    ...(equipes.length === 0
      ? []
      : [
          Prisma.sql`(t.mediateur_id IS NULL AND t.equipe = true AND t.coordinateur_id IN (${uuids(equipes)}))`,
        ]),
    ...(acteur.departement === null
      ? []
      : [
          Prisma.sql`(${sansProprietaire} AND t.departement = ${acteur.departement})`,
        ]),
    Prisma.sql`(${sansProprietaire} AND t.departement IS NULL)`,
  ]

  return Prisma.sql`(${Prisma.join(conditions, ' OR ')})`
}

const AU_MOINS_AUSSI_LARGE: Record<TypeDePortee, Prisma.Sql> = {
  Personnel: Prisma.sql`TRUE`,
  Equipe: Prisma.sql`t.mediateur_id IS NULL AND (t.coordinateur_id IS NULL OR t.equipe = true)`,
  Departemental: sansProprietaire,
  National: Prisma.sql`${sansProprietaire} AND t.departement IS NULL`,
}

export const porteeAuMoinsAussiLargeQue = (portee: TypeDePortee): Prisma.Sql =>
  AU_MOINS_AUSSI_LARGE[portee]

export const ORDRE_ALPHABETIQUE = Prisma.sql`t.nom ASC`

export const ORDRE_DE_VISIBILITE = Prisma.sql`t.departement ASC, t.mediateur_id ASC, t.coordinateur_id ASC, t.nom ASC`
