'use client'

import { Options } from '@app/ui/components/Primitives/Options'
import { createToast } from '@app/ui/toast/createToast'
import { renseignerLieuxActiviteAction } from '@app/web/app/_actions/inscription/renseigner-lieux-activite.action'
import StructureCard from '@app/web/components/structure/StructureCard'
import type { LieuActiviteInput } from '@app/web/features/inscription/abilities/renseigner-lieux-activite'
import {
  adresseNonVerifiableMessage,
  geocodeStructureAdresse,
} from '@app/web/features/structures/siret/geocodeStructureAdresse'
import { handleSubmit } from '@app/web/libs/form/handle-submit'
import { useAppForm } from '@app/web/libs/form/use-app-form'
import { useHydrated } from '@app/web/libs/form/use-hydrated'
import type { LieuActiviteSearchResult } from '@app/web/structure/searchLieuActiviteCombined'
import Button from '@codegouvfr/react-dsfr/Button'
import { useStore } from '@tanstack/react-form'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { z } from 'zod'
import {
  LieuActiviteComboBox,
  LieuActiviteOptions,
  type RechercheLieuActivite,
  rechercheMinimum,
} from './lieu-activite-combo-box'

type FormValues = {
  lieux: LieuActiviteInput[]
  recherche: LieuActiviteSearchResult | null
}

/** Au moins un lieu ajouté ; le champ de recherche est transitoire. */
const lieuxActiviteFormShape = z
  .custom<FormValues>()
  .refine((value) => value.lieux.length > 0, {
    message: 'Veuillez renseigner au moins un lieu d’activité',
    path: ['lieux'],
  })

/**
 * Traduit un résultat de recherche en lieu à rattacher, selon sa provenance :
 * - coop : le lieu existe déjà, on le rattache par son id (aucun doublon créé) ;
 * - cartographie : la coop ne le connaît pas encore, on transmet son id carto —
 *   la persistance le matérialisera avec toutes les informations de la carto ;
 * - annuaire des entreprises : aucune coordonnée n'est fournie, le géocodage est
 *   donc obligatoire ; sans lui le lieu n'est pas exploitable (`null`). Son SIRET
 *   voyage avec lui — c'est la corrélation la plus sûre côté persistance, et il
 *   n'est renseigné que là : le `pivot` de la carto peut être un RNA.
 */
const lieuDepuisResultat = async (
  item: LieuActiviteSearchResult,
): Promise<LieuActiviteInput | null> => {
  const identiteAffichee = {
    nom: item.nom,
    adresse: item.adresse,
    commune: item.commune,
    codePostal: item.codePostal,
    codeInsee: item.codeInsee,
  }

  const lieuCoop = item.structures.at(0)
  if (lieuCoop) return { ...identiteAffichee, id: lieuCoop.id }

  if (item.source === 'cartographie_nationale')
    return {
      ...identiteAffichee,
      structureCartographieNationaleId: item.id,
      latitude: item.latitude,
      longitude: item.longitude,
    }

  const adresseBan = await geocodeStructureAdresse(item)
  return adresseBan
    ? {
        nom: item.nom,
        // Le SIRET de l'annuaire corrèle le lieu à celui que la coop connaît
        // peut-être déjà, et reste porté par le lieu s'il faut le créer.
        siret: item.pivot ?? null,
        adresse: adresseBan.nom,
        commune: adresseBan.commune,
        codePostal: adresseBan.codePostal,
        codeInsee: adresseBan.codeInsee,
        banId: adresseBan.id,
        latitude: adresseBan.latitude,
        longitude: adresseBan.longitude,
      }
    : null
}

const erreurEnregistrement = () =>
  createToast({
    priority: 'error',
    message:
      'Une erreur est survenue lors de l’enregistrement, veuillez réessayer ultérieurement.',
  })

/**
 * Renseignement des lieux d'activité. La recherche privilégie les lieux déjà
 * connus de la coop, puis la cartographie nationale, et ne tombe sur l'annuaire
 * des entreprises qu'en dernier repli — de quoi éviter de recréer un lieu
 * existant. La création d'un lieu n'est proposée qu'une fois la recherche restée
 * sans résultat : elle n'est pas une alternative offerte d'emblée, sans quoi on
 * créerait des doublons de lieux qu'on n'a jamais cherchés.
 */
