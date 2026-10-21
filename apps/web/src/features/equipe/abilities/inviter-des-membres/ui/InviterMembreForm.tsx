'use client'

import { createToast } from '@app/ui/toast/createToast'
import { handleSubmit } from '@app/web/libs/form/handle-submit'
import { useAppForm } from '@app/web/libs/form/use-app-form'
import { useHydrated } from '@app/web/libs/form/use-hydrated'
import { inject } from '@app/web/libs/injection/client'
import Button from '@codegouvfr/react-dsfr/Button'
import Tag from '@codegouvfr/react-dsfr/Tag'
import { useSelector } from '@tanstack/react-form'
import { useRouter } from 'next/navigation'
import type { KeyboardEvent } from 'react'
import { z } from 'zod'
import { INVITER_DES_MEMBRES_ACTION_KEY } from '../action/inviter-des-membres.key'
import { issueDeLInvitation } from './mediateurs-a-inviter.presenter'
import {
  ajouter,
  cleDe,
  libelleDe,
  type PersonneAInviter,
} from './personne-a-inviter'
import { personneAInviterComboBox } from './personne-a-inviter-combo-box'
import { RechercheDePersonne } from './RechercheDePersonne'

type Valeurs = {
  membres: readonly PersonneAInviter[]
  recherche: PersonneAInviter | null
}

const auMoinsUnMembre = z
  .custom<Valeurs>()
  .refine((valeurs) => valeurs.membres.length > 0, {
    message: 'Veuillez choisir au moins une personne à inviter',
    path: ['membres'],
  })

const valeursInitiales: Valeurs = { membres: [], recherche: null }

const pasDeSoumissionDepuisLaRecherche = (
  evenement: KeyboardEvent<HTMLFormElement>,
) => {
  if (evenement.key === 'Enter' && evenement.target instanceof HTMLInputElement)
    evenement.preventDefault()
}

const InviterMembreForm = () => {
  const router = useRouter()

  const form = useAppForm({
    validators: { onSubmit: auMoinsUnMembre },
    defaultValues: valeursInitiales,
    onSubmit: async ({ value }) => {
      const resultat = await inject(INVITER_DES_MEMBRES_ACTION_KEY)({
        emails: value.membres.map(({ email }) => email),
      })

      if (!resultat.success) {
        createToast({ priority: 'error', message: resultat.error })
        return
      }

      createToast(issueDeLInvitation(value.membres, resultat.data))
      router.push('/coop/mon-equipe')
      router.refresh()
    },
  })

  const isSubmitting = useSelector(form.store, (state) => state.isSubmitting)
  const aucunMembre = useSelector(
    form.store,
    (state) => state.values.membres.length === 0,
  )
  const isHydrated = useHydrated()
  const isPending = isSubmitting || !isHydrated

  return (
    <form.AppForm>
      <form
        onSubmit={handleSubmit(form)}
        onKeyDown={pasDeSoumissionDepuisLaRecherche}
      >
        <div className="fr-mt-12v fr-mb-2v">
          <form.AppField name="recherche">
            {(field) => (
              <field.ComboBox
                isPending={isPending}
                onSelect={(personne) => {
                  form.setFieldValue('membres', (membres) =>
                    ajouter(membres, personne),
                  )
                  queueMicrotask(() => form.setFieldValue('recherche', null))
                }}
                {...personneAInviterComboBox(() =>
                  form.getFieldValue('membres'),
                )}
              >
                {(rendu) => (
                  <RechercheDePersonne {...rendu} isPending={isPending} />
                )}
              </field.ComboBox>
            )}
          </form.AppField>
        </div>
        <form.Field name="membres" mode="array">
          {(field) =>
            field.state.value.length > 0 && (
              <ul className="fr-list-group fr-flex fr-flex-wrap fr-flex-gap-1v fr-mt-6v">
                {field.state.value.map((membre, index) => (
                  <li key={cleDe(membre)}>
                    <Tag
                      nativeButtonProps={{
                        type: 'button',
                        onClick: () => field.removeValue(index),
                      }}
                    >
                      {libelleDe(membre)}&nbsp;
                      <span
                        className="fr-icon-close-line fr-icon--sm"
                        aria-hidden
                      />
                    </Tag>
                  </li>
                ))}
              </ul>
            )
          }
        </form.Field>
        <hr className="fr-separator-12v" />
        <div className="fr-btns-group fr-btns-group--lg">
          <form.Submit
            isPending={isPending}
            disabled={isPending || aucunMembre}
          >
            Inviter
          </form.Submit>
          <Button linkProps={{ href: '/coop/mon-equipe' }} priority="secondary">
            Annuler
          </Button>
        </div>
      </form>
    </form.AppForm>
  )
}

export default InviterMembreForm
