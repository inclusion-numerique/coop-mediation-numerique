import { Options } from '@app/ui/components/Primitives/Options'
import { withForm } from '@app/web/libs/form/use-app-form'
import Button from '@codegouvfr/react-dsfr/Button'
import { useRef } from 'react'
import { plusDeFiltresFormOptions } from './plus-de-filtres.form-options'
import {
  OptionDEmployeuses,
  type StructureEmployeuse,
  StructureEmployeuseComboBox,
  StructureEmployeuseSelectedItems,
} from './StructureEmployeuseComboBox'

export const structuresEmployeusesCount = ({
  structuresEmployeuses,
}: {
  structuresEmployeuses?: StructureEmployeuse[]
}) => structuresEmployeuses?.length ?? 0

export const updateStructuresEmployeusesParams =
  (params: URLSearchParams) =>
  (data: { value: { structuresEmployeuses?: StructureEmployeuse[] } }) => {
    const ids = data.value.structuresEmployeuses?.map((s) => s.id) ?? []
    ids.length > 0
      ? params.set('structuresEmployeuses', ids.join(','))
      : params.delete('structuresEmployeuses')
  }

export const StructuresEmployeusesField = withForm({
  ...plusDeFiltresFormOptions,
  props: {} as {
    isPending: boolean
    initialStructuresEmployeusesOptions: StructureEmployeuse[]
  },
  render: ({ form, isPending, initialStructuresEmployeusesOptions }) => {
    const inputContainerRef = useRef<HTMLDivElement>(null)

    return (
      <form.AppField name="structuresEmployeuses">
        {(field) => (
          <field.ComboBox
            isPending={isPending}
            defaultItems={initialStructuresEmployeusesOptions}
            {...StructureEmployeuseComboBox(field.state.value)}
          >
            {({
              getLabelProps,
              getInputProps,
              getToggleButtonProps,
              ...optionsProps
            }) => (
              <>
                <div ref={inputContainerRef}>
                  <field.Input
                    addonEnd={
                      <Button
                        title="Voir la liste des structures"
                        className="fr-border-left-0 fr-py-7v fr-pl-4v"
                        style={{ width: 56, maxWidth: 56, minWidth: 56 }}
                        iconId="fr-icon-search-line"
                        {...getToggleButtonProps({ type: 'button' })}
                      />
                    }
                    isConnected={false}
                    isPending={isPending}
                    nativeLabelProps={getLabelProps()}
                    nativeInputProps={{
                      ...getInputProps(),
                      placeholder: 'Rechercher une structure',
                      style: { minHeight: '56px' },
                    }}
                    label={
                      <h2 className="fr-h6 fr-mb-0">
                        Filtrer par structure employeuse&nbsp;:
                      </h2>
                    }
                  />
                </div>
                <Options
                  {...optionsProps}
                  {...OptionDEmployeuses}
                  anchorRef={inputContainerRef}
                  className="fr-index-2000"
                />
                <field.SelectedItems {...StructureEmployeuseSelectedItems} />
              </>
            )}
          </field.ComboBox>
        )}
      </form.AppField>
    )
  },
})
