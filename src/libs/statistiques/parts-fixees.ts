import { allocatePercentagesFromRecords } from '@app/web/libraries/proportions'

export const partsFixees = <V extends string>(
  valeurs: readonly V[],
  libelles: Readonly<Record<V, string>>,
  nombres: readonly number[] = [],
) =>
  allocatePercentagesFromRecords(
    valeurs.map((value, rang) => ({
      value,
      label: libelles[value],
      count: nombres[rang] ?? 0,
    })),
    'count',
    'proportion',
  )
