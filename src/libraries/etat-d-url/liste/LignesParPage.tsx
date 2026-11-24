'use client'

import classNames from 'classnames'
import { parseAsInteger } from 'nuqs'
import { useFiltre } from '../filtres/use-filtre'

const PARAMETRES_DES_LIGNES = { lignes: parseAsInteger }

export const LignesParPage = ({
  pagination: { lignes: proposees, parDefaut },
  className,
}: {
  pagination: { readonly lignes: readonly number[]; readonly parDefaut: number }
  className?: string
}) => {
  const [{ lignes }, ecrire] = useFiltre(PARAMETRES_DES_LIGNES)

  return (
    <div className={classNames(className)}>
      <select
        className="fr-select fr-select--white"
        aria-label="Nombre de lignes par page"
        value={lignes ?? parDefaut}
        onChange={({ target }) =>
          ecrire({
            lignes:
              Number(target.value) === parDefaut ? null : Number(target.value),
          })
        }
      >
        {proposees.map((nombre) => (
          <option key={nombre} value={nombre}>
            {nombre} lignes par page
          </option>
        ))}
      </select>
    </div>
  )
}
