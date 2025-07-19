import RedAsterisk from '@app/ui/components/Form/RedAsterisk'
import type { SelectOption } from '@app/ui/components/Form/utils/options'
import { Options } from '@app/ui/components/Primitives/Options'
import { type DefaultValues, withForm } from '@app/web/libs/form/use-app-form'
import Button from '@codegouvfr/react-dsfr/Button'
import { Thematique } from '@prisma/client'
import { formOptions } from '@tanstack/react-form'
import {
  Tag,
  TagComboBox,
  TagOptions,
  TagSelectedItems,
} from '../../../tags/components/TagsComboBox'
import { CraData } from '../../validation/CraValidation'

const options = formOptions({
  defaultValues: {} as DefaultValues<CraData>,
})

export const ThematiquesFields = withForm({
  ...options,
  props: {} as {
    isPending: boolean
    thematiqueNonAdministrativesOptionsWithExtras: SelectOption<Thematique>[]
    thematiqueAdministrativesOptionsWithExtras: SelectOption<Thematique>[]
    initialTagsOptions: Tag[]
  },
  render: ({
    form,
    isPending,
    thematiqueNonAdministrativesOptionsWithExtras,
    thematiqueAdministrativesOptionsWithExtras,
    initialTagsOptions,
  }) => (
    <>
      <form.AppField name="thematiques">
        {(field) => (
          <>
            <field.Checkbox
              className="fr-flex-basis-0 fr-flex-grow-1 fr-mb-12v"
              classes={{
                content:
                  'fr-display-grid fr-grid--3x1 fr-grid--last-span-3 fr-grid-gap-2v',
              }}
              isPending={isPending}
              options={thematiqueNonAdministrativesOptionsWithExtras}
              orientation="horizontal"
              legend={
                <>
                  Thématique(s) d’accompagnement de médiation numérique{' '}
                  <RedAsterisk />
                </>
              }
            />
            {field.state.value?.includes(
              Thematique.AideAuxDemarchesAdministratives,
            ) && (
              <>
                <form.AppField name="thematiques">
                  {(field) => (
                    <>
                      <field.Checkbox
                        className="fr-flex-basis-0 fr-flex-grow-1 fr-mb-12v"
                        classes={{
                          content:
                            'fr-display-grid fr-grid--3x1 fr-grid-gap-2v',
                        }}
                        isPending={isPending}
                        options={thematiqueAdministrativesOptionsWithExtras}
                        orientation="horizontal"
                        legend="Thématique(s) de la démarche administrative"
                      />
                    </>
                  )}
                </form.AppField>
                <form.AppField name="precisionsDemarche">
                  {(field) => (
                    <>
                      <field.Input
                        isPending={isPending}
                        label="Préciser le nom de la démarche administrative réalisée"
                      />
                    </>
                  )}
                </form.AppField>
              </>
            )}
          </>
        )}
      </form.AppField>
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
                <Options {...options} {...TagOptions} />
                {(field.state.value?.length ?? 0) > 0 && (
                  <>
                    <field.SelectedItems {...TagSelectedItems} />
                  </>
                )}
              </>
            )}
          </field.ComboBox>
        )}
      </form.AppField>
    </>
  ),
})
