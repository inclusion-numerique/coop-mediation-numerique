import { ComboBox } from '@app/ui/components/Primitives/Form/ComboBox'
import Input from '@app/ui/components/Primitives/Form/Input'
import { Options } from '@app/ui/components/Primitives/Options'
import {
  TYPE_LIEUX,
  TypeLieuComboBox,
  TypeLieuLabel,
  TypeLieuOptions,
} from '@app/web/features/lieux-activite/combo-box/TypeLieuComboBox'
import Button from '@codegouvfr/react-dsfr/Button'

export const SelectTypeLieu = ({
  setTypeLieu,
}: {
  setTypeLieu: (selectedItem?: TypeLieuLabel) => void
}) => (
  <ComboBox
    defaultItems={TYPE_LIEUX}
    {...TypeLieuComboBox}
    onSelectedItemChange={(selectedItem) => setTypeLieu(selectedItem?.value)}
  >
    {({ getLabelProps, getInputProps, getToggleButtonProps, ...options }) => (
      <>
        <Input
          label={<span className="fr-text--bold">Filtrer par&nbsp;:</span>}
          addonEnd={
            <Button
              title="Voir les types de localisation"
              priority="tertiary"
              className="fr-border-left-0"
              iconId="fr-icon-arrow-down-s-line"
              {...getToggleButtonProps({ type: 'button' })}
            />
          }
          nativeLabelProps={getLabelProps()}
          nativeInputProps={{
            ...getInputProps(),
            placeholder: 'Choisir un type de localisation',
          }}
        />
        <Options {...options} {...TypeLieuOptions} />
      </>
    )}
  </ComboBox>
)
