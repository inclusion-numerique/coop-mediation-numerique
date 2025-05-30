'use client'

import { createToast } from '@app/ui/toast/createToast'
import EditCard from '@app/web/components/EditCard'
import { ServicesEtAccompagnementFields } from '@app/web/components/structure/fields/ServicesEtAccompagnementFields'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import {
  ServicesEtAccompagnementData,
  ServicesEtAccompagnementValidation,
} from '@app/web/features/structures/ServicesEtAccompagnementValidation'
import type { ServiceLabel } from '@app/web/features/structures/service'
import { trpc } from '@app/web/trpc'
import { applyZodValidationMutationErrorsToForm } from '@app/web/utils/applyZodValidationMutationErrorsToForm'
import { isEmpty } from '@app/web/utils/isEmpty'
import Notice from '@codegouvfr/react-dsfr/Notice'
import { zodResolver } from '@hookform/resolvers/zod'
import type { ModaliteAccompagnement } from '@prisma/client'
import { useRouter } from 'next/navigation'
import React from 'react'
import { useForm } from 'react-hook-form'
import { EmptyState } from '../EmptyState'
import { ServicesEtAccompagnementView } from './ServicesEtAccompagnementView'

const ServicesEtAccompagnementEditCard = ({
  id,
  services,
  modalitesAccompagnement,
}: {
  id: string
  services?: ServiceLabel[]
  modalitesAccompagnement?: ModaliteAccompagnement[]
}) => {
  const mutation =
    trpc.lieuActivite.updateServicesEtAccompagnement.useMutation()
  const router = useRouter()
  const form = useForm<ServicesEtAccompagnementData>({
    resolver: zodResolver(ServicesEtAccompagnementValidation),
    defaultValues: {
      id,
      services,
      modalitesAccompagnement,
    },
  })

  const handleMutation = async (data: ServicesEtAccompagnementData) => {
    try {
      await mutation.mutateAsync(data)

      createToast({
        priority: 'success',
        message: 'Le lieu d’activité a bien été modifié.',
      })

      router.refresh()
    } catch (mutationError) {
      if (
        applyZodValidationMutationErrorsToForm(mutationError, form.setError)
      ) {
        return
      }
      createToast({
        priority: 'error',
        message:
          'Une erreur est survenue lors de l’enregistrement, veuillez réessayer ultérieurement.',
      })
    }
  }

  return (
    <EditCard
      noBorder
      contentSeparator={false}
      id="services-et-accompagnement"
      title="Services & types d’accompagnement"
      description="Renseignez ici les services et les types d’accompagnements proposés dans ce lieu."
      titleAs="h3"
      form={form}
      mutation={handleMutation}
      edition={<ServicesEtAccompagnementFields form={form} />}
      view={
        <>
          <Notice
            className="fr-notice--warning fr-notice--flex fr-align-items-center fr-mb-6v "
            title={
              <span className="fr-text-default--grey fr-text--regular fr-text--sm">
                Il est obligatoire de renseigner les services d’inclusion
                numérique proposés afin d’être visible sur la cartographie.
              </span>
            }
          />
          <ServicesEtAccompagnementView
            services={services}
            modalitesAccompagnement={modalitesAccompagnement}
          />
        </>
      }
      isEmpty={[services, modalitesAccompagnement].every(isEmpty)}
      emptyState={
        <EmptyState
          className="fr-mb-2v"
          title="Compléter ces informations pour rendre visible votre offre de services aux aidants qui souhaitent orienter un bénéficiaire."
        />
      }
    />
  )
}

export default withTrpc(ServicesEtAccompagnementEditCard)
