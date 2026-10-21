'use client'

import type { SelectOption } from '@app/ui/components/Form/utils/options'
import { Popover } from '@app/ui/components/Primitives/Popover'
import { resetPagination } from '@app/web/libs/filters/helpers'
import TriggerButton from '@app/web/libs/filters/TriggerButton'
import classNames from 'classnames'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export const FiltreAChoixUnique = ({
  parametre,
  titre,
  libelleDeTous,
  options,
  valeurInitiale,
}: {
  parametre: string
  titre: string
  libelleDeTous: string
  options: readonly SelectOption[]
  valeurInitiale: string | null
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [ouvert, setOuvert] = useState(false)
  const [valeur, setValeur] = useState(valeurInitiale)

  useEffect(() => setValeur(valeurInitiale), [valeurInitiale])

  const appliquer = (fermer = false) => {
    const params = new URLSearchParams(searchParams.toString())
    if (valeur === null) params.delete(parametre)
    else params.set(parametre, valeur)
    resetPagination(params)
    if (fermer) setOuvert(false)
    router.replace(`?${params}`, { scroll: false })
  }

  const choix = [{ value: '', label: libelleDeTous }, ...options]

  return (
    <Popover
      open={ouvert}
      onOpenChange={setOuvert}
      onInteractOutside={() => appliquer()}
      onEscapeKeyDown={() => appliquer()}
      trigger={
        <TriggerButton isOpen={ouvert} isFilled={valeur !== null}>
          {titre}
          {valeur !== null && <>&nbsp;·&nbsp;1</>}
        </TriggerButton>
      }
    >
      <form style={{ width: 384 }} action={() => appliquer(true)}>
        <fieldset className="fr-fieldset fr-mb-0">
          <legend className="fr-label fr-mb-2v fr-text--bold">
            Filtrer par&nbsp;:
          </legend>
          {choix.map(({ label, value }, index) => {
            const id = `filtre-${parametre}-${value || 'tous'}`

            return (
              <div
                className={classNames(
                  'fr-fieldset__element',
                  index === choix.length - 1 && 'fr-mb-0',
                )}
                key={id}
              >
                <div className="fr-radio-group">
                  <input
                    type="radio"
                    id={id}
                    name={parametre}
                    value={value}
                    checked={(valeur ?? '') === value}
                    onChange={() => setValeur(value === '' ? null : value)}
                  />
                  <label className="fr-label fr-whitespace-nowrap" htmlFor={id}>
                    {label}
                  </label>
                </div>
              </div>
            )
          })}
        </fieldset>
      </form>
    </Popover>
  )
}
