import type { SelectOption } from '@app/ui/components/Form/utils/options'
import type { Materiel } from '@app/web/features/activites/ui/libelles/materiel'
import { CraData } from '@app/web/features/activites/ui/saisie/validation/CraValidation'
import { type DefaultValues, withForm } from '@app/web/libs/form/use-app-form'
import { formOptions } from '@tanstack/react-form'

const options = formOptions({
  defaultValues: {} as DefaultValues<CraData>,
})

export const MaterielField = withForm({
  ...options,
  props: {} as {
    isPending: boolean
    materielOptions: SelectOption<Materiel>[]
  },
  render: ({ form, isPending, materielOptions }) => (
    <form.AppField name="materiel">
      {(field) => (
        <field.Checkbox
          className="fr-flex-basis-0 fr-flex-grow-1 fr-mb-12v"
          classes={{
            content:
              'fr-display-grid fr-grid--2x1 fr-grid-md--5x1 fr-grid-gap-2v',
          }}
          isPending={isPending}
          options={materielOptions}
          orientation="horizontal"
          legend="Matériel numérique utilisé"
        />
      )}
    </form.AppField>
  ),
})
