import { Options } from '@app/ui/components/Primitives/Options'
import { type DefaultValues, withForm } from '@app/web/libs/form/use-app-form'
import Button from '@codegouvfr/react-dsfr/Button'
import { formOptions } from '@tanstack/react-form'
import {
  Tag,
  TagComboBox,
  TagOptions,
  TagSelectedItems,
} from '../../../tags/components/TagsComboBox'
import { CreateTagDynamicModal } from '../../../tags/create/CreateTagModal'
import { CraData } from '../../validation/CraValidation'

const options = formOptions({
  defaultValues: {} as DefaultValues<CraData>,
})

export const TagsFields = withForm({
  ...options,
  props: {} as {
    isPending: boolean
    initialTagsOptions: Tag[]
  },
  render: ({ form, isPending, initialTagsOptions }) => {
    const openCraModal = CreateTagDynamicModal.useOpen()

    return (
      <form.AppField name="tags">
        {(field) => (
          <field.ComboBox
            isPending={isPending}
            defaultItems={initialTagsOptions}
            {...TagComboBox(field.state.value)}
          >
            {({
              getLabelProps,
              getInputProps,
              getToggleButtonProps,
              ...options
            }) => (
              <>
                <field.Input
                  addonEnd={
                    <Button
                      title="Voir la liste des tags"
                      className="fr-border-left-0"
                      iconId="fr-icon-search-line"
                      {...getToggleButtonProps({ type: 'button' })}
                    />
                  }
                  isConnected={false}
                  isPending={isPending}
                  nativeLabelProps={getLabelProps()}
                  nativeInputProps={{
                    ...getInputProps(),
                    placeholder: 'Sélectionnez un ou plusieurs tags',
                  }}
                  label="Tags spécifiques"
                  hintText={
                    <>
                      Thématiques spécifiques, dispositifs locaux... Vous pouvez
                      également créer vos tags personnalisés.
                    </>
                  }
                />
                <Options {...options} {...TagOptions}>
                  <Button
                    type="button"
                    priority="tertiary no outline"
                    iconId="fr-icon-add-line"
                    onClick={() => {
                      openCraModal({
                        nom: options.inputValue,
                        onTagCreated: (tag) => {
                          field.setValue([...(field.state.value ?? []), tag])
                          options.setInputValue('')
                        },
                      })
                    }}
                  >
                    Créer un nouveau tag
                  </Button>
                </Options>
                <field.SelectedItems {...TagSelectedItems} />
              </>
            )}
          </field.ComboBox>
        )}
      </form.AppField>
    )
  },
})