const LieuxActiviteForm = ({
  lieuxExistants,
  nextHref,
  retourHref,
}: {
  lieuxExistants: LieuActiviteInput[]
  nextHref: string
  retourHref: string
}) => {
  const router = useRouter()
  const [rechercheError, setRechercheError] = useState<string | null>(null)

  const enregistrerLieux = async (lieux: LieuActiviteInput[]) =>
    renseignerLieuxActiviteAction({ lieuxActivite: lieux })

  const form = useAppForm({
    validators: { onSubmit: lieuxActiviteFormShape },
    defaultValues: { lieux: lieuxExistants, recherche: null } as FormValues,
    onSubmit: async ({ value }) => {
      try {
        const result = await enregistrerLieux(value.lieux)

        if (!result.success) {
          erreurEnregistrement()
          return
        }

        router.push(nextHref)
        router.refresh()
      } catch {
        erreurEnregistrement()
      }
    },
  })

  const isSubmitting = useStore(form.store, (state) => state.isSubmitting)
  const isHydrated = useHydrated()
  const isPending = isSubmitting || !isHydrated

  /**
   * La création se fait sur une autre page : les lieux déjà ajoutés y seraient
   * perdus, on les enregistre donc avant de partir. Ils seront relus au retour.
   */
  const creerUnLieu = async (recherche: string) => {
    const lieux = form.state.values.lieux
    const creerHref = `/inscription/creer-un-lieu-d-activite?nom=${encodeURIComponent(recherche)}&retour=${encodeURIComponent(retourHref)}`

    if (lieux.length === 0) {
      router.push(creerHref)
      return
    }

    try {
      const result = await enregistrerLieux(lieux)
      if (!result.success) {
        erreurEnregistrement()
        return
      }
      router.push(creerHref)
    } catch {
      erreurEnregistrement()
    }
  }

  return (
    <form.AppForm>
      <form onSubmit={handleSubmit(form)}>
        <form.Field name="lieux" mode="array">
          {(field) => (
            <>
              {(field.state.value ?? []).toReversed().map((lieu, reversed) => {
                const index = (field.state.value ?? []).length - 1 - reversed
                return (
                  <StructureCard
                    key={`${lieu.nom}-${index}`}
                    className="fr-mb-4v"
                    structure={{
                      nom: lieu.nom,
                      adresse: lieu.adresse,
                      commune: lieu.commune,
                      codePostal: lieu.codePostal,
                      siret: null,
                      typologies: null,
                      rna: null,
                    }}
                    topRight={
                      <Button
                        type="button"
                        priority="tertiary no outline"
                        size="small"
                        iconPosition="right"
                        iconId="fr-icon-close-line"
                        onClick={() => field.removeValue(index)}
                      >
                        Retirer
                      </Button>
                    }
                  />
                )
              })}
            </>
          )}
        </form.Field>

        <hr className="fr-separator-6v" />

        <form.AppField name="recherche">
          {(field) => (
            <field.ComboBox
              isPending={isPending}
              onSelect={async (item) => {
                setRechercheError(null)
                const lieu = await lieuDepuisResultat(item)

                if (!lieu) {
                  setRechercheError(adresseNonVerifiableMessage(item))
                  form.setFieldValue('recherche', null)
                  return
                }

                form.pushFieldValue('lieux', lieu)
                form.setFieldValue('recherche', null)
              }}
              {...LieuActiviteComboBox}
            >
              {({
                getLabelProps,
                getInputProps,
                getToggleButtonProps,
                payload,
                ...optionsProps
              }) => {
                const { recherche, enCours, enEchec } =
                  payload as RechercheLieuActivite
                const rechercheAboutie =
                  !enCours &&
                  (recherche?.trim().length ?? 0) >= rechercheMinimum &&
                  optionsProps.items.length === 0
                const sansResultat = rechercheAboutie && !enEchec
                const rechercheEnEchec = rechercheAboutie && enEchec

                // Un seul enfant, `null` quand il n'y a rien à dire : `Options`
                // teste `children &&` pour ouvrir son élément de liste, et une
                // paire de conditions serait un tableau toujours truthy — le
                // menu s'ouvrirait vide dès le premier clic dans le champ.
                const proposition = sansResultat ? (
                  <div>
                    <p className="fr-text--sm fr-text-mention--grey fr-mb-2v">
                      Aucun lieu ne correspond à votre recherche.
                    </p>
                    <Button
                      type="button"
                      priority="secondary"
                      className="fr-width-full fr-justify-content-center fr-mb-0"
                      disabled={isPending}
                      onClick={() => creerUnLieu(recherche)}
                    >
                      Créer un lieu d’activité
                    </Button>
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
                      {...LieuActiviteOptions}
                      showEmpty={proposition != null}
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

        <hr className="fr-separator-12v" />

        <div className="fr-btns-group fr-btns-group--lg">
          <form.Submit isPending={isPending}>Suivant</form.Submit>
        </div>
      </form>
    </form.AppForm>
  )
}

export default LieuxActiviteForm
