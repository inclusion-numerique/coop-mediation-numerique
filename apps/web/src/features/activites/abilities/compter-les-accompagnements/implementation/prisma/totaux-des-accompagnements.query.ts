import { prismaClient } from '@app/web/prismaClient'
import {
  activitesRetenues,
  type DemandeDeStatistiques,
  jointuresDesStatistiques,
} from '../../../../db/statistiques.sql'
import { Effectif } from '../../../../domain'
import { nouvellesComptees, type TotauxDesAccompagnements } from '../../domain'

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

const activites = async (
  demande: DemandeDeStatistiques,
): Promise<LigneDesActivites> => {
  const [ligne] = await prismaClient.$queryRaw<LigneDesActivites[]>`
    SELECT
      COUNT(*)::int AS activites,
      COUNT(*) FILTER (WHERE act.type = 'individuel')::int AS individuelles,
      COUNT(*) FILTER (WHERE act.type = 'collectif')::int AS collectives,
      COALESCE(SUM(act.accompagnements_count), 0)::int AS accompagnements,
      COALESCE(SUM(act.accompagnements_count) FILTER (WHERE act.type = 'collectif'), 0)::int AS accompagnements_collectifs
    FROM activites act ${jointuresDesStatistiques(demande.criteres)}
    WHERE ${activitesRetenues(demande)}`
  return (
    ligne ?? {
      activites: 0,
      individuelles: 0,
      collectives: 0,
      accompagnements: 0,
      accompagnements_collectifs: 0,
    }
  )
}

const personnes = async (
  demande: DemandeDeStatistiques,
): Promise<LigneDesPersonnes> => {
  const [ligne] = await prismaClient.$queryRaw<LigneDesPersonnes[]>`
    SELECT
      COUNT(DISTINCT ben.id)::int AS personnes,
      COUNT(DISTINCT ben.id) FILTER (WHERE ben.anonyme = false)::int AS suivies
    FROM activites act
      INNER JOIN accompagnements acc ON acc.activite_id = act.id
      INNER JOIN beneficiaires ben ON ben.id = acc.beneficiaire_id
      ${jointuresDesStatistiques(demande.criteres)}
    WHERE ${activitesRetenues(demande)}`
  return ligne ?? { personnes: 0, suivies: 0 }
}

const nouvelles = async (demande: DemandeDeStatistiques): Promise<number> => {
  if (!nouvellesComptees(demande.criteres.periode)) return 0
  const [ligne] = await prismaClient.$queryRaw<{ nouvelles: number }[]>`
    SELECT COUNT(*)::int AS nouvelles
    FROM accompagnements acc
      INNER JOIN activites act ON acc.activite_id = act.id
      ${jointuresDesStatistiques(demande.criteres)}
    WHERE acc.premier_accompagnement = true
      AND ${activitesRetenues(demande)}`
  return ligne?.nouvelles ?? 0
}

export const compterLesAccompagnements = async (
  demande: DemandeDeStatistiques,
): Promise<TotauxDesAccompagnements> => {
  const [desActivites, desPersonnes, nouvellesPersonnes] = await Promise.all([
    activites(demande),
    personnes(demande),
    nouvelles(demande),
  ])
  return {
    activites: {
      total: Effectif(desActivites.activites),
      individuelles: Effectif(desActivites.individuelles),
      collectives: Effectif(desActivites.collectives),
    },
    accompagnements: {
      total: Effectif(desActivites.accompagnements),
      collectifs: Effectif(desActivites.accompagnements_collectifs),
    },
    personnes: {
      total: Effectif(desPersonnes.personnes),
      suivies: Effectif(desPersonnes.suivies),
      nouvelles: Effectif(nouvellesPersonnes),
    },
  }
}
