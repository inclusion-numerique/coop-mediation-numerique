'use client'

import { useStore } from '@tanstack/react-form'
import type { z } from 'zod'
import {
  modaliteAccompagnementOptions,
  serviceOptions,
} from '@/features/lieux-activite/ui/labels/options-du-lieu.labels'
import { EditCardTanStack } from '@/libraries/formulaire/form-components'
import { useAppForm } from '@/libraries/formulaire/hooks'
import { ServicesEtAccompagnementSaisie } from '../../../action/modifier-la-fiche-du-lieu.validation'
import type { EnregistrerUneSection } from '../../hooks/use-enregistrement-de-section'
import { useEnregistrementDeSection } from '../../hooks/use-enregistrement-de-section'
import type { ServicesEtAccompagnementAffiches } from '../../presenters/services-et-accompagnement.presenter'
import { EtatVide } from '../EtatVide'
import { VueServicesEtAccompagnement } from '../vues/VueServicesEtAccompagnement'

export const SectionServicesEtAccompagnement = ({
  id,
  servicesEtAccompagnement,
  enregistrer,
}: {
  id: string
  servicesEtAccompagnement: ServicesEtAccompagnementAffiches
  enregistrer: EnregistrerUneSection
}) => {
  const soumettre = useEnregistrementDeSection(id, enregistrer)

  const defaultValues: z.input<typeof ServicesEtAccompagnementSaisie> = {
    section: 'ServicesEtAccompagnement',
    services: [...servicesEtAccompagnement.services],
    modalitesAccompagnement: [
      ...servicesEtAccompagnement.modalitesAccompagnement,
    ],
  }

  const form = useAppForm({
    validators: { onSubmit: ServicesEtAccompagnementSaisie },
    defaultValues,
    onSubmit: async ({ value }) =>
      soumettre(ServicesEtAccompagnementSaisie.parse(value)),
  })

  const isPending = useStore(form.store, (etat) => etat.isSubmitting)

  return (
    <EditCardTanStack
      noBorder
      contentSeparator={false}
      id="services-et-accompagnement"
      title="Services & accompagnements proposés"
      description="Sélectionnez les services proposés dans ce lieu."
      form={form}
      isPending={isPending}
      isEmpty={servicesEtAccompagnement.estVide}
      emptyState={
        <EtatVide titre="Renseignez les services proposés pour que ce lieu soit trouvé par les personnes qui en ont besoin." />
      }
      edition={
        <div className="fr-flex fr-direction-column fr-flex-gap-6v">
          <form.AppField name="services">
            {(field) => (
              <field.Checkbox
                className="fr-mb-0"
                classes={{ content: 'fr-checkboxes-compact' }}
                legend="Services proposés"
                isPending={isPending}
                isTiled={false}
                options={serviceOptions}
              />
            )}
          </form.AppField>
          <form.AppField name="modalitesAccompagnement">
            {(field) => (
              <field.Checkbox
                className="fr-mb-0"
                classes={{ content: 'fr-checkboxes-compact' }}
                legend="Modalités d’accompagnement"
                isPending={isPending}
                isTiled={false}
                options={modaliteAccompagnementOptions}
              />
            )}
          </form.AppField>
        </div>
      }
      view={
        <VueServicesEtAccompagnement
          services={[...servicesEtAccompagnement.services]}
          modalitesAccompagnement={[
            ...servicesEtAccompagnement.modalitesAccompagnement,
          ]}
        />
      }
    />
  )
}
