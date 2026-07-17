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
// NB : StructureSearchResult vit encore dans le legacy use-cases/ (à re-router inc. 5).
import type { StructureSearchResult } from '@app/web/features/inscription/use-cases/renseigner-structure-employeuse/searchStructureEmployeuseCombined'
import {
  adresseNonVerifiableMessage,
  geocodeStructureAdresse,
} from '@app/web/features/structures/siret/geocodeStructureAdresse'
import {
  SiretSearchComboBox,
  SiretSearchOptions,
} from '@app/web/features/structures/siret/SiretSearchComboBox'
import { handleSubmit } from '@app/web/libs/form/handle-submit'
import { useAppForm } from '@app/web/libs/form/use-app-form'
import { useHydrated } from '@app/web/libs/form/use-hydrated'
import Button from '@codegouvfr/react-dsfr/Button'
import { useStore } from '@tanstack/react-form'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { z } from 'zod'

type FormValues = {
  lieux: LieuActiviteInput[]
  siretSearch: StructureSearchResult | null
  nom: string
  adresseBan: AdresseBanData | null
}

/**
 * Forme minimale attendue à la soumission : au moins un lieu d'activité ajouté.
 * Les champs d'ajout (SIRET, nom, adresse) sont transitoires et non validés ici.
 */
const lieuxActiviteFormShape = z
  .custom<FormValues>()
  .refine((value) => value.lieux.length > 0, {
    message: 'Veuillez renseigner au moins un lieu d’activité',
    path: ['lieux'],
  })

/** Construit un lieu à créer depuis l'adresse géocodée (nom + adresse BAN). */
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

const erreurEnregistrement = () =>
  createToast({
    priority: 'error',
    message:
      'Une erreur est survenue lors de l’enregistrement, veuillez réessayer ultérieurement.',
  })

/**
 * Renseignement des lieux d'activité : on ajoute des lieux (recherche SIRET
 * optionnelle qui préremplit nom + adresse géocodée, ou saisie manuelle), chacun
 * s'empilant en carte. Seuls nom + adresse (géocodée) sont saisis ici ; le reste
 * des informations du lieu se renseigne plus tard dans la gestion des lieux.
 */
const LieuxActiviteForm = ({
  lieuxExistants,
  nextHref,
}: {
  lieuxExistants: LieuActiviteInput[]
  nextHref: string
}) => {
  const router = useRouter()
  const [siretSearchError, setSiretSearchError] = useState<string | null>(null)

  const defaultValues: FormValues = {
    lieux: lieuxExistants,
    siretSearch: null,
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
  const peutAjouter = !!nom && !!adresseBan

  const ajouterLieu = () => {
    if (!nom || !adresseBan) return
    form.pushFieldValue('lieux', lieuDepuisAdresse(nom, adresseBan))
    form.setFieldValue('nom', '')
    form.setFieldValue('adresseBan', null)
    form.setFieldValue('siretSearch', null)
    setSiretSearchError(null)
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

        <form.AppField name="siretSearch">
          {(field) => (
            <field.ComboBox
              isPending={isPending}
              onSelect={async (item) => {
                setSiretSearchError(null)
                form.setFieldValue('adresseBan', null)
                const adresseGeocodee = await geocodeStructureAdresse(item)
                if (!adresseGeocodee) {
                  form.setFieldValue('siretSearch', null)
                  setSiretSearchError(adresseNonVerifiableMessage(item))
                  return
                }
                form.setFieldValue('nom', item.nom)
                form.setFieldValue('adresseBan', adresseGeocodee)
              }}
              {...SiretSearchComboBox}
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
                    label="Rechercher par SIRET, nom ou adresse du lieu (optionnel)"
                  />
                  <Options
                    className="fr-mt-n4v"
                    {...optionsProps}
                    {...SiretSearchOptions}
                  />
                </>
              )}
            </field.ComboBox>
          )}
        </form.AppField>

        {siretSearchError && (
          <p className="fr-text-default--error fr-text--sm">
            {siretSearchError}
          </p>
        )}

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
          disabled={isPending || !peutAjouter}
          onClick={ajouterLieu}
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
