'use client'

import {
  type inferParserType,
  type ParserMap,
  parseAsString,
  useQueryStates,
} from 'nuqs'
import { CLES_REMISES_A_ZERO } from './definition/composition'

const REMISES_A_ZERO = Object.fromEntries(
  CLES_REMISES_A_ZERO.map((cle) => [cle, parseAsString]),
)

const SANS_PAGE = Object.fromEntries(
  CLES_REMISES_A_ZERO.map((cle) => [cle, null]),
)

export const useFiltre = <P extends ParserMap>(parametres: P) => {
  const [lues, ecrire] = useQueryStates(
    { ...parametres, ...REMISES_A_ZERO },
    { shallow: false, scroll: false },
  )

  return [
    lues as inferParserType<P>,
    (valeurs: Partial<inferParserType<P>>) =>
      ecrire({ ...valeurs, ...SANS_PAGE } as Parameters<typeof ecrire>[0]),
  ] as const
}
