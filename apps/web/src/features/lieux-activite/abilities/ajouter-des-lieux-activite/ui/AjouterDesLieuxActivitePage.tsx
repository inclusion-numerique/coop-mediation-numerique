'use client'

import { Options } from '@app/ui/components/Primitives/Options'
import { createToast } from '@app/ui/toast/createToast'
import { ajouterDesLieuxActiviteAction } from '@app/web/app/_actions/lieux-activite/ajouter-des-lieux-activite.action'
import { creerUnLieuActiviteAction } from '@app/web/app/_actions/lieux-activite/creer-lieu-activite.action'
import CreerLieuActiviteForm from '@app/web/features/lieux-activite/components/creer/CreerLieuActiviteForm'
import {
  type CreerLieuActiviteFormData,
  toCreerLieuData,
} from '@app/web/features/lieux-activite/components/creer/creerLieuActiviteFormData'
import { adresseNonVerifiableMessage } from '@app/web/features/structures/siret/geocodeStructureAdresse'
import { handleSubmit } from '@app/web/libs/form/handle-submit'
import { useAppForm } from '@app/web/libs/form/use-app-form'
import { useHydrated } from '@app/web/libs/form/use-hydrated'
import type { LieuActiviteSearchResult } from '@app/web/structure/searchLieuActiviteCombined'
import { getDepartementCodeFromCodeInsee } from '@app/web/utils/getDepartementFromCodeInsee'
import Button from '@codegouvfr/react-dsfr/Button'
import { useSelector } from '@tanstack/react-form'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { z } from 'zod'
import {
  LieuAAjouterComboBox,
  LieuAAjouterOptions,
  type RechercheLieuAAjouter,
  rechercheMinimum,
} from './components/lieu-a-ajouter-combo-box'
import { PanierDeLieux } from './components/PanierDeLieux'
import { auPanier, type LieuAuPanier, memeLieu } from './panier'

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
                setRechercheError(null)
                const lieu = await auPanier(item)

                // L'adresse de ce lieu n'existe pas dans la BAN : le créer
                // écrirait une adresse que personne n'a validée. On renvoie
                // vers la saisie manuelle, seule à pouvoir faire choisir une
                // adresse reconnue.
                if (lieu == null) {
                  setRechercheError(adresseNonVerifiableMessage(item))
                  form.setFieldValue('recherche', null)
                  return
                }

                if (
                  form.state.values.lieux.some((present) =>
                    memeLieu(present, lieu),
                  )
                ) {
                  setRechercheError(
                    `${lieu.nom} fait déjà partie de votre sélection.`,
                  )
                  form.setFieldValue('recherche', null)
                  return
                }

                form.pushFieldValue('lieux', lieu)
                form.setFieldValue('recherche', null)
              }}
              {...LieuAAjouterComboBox}
            >
              {({
                getLabelProps,
                getInputProps,
                getToggleButtonProps,
                payload,
                ...optionsProps
              }) => {
                const { recherche, enCours, enEchec, nonAffiches } =
                  payload as RechercheLieuAAjouter
                const rechercheFaite =
                  !enCours &&
                  (recherche?.trim().length ?? 0) >= rechercheMinimum
                const rechercheAboutie =
                  rechercheFaite && optionsProps.items.length === 0
                const sansResultat = rechercheAboutie && !enEchec
                const rechercheEnEchec = rechercheAboutie && enEchec

                const boutonCreer = (
                  <Button
                    type="button"
                    priority="secondary"
                    className="fr-width-full fr-justify-content-center fr-mb-0"
                    disabled={isPending}
                    onClick={() => setEnCreation(true)}
                  >
                    Créer un lieu d’activité
                  </Button>
                )

                /**
                 * Trouver des résultats n'est pas trouver le bon : une recherche
                 * qui propose dix lieux sans proposer CELUI qu'on a en tête
                 * enfermerait autant qu'une recherche vide. La création reste
                 * donc offerte sous la liste, tant qu'il y a une liste — le cas
                 * sans résultat porte déjà le sien, avec son explication.
                 */
                const issue =
                  rechercheFaite && optionsProps.items.length > 0 ? (
                    <div>
                      {nonAffiches > 0 && (
                        <p className="fr-text--sm fr-text-mention--grey fr-mb-2v">
                          Précisez votre recherche : {nonAffiches} structures ne
                          sont pas affichées.
                        </p>
                      )}
                      {boutonCreer}
                    </div>
                  ) : null

                // Un seul enfant, `null` quand il n'y a rien à dire : `Options`
                // teste `children &&` pour ouvrir son élément de liste, et une
                // paire de conditions serait un tableau toujours truthy — le
                // menu s'ouvrirait vide dès le premier clic dans le champ.
                const proposition = sansResultat ? (
                  <div>
                    <p className="fr-text--sm fr-text-mention--grey fr-mb-2v">
                      Aucun lieu ne correspond à votre recherche.
                    </p>
                    {boutonCreer}
                  </div>
                ) : rechercheEnEchec ? (
                  <p className="fr-text--sm fr-text-default--error fr-mb-0">
                    La recherche n’a pas abouti, veuillez réessayer.
                  </p>
                ) : null

                return (
                  <>
                    <field.Input
                      addonEnd={
                        <Button
                          title="Rechercher"
                          className="fr-border-left-0"
                          iconId="fr-icon-search-line"
                          {...getToggleButtonProps({ type: 'button' })}
                        />
                      }
                      isConnected={false}
                      isPending={isPending}
                      nativeLabelProps={getLabelProps()}
                      nativeInputProps={getInputProps()}
                      label="Rechercher un lieu d’activité par nom, adresse ou SIRET"
                    />
                    <Options
                      {...optionsProps}
                      {...LieuAAjouterOptions}
                      showEmpty={proposition != null}
                      footer={issue}
                    >
                      {proposition}
                    </Options>
                  </>
                )
              }}
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
