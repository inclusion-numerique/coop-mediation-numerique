'use client'

import type { SelectOption } from '@app/ui/components/Form/utils/options'
import { Options } from '@app/ui/components/Primitives/Options'
import { Popover } from '@app/ui/components/Primitives/Popover'
import { FilterFooter } from '@app/web/libs/filters/FilterFooter'
import { FilterSelection } from '@app/web/libs/filters/FilterSelection'
import {
  matchingOption,
  resetPagination,
  update,
} from '@app/web/libs/filters/helpers'
import TriggerButton from '@app/web/libs/filters/TriggerButton'
import { useAppForm } from '@app/web/libs/form/use-app-form'
import { useHydrated } from '@app/web/libs/form/use-hydrated'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { EmployeuseOptions, employeuseComboBox } from './employeuse-combo-box'

const aucune = (): SelectOption | null => null

export const FiltreEmployeuses = ({
  employeusesInitiales,
}: {
  employeusesInitiales: readonly SelectOption[]
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [ouvert, setOuvert] = useState(false)
  const [employeuses, setEmployeuses] = useState(employeusesInitiales)
  const champRef = useRef<HTMLDivElement>(null)
  const enAttente = !useHydrated()

  useEffect(() => setEmployeuses(employeusesInitiales), [employeusesInitiales])

  const form = useAppForm({ defaultValues: { employeuse: aucune() } })

  const appliquer = (choisies: readonly SelectOption[], fermer = false) => {
    const params = new URLSearchParams(searchParams.toString())
    update(params)('employeuses', [...choisies])
    resetPagination(params)
    if (fermer) setOuvert(false)
    form.setFieldValue('employeuse', null)
    router.replace(`?${params}`, { scroll: false })
  }

  const choisir = (option: SelectOption) => {
    setEmployeuses((precedentes) => [...precedentes, option])
    queueMicrotask(() => form.setFieldValue('employeuse', null))
  }

  const retirer = (option: SelectOption) =>
    setEmployeuses(employeuses.filter(matchingOption(option)))

  const effacer = () => {
    setEmployeuses([])
    appliquer([], true)
  }

  return (
    <Popover
      open={ouvert}
      onOpenChange={setOuvert}
      onInteractOutside={() => appliquer(employeuses)}
      onEscapeKeyDown={() => appliquer(employeuses)}
      trigger={
        <TriggerButton isOpen={ouvert} isFilled={employeuses.length > 0}>
          Employeuse
          {employeuses.length > 0 && <>&nbsp;·&nbsp;{employeuses.length}</>}
        </TriggerButton>
      }
    >
      <form style={{ width: 384 }} action={() => appliquer(employeuses, true)}>
        <form.AppForm>
          <form.AppField name="employeuse">
            {(field) => (
              <field.ComboBox
                isPending={enAttente}
                onSelect={choisir}
                {...employeuseComboBox(() => employeuses)}
              >
                {({
                  getLabelProps,
                  getInputProps,
                  getToggleButtonProps: _,
                  ...optionsProps
                }) => (
                  <>
                    <div ref={champRef}>
                      <field.Input
                        isConnected={false}
                        isPending={enAttente}
                        nativeLabelProps={getLabelProps()}
                        nativeInputProps={{
                          ...getInputProps(),
                          placeholder: 'Nom, SIRET ou commune de la structure',
                        }}
                        label="Filtrer par structure employeuse"
                      />
                    </div>
                    <Options
                      {...optionsProps}
                      {...EmployeuseOptions}
                      anchorRef={champRef}
                      className="fr-index-2000"
                    />
                  </>
                )}
              </field.ComboBox>
            )}
          </form.AppField>
        </form.AppForm>
        {employeuses.length > 0 && (
          <>
            <FilterSelection
              options={[...employeuses]}
              onRemoveFilter={retirer}
              label={{
                singular: 'employeuse sélectionnée',
                plural: 'employeuses sélectionnées',
              }}
            />
            <FilterFooter onClearFilters={effacer} />
          </>
        )}
      </form>
    </Popover>
  )
}
