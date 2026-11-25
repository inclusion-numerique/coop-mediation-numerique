import { formOptions } from '@tanstack/react-form'
import { CraCollectifData } from '@/features/activites/abilities/enregistrer-un-atelier-collectif/ui/forms/cra-collectif.validation'
import type { NiveauAtelier } from '@/features/activites/ui/labels/libelles/niveau-atelier.labels'
import type { DefaultValues } from '@/libraries/formulaire'
import { withForm } from '@/libraries/formulaire/hooks'
import type { SelectOption } from '@/libraries/ui'

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
