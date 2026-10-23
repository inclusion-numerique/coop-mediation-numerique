'use client'

import { Popover } from '@app/ui/components/Primitives/Popover'
import { FilterFooter } from '@app/web/libs/filters/FilterFooter'
import TriggerButton from '@app/web/libs/filters/TriggerButton'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { filtresDeRole } from '../../domain'
import { LIBELLE_DU_ROLE } from '../acteurs.presenter'

const OPTIONS = [
  { libelle: 'Tous les rôles', valeur: '' },
  ...filtresDeRole.map((valeur) => ({
    libelle: LIBELLE_DU_ROLE[valeur],
    valeur,
  })),
]

export const FiltreRole = ({ role: roleRetenu }: { role: string | null }) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [ouvert, ouvrir] = useState(false)
  const [role, choisir] = useState(roleRetenu ?? '')

  const appliquer = (valeur: string, fermer: boolean) => {
    const autres = [...searchParams.entries()].filter(
      ([nom]) => nom !== 'role' && nom !== 'page',
    )
    const params = new URLSearchParams(
      valeur === '' ? autres : [...autres, ['role', valeur]],
    )
    if (fermer) ouvrir(false)
    router.replace(`?${params}`, { scroll: false })
  }

  const effacer = () => {
    choisir('')
    appliquer('', true)
  }

  return (
    <Popover
      open={ouvert}
      onOpenChange={ouvrir}
      onInteractOutside={() => appliquer(role, false)}
      onEscapeKeyDown={() => appliquer(role, false)}
      trigger={
        <TriggerButton isOpen={ouvert} isFilled={role !== ''}>
          Rôle{role !== '' && <>&nbsp;·&nbsp;1</>}
        </TriggerButton>
      }
    >
      <form style={{ width: 300 }} action={() => appliquer(role, true)}>
        <fieldset className="fr-fieldset fr-mb-0">
          <legend className="fr-label fr-mb-2v fr-text--bold">
            Filtrer par rôle&nbsp;:
          </legend>
          {OPTIONS.map(({ libelle, valeur }) => {
            const id = `role-filter-radio-${valeur || 'all'}`
            return (
              <div className="fr-fieldset__element fr-mb-1v" key={valeur}>
                <div className="fr-radio-group">
                  <input
                    type="radio"
                    id={id}
                    name="role-type"
                    value={valeur}
                    checked={role === valeur}
                    onChange={() => choisir(valeur)}
                  />
                  <label className="fr-label fr-whitespace-nowrap" htmlFor={id}>
                    {libelle}
                  </label>
                </div>
              </div>
            )
          })}
        </fieldset>
        <FilterFooter onClearFilters={effacer} />
      </form>
    </Popover>
  )
}
