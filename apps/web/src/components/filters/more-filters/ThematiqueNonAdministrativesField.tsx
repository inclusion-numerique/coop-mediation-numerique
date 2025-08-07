import { thematiqueNonAdministrativesOptions } from '@app/web/features/activites/use-cases/cra/fields/thematique'
import { type DefaultValues, withForm } from '@app/web/libs/form/use-app-form'
import { Thematique } from '@prisma/client'
import { formOptions } from '@tanstack/react-form'

export const updateThematiqueNonAdministrativesParams =
  (params: URLSearchParams) =>
  (data: {
    value: {
      thematiqueNonAdministratives: string[]
    }
  }) =>
    data.value.thematiqueNonAdministratives.length > 0
      ? params.set(
          'thematiqueNonAdministratives',
          data.value.thematiqueNonAdministratives.join(','),
        )
      : params.delete('thematiqueNonAdministratives')

const options = formOptions({
  defaultValues: {} as DefaultValues<{
    thematiqueNonAdministratives: Thematique[]
  }>,
})

export const ThematiqueNonAdministrativesFiled = withForm({
  ...options,
  props: {} as {
    isPending: boolean
  },
  render: ({ form, isPending }) => (
    <form.AppField name="thematiqueNonAdministratives">
      {(field) => (
        <field.Checkbox
          classes={{
            content: 'fr-display-grid fr-grid--2x1 fr-grid-gap-0',
          }}
          isPending={isPending}
          isTiled={false}
          options={thematiqueNonAdministrativesOptions.filter(
            ({ value }) => value !== Thematique.AideAuxDemarchesAdministratives,
          )}
        />
      )}
    </form.AppField>
  ),
})
