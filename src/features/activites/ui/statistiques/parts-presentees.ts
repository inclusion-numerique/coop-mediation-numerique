import { allocatePercentagesFromRecords } from '@app/web/libraries/proportions'
import type { CommuneComptee, Repartition } from '../../domain'

export type PartPresentee<V = string> = {
  value: V
  label: string
  count: number
  proportion: number
}

export const partsPresentees = <V, A>(
  lignes: Repartition<V>,
  affichage: (valeur: V) => { value: A; label: string },
): PartPresentee<A>[] =>
  allocatePercentagesFromRecords(
    lignes.map(
      ({ valeur, nombre }): { value: A; label: string; count: number } => ({
        ...affichage(valeur),
        count: nombre,
      }),
    ),
    'count',
    'proportion',
  )

export const libelleDeLaCommune = (
  commune: CommuneComptee,
  espace = ' ',
): string =>
  commune.type === 'NonCommuniquee'
    ? 'Non communiqué'
    : `${commune.commune.nom}${espace}·${espace}${commune.commune.codePostal}`
