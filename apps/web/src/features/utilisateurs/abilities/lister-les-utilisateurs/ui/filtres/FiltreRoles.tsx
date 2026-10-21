'use client'

import { Popover } from '@app/ui/components/Primitives/Popover'
import {
  RoleFiltre,
  type RoleFiltre as RoleFiltreType,
} from '@app/web/features/utilisateurs/domain'
import { optionsDesRoles } from '@app/web/features/utilisateurs/ui'
import { FilterFooter } from '@app/web/libs/filters/FilterFooter'
import { resetPagination } from '@app/web/libs/filters/helpers'
import TriggerButton from '@app/web/libs/filters/TriggerButton'
import classNames from 'classnames'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

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
    const params = new URLSearchParams(searchParams.toString())
    if (choisis.length === 0) params.delete('roles')
    else params.set('roles', choisis.join(','))
    resetPagination(params)
    if (fermer) setOuvert(false)
    router.replace(`?${params}`, { scroll: false })
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
