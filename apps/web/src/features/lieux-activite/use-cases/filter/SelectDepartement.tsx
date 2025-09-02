import { ComboBox } from '@app/ui/components/Primitives/Form/ComboBox'
import Input from '@app/ui/components/Primitives/Form/Input'
import { Options } from '@app/ui/components/Primitives/Options'
import {
  DepartementActivite,
  DepartementActiviteComboBox,
  DepartementActiviteOptions,
} from '@app/web/features/adresse/combo-box/DepartementActiviteComboBox'
import Button from '@codegouvfr/react-dsfr/Button'
import React from 'react'

export const SelectDepartement = ({
  departements,
  handleSelectFilter,
}: {
  departements: DepartementActivite[]
  handleSelectFilter: (selectedItem: DepartementActivite) => void
}) => (
  <ComboBox
    loadSuggestionsOnOpenChange
    {...DepartementActiviteComboBox(departements)}
    onSelectedItemChange={(item, setInputValue) => {
      setInputValue('')
      handleSelectFilter({
        label: item?.label ?? '',
        value: item?.value ?? '',
      })
    }}
  >
    {({ getLabelProps, getInputProps, getToggleButtonProps, ...options }) => (
      <>
        <Input
          label
          addonEnd={
            <Button
              title="Voir les departements"
              priority="tertiary"
              className="fr-border-left-0"
              iconId="fr-icon-search-line"
              {...getToggleButtonProps({ type: 'button' })}
            />
          }
          nativeLabelProps={getLabelProps()}
          nativeInputProps={{
            ...getInputProps(),
            placeholder: 'Choisir un département',
          }}
        />
        <Options {...options} {...DepartementActiviteOptions} />
      </>
    )}
  </ComboBox>
)
