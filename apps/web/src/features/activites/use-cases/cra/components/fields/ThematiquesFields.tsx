import RedAsterisk from '@app/ui/components/Form/RedAsterisk'
import type { SelectOption } from '@app/ui/components/Form/utils/options'
import { type DefaultValues, withForm } from '@app/web/libs/form/use-app-form'
import { Thematique } from '@prisma/client'
import { formOptions } from '@tanstack/react-form'
import { CraData } from '../../validation/CraValidation'
import styles from '../CraForm.module.css'

const options = formOptions({
  defaultValues: {} as DefaultValues<CraData>,
})

export const ThematiquesFields = withForm({
  ...options,
  props: {} as {
    isPending: boolean
    thematiqueNonAdministrativesOptionsWithExtras: SelectOption<Thematique>[]
    thematiqueAdministrativesOptionsWithExtras: SelectOption<Thematique>[]
  },
  render: ({
    form,
    isPending,
    thematiqueNonAdministrativesOptionsWithExtras,
    thematiqueAdministrativesOptionsWithExtras,
  }) => (
    <form.AppField name="thematiques">
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
          {field.state.value?.includes(
            Thematique.AideAuxDemarchesAdministratives,
          ) && (
            <>
              <form.AppField name="thematiques">
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
              </form.AppField>
              <form.AppField name="precisionsDemarche">
                {(field) => (
                  <>
                    <field.Input
                      isPending={isPending}
                      label="Préciser le nom de la démarche administrative réalisée"
                      classes={{ nativeInputOrTextArea: styles.tallInput }}
                      className="fr-mb-12v"
                    />
                  </>
                )}
              </form.AppField>
            </>
          )}
        </>
      )}
    </form.AppField>
  ),
})
