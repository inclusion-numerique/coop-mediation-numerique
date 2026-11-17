import { Prisma } from '@app/web/generated/prisma/client'
import {
  type EmployeuseDesActivites,
  EmployeuseId,
  NomDeCommune,
  NomDeStructure,
  type PerimetreDesActivites,
} from '../domain'
import { dansLaPeriodeDAppartenance } from './periode-d-appartenance.sql'

export const employeusesDesActivites = ({
  mediateurs,
  coordinateurId,
}: PerimetreDesActivites): Prisma.Sql => Prisma.sql`
  SELECT DISTINCT act.structure_employeuse_main_id AS id
  FROM activites act
  WHERE act.mediateur_id = ANY(${[...mediateurs]}::uuid[])
    AND act.suppression IS NULL
    AND act.structure_employeuse_main_id IS NOT NULL
    AND ${dansLaPeriodeDAppartenance(coordinateurId)}`

export const colonnesDeLEmployeuse = {
  id: true,
  denominationAntenne: true,
  denominationSirene: true,
  adresse: { select: { nomCommune: true } },
} satisfies Prisma.StructureAdministrativeMainSelect

type LigneDEmployeuse = Prisma.StructureAdministrativeMainGetPayload<{
  select: typeof colonnesDeLEmployeuse
}>

export const employeuseDesActivitesDe = (
  ligne: LigneDEmployeuse,
): readonly EmployeuseDesActivites[] => {
  const id = EmployeuseId.safe(ligne.id)
  return id === null
    ? []
    : [
        {
          id,
          nom: NomDeStructure.safe(
            ligne.denominationAntenne ?? ligne.denominationSirene ?? '',
          ),
          commune: NomDeCommune.safe(ligne.adresse?.nomCommune ?? ''),
        },
      ]
}
