import { prismaClient } from '@/configuration/prisma/prisma-client'
import { Prisma } from '@/generated/prisma/client'
import type { FiltresUtilisateurs } from '../../domain'

export type UtilisateursRattaches = {
  readonly employeuses: readonly string[] | null
  readonly lieux: readonly string[] | null
}

export const SANS_ANCIENS_RATTACHEMENTS: UtilisateursRattaches = {
  employeuses: null,
  lieux: null,
}

const identifiants = async (requete: Prisma.Sql): Promise<readonly string[]> =>
  (await prismaClient.$queryRaw<{ id: string }[]>(requete)).map(({ id }) => id)

const rattachesAuxEmployeuses = (employeuses: readonly number[]) =>
  identifiants(Prisma.sql`
    SELECT personne.coop_id AS id
    FROM main.personne_affectations_emploi affectation
    JOIN main.personne personne ON personne.id = affectation.personne_id
    WHERE affectation.structure_administrative_id = ANY(${[...employeuses]}::int[])
      AND personne.coop_id IS NOT NULL
    UNION
    SELECT mediateur.user_id AS id
    FROM coop.activites activite
    JOIN coop.mediateurs mediateur ON mediateur.id = activite.mediateur_id
    WHERE activite.structure_employeuse_main_id = ANY(${[...employeuses]}::int[])
      AND activite.suppression IS NULL
  `)

const rattachesAuxLieux = (lieux: readonly string[]) =>
  identifiants(Prisma.sql`
    SELECT mediateur.user_id AS id
    FROM coop.mediateurs_en_activite rattachement
    JOIN coop.mediateurs mediateur ON mediateur.id = rattachement.mediateur_id
    WHERE rattachement.structure_id = ANY(${[...lieux]}::uuid[])
      AND rattachement.suppression IS NULL
      AND rattachement.fin_activite IS NULL
    UNION
    SELECT mediateur.user_id AS id
    FROM coop.activites activite
    JOIN coop.mediateurs mediateur ON mediateur.id = activite.mediateur_id
    WHERE activite.structure_id = ANY(${[...lieux]}::uuid[])
      AND activite.suppression IS NULL
  `)

const siDemande = <T>(
  demande: boolean,
  resoudre: () => Promise<readonly T[]>,
): Promise<readonly T[] | null> =>
  demande ? resoudre() : Promise.resolve(null)

export const utilisateursRattaches = async (
  filtres: FiltresUtilisateurs,
): Promise<UtilisateursRattaches> => {
  const avecLesAnciens = filtres.rattachements === 'ActuelsEtAnciens'

  const [employeuses, lieux] = await Promise.all([
    siDemande(avecLesAnciens && filtres.employeuses.length > 0, () =>
      rattachesAuxEmployeuses(filtres.employeuses),
    ),
    siDemande(avecLesAnciens && filtres.lieux.length > 0, () =>
      rattachesAuxLieux(filtres.lieux),
    ),
  ])

  return { employeuses, lieux }
}
