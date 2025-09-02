import { ComboBox } from '@app/ui/components/Primitives/Form/ComboBox'
import Input from '@app/ui/components/Primitives/Form/Input'
import { Options } from '@app/ui/components/Primitives/Options'
import {
  CommuneActivite,
  CommuneActiviteComboBox,
  CommuneActiviteOptions,
} from '@app/web/features/adresse/combo-box/CommuneActiviteComboBox'
import Button from '@codegouvfr/react-dsfr/Button'
import React from 'react'

export const SelectCommune = ({
  communes,
  handleSelectFilter,
}: {
  communes: CommuneActivite[]
  handleSelectFilter: (selectedItem: CommuneActivite) => void
}) => (
  <ComboBox
    loadSuggestionsOnOpenChange
    {...CommuneActiviteComboBox(communes)}
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
              title="Voir les communes"
              priority="tertiary"
              className="fr-border-left-0"
              iconId="fr-icon-search-line"
              {...getToggleButtonProps({ type: 'button' })}
            />
          }
          nativeLabelProps={getLabelProps()}
          nativeInputProps={{
            ...getInputProps(),
            placeholder: 'Choisir une commune',
          }}
        />
        <Options {...options} {...CommuneActiviteOptions} />
      </>
    )}
  </ComboBox>
)
