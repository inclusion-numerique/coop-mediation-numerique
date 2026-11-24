import { prismaClient } from '@/configuration/prisma/prisma-client'
import { Prisma } from '@/generated/prisma/client'
import type {
  CoordinateurId,
  CriteresDesActivites,
  MediateurId,
} from '../../../../domain'
import { filtreDesActivites } from '../../../../implementations/prisma/criteres-des-activites.sql'
import { enPosteSql } from '../../../../implementations/prisma/statistiques/conseiller-numerique-en-poste.sql'
import { dansLaPeriodeDAppartenance } from '../../../../implementations/prisma/statistiques/periode-d-appartenance.sql'
import type { ActiviteExportee } from '../../domain'
import {
  activiteExporteeDe,
  activiteExporteeSelect,
} from './activite-exportee.transfer'

const TAILLE_DU_LOT = 500

type Curseur = {
  readonly jour: string
  readonly creation: string
  readonly id: string
}

type Retenue = Curseur & { readonly conseiller_numerique: boolean }

type Selection = {
  readonly perimetre: readonly MediateurId[]
  readonly coordinateurId: CoordinateurId | null
  readonly criteres: CriteresDesActivites
}

const apres = (curseur: Curseur | null): Prisma.Sql =>
  curseur === null
    ? Prisma.sql`TRUE`
    : Prisma.sql`(act.date, act.creation, act.id) < (${curseur.jour}::date, ${curseur.creation}::timestamp, ${curseur.id}::uuid)`

const activitesRetenues = (
  { perimetre, coordinateurId, criteres }: Selection,
  curseur: Curseur | null,
) =>
  prismaClient.$queryRaw<Retenue[]>`
    SELECT act.id::text AS id,
           act.date::text AS jour,
           act.creation::text AS creation,
           ${enPosteSql('u.id', true)} AS conseiller_numerique
    FROM activites act
      LEFT JOIN lieu_inclusion str ON str.id = act.structure_id
      LEFT JOIN mediateurs med ON med.id = act.mediateur_id
      LEFT JOIN users u ON u.id = med.user_id
    WHERE act.mediateur_id = ANY(${[...perimetre]}::uuid[])
      AND act.suppression IS NULL
      AND ${dansLaPeriodeDAppartenance(coordinateurId)}
      AND ${filtreDesActivites(criteres)}
      AND ${apres(curseur)}
    ORDER BY act.date DESC, act.creation DESC, act.id DESC
    LIMIT ${TAILLE_DU_LOT}`

const lotExporte = async (
  retenues: readonly Retenue[],
): Promise<readonly ActiviteExportee[]> => {
  const lignes = await prismaClient.activite.findMany({
    where: { id: { in: retenues.map(({ id }) => id) } },
    select: activiteExporteeSelect,
  })
  const parId = new Map(lignes.map((ligne) => [ligne.id, ligne]))
  return retenues.flatMap((retenue) => {
    const ligne = parId.get(retenue.id)
    return ligne === undefined
      ? []
      : [activiteExporteeDe(ligne, retenue.conseiller_numerique)]
  })
}

const lotsDepuis = async (
  selection: Selection,
  curseur: Curseur | null,
  exportees: readonly ActiviteExportee[],
): Promise<readonly ActiviteExportee[]> => {
  const retenues = await activitesRetenues(selection, curseur)
  const cumul = [...exportees, ...(await lotExporte(retenues))]
  const derniere = retenues.at(-1)
  return derniere === undefined || retenues.length < TAILLE_DU_LOT
    ? cumul
    : lotsDepuis(selection, derniere, cumul)
}

export const accompagnementsExportes = (
  selection: Selection,
): Promise<readonly ActiviteExportee[]> => lotsDepuis(selection, null, [])

export const importsV1Presents = async (
  mediateurs: readonly MediateurId[],
): Promise<boolean> =>
  mediateurs.length > 0 &&
  (await prismaClient.activite.findFirst({
    where: { mediateurId: { in: [...mediateurs] }, v1CraId: { not: null } },
    select: { id: true },
  })) !== null
