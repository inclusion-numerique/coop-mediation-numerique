'use client'

import type { ParserMap } from 'nuqs'
import { etiquettesDe, type FiltreQuelconque } from '../definition/filtre'
import { useFiltre } from './use-filtre'

export const useEtiquettesActives = (
  filtres: readonly FiltreQuelconque[],
): readonly string[] => {
  const [lues] = useFiltre<ParserMap>(
    Object.assign({}, ...filtres.map(({ parametres }) => parametres)),
  )

  return filtres.flatMap((filtre) =>
    etiquettesDe(filtre, lues as object, {}).map(({ libelle }) => libelle),
  )
}
