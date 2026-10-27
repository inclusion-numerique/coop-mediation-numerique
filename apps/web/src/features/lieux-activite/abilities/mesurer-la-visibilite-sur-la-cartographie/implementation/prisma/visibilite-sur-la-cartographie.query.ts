import { departementsRegionByCode } from '@app/web/data/collectivites-territoriales/departementsRegion'
import { Prisma } from '@app/web/generated/prisma/client'
import { getCartographieDepartementLink } from '@app/web/libraries/cartographie-nationale'
import {
  CodeInsee,
  DEPARTEMENT_PAR_DEFAUT,
  departementDeLActeur,
} from '@app/web/libraries/departement'
import { prismaClient } from '@app/web/prismaClient'
import { departementCodeFromInseeRegex } from '@app/web/utils/departementCodeFromInseeRegex'
import { visibiliteDesLieuxDuMediateur } from '../../../../implementation/prisma/lieux-du-mediateur'
import type { VisibiliteSurLaCartographie } from '../../domain'

const CARTOGRAPHIE_NATIONALE =
  'https://cartographie.societenumerique.gouv.fr/cartographie'

const nombreDeLieuxDuDepartement = async (
  departementCode: string,
): Promise<number> => {
  const [resultat] = await prismaClient.$queryRaw<[{ nombre: number }]>`
    SELECT COUNT(*)::integer AS nombre
    FROM lieu_inclusion s
    WHERE ${Prisma.sql`(
      s.suppression IS NULL
      AND SUBSTRING(s.code_insee FROM ${departementCodeFromInseeRegex}) = ${departementCode}
      AND (
        s.visible_pour_cartographie_nationale = true
        OR EXISTS (
          SELECT 1
          FROM mediateurs_en_activite mea2
          WHERE mea2.structure_id = s.id
            AND mea2.suppression IS NULL
            AND mea2.fin_activite IS NULL
        )
      )
    )`}
  `
  return resultat?.nombre ?? 0
}

const lienDuDepartement = (departementCode: string): string => {
  const departementRegion = departementsRegionByCode.get(departementCode)

  return departementRegion
    ? getCartographieDepartementLink({
        region: departementRegion.region,
        departement: departementRegion.nom,
      })
    : CARTOGRAPHIE_NATIONALE
}

export const visibiliteSurLaCartographie = async ({
  mediateurId,
  codeInseeEmployeuse,
}: {
  readonly mediateurId: string | undefined
  readonly codeInseeEmployeuse: string | undefined
}): Promise<VisibiliteSurLaCartographie> => {
  const lieux = mediateurId
    ? await visibiliteDesLieuxDuMediateur({ mediateurId })
    : []

  const departementCode =
    departementDeLActeur({
      employeuse: CodeInsee.safe(codeInseeEmployeuse ?? ''),
      lieux: lieux
        .map(({ codeInsee }) => CodeInsee.safe(codeInsee ?? ''))
        .filter((codeInsee) => codeInsee !== null),
    }) ?? DEPARTEMENT_PAR_DEFAUT

  return {
    lieuxVisiblesDuMediateur: lieux.filter(
      ({ visiblePourCartographieNationale }) =>
        visiblePourCartographieNationale,
    ).length,
    lieuxDuDepartement: await nombreDeLieuxDuDepartement(departementCode),
    lienCartographie: lienDuDepartement(departementCode),
  }
}
