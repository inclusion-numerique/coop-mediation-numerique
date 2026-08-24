'use client'

import { createToast } from '@app/ui/toast/createToast'
import { validerAction } from '@app/web/app/_actions/inscription/valider.action'
import {
  type ValiderFormData,
  validerFormShape,
} from '@app/web/features/inscription/abilities/valider'
import { handleSubmit } from '@app/web/libs/form/handle-submit'
import { type DefaultValues, useAppForm } from '@app/web/libs/form/use-app-form'
import { useHydrated } from '@app/web/libs/form/use-hydrated'
import Button from '@codegouvfr/react-dsfr/Button'
import { useStore } from '@tanstack/react-form'
import classNames from 'classnames'
import { useRouter } from 'next/navigation'

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

  // Si l'acceptation des CGU n'est pas requise (déjà acceptée), on la
  // pré-remplit ; sinon l'utilisateur doit cocher la case au récapitulatif.
  const defaultValues: DefaultValues<ValiderFormData> = {
    cguAcceptee: !mustAcceptCgu,
  }

  const form = useAppForm({
    validators: { onSubmit: validerFormShape },
    defaultValues,
    onSubmit: async ({ value }) => {
      try {
        const result = await validerAction(validerFormShape.parse(value))

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

  const isSubmitting = useStore(form.store, (state) => state.isSubmitting)
  const isHydrated = useHydrated()

  // Bouton désactivé tant que la page n'est pas interactive : sans cela, un
  // clic trop précoce est silencieusement perdu à l'hydratation.
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
