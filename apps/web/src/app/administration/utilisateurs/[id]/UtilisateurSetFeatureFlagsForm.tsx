'use client'

import CheckboxGroupFormField from '@app/ui/components/Form/CheckboxGroupFormField'
import { SelectOption } from '@app/ui/components/Form/utils/options'
import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import { trpc } from '@app/web/trpc'
import { applyZodValidationMutationErrorsToForm } from '@app/web/utils/applyZodValidationMutationErrorsToForm'
import { UserFeatureFlags, UserId } from '@app/web/utils/user'
import Button from '@codegouvfr/react-dsfr/Button'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserFeatureFlag } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import {
  UtilisateurSetFeatureFlagsData,
  UtilisateurSetFeatureFlagsValidation,
} from './UtilisateurSetFeatureFlagsValidation'

const featureFlagOptions: SelectOption<UserFeatureFlag>[] = [
  {
    value: 'Assistant',
    label: 'Assistant',
    hint: 'Autorise l’accès à l’assistant IA',
  },
]

const UtilisateurSetFeatureFlagsForm = ({
  user,
}: {
  user: UserFeatureFlags & UserId
}) => {
  const form = useForm<UtilisateurSetFeatureFlagsData>({
    resolver: zodResolver(UtilisateurSetFeatureFlagsValidation),
    defaultValues: {
      featureFlags: user.featureFlags,
      userId: user.id,
    },
  })

  const {
    control,
    setError,
    handleSubmit,
    formState: { isSubmitting },
  } = form

  const setFeatureFlagsMutation = trpc.user.setFeatureFlags.useMutation()
  const router = useRouter()

  const onSubmit = async (data: UtilisateurSetFeatureFlagsData) => {
    try {
      await setFeatureFlagsMutation.mutateAsync(data)
      createToast({
        priority: 'success',
        message: 'Les feature flags ont été mis à jour avec succès.',
      })
      router.refresh()
    } catch (mutationError) {
      if (applyZodValidationMutationErrorsToForm(mutationError, setError)) {
        return
      }
      createToast({
        priority: 'error',
        message:
          'Une erreur est survenue lors de la mise à jour, veuillez réessayer ultérieurement.',
      })
    }
  }

  const isLoading = isSubmitting
  const disabled = isLoading

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <CheckboxGroupFormField
        label=" "
        control={control}
        path="featureFlags"
        options={featureFlagOptions}
        disabled={disabled}
      />

      <Button
        type="submit"
        priority="primary"
        {...buttonLoadingClassname(isLoading, 'fr-mb-0')}
      >
        Mettre à jour
      </Button>
    </form>
  )
}

export default withTrpc(UtilisateurSetFeatureFlagsForm)
