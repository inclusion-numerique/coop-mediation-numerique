'use client'

import { createToast } from '@app/ui/toast/createToast'
import EditCard from '@app/web/components/EditCard'
import { DescriptionFields } from '@app/web/components/structure/fields/DescriptionFields'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import {
  DescriptionData,
  DescriptionValidation,
} from '@app/web/features/structures/DescriptionValidation'
import { trpc } from '@app/web/trpc'
import { applyZodValidationMutationErrorsToForm } from '@app/web/utils/applyZodValidationMutationErrorsToForm'
import { isEmpty } from '@app/web/utils/isEmpty'
import { zodResolver } from '@hookform/resolvers/zod'
import type { FormationLabel, Typologie } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { EmptyState } from '../EmptyState'
import { DescriptionView } from './DescriptionView'

const DescriptionEditCard = ({
  id,
  typologies,
  presentationResume,
  presentationDetail,
  formationsLabels,
}: {
  id: string
  typologies?: Typologie[] | null
  presentationResume?: string | null
  presentationDetail?: string | null
  formationsLabels?: FormationLabel[] | null
}) => {
  const mutation = trpc.lieuActivite.updateDescription.useMutation()
  const router = useRouter()
  const form = useForm<DescriptionData>({
    resolver: zodResolver(DescriptionValidation),
    defaultValues: {
      id,
      presentationResume,
      presentationDetail,
    },
  })

  const handleMutation = async (data: DescriptionData) => {
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
      id="description"
      title="Description du lieu"
      description="Décrivez ici le lieu et les activités qu’il propose."
      titleAs="h3"
      form={form}
      mutation={handleMutation}
      edition={<DescriptionFields form={form} />}
      view={
        <DescriptionView
          presentationResume={presentationResume}
          presentationDetail={presentationDetail}
          formationsLabels={formationsLabels}
        />
      }
      isEmpty={[presentationResume, presentationDetail].every(isEmpty)}
      emptyState={
        <EmptyState title="Compléter ces informations pour donner du contexte aux aidants qui découvrent ce lieu." />
      }
    />
  )
}

export default withTrpc(DescriptionEditCard)
