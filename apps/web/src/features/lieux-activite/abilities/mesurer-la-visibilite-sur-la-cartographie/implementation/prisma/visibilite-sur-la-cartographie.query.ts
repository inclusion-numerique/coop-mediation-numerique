import { Prisma } from '@app/web/generated/prisma/client'
import { type CodeDepartement, CodeInsee } from '@app/web/libraries/departement'
import { prismaClient } from '@app/web/prismaClient'
import { departementCodeFromInseeRegex } from '@app/web/utils/departementCodeFromInseeRegex'
import type { MediateurId } from '../../../../domain/mediateur-id'
import { visibiliteDesLieuxDuMediateur } from '../../../../implementation/prisma/lieux-du-mediateur'
import {
  departementDeReference,
  type LieuDuMediateur,
  lieuxVisibles,
  NombreDeLieux,
  VisibiliteDuLieu,
  type VisibiliteSurLaCartographie,
} from '../../domain'

const lieuxDuMediateur = async (
  mediateurId: MediateurId | null,
): Promise<readonly LieuDuMediateur[]> =>
  mediateurId === null
    ? []
    : (await visibiliteDesLieuxDuMediateur({ mediateurId })).map(
        ({ codeInsee, visiblePourCartographieNationale }) => ({
          codeInsee: CodeInsee.safe(codeInsee ?? ''),
          visibilite: VisibiliteDuLieu(
            visiblePourCartographieNationale ? 'Visible' : 'Masque',
          ),
        }),
      )

const lieuxDuDepartement = async (
  departement: CodeDepartement,
): Promise<NombreDeLieux> => {
  const [resultat] = await prismaClient.$queryRaw<[{ nombre: number }]>`
    SELECT COUNT(*)::integer AS nombre
    FROM lieu_inclusion s
    WHERE ${Prisma.sql`(
      s.suppression IS NULL
      AND SUBSTRING(s.code_insee FROM ${departementCodeFromInseeRegex}) = ${departement}
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
  return NombreDeLieux(resultat?.nombre ?? 0)
}

export const visibiliteSurLaCartographie = async ({
  mediateurId,
  employeuse,
}: {
  readonly mediateurId: MediateurId | null
  readonly employeuse: CodeInsee | null
}): Promise<VisibiliteSurLaCartographie> => {
  const lieux = await lieuxDuMediateur(mediateurId)
  const departement = departementDeReference({ employeuse, lieux })

  return {
    departement,
    lieuxVisiblesDuMediateur: lieuxVisibles(lieux),
    lieuxDuDepartement: await lieuxDuDepartement(departement),
  }
}
