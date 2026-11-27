import { prismaClient } from '@/configuration/prisma'
import { Effectif } from '../../../../domain'
import {
  activitesRetenues,
  type DemandeDeStatistiques,
  jointuresDesStatistiques,
  personneAccompagnee,
} from '../../../../implementations/prisma/statistiques/statistiques.sql'
import type {
  ActivitesEtAccompagnementsComptes,
  PersonnesComptees,
} from '../../domain'

type LigneDesActivites = {
  readonly activites: number
  readonly individuelles: number
  readonly collectives: number
  readonly accompagnements: number
  readonly accompagnements_collectifs: number
}

type LigneDesPersonnes = {
  readonly personnes: number
  readonly suivies: number
}

export const activitesComptees = async (
  demande: DemandeDeStatistiques,
): Promise<ActivitesEtAccompagnementsComptes> => {
  const [ligne] = await prismaClient.$queryRaw<LigneDesActivites[]>`
    SELECT
      COUNT(*)::int AS activites,
      COUNT(*) FILTER (WHERE act.type = 'individuel')::int AS individuelles,
      COUNT(*) FILTER (WHERE act.type = 'collectif')::int AS collectives,
      COALESCE(SUM(act.accompagnements_count), 0)::int AS accompagnements,
      COALESCE(SUM(act.accompagnements_count) FILTER (WHERE act.type = 'collectif'), 0)::int AS accompagnements_collectifs
    FROM activites act ${jointuresDesStatistiques(demande.criteres)}
    WHERE ${activitesRetenues(demande)}`
  return {
    activites: {
      total: Effectif(ligne?.activites ?? 0),
      individuelles: Effectif(ligne?.individuelles ?? 0),
      collectives: Effectif(ligne?.collectives ?? 0),
    },
    accompagnements: {
      total: Effectif(ligne?.accompagnements ?? 0),
      collectifs: Effectif(ligne?.accompagnements_collectifs ?? 0),
    },
  }
}

export const personnesComptees = async (
  demande: DemandeDeStatistiques,
): Promise<PersonnesComptees> => {
  const [ligne] = await prismaClient.$queryRaw<LigneDesPersonnes[]>`
    SELECT
      COUNT(*)::int AS personnes,
      COUNT(*) FILTER (WHERE ben.anonyme = false)::int AS suivies
    FROM beneficiaires ben
    WHERE ${personneAccompagnee(demande)}`
  return {
    total: Effectif(ligne?.personnes ?? 0),
    suivies: Effectif(ligne?.suivies ?? 0),
  }
}

export const nouvellesPersonnesComptees = async (
  demande: DemandeDeStatistiques,
): Promise<Effectif> => {
  const [ligne] = await prismaClient.$queryRaw<{ nouvelles: number }[]>`
    SELECT COUNT(*)::int AS nouvelles
    FROM accompagnements acc
      INNER JOIN activites act ON acc.activite_id = act.id
      ${jointuresDesStatistiques(demande.criteres)}
    WHERE acc.premier_accompagnement = true
      AND ${activitesRetenues(demande)}`
  return Effectif(ligne?.nouvelles ?? 0)
}
