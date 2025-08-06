import { thematiqueAdministrativesOptions } from '@app/web/features/activites/use-cases/cra/fields/thematique'
import { type DefaultValues, withForm } from '@app/web/libs/form/use-app-form'
import Checkbox from '@codegouvfr/react-dsfr/Checkbox'
import { Thematique } from '@prisma/client'
import { formOptions } from '@tanstack/react-form'

export const updateThematiqueAdministrativesParams =
  (params: URLSearchParams) =>
  (data: {
    value: {
      thematiqueAdministratives: string[]
    }
  }) =>
    data.value.thematiqueAdministratives.length > 0
      ? params.set(
          'thematiqueAdministratives',
          data.value.thematiqueAdministratives.join(','),
        )
      : params.delete('thematiqueAdministratives')

const options = formOptions({
  defaultValues: {} as DefaultValues<{
    thematiqueAdministratives: Thematique[]
  }>,
})

export const ThematiqueAdministrativesFiled = withForm({
  ...options,
  props: {} as {
    isPending: boolean
  },
  render: ({ form, isPending }) => (
    <form.AppField name="thematiqueAdministratives">
      {(field) => (
        <>
          <Checkbox
            className="fr-mb-3v"
            options={[
              {
                label: 'Toutes les thématiques de démarches administrative',
                nativeInputProps: {
                  checked:
                    field.state.value?.length ===
                    thematiqueAdministrativesOptions.length,
                  onChange: (value) => {
                    field.setValue(
                      value.target.checked
                        ? thematiqueAdministrativesOptions.map(
                            ({ value }) => value,
                          )
                        : [],
                    )
                  },
                },
              },
            ]}
          />
          <field.Checkbox
            classes={{
              content: 'fr-display-grid fr-grid--2x1 fr-grid-gap-0',
            }}
            isPending={isPending}
            isTiled={false}
            options={thematiqueAdministrativesOptions}
          />
        </>
      )}
    </form.AppField>
  ),
})
