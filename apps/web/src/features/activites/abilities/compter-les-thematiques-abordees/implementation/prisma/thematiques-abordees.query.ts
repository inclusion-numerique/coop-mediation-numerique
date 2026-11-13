import { prismaClient } from '@app/web/prismaClient'
import { pascalCase } from 'change-case'
import {
  type BeneficiaireId,
  Effectif,
  type MediateurId,
  THEMATIQUES_RECHERCHEES,
  ThematiqueRecherchee,
} from '../../../../domain'
import type { ThematiqueAbordee } from '../../domain'

export const compterLesThematiquesAbordees = async ({
  mediateurId,
  beneficiaireId,
}: {
  readonly mediateurId: MediateurId
  readonly beneficiaireId: BeneficiaireId
}): Promise<readonly ThematiqueAbordee[]> =>
  (
    await prismaClient.$queryRaw<{ thematique: string; nombre: number }[]>`
      SELECT unnest(a.thematiques)::text AS thematique, COUNT(*)::int AS nombre
      FROM activites a
        INNER JOIN accompagnements acc
          ON acc.activite_id = a.id
          AND acc.beneficiaire_id = ${beneficiaireId}::uuid
      WHERE a.suppression IS NULL
        AND a.mediateur_id = ${mediateurId}::uuid
      GROUP BY 1
      ORDER BY 1 ASC`
  ).flatMap(({ thematique, nombre }) => {
    const abordee = THEMATIQUES_RECHERCHEES.find(
      (cle) => cle === pascalCase(thematique),
    )
    return abordee === undefined
      ? []
      : [
          {
            thematique: ThematiqueRecherchee(abordee),
            nombre: Effectif(nombre),
          },
        ]
  })
