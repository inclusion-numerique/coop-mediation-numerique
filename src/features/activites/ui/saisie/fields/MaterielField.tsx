import type { SelectOption } from '@app/ui/components/Form/utils/options'
import type { Materiel } from '@app/web/features/activites/ui/libelles/materiel'
import { CraData } from '@app/web/features/activites/ui/saisie/validation/CraValidation'
import {
  type DefaultValues,
  withFieldGroup,
} from '@app/web/libs/form/use-app-form'

const valeursDuGroupe: Pick<DefaultValues<CraData>, 'materiel'> = {}

export const MaterielField = withFieldGroup({
  defaultValues: valeursDuGroupe,
  props: {} as {
    isPending: boolean
    materielOptions: SelectOption<Materiel>[]
  },
  render: ({ group, isPending, materielOptions }) => (
    <group.AppField name="materiel">
      {(field) => (
        <field.Checkbox
          className="fr-flex-basis-0 fr-flex-grow-1 fr-mb-12v"
          classes={{
            content:
              'fr-display-grid fr-grid--2x1 fr-grid-md--5x1 fr-grid-gap-2v',
          }}
          isPending={isPending}
          options={materielOptions}
          exclusives={['Aucun']}
          orientation="horizontal"
          legend="Matériel numérique utilisé"
        />
      )}
    </group.AppField>
  ),
})
