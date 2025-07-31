import type { SelectOption } from '@app/ui/components/Form/utils/options'
import { type DefaultValues, withForm } from '@app/web/libs/form/use-app-form'
import { NiveauAtelier } from '@prisma/client'
import { formOptions } from '@tanstack/react-form'
import { CraCollectifData } from '../../validation/CraCollectifValidation'

const options = formOptions({
  defaultValues: {} as DefaultValues<CraCollectifData>,
})

export const NiveauAtelierField = withForm({
  ...options,
  props: {} as {
    isPending: boolean
    niveauAtelierOptionsWithExtras: SelectOption<NiveauAtelier>[]
  },
  render: ({ form, isPending, niveauAtelierOptionsWithExtras }) => (
    <form.AppField name="niveau">
      {(field) => (
        <field.RadioButtons
          className="fr-flex-basis-0 fr-flex-grow-1 fr-mb-12v"
          classes={{ content: 'fr-display-grid fr-grid--3x1 fr-grid-gap-2v' }}
          isPending={isPending}
          options={niveauAtelierOptionsWithExtras}
          orientation="horizontal"
          legend="Niveau de l’atelier"
        />
      )}
    </form.AppField>
  ),
})
