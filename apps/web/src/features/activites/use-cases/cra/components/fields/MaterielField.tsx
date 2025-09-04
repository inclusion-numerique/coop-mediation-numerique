import type { SelectOption } from '@app/ui/components/Form/utils/options'
import { type DefaultValues, withForm } from '@app/web/libs/form/use-app-form'
import { Materiel } from '@prisma/client'
import { formOptions } from '@tanstack/react-form'
import { CraData } from '../../validation/CraValidation'

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
