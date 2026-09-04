'use client'

import { optionsWithEmptyValue } from '@app/ui/components/Form/utils/options'
import { descriptionMaxLength } from '@app/web/features/lieux-activite/formulaire/DescriptionValidation'
import * as vocabulaire from '@app/web/features/lieux-activite/vocabulaire'
import { formationLabelOptions } from '@app/web/features/lieux-activite/vocabulaire/options'
import { withForm } from '@app/web/libs/form/use-app-form'
import { useSelector } from '@tanstack/react-form'
import { creerLieuActiviteFormOptions } from '../creerLieuActiviteFormData'

export const DescriptionFields = withForm({
  ...creerLieuActiviteFormOptions,
  props: {} as { isPending: boolean },
  render: ({ form, isPending }) => {
    const presentationResume = useSelector(
      form.store,
      (state) => state.values.presentationResume,
    )

    return (
      <>
        <p className="fr-mb-4w fr-text--sm fr-text-mention--grey">
          Ces champs sont optionnels
        </p>

        <form.AppField name="presentationResume">
          {(field) => (
            <field.Input
              isPending={isPending}
              textArea
              nativeTextAreaProps={{ rows: 3 }}
              label="Résumé de l’activité du lieu"
              hintText="Ce résumé permet d’introduire brièvement l’activité du lieu."
              info={`${presentationResume.length}/${descriptionMaxLength} caractères`}
            />
          )}
        </form.AppField>

        <form.AppField name="presentationDetail">
          {(field) => (
            <field.Input
              isPending={isPending}
              textArea
              nativeTextAreaProps={{ rows: 6 }}
              label="Description complète du lieu"
            />
          )}
        </form.AppField>

        <form.AppField name="formationsLabels">
          {(field) => (
            <>
              <field.MultiSelect
                isPending={isPending}
                label="Formations et labels"
                hint="Indiquez si le lieu a obtenu un(e) ou plusieurs formations et labels."
                options={optionsWithEmptyValue(formationLabelOptions)}
              />
              <field.SelectedItems
                itemToString={(item: string) =>
                  vocabulaire.formationLabel.table[
                    item as keyof typeof vocabulaire.formationLabel.table
                  ] ?? item
                }
                itemToKey={(item: string) => item}
              />
            </>
          )}
        </form.AppField>
      </>
    )
  },
})
