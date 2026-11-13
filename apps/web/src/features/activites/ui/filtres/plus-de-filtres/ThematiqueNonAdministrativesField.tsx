import { thematiqueNonAdministrativesOptions } from '@app/web/features/activites/ui/libelles/thematique'
import { withForm } from '@app/web/libs/form/use-app-form'
import { plusDeFiltresFormOptions } from './plus-de-filtres.form-options'

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

export const ThematiqueNonAdministrativesFiled = withForm({
  ...plusDeFiltresFormOptions,
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
            ({ value }) => value !== 'AideAuxDemarchesAdministratives',
          )}
        />
      )}
    </form.AppField>
  ),
})
