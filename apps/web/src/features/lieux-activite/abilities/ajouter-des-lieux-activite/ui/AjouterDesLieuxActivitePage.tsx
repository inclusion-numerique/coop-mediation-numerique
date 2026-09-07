'use client'

import { createToast } from '@app/ui/toast/createToast'
import { ajouterDesLieuxActiviteAction } from '@app/web/app/_actions/lieux-activite/ajouter-des-lieux-activite.action'
import { creerUnLieuActiviteAction } from '@app/web/app/_actions/lieux-activite/creer-lieu-activite.action'
import type { LieuActiviteSearchResult } from '@app/web/features/lieux-activite/abilities/ajouter-des-lieux-activite/implementation/searchLieuActiviteCombined'
import CreerLieuActiviteForm from '@app/web/features/lieux-activite/formulaire/CreerLieuActiviteForm'
import {
  type CreerLieuActiviteFormData,
  toCreerLieuData,
} from '@app/web/features/lieux-activite/formulaire/creerLieuActiviteFormData'
import { handleSubmit } from '@app/web/libs/form/handle-submit'
import { useAppForm } from '@app/web/libs/form/use-app-form'
import { useHydrated } from '@app/web/libs/form/use-hydrated'
import { getDepartementCodeFromCodeInsee } from '@app/web/utils/getDepartementFromCodeInsee'
import Button from '@codegouvfr/react-dsfr/Button'
import { useSelector } from '@tanstack/react-form'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { z } from 'zod'
import { LieuAAjouterComboBox } from './components/lieu-a-ajouter-combo-box'
import { PanierDeLieux } from './components/PanierDeLieux'
import { RechercheDeLieu } from './components/RechercheDeLieu'
import { type LieuAuPanier, selectionner } from './panier'

type FormValues = {
  lieux: LieuAuPanier[]
  recherche: LieuActiviteSearchResult | null
}

/** Au moins un lieu au panier ; le champ de recherche est transitoire. */
const panierShape = z
  .custom<FormValues>()
  .refine((value) => value.lieux.length > 0, {
    message: 'Veuillez sélectionner au moins un lieu d’activité',
    path: ['lieux'],
  })

const erreur = (message: string) => createToast({ priority: 'error', message })

const erreurEnregistrement = () =>
  erreur(
    'Une erreur est survenue lors de l’enregistrement, veuillez réessayer ultérieurement.',
  )

/**
 * Ajout de lieux d'activité : on constitue un panier, on le valide d'un coup.
 *
 * La création d'un lieu se déroule DANS cet écran plutôt qu'en le quittant :
 * naviguer viderait le panier, et l'on ne s'aperçoit qu'un lieu manque qu'après
 * en avoir sélectionné d'autres. Le lieu créé rejoint donc la sélection au
 * retour.
 */
export const AjouterDesLieuxActivitePage = ({
  retourHref,
}: {
  retourHref: string
}) => {
  const router = useRouter()
  const [enCreation, setEnCreation] = useState(false)
  const [rechercheError, setRechercheError] = useState<string | null>(null)

  /**
   * Un panier d'un seul lieu mène à sa fiche : c'est ce qu'on est venu chercher.
   * Au-delà, aucune fiche ne résume l'ajout, on revient à la liste.
   */
  const destination = (
    lieux: readonly LieuAuPanier[],
    rejoints: readonly string[],
  ) => {
    const premier = lieux.at(0)

    return lieux.length === 1 && rejoints.length === 1 && premier != null
      ? `/coop/mon-reseau/${getDepartementCodeFromCodeInsee(
          premier.codeInsee ?? '',
        )}/lieux/${rejoints[0]}`
      : retourHref
  }

  const form = useAppForm({
    validators: { onSubmit: panierShape },
    defaultValues: { lieux: [], recherche: null } as FormValues,
    onSubmit: async ({ value }) => {
      try {
        const resultat = await ajouterDesLieuxActiviteAction({
          lieux: value.lieux,
        })

        if (!resultat.success) {
          erreur(resultat.error)
          return
        }

        router.push(destination(value.lieux, resultat.data.lieux))
        router.refresh()

        createToast({
          priority: 'success',
          message:
            value.lieux.length === 1
              ? 'Le lieu d’activité a bien été ajouté'
              : `Les ${value.lieux.length} lieux d’activité ont bien été ajoutés.`,
        })
      } catch {
        erreurEnregistrement()
      }
    },
  })

  const isSubmitting = useSelector(form.store, (state) => state.isSubmitting)
  const isHydrated = useHydrated()
  const isPending = isSubmitting || !isHydrated

  const creer = async (valeur: CreerLieuActiviteFormData) => {
    const { adresseBan, ...donnees } = toCreerLieuData(valeur)
    if (adresseBan == null) return

    const resultat = await creerUnLieuActiviteAction({ ...donnees, adresseBan })

    if (!resultat.success) {
      erreurEnregistrement()
      return
    }

    form.pushFieldValue('lieux', {
      id: resultat.data.id,
      structureCartographieNationaleId: null,
      nom: donnees.nom,
      siret: null,
      adresse: adresseBan.nom,
      commune: adresseBan.commune,
      codePostal: adresseBan.codePostal,
      codeInsee: adresseBan.codeInsee,
      banId: adresseBan.id,
      latitude: adresseBan.latitude,
      longitude: adresseBan.longitude,
    })
    setEnCreation(false)
    createToast({
      priority: 'success',
      message:
        'Le lieu d’activité a bien été créé et ajouté à votre sélection.',
    })
  }

  if (enCreation)
    return (
      <CreerLieuActiviteForm
        onAnnuler={() => setEnCreation(false)}
        onCreer={creer}
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
                const issue = await selectionner(form.state.values.lieux, item)

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
                  onCreer={() => setEnCreation(true)}
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

        <div className="fr-btns-group">
          <form.Submit isPending={isPending}>Ajouter</form.Submit>
          <Button
            linkProps={{ href: retourHref }}
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
