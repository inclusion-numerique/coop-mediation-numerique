'use client'

import { Options } from '@app/ui/components/Primitives/Options'
import { createToast } from '@app/ui/toast/createToast'
import { renseignerLieuxActiviteAction } from '@app/web/app/_actions/inscription/renseigner-lieux-activite.action'
import StructureCard from '@app/web/components/structure/StructureCard'
import type { AdresseBanData } from '@app/web/external-apis/ban/AdresseBanValidation'
import {
  AdresseBanComboBox,
  AdresseBanOptions,
} from '@app/web/features/adresse/combo-box/AdresseBanComboBox'
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
} from './lieu-activite-combo-box'

type FormValues = {
  lieux: LieuActiviteInput[]
  recherche: LieuActiviteSearchResult | null
  nom: string
  adresseBan: AdresseBanData | null
}

/** Au moins un lieu ajouté ; les champs d'ajout sont transitoires. */
const lieuxActiviteFormShape = z
  .custom<FormValues>()
  .refine((value) => value.lieux.length > 0, {
    message: 'Veuillez renseigner au moins un lieu d’activité',
    path: ['lieux'],
  })

/** Nouveau lieu construit depuis une adresse géocodée (saisie manuelle ou annuaire). */
const lieuDepuisAdresse = (
  nom: string,
  adresseBan: AdresseBanData,
): LieuActiviteInput => ({
  nom,
  adresse: adresseBan.nom,
  commune: adresseBan.commune,
  codePostal: adresseBan.codePostal,
  codeInsee: adresseBan.codeInsee,
  latitude: adresseBan.latitude,
  longitude: adresseBan.longitude,
})

/**
 * Traduit un résultat de recherche en lieu à rattacher, selon sa provenance :
 * - coop : le lieu existe déjà, on le rattache par son id (aucun doublon créé) ;
 * - cartographie : la coop ne le connaît pas encore, on transmet son id carto —
 *   la persistance le matérialisera avec toutes les informations de la carto ;
 * - annuaire des entreprises : aucune coordonnée n'est fournie, le géocodage est
 *   donc obligatoire ; sans lui le lieu n'est pas exploitable (`null`).
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
  return adresseBan ? lieuDepuisAdresse(item.nom, adresseBan) : null
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
 * existant. À défaut, ou si l'adresse d'un établissement n'est pas géocodable, on
 * saisit nom + adresse à la main. Seuls ces deux champs sont demandés ici ; le
 * reste des informations se renseigne dans la gestion des lieux d'activité.
 */
const LieuxActiviteForm = ({
  lieuxExistants,
  nextHref,
}: {
  lieuxExistants: LieuActiviteInput[]
  nextHref: string
}) => {
  const router = useRouter()
  const [rechercheError, setRechercheError] = useState<string | null>(null)

  const defaultValues: FormValues = {
    lieux: lieuxExistants,
    recherche: null,
    nom: '',
    adresseBan: null,
  }

  const form = useAppForm({
    validators: { onSubmit: lieuxActiviteFormShape },
    defaultValues,
    onSubmit: async ({ value }) => {
      try {
        const result = await renseignerLieuxActiviteAction({
          lieuxActivite: value.lieux,
        })

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

  const nom = useStore(form.store, (state) => state.values.nom)
  const adresseBan = useStore(form.store, (state) => state.values.adresseBan)

  const ajouterSaisieManuelle = () => {
    if (!nom || !adresseBan) return
    form.pushFieldValue('lieux', lieuDepuisAdresse(nom, adresseBan))
    form.setFieldValue('nom', '')
    form.setFieldValue('adresseBan', null)
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
                ...optionsProps
              }) => (
                <>
                  <field.Input
                    addonEnd={
                      <Button
                        title="Rechercher"
                        className="fr-border-left-0 fr-pl-3v"
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
                    className="fr-mt-n4v"
                    {...optionsProps}
                    {...LieuActiviteOptions}
                  />
                </>
              )}
            </field.ComboBox>
          )}
        </form.AppField>

        {rechercheError && (
          <p className="fr-text-default--error fr-text--sm">{rechercheError}</p>
        )}

        <p className="fr-text--sm fr-text-mention--grey fr-mt-4v fr-mb-2v">
          Vous ne trouvez pas votre lieu d’activité ? Renseignez-le ci-dessous.
        </p>

        <form.AppField name="nom">
          {(field) => (
            <field.Input isPending={isPending} label="Nom du lieu d’activité" />
          )}
        </form.AppField>

        <form.AppField name="adresseBan">
          {(field) => (
            <field.ComboBox isPending={isPending} {...AdresseBanComboBox}>
              {({
                getLabelProps,
                getInputProps,
                getToggleButtonProps,
                ...optionsProps
              }) => (
                <>
                  <field.Input
                    addonEnd={
                      <Button
                        title="Rechercher"
                        className="fr-border-left-0 fr-pl-3v"
                        iconId="fr-icon-search-line"
                        {...getToggleButtonProps({ type: 'button' })}
                      />
                    }
                    isConnected={false}
                    isPending={isPending}
                    nativeLabelProps={getLabelProps()}
                    nativeInputProps={getInputProps()}
                    label="Adresse"
                  />
                  <Options
                    className="fr-mt-n4v"
                    {...optionsProps}
                    {...AdresseBanOptions}
                  />
                </>
              )}
            </field.ComboBox>
          )}
        </form.AppField>

        <Button
          type="button"
          priority="secondary"
          iconId="fr-icon-add-line"
          disabled={isPending || !nom || !adresseBan}
          onClick={ajouterSaisieManuelle}
        >
          Ajouter ce lieu d’activité
        </Button>

        <hr className="fr-separator-12v" />

        <div className="fr-btns-group fr-btns-group--lg">
          <form.Submit isPending={isPending}>Suivant</form.Submit>
        </div>
      </form>
    </form.AppForm>
  )
}

export default LieuxActiviteForm
