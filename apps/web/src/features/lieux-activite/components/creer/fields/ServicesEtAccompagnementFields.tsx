'use client'

import RedAsterisk from '@app/ui/components/Form/RedAsterisk'
import { optionsWithEmptyValue } from '@app/ui/components/Form/utils/options'
import { modaliteAccompagnementOptions } from '@app/web/features/structures/modaliteAccompagnement'
import {
  serviceLabels,
  serviceOptions,
} from '@app/web/features/structures/service'
import { withForm } from '@app/web/libs/form/use-app-form'
import Notice from '@codegouvfr/react-dsfr/Notice'
import { useStore } from '@tanstack/react-form'
import { creerLieuActiviteFormOptions } from '../creerLieuActiviteFormData'

export const ServicesEtAccompagnementFields = withForm({
  ...creerLieuActiviteFormOptions,
  props: {} as { isPending: boolean },
  render: ({ form, isPending }) => {
    const services = useStore(form.store, (state) => state.values.services)

    return (
      <>
        {services.length === 0 && (
          <Notice
            className="fr-notice--warning fr-notice--flex fr-align-items-center fr-mb-6v"
            title={
              <span className="fr-text-default--grey fr-text--regular fr-text--sm">
                Il est obligatoire de renseigner les services d’inclusion
                numérique proposés afin d’être visible sur la cartographie.
              </span>
            }
          />
        )}

        <form.AppField name="services">
          {(field) => (
            <>
              <field.MultiSelect
                isPending={isPending}
                label={
                  <>
                    Thématiques des services d’inclusion numérique{' '}
                    <RedAsterisk />
                  </>
                }
                hint="Renseignez ici les services proposés dans ce lieu."
                options={optionsWithEmptyValue(serviceOptions)}
              />
              <field.SelectedItems
                itemToString={(item: string) =>
                  serviceLabels[item as keyof typeof serviceLabels] ?? item
                }
                itemToKey={(item: string) => item}
              />
            </>
          )}
        </form.AppField>

        <form.AppField name="modalitesAccompagnement">
          {(field) => (
            <field.Checkbox
              className="fr-mb-0"
              isPending={isPending}
              isTiled={false}
              legend="Types d’accompagnements proposés"
              options={modaliteAccompagnementOptions}
            />
          )}
        </form.AppField>
      </>
    )
  },
})
