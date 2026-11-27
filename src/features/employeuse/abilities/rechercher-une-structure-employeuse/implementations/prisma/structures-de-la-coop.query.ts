import { toTitleCase } from '@/libraries/texte'
import type { Employeuse } from '../../../../domain/employeuse'
import { rechercherEmployeuse } from '../../../../implementations/prisma/rechercher-employeuse.query'

const structureDeLaCoop = ({ id, denomination, adresse, siret }: Employeuse) =>
  siret === null
    ? []
    : [
        {
          id: String(id),
          nom: denomination ?? '',
          adresse: toTitleCase(adresse?.voie ?? '', { noUpper: true }),
          commune: toTitleCase(adresse?.commune ?? ''),
          codePostal: adresse?.codePostal ?? '',
          codeInsee: adresse?.codeInsee ?? '',
          siret,
          typologie: null,
          source: 'database' as const,
        },
      ]

export const lireLesStructuresDeLaCoop = async (entree: {
  readonly recherche: string
  readonly limite: number
}) => {
  const { employeuses, total } = await rechercherEmployeuse(entree)

  return { structures: employeuses.flatMap(structureDeLaCoop), total }
}
