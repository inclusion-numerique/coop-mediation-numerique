'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import { useSelector } from '@tanstack/react-form'
import { useRouter } from 'next/navigation'
import { libellesDesPortees, porteesApi } from '@/features/clients-api/domain'
import {
  handleSubmit,
  useAppForm,
  useHydrated,
} from '@/libraries/formulaire/hooks'
import type { ServerActionResult } from '@/libraries/nextjs'
import { RedAsterisk } from '@/libraries/ui/form'
import { createToast } from '@/libraries/ui/toast'
import {
  ClientApiValidation,
  type ValeursDuClientApi,
} from '../../action/client-api.validation'

const LISTE_DES_CLIENTS_API = '/administration/clients-api'

const optionsDesPortees = porteesApi.map((portee) => ({
  label: libellesDesPortees[portee],
  value: portee,
}))

export const ClientApiForm = ({
  valeursInitiales,
  enregistrer,
  libelleDuBouton,
  messageDeSucces,
}: {
  valeursInitiales: ValeursDuClientApi
  enregistrer: (
    valeurs: ValeursDuClientApi,
  ) => Promise<ServerActionResult<unknown, string>>
  libelleDuBouton: string
  messageDeSucces: (nom: string) => string
}) => {
  const router = useRouter()

  const form = useAppForm({
    defaultValues: valeursInitiales,
    validators: { onSubmit: ClientApiValidation },
    onSubmit: async ({ value }) => {
      const resultat = await enregistrer(value)

      if (!resultat.success) {
        createToast({ priority: 'error', message: resultat.error })
        return
      }

      createToast({
        priority: 'success',
        message: messageDeSucces(value.nom.trim()),
      })
      router.push(LISTE_DES_CLIENTS_API)
      router.refresh()
    },
  })

  const isSubmitting = useSelector(form.store, (state) => state.isSubmitting)
  const isHydrated = useHydrated()
  const isPending = isSubmitting || !isHydrated

  return (
    <form.AppForm>
      <form onSubmit={handleSubmit(form)}>
        <form.AppField name="nom">
          {(field) => (
            <field.Input
              isPending={isPending}
              label={
                <>
                  Nom <RedAsterisk />
                </>
              }
            />
          )}
        </form.AppField>
        <form.AppField name="debut">
          {(field) => (
            <field.Input
              isPending={isPending}
              label={
                <>
                  Début de validité <RedAsterisk />
                </>
              }
              nativeInputProps={{ type: 'date' }}
            />
          )}
        </form.AppField>
        <form.AppField name="fin">
          {(field) => (
            <field.Input
              isPending={isPending}
              label="Fin de validité"
              nativeInputProps={{ type: 'date' }}
            />
          )}
        </form.AppField>
        <form.AppField name="portees">
          {(field) => (
            <field.Checkbox
              isPending={isPending}
              isTiled={false}
              legend={
                <>
                  Permissions <RedAsterisk />
                </>
              }
              options={optionsDesPortees}
            />
          )}
        </form.AppField>
        <hr className="fr-separator-12v" />
        <div className="fr-btns-group">
          <form.Submit isPending={isPending} className="fr-mb-0">
            {libelleDuBouton}
          </form.Submit>
          <Button
            linkProps={{ href: LISTE_DES_CLIENTS_API }}
            priority="tertiary"
            className="fr-mb-0 fr-mt-4v"
          >
            Annuler
          </Button>
        </div>
      </form>
    </form.AppForm>
  )
}
