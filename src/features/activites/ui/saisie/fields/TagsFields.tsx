import { Options } from '@app/ui/components/Primitives/Options'
import { CreationDeTagDuCra } from '@app/web/features/activites/ui/saisie/tags/ModaleDeCreationDeTag'
import {
  TagComboBox,
  TagOptions,
  TagSelectedItems,
} from '@app/web/features/activites/ui/saisie/tags/TagsComboBox'
import type { Tag } from '@app/web/features/activites/ui/saisie/tags/tag-du-cra'
import type { CraData } from '@app/web/features/activites/ui/saisie/validation/CraValidation'
import {
  type DefaultValues,
  withFieldGroup,
} from '@app/web/libs/form/use-app-form'
import Button from '@codegouvfr/react-dsfr/Button'

const valeursDuGroupe: Pick<DefaultValues<CraData>, 'tags'> = {}

export const TagsFields = withFieldGroup({
  defaultValues: valeursDuGroupe,
  props: {} as {
    isPending: boolean
    initialTagsOptions: Tag[]
  },
  render: ({ group, isPending, initialTagsOptions }) => {
    const openCraModal = CreationDeTagDuCra.useOpen()

    return (
      <group.AppField name="tags">
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
                      className="fr-border-left-0 fr-py-7v fr-pl-4v"
                      style={{ width: 56, maxWidth: 56, minWidth: 56 }}
                      iconId="fr-icon-search-line"
                      {...getToggleButtonProps({ type: 'button' })}
                    />
                  }
                  isConnected={false}
                  isPending={isPending}
                  nativeLabelProps={getLabelProps()}
                  classes={{ nativeInputOrTextArea: 'fr-input--tall' }}
                  nativeInputProps={{
                    ...getInputProps(),
                    placeholder: 'Sélectionnez un ou plusieurs tags',
                  }}
                  label="Tags spécifiques"
                  hintText={
                    <>
                      Thématiques spécifiques, dispositifs locaux... Vous pouvez
                      également créer vos tags personnalisés.{' '}
                      <a
                        className="fr-link fr-link--xs"
                        href="https://docs.numerique.gouv.fr/docs/dcade515-17b9-4298-a2e5-bdf3ed22bf96/"
                        target="_blank"
                        rel="noreferrer"
                      >
                        En savoir plus
                      </a>
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
                        quandCree: (tag) => {
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
      </group.AppField>
    )
  },
})
