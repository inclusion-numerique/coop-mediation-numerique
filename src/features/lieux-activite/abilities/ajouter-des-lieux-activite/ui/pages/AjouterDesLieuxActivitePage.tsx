'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import { useSelector } from '@tanstack/react-form'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { z } from 'zod'
import type { SuggestionAffichee } from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/ui/presenters/suggestion-de-lieu.presenter'
import CreerLieuActiviteForm from '@/features/lieux-activite/ui/forms/creation/CreerLieuActiviteForm'
import {
  type CreerLieuActiviteFormData,
  donneesDeCreation,
} from '@/features/lieux-activite/ui/forms/creer-lieu-activite.form-data'
import { geocoderPrecisement } from '@/libraries/ban'
import { handleSubmit } from '@/libraries/formulaire'
import { useAppForm, useHydrated } from '@/libraries/formulaire/hooks'
import { routeConstruite } from '@/libraries/nextjs'
import { inject } from '@/libraries/nextjs/injection'
import { createToast } from '@/libraries/ui/toast'
import { AJOUTER_DES_LIEUX_ACTIVITE_ACTION_KEY } from '../../action/ajouter-des-lieux-activite.key'
import { CREER_UN_LIEU_KEY } from '../../action/creer-un-lieu.key'
import { ENREGISTRER_LA_SELECTION_DE_LIEUX_KEY } from '../../action/enregistrer-la-selection.key'
import { PanierDeLieux } from '../components/PanierDeLieux'
import { RechercheDeLieu } from '../components/RechercheDeLieu'
import { LieuAAjouterComboBox } from '../forms/LieuAAjouterComboBox'
import {
  type LieuAuPanier,
  lieuCree,
  selectionner,
} from '../forms/panier.form-data'
import { destination } from '../presenters/destination.presenter'

type FormValues = {
  lieux: LieuAuPanier[]
  recherche: SuggestionAffichee | null
}

const panierShape = z
  .custom<FormValues>()
  .refine((value) => value.lieux.length > 0, {
    message: 'Veuillez sélectionner au moins un lieu d’activité',
    path: ['lieux'],
  })

export type IssueDeLaSelection =
  | { readonly _tag: 'Ajout'; readonly retourHref: string }
  | { readonly _tag: 'Selection'; readonly suivantHref: string }

const erreur = (message: string) => createToast({ priority: 'error', message })

const erreurEnregistrement = () =>
  erreur(
    'Une erreur est survenue lors de l’enregistrement, veuillez réessayer ultérieurement.',
  )

const enregistrerLAjout = async (
  lieux: LieuAuPanier[],
  retourHref: string,
): Promise<string | null> => {
  const resultat = await inject(AJOUTER_DES_LIEUX_ACTIVITE_ACTION_KEY)({
    lieux,
  })

  if (!resultat.success) {
    erreur(resultat.error)
    return null
  }

  createToast({
    priority: 'success',
    message:
      lieux.length === 1
        ? 'Le lieu d’activité a bien été ajouté'
        : `Les ${lieux.length} lieux d’activité ont bien été ajoutés.`,
  })

  return destination(lieux, resultat.data.lieux, retourHref)
}

const enregistrerLaSelection = async (
  lieux: LieuAuPanier[],
  suivantHref: string,
): Promise<string | null> => {
  const resultat = await inject(ENREGISTRER_LA_SELECTION_DE_LIEUX_KEY)({
    lieux,
  })

  if (!resultat.success) {
    erreurEnregistrement()
    return null
  }

  return suivantHref
}

