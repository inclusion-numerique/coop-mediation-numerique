import {
  communesDesLieux,
  lieuxDuDepartement,
  TriDesLieux,
} from '@app/web/features/lieux-activite'
import type { CodeDepartement } from '@app/web/libraries/departement'
import type { CriteresDesLieux } from '../../domain'

export const lieuxEtCommunesDuDepartement = async (
  departement: CodeDepartement,
  { recherche, communes, tri, page, lignes }: CriteresDesLieux,
) => {
  const [lieux, { communesOptions }] = await Promise.all([
    lieuxDuDepartement({
      departementCode: departement,
      searchParams: {
        recherche: recherche ?? undefined,
        communes,
        tri: TriDesLieux(tri),
        page: String(page),
        lignes: String(lignes),
      },
    }),
    communesDesLieux({ departementCode: departement }),
  ])

  return { lieux, communes: communesOptions }
}
