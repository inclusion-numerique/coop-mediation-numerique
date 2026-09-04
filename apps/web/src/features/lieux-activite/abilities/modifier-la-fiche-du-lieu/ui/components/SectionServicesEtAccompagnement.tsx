import {
  modaliteAccompagnementOptions,
  serviceOptions,
} from '@app/web/features/lieux-activite/vocabulaire/options'
;('use client')

import EditCardTanStack from '@app/web/components/EditCardTanStack'
import { useAppForm } from '@app/web/libs/form/use-app-form'
import { useStore } from '@tanstack/react-form'
import type { z } from 'zod'
import { ServicesEtAccompagnementSaisie } from '../../action/modifier-la-fiche-du-lieu.validation'
import type { EnregistrerUneSection } from '../enregistrer-une-section'
import type { FicheAffichee } from '../fiche-du-lieu.presenter'
import { EtatVide } from './EtatVide'
import { useEnregistrementDeSection } from './useEnregistrementDeSection'
import { VueServicesEtAccompagnement } from './vues/VueServicesEtAccompagnement'

export const SectionServicesEtAccompagnement = ({
  id,
  servicesEtAccompagnement,
  enregistrer,
}: {
  id: string
  servicesEtAccompagnement: FicheAffichee['servicesEtAccompagnement']
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
        <>
          <form.AppField name="services">
            {(field) => (
              <field.Checkbox
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
                legend="Modalités d’accompagnement"
                isPending={isPending}
                isTiled={false}
                options={modaliteAccompagnementOptions}
              />
            )}
          </form.AppField>
        </>
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
