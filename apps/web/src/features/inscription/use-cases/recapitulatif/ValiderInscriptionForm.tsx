'use client'

import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import CguCheckboxField from '@app/web/features/inscription/components/CguCheckboxField'
import {
  ValiderInscriptionData,
  ValiderInscriptionValidation,
} from '@app/web/features/utilisateurs/use-cases/registration/ValiderInscriptionValidation'
import { trpc } from '@app/web/trpc'
import Button from '@codegouvfr/react-dsfr/Button'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'

const ValiderInscriptionForm = ({
  userId,
  mustAcceptCgu = false,
  canCancel = false,
}: {
  userId: string
  mustAcceptCgu?: boolean
  canCancel?: boolean
}) => {
  const form = useForm<ValiderInscriptionData>({
    resolver: zodResolver(ValiderInscriptionValidation),
    defaultValues: {
      userId,
      // If CGU acceptance is not required (already accepted), default to true
      cguAcceptee: mustAcceptCgu ? undefined : true,
    },
  })

  const { control, handleSubmit } = form

  const mutation = trpc.inscription.validerInscription.useMutation()

  const isLoading = mutation.isPending || mutation.isSuccess

  const router = useRouter()

  const onSubmit = async (data: ValiderInscriptionData) => {
    try {
      await mutation.mutateAsync(data)
      router.push('/en-savoir-plus')
      router.refresh()
      createToast({
        priority: 'success',
        message: 'Votre inscription a bien été validée !',
      })
    } catch {
      createToast({
        priority: 'error',
        message:
          'Une erreur est survenue lors de l’enregistrement, veuillez réessayer ultérieurement.',
      })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {mustAcceptCgu && (
        <CguCheckboxField
          path="cguAcceptee"
          control={control}
          disabled={isLoading}
        />
      )}
      <div className="fr-btns-group">
        <Button
          type="submit"
          priority="primary"
          {...buttonLoadingClassname(isLoading, 'fr-mb-0')}
        >
          Valider mon inscription
        </Button>
        {canCancel && (
          <Button
            linkProps={{ href: '/' }}
            priority="secondary"
            className="fr-mb-0 fr-mt-4v"
          >
            Annuler
          </Button>
        )}
      </div>
    </form>
  )
}

export default withTrpc(ValiderInscriptionForm)
