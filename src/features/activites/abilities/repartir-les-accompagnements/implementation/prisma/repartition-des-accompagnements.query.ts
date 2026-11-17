import { Prisma } from '@app/web/generated/prisma/client'
import { prismaClient } from '@app/web/prismaClient'
import {
  activitesRetenues,
  type DemandeDeStatistiques,
  jointuresDesStatistiques,
} from '../../../../db/statistiques.sql'
import { valeurEnBase } from '../../../../db/valeur-en-base'
import {
  Effectif,
  repartitionComplete,
  thematiquesRecherchees,
  typesDActivite,
  typesDeLieu,
} from '../../../../domain'
import {
  bornesEnMinutes,
  materielsComptes,
  type RepartitionDesAccompagnements,
  tranchesDeDuree,
} from '../../domain'

type Ligne = {
  readonly total: number
  readonly types: readonly number[]
  readonly durees: readonly number[]
  readonly types_de_lieu: readonly number[]
  readonly thematiques: readonly number[]
  readonly materiels: readonly number[]
}

const accompagnementsOu = (condition: Prisma.Sql): Prisma.Sql =>
  Prisma.sql`COALESCE(SUM(act.accompagnements_count) FILTER (WHERE ${condition}), 0)::int`

const parValeur = <V extends string>(
  valeurs: readonly V[],
  condition: (enBase: string) => Prisma.Sql,
): Prisma.Sql =>
  Prisma.sql`ARRAY[${Prisma.join(
    valeurs.map((valeur) => accompagnementsOu(condition(valeurEnBase(valeur)))),
  )}]::int[]`

const parDuree = Prisma.sql`ARRAY[${Prisma.join(
  tranchesDeDuree.map((tranche) => {
    const { depuis, jusqua } = bornesEnMinutes(tranche)
    return accompagnementsOu(
      jusqua === null
        ? Prisma.sql`act.duree >= ${depuis}`
        : Prisma.sql`act.duree >= ${depuis} AND act.duree < ${jusqua}`,
    )
  }),
)}]::int[]`

export const repartirLesAccompagnements = async (
  demande: DemandeDeStatistiques,
): Promise<RepartitionDesAccompagnements> => {
  const [ligne] = await prismaClient.$queryRaw<Ligne[]>`
    SELECT
      COALESCE(SUM(act.accompagnements_count), 0)::int AS total,
      ${parValeur(typesDActivite, (type) => Prisma.sql`act.type = ${type}::type_activite`)} AS types,
      ${parDuree} AS durees,
      ${parValeur(typesDeLieu, (typeDeLieu) => Prisma.sql`act.type_lieu = ${typeDeLieu}::type_lieu`)} AS types_de_lieu,
      ${parValeur(thematiquesRecherchees, (thematique) => Prisma.sql`${thematique}::thematique = ANY(act.thematiques)`)} AS thematiques,
      ${parValeur(materielsComptes, (materiel) => Prisma.sql`${materiel}::materiel = ANY(act.materiel)`)} AS materiels
    FROM activites act ${jointuresDesStatistiques(demande.criteres)}
    WHERE ${activitesRetenues(demande)}`
  return {
    total: Effectif(ligne?.total ?? 0),
    types: repartitionComplete(typesDActivite, ligne?.types ?? []),
    durees: repartitionComplete(tranchesDeDuree, ligne?.durees ?? []),
    typesDeLieu: repartitionComplete(typesDeLieu, ligne?.types_de_lieu ?? []),
    thematiques: repartitionComplete(
      thematiquesRecherchees,
      ligne?.thematiques ?? [],
    ),
    materiels: repartitionComplete(materielsComptes, ligne?.materiels ?? []),
  }
}
