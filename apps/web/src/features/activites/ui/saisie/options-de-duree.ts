import { labelsToOptions } from '@app/ui/components/Form/utils/options'
import { dureeAsString } from '@app/web/utils/dureeAsString'
import {
  dureeAccompagnementParDefautLabels,
  dureeAccompagnementPersonnaliseeValue,
} from '../libelles/duree-accompagnement'

const libelleDe = (duree: string): string =>
  duree === dureeAccompagnementPersonnaliseeValue
    ? dureeAccompagnementParDefautLabels.personnaliser
    : dureeAsString(Number.parseInt(duree, 10))

const ordreDesDurees = (
  [a]: readonly [string, string],
  [b]: readonly [string, string],
) => {
  const minutesA = Number.parseInt(a, 10)
  const minutesB = Number.parseInt(b, 10)
  if (Number.isNaN(minutesA) && !Number.isNaN(minutesB)) return 1
  if (!Number.isNaN(minutesA) && Number.isNaN(minutesB)) return -1
  return minutesA - minutesB
}

export const optionsDeDuree = ({
  dureesFrequentes,
  incluse,
}: {
  readonly dureesFrequentes: readonly number[]
  readonly incluse?: string | null
}) =>
  labelsToOptions(
    Object.fromEntries(
      new Map(
        [
          ...dureesFrequentes.map((duree): readonly [string, string] => [
            duree.toString(),
            dureeAsString(duree),
          ]),
          ...Object.entries(dureeAccompagnementParDefautLabels),
          ...(incluse == null ? [] : [[incluse, libelleDe(incluse)] as const]),
        ].toSorted(ordreDesDurees),
      ),
    ),
  )
