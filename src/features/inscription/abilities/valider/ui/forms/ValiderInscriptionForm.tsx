'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import { useSelector } from '@tanstack/react-form'
import classNames from 'classnames'
import { useRouter } from 'next/navigation'
import {
  type ValiderFormData,
  ValiderValidation,
} from '@/features/inscription/abilities/valider/action/valider.validation'
import type { DefaultValues } from '@/libraries/formulaire'
import {
  handleSubmit,
  useAppForm,
  useHydrated,
} from '@/libraries/formulaire/hooks'
import { inject } from '@/libraries/nextjs/injection'
import { createToast } from '@/libraries/ui/toast'
import { VALIDER_ACTION_KEY } from '../../action/valider.key'

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
  const router = useRouter()

  const defaultValues: DefaultValues<ValiderFormData> = {
    cguAcceptee: !mustAcceptCgu,
  }

  const form = useAppForm({
    validators: { onSubmit: ValiderValidation },
    defaultValues,
    onSubmit: async ({ value }) => {
      try {
        const result = await inject(VALIDER_ACTION_KEY)(
          ValiderValidation.parse(value),
        )

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
    },
  })

  const isSubmitting = useSelector(form.store, (state) => state.isSubmitting)
  const isHydrated = useHydrated()

  const isPending = isSubmitting || !isHydrated

  return (
    <form.AppForm>
      <form onSubmit={handleSubmit(form)}>
        {mustAcceptCgu && (
          <form.AppField name="cguAcceptee">
            {(field) => (
              <field.Checkbox
                isPending={isPending}
                isTiled={false}
                options={[
                  {
                    label: (
                      <>
                        J’ai lu et j’accepte les{' '}
                        <a
                          href="/cgu"
                          className="fr-link"
                          target="_blank"
                          rel="noreferrer"
                        >
                          conditions générales d’utilisation du service
                        </a>
                      </>
                    ),
                    value: true,
                  },
                ]}
              />
            )}
          </form.AppField>
        )}
        <div
          className={classNames(mustAcceptCgu && 'fr-mt-8v', 'fr-btns-group')}
        >
          <form.Submit isPending={isPending}>
            Valider mon inscription
          </form.Submit>
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
    </form.AppForm>
  )
}

export default ValiderInscriptionForm
