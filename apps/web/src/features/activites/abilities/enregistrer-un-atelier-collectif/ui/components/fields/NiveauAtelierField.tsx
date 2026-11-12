import type { SelectOption } from '@app/ui/components/Form/utils/options'
import { CraCollectifData } from '@app/web/features/activites/abilities/enregistrer-un-atelier-collectif/ui/validation/CraCollectifValidation'
import type { NiveauAtelier } from '@app/web/features/activites/ui/libelles/niveau-atelier'
import { type DefaultValues, withForm } from '@app/web/libs/form/use-app-form'
import { formOptions } from '@tanstack/react-form'

const valeursDuFormulaire: DefaultValues<CraCollectifData> = {}

const options = formOptions({
  defaultValues: valeursDuFormulaire,
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
