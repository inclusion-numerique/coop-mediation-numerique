'use client'

import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import { validerAction } from '@app/web/app/_actions/inscription/valider.action'
import {
  type ValiderFormData,
  ValiderValidation,
} from '@app/web/features/inscription/abilities/valider'
import CguCheckboxField from '@app/web/features/inscription/components/CguCheckboxField'
import Button from '@codegouvfr/react-dsfr/Button'
import { zodResolver } from '@hookform/resolvers/zod'
import classNames from 'classnames'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'

const erreurValidation = () =>
  createToast({
    priority: 'error',
    message:
      'Une erreur est survenue lors de l’enregistrement, veuillez réessayer ultérieurement.',
  })

const ValiderInscriptionForm = ({
  mustAcceptCgu = false,
  canCancel = false,
}: {
  mustAcceptCgu?: boolean
  canCancel?: boolean
}) => {
  const form = useForm<ValiderFormData>({
    resolver: zodResolver(ValiderValidation),
    defaultValues: {
      // Si l'acceptation des CGU n'est pas requise (déjà acceptée), on la
      // pré-remplit ; sinon l'utilisateur doit cocher la case au récapitulatif.
      cguAcceptee: mustAcceptCgu ? undefined : true,
    },
  })

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, isSubmitSuccessful },
  } = form

  const isLoading = isSubmitting || isSubmitSuccessful

  const router = useRouter()

  const onSubmit = async (data: ValiderFormData) => {
    try {
      const result = await validerAction(data)

      if (!result.success) {
        erreurValidation()
        return
      }

      router.push('/en-savoir-plus')
      router.refresh()
      createToast({
        priority: 'success',
        message: 'Votre inscription a bien été validée !',
      })
    } catch {
      erreurValidation()
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
      <div className={classNames(mustAcceptCgu && 'fr-mt-8v', 'fr-btns-group')}>
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

export default ValiderInscriptionForm
