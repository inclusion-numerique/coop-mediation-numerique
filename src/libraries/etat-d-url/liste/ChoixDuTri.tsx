'use client'

import type { Sort } from '@arckit/resultset'
import { parseAsString } from 'nuqs'
import { useFiltre } from '../filtres'

const PARAMETRES_DU_TRI = { tri: parseAsString, ordre: parseAsString }

const ecritureDuTri = <C extends string>(tri: Sort<C>, parDefaut: Sort<C>) => ({
  tri: tri.field === parDefaut.field ? null : tri.field,
  ordre: tri.direction === parDefaut.direction ? null : tri.direction,
})

export const ChoixDuTri = <C extends string>({
  tri: { parDefaut },
  options,
}: {
  tri: {
    readonly colonnes: readonly C[]
    readonly parDefaut: Sort<C>
  }
  options: readonly { readonly libelle: string; readonly tri: Sort<C> }[]
}) => {
  const [{ tri, ordre }, ecrire] = useFiltre(PARAMETRES_DU_TRI)
  const colonne = tri ?? parDefaut.field
  const sens = ordre ?? parDefaut.direction
  const choisie = options.findIndex(
    (option) => option.tri.field === colonne && option.tri.direction === sens,
  )

  return (
    <label className="fr-text-label--blue-france fr-text--semi-bold fr-text--sm fr-mb-0">
      Trier par&nbsp;:
      <select
        style={{ appearance: 'auto' }}
        className="fr-text-label--blue-france fr-text--semi-bold"
        value={Math.max(choisie, 0)}
        onChange={({ target }) => {
          const option = options.at(Number(target.value))
          if (option) ecrire(ecritureDuTri(option.tri, parDefaut))
        }}
      >
        {options.map((option, rang) => (
          <option key={option.libelle} value={rang}>
            {option.libelle}
          </option>
        ))}
      </select>
    </label>
  )
}
