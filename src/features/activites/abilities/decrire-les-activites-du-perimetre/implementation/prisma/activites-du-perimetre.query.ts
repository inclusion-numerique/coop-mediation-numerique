import { prismaClient } from '@app/web/prismaClient'
import {
  colonnesDeLEmployeuse,
  employeuseDesActivitesDe,
  employeusesDesActivites,
} from '../../../../db/employeuses-des-activites.sql'
import {
  Jour,
  type PerimetreDesActivites,
  type PerimetreDesStatistiques,
} from '../../../../domain'
import {
  type ActivitesDuPerimetre,
  perimetreDesActivitesDe,
} from '../../domain'

const AUCUNE: ActivitesDuPerimetre = {
  employeuses: [],
  premiere: null,
  derniere: null,
}

const jourDe = (date: Date | null): Jour | null =>
  date === null ? null : Jour(date.toISOString().slice(0, 10))

const employeuses = async (perimetre: PerimetreDesActivites) => {
  const ids = (
    await prismaClient.$queryRaw<{ id: number }[]>(
      employeusesDesActivites(perimetre),
    )
  ).map(({ id }) => id)
  const lignes = await prismaClient.structureAdministrativeMain.findMany({
    where: { id: { in: ids } },
    select: colonnesDeLEmployeuse,
    orderBy: { denominationAntenne: 'asc' },
  })
  return lignes.flatMap(employeuseDesActivitesDe)
}

const bornes = async ({ mediateurs }: PerimetreDesActivites) => {
  const [ligne] = await prismaClient.$queryRaw<
    { premiere: Date | null; derniere: Date | null }[]
  >`
    SELECT MIN(date) AS premiere, MAX(date) AS derniere
    FROM activites
    WHERE mediateur_id = ANY(${[...mediateurs]}::uuid[])`
  return {
    premiere: jourDe(ligne?.premiere ?? null),
    derniere: jourDe(ligne?.derniere ?? null),
  }
}

export const decrireLesActivitesDuPerimetre = async (
  perimetreDesStatistiques: PerimetreDesStatistiques,
): Promise<ActivitesDuPerimetre> => {
  const perimetre = perimetreDesActivitesDe(perimetreDesStatistiques)
  if (perimetre === null || perimetre.mediateurs.length === 0) return AUCUNE
  const [desEmployeuses, desBornes] = await Promise.all([
    employeuses(perimetre),
    bornes(perimetre),
  ])
  return { employeuses: desEmployeuses, ...desBornes }
}