export const AjouterDesLieuxActivitePage = ({
  lieuxInitiaux = [],
  issue,
  lienDePriseDeRendezVous,
}: {
  lieuxInitiaux?: LieuAuPanier[]
  issue: IssueDeLaSelection
  lienDePriseDeRendezVous: string
}) => {
  const router = useRouter()
  const [enCreation, setEnCreation] = useState<string | null>(null)
  const [rechercheError, setRechercheError] = useState<string | null>(null)

  const form = useAppForm({
    validators: { onSubmit: panierShape },
    defaultValues: { lieux: lieuxInitiaux, recherche: null } as FormValues,
    onSubmit: async ({ value }) => {
      try {
        const suite =
          issue._tag === 'Ajout'
            ? await enregistrerLAjout(value.lieux, issue.retourHref)
            : await enregistrerLaSelection(value.lieux, issue.suivantHref)

        if (suite == null) return

        router.push(routeConstruite(suite))
        router.refresh()
      } catch {
        erreurEnregistrement()
      }
    },
  })

  const isSubmitting = useSelector(form.store, (state) => state.isSubmitting)
  const isHydrated = useHydrated()
  const isPending = isSubmitting || !isHydrated

  const creer = async (valeur: CreerLieuActiviteFormData) => {
    const { adresseBan, ...donnees } = donneesDeCreation(valeur)
    if (adresseBan == null) return

    const resultat = await inject(CREER_UN_LIEU_KEY)({ ...donnees, adresseBan })

    if (!resultat.success) {
      erreurEnregistrement()
      return
    }

    form.pushFieldValue(
      'lieux',
      lieuCree({ id: resultat.data.id, nom: donnees.nom, adresseBan }),
    )
    setEnCreation(null)
    createToast({
      priority: 'success',
      message:
        'Le lieu d’activité a bien été créé et ajouté à votre sélection.',
    })
  }

  if (enCreation != null)
    return (
      <CreerLieuActiviteForm
        nom={enCreation}
        onAnnuler={() => setEnCreation(null)}
        onCreer={creer}
        lienDePriseDeRendezVous={lienDePriseDeRendezVous}
      />
    )

  return (
    <form.AppForm>
      <form onSubmit={handleSubmit(form)}>
        <form.Field name="lieux" mode="array">
          {(field) => (
            <PanierDeLieux
              lieux={field.state.value ?? []}
              onRetirer={(index) => field.removeValue(index)}
            />
          )}
        </form.Field>

        <form.AppField name="recherche">
          {(field) => (
            <field.ComboBox
              isPending={isPending}
              onSelect={async (item) => {
                const issue = await selectionner(geocoderPrecisement)(
                  form.state.values.lieux,
                  item,
                )

                form.setFieldValue('recherche', null)
                setRechercheError(issue.success ? null : issue.error)

                if (issue.success) form.pushFieldValue('lieux', issue.data)
              }}
              {...LieuAAjouterComboBox}
            >
              {(rendu) => (
                <RechercheDeLieu
                  {...rendu}
                  isPending={isPending}
                  onCreer={setEnCreation}
                />
              )}
            </field.ComboBox>
          )}
        </form.AppField>

        {rechercheError && (
          <p className="fr-text-default--error fr-text--sm">{rechercheError}</p>
        )}

        <div className="fr-mt-2v">
          <Link
            className="fr-link fr-link--sm"
            href="https://annuaire-entreprises.data.gouv.fr/"
            target="_blank"
            rel="noreferrer"
            title="Annuaire des Entreprises - nouvelle fenêtre"
          >
            Retrouvez votre SIRET sur l’Annuaire des Entreprises
          </Link>
        </div>

        <hr className="fr-separator-12v" />

        {issue._tag === 'Ajout' ? (
          <div className="fr-btns-group">
            <form.Submit isPending={isPending}>Ajouter</form.Submit>
            <Button
              linkProps={{ href: issue.retourHref }}
              priority="tertiary"
              className="fr-mb-0 fr-mt-4v"
            >
              Annuler
            </Button>
          </div>
        ) : (
          <div className="fr-btns-group fr-btns-group--lg">
            <form.Submit isPending={isPending}>Suivant</form.Submit>
          </div>
        )}
      </form>
    </form.AppForm>
  )
}
