'use client'

import classNames from 'classnames'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { listeEnParametres } from '@/features/utilisateurs/abilities/lister-les-utilisateurs/ui/search-params/lister-les-utilisateurs.search-params'
import {
  RoleFiltre,
  type RoleFiltre as RoleFiltreType,
} from '@/features/utilisateurs/domain'
import { optionsDesRoles } from '@/features/utilisateurs/ui/presenters/libelles-des-filtres.presenter'
import { FilterFooter } from '@/libraries/filtres/FilterFooter'
import TriggerButton from '@/libraries/filtres/TriggerButton'
import { requeteAvec } from '@/libraries/parametres-d-url'
import { Popover } from '@/libraries/ui/components/Primitives/Popover'

export const FiltreRoles = ({
  rolesInitiaux,
}: {
  rolesInitiaux: readonly RoleFiltreType[]
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [ouvert, setOuvert] = useState(false)
  const [roles, setRoles] = useState(rolesInitiaux)

  useEffect(() => setRoles(rolesInitiaux), [rolesInitiaux])

  const appliquer = (choisis: readonly RoleFiltreType[], fermer = false) => {
    if (fermer) setOuvert(false)
    router.replace(
      requeteAvec(searchParams, listeEnParametres('roles', choisis)),
      { scroll: false },
    )
  }

  const basculer = (valeur: string, coche: boolean) => {
    const lecture = RoleFiltre.schema.safeParse(valeur)
    if (!lecture.success) return
    const role = lecture.data
    setRoles(
      coche ? [...roles, role] : roles.filter((choisi) => choisi !== role),
    )
  }

  const effacer = () => {
    setRoles([])
    appliquer([], true)
  }

  return (
    <Popover
      open={ouvert}
      onOpenChange={setOuvert}
      onInteractOutside={() => appliquer(roles)}
      onEscapeKeyDown={() => appliquer(roles)}
      trigger={
        <TriggerButton isOpen={ouvert} isFilled={roles.length > 0}>
          Rôle{roles.length > 0 && ` · ${roles.length}`}
        </TriggerButton>
      }
    >
      <form style={{ width: 384 }} action={() => appliquer(roles, true)}>
        <fieldset className="fr-fieldset fr-mb-0">
          <legend className="fr-label fr-mb-2v fr-text--bold">
            Filtrer par&nbsp;:
          </legend>
          {optionsDesRoles.map(({ label, value }, index) => {
            const id = `filtre-role-${value}`

            return (
              <div
                className={classNames(
                  'fr-fieldset__element',
                  index === optionsDesRoles.length - 1 && 'fr-mb-0',
                )}
                key={value}
              >
                <div className="fr-checkbox-group">
                  <input
                    type="checkbox"
                    id={id}
                    name="roles"
                    value={value}
                    checked={roles.some((role) => role === value)}
                    onChange={(event) =>
                      basculer(event.target.value, event.target.checked)
                    }
                  />
                  <label className="fr-label fr-whitespace-nowrap" htmlFor={id}>
                    {label}
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
