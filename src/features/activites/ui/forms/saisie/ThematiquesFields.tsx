import { CraData } from '@/features/activites/ui/forms/cra.validation'
import {
  AIDE_AUX_DEMARCHES_ADMINISTRATIVES,
  type Thematique,
} from '@/features/activites/ui/labels/libelles/thematique.labels'
import {
  type DefaultValues,
  withFieldGroup,
} from '@/libraries/formulaire/use-app-form'
import RedAsterisk from '@/libraries/ui/form/RedAsterisk'
import type { SelectOption } from '@/libraries/ui/form/utils/options'

const valeursDuGroupe: Pick<
  DefaultValues<CraData>,
  'thematiques' | 'precisionsDemarche'
> = {}

export const ThematiquesFields = withFieldGroup({
  defaultValues: valeursDuGroupe,
  props: {} as {
    isPending: boolean
    thematiqueNonAdministrativesOptionsWithExtras: SelectOption<Thematique>[]
    thematiqueAdministrativesOptionsWithExtras: SelectOption<Thematique>[]
  },
  render: ({
    group,
    isPending,
    thematiqueNonAdministrativesOptionsWithExtras,
    thematiqueAdministrativesOptionsWithExtras,
  }) => (
    <group.AppField name="thematiques">
      {(field) => (
        <>
          <field.Checkbox
            className="fr-flex-basis-0 fr-flex-grow-1 fr-mb-12v"
            classes={{
              content:
                'fr-display-grid fr-grid--2x1 fr-grid-md--3x1 fr-grid--last-span-2 fr-grid-md--last-span-3 fr-grid-gap-2v',
            }}
            isPending={isPending}
            options={thematiqueNonAdministrativesOptionsWithExtras}
            orientation="horizontal"
            legend={
              <>
                Thématique(s) d’accompagnement de médiation numérique{' '}
                <RedAsterisk />
              </>
            }
          />
          {field.state.value?.includes(AIDE_AUX_DEMARCHES_ADMINISTRATIVES) && (
            <>
              <group.AppField name="thematiques">
                {(field) => (
                  <>
                    <field.Checkbox
                      className="fr-flex-basis-0 fr-flex-grow-1 fr-mb-12v"
                      classes={{
                        content:
                          'fr-display-grid fr-grid--2x1 fr-grid-md--3x1 fr-grid-gap-2v',
                      }}
                      isPending={isPending}
                      options={thematiqueAdministrativesOptionsWithExtras}
                      orientation="horizontal"
                      legend="Thématique(s) de la démarche administrative"
                    />
                  </>
                )}
              </group.AppField>
              <group.AppField name="precisionsDemarche">
                {(field) => (
                  <>
                    <field.Input
                      isPending={isPending}
                      label="Préciser le nom de la démarche administrative réalisée"
                      classes={{ nativeInputOrTextArea: 'fr-input--tall' }}
                      className="fr-mb-12v"
                    />
                  </>
                )}
              </group.AppField>
            </>
          )}
        </>
      )}
    </group.AppField>
  ),
})
