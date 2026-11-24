import { formOptions } from '@tanstack/react-form'
import { type CraIndividuelData } from '@/features/activites/abilities/enregistrer-un-accompagnement-individuel/ui/forms/cra-individuel.validation'
import type { StructureDeRedirection } from '@/features/activites/ui/labels/libelles/structures-redirection.labels'
import {
  type DefaultValues,
  withForm,
} from '@/libraries/formulaire/use-app-form'
import type { SelectOption } from '@/libraries/ui/form/utils/options'

const valeursDuFormulaire: DefaultValues<CraIndividuelData> & {
  mediateurId: string
} = { mediateurId: '' }

const options = formOptions({
  defaultValues: valeursDuFormulaire,
})

export const OrientationFields = withForm({
  ...options,
  props: {} as {
    isPending: boolean
    yesNoBooleanOptions: SelectOption<'yes' | 'no'>[]
    structuresRedirectionOptions: SelectOption<StructureDeRedirection>[]
  },
  render: ({
    form,
    isPending,
    yesNoBooleanOptions,
    structuresRedirectionOptions,
  }) => (
    <form.AppField name="orienteVersStructure">
      {(field) => (
        <>
          <field.RadioButtons
            className="fr-flex-basis-0 fr-flex-grow-1"
            classes={{
              content: 'fr-display-grid fr-grid--2x1 fr-grid-gap-2v',
            }}
            isPending={isPending}
            options={yesNoBooleanOptions}
            orientation="horizontal"
            legend="Le bénéficiaire est-il orienté vers une autre structure ?"
          />
          {field.state.value === 'yes' && (
            <form.AppField name="structureDeRedirection">
              {(field) => (
                <field.Select
                  className="fr-flex-basis-0 fr-flex-grow-1 fr-mb-8v"
                  isPending={isPending}
                  options={structuresRedirectionOptions}
                  placeholder="Structure de redirection"
                  label={<></>}
                />
              )}
            </form.AppField>
          )}
        </>
      )}
    </form.AppField>
  ),
})
