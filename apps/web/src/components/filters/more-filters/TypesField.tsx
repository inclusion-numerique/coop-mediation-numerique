import { typeActiviteSlugOptions } from '@app/web/features/activites/use-cases/cra/fields/type-activite'
import { type DefaultValues, withForm } from '@app/web/libs/form/use-app-form'
import { formOptions } from '@tanstack/react-form'

export const updateTypesParams =
  (params: URLSearchParams) => (data: { value: { types: string[] } }) =>
    data.value.types.length > 0
      ? params.set('types', data.value.types.join(','))
      : params.delete('types')

const options = formOptions({
  defaultValues: {} as DefaultValues<{
    types: string[]
  }>,
})

export const TypesField = withForm({
  ...options,
  props: {} as {
    isPending: boolean
  },
  render: ({ form, isPending }) => (
    <form.AppField name="types">
      {(field) => (
        <field.Checkbox
          isPending={isPending}
          isTiled={false}
          legend={
            <h2 className="fr-h6 fr-mb-0">
              Filtrer par type d’activité&nbsp;:
            </h2>
          }
          options={typeActiviteSlugOptions}
        />
      )}
    </form.AppField>
  ),
})
