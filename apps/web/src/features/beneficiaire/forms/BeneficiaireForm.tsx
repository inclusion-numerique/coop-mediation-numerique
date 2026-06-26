'use client'

import RequiredFieldsDisclaimer from '@app/ui/components/Form/RequiredFieldsDisclaimer'
import { Options } from '@app/ui/components/Primitives/Options'
import { createToast } from '@app/ui/toast/createToast'
import type { AdresseBanData } from '@app/web/external-apis/ban/AdresseBanValidation'
import { CraCollectifData } from '@app/web/features/activites/use-cases/cra/collectif/validation/CraCollectifValidation'
import { CraIndividuelData } from '@app/web/features/activites/use-cases/cra/individuel/validation/CraIndividuelValidation'
import {
  CommuneComboBox,
  CommuneOptions,
} from '@app/web/features/adresse/combo-box/CommuneComboBox'
import {
  ANNEE_NAISSANCE_MAX as anneeNaissanceMax,
  ANNEE_NAISSANCE_MIN as anneeNaissanceMin,
} from '@app/web/features/beneficiaire/domain/annee-naissance'
import { effectiveTrancheAge } from '@app/web/features/beneficiaire/domain/tranche-age'
import {
  genreOptions,
  statutSocialOptions,
  trancheAgeOptions,
} from '@app/web/features/beneficiaire/forms/beneficiaire-options'
import {
  BeneficiaireData,
  BeneficiaireValidation,
} from '@app/web/features/beneficiaire/forms/beneficiaire-validation'
import FormSection from '@app/web/features/beneficiaire/forms/FormSection'
import type { ServerActionResult } from '@app/web/libraries/nextjs'
import { handleSubmit } from '@app/web/libs/form/handle-submit'
import { useAppForm } from '@app/web/libs/form/use-app-form'
import { encodeSerializableState } from '@app/web/utils/encodeSerializableState'
import Button from '@codegouvfr/react-dsfr/Button'
import { useStore } from '@tanstack/react-form'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'
import type { DefaultValues } from 'react-hook-form'
import { z } from 'zod'

// Le formulaire véhicule l'identifiant du médiateur propriétaire dans ses
// valeurs (comme `CraValidation`) : on étend le schéma partagé localement pour
// que la valeur validée par le moteur de formulaire s'aligne sur ce contrat,
// sans alourdir `BeneficiaireValidation` consommé par les server actions.
const BeneficiaireFormValidation = BeneficiaireValidation.extend({
  mediateurId: z.string(),
})

// Concern croisé injecté par la route-hub : créer ou modifier. La route lie
// l'action (server action) de l'ability concernée ; le form reste découplé des
// abilities et ne connaît que ce contrat de sauvegarde.
export type EnregistrerBeneficiaire = (
  beneficiaire: BeneficiaireData,
) => Promise<ServerActionResult<{ id: string }>>

type BeneficiaireCraData = {
  id: string
  prenom: string
  nom: string
  communeResidence: AdresseBanData | null
}

// Fusionne le bénéficiaire créé / modifié dans l'état du CRA en cours, qu'il
// soit individuel (remplace le bénéficiaire) ou collectif (ajoute un
// participant).
const craAvecBeneficiaire = (
  cra: DefaultValues<CraIndividuelData> | DefaultValues<CraCollectifData>,
  beneficiaire: BeneficiaireCraData,
) =>
  'participants' in cra
    ? { ...cra, participants: [...(cra.participants ?? []), beneficiaire] }
    : { ...cra, beneficiaire }

const BeneficiaireForm = ({
  defaultValues,
  save,
  cra,
  retour,
  edit = false,
}: {
  defaultValues: DefaultValues<BeneficiaireData> & { mediateurId: string }
  save: EnregistrerBeneficiaire
  // If present, used to merge with state on retour redirection
  cra?: DefaultValues<CraIndividuelData> | DefaultValues<CraCollectifData>
  retour?: string
  edit?: boolean
}) => {
  const router = useRouter()

  const enSavoirPlusLink = (
    <Link
      href="https://docs.numerique.gouv.fr/docs/3d5bad76-8e02-4abc-b83a-c2f2965ae5d9/"
      target="_blank"
      rel="noreferrer"
      className="fr-link fr-link--xs"
    >
      En savoir plus
    </Link>
  )

  const erreurEnregistrement = () =>
    createToast({
      priority: 'error',
      message:
        'Une erreur est survenue lors de l’enregistrement, veuillez réessayer ultérieurement.',
    })

  const form = useAppForm({
    validators: { onSubmit: BeneficiaireFormValidation },
    defaultValues,
    onSubmit: async ({ value }) => {
      const data = value as BeneficiaireData
      try {
        const result = await save(data)

        if (!result.success) {
          erreurEnregistrement()
          return
        }

        const beneficiaire = result.data

        createToast({
          priority: 'success',
          message: edit
            ? 'Le bénéficiaire a bien été mis à jour.'
            : 'Le bénéficiaire a bien été créé.',
        })

        // Les données de redirection CRA sont reconstruites à partir de la
        // saisie du formulaire + l'identifiant retourné : `data.communeResidence`
        // est déjà l'aperçu BAN attendu, inutile d'adapter le retour domaine.
        const queryParams = cra
          ? `?v=${encodeSerializableState(
              craAvecBeneficiaire(cra, {
                id: beneficiaire.id,
                prenom: data.prenom,
                nom: data.nom,
                communeResidence: data.communeResidence ?? null,
              }),
            )}`
          : ''

        router.push(
          `${
            retour ?? `/coop/mes-beneficiaires/${beneficiaire.id}`
          }${queryParams}`,
        )
        router.refresh()
      } catch {
        erreurEnregistrement()
      }
    },
  })

  const isPending = useStore(form.store, (state) => state.isSubmitting)
  const pasDeTelephone = useStore(
    form.store,
    (state) => state.values.pasDeTelephone === true,
  )
  const anneeNaissance = useStore(
    form.store,
    (state) => state.values.anneeNaissance,
  )

  const anneeNaissanceInt =
    typeof anneeNaissance === 'number' ? anneeNaissance : null
  const disableTrancheAge =
    anneeNaissanceInt != null &&
    anneeNaissanceInt >= anneeNaissanceMin &&
    anneeNaissanceInt <= anneeNaissanceMax

  const backUrl =
    retour ||
    (defaultValues.id
      ? `/coop/mes-beneficiaires/${defaultValues.id}`
      : '/coop/mes-beneficiaires')

  // Efface le téléphone lorsque « N'a pas de téléphone » est coché.
  const eraseTelephoneIfNeeded = ({ value }: { value?: boolean | null }) => {
    if (value === true && form.getFieldValue('telephone'))
      form.setFieldValue('telephone', null)
  }

  // Dérive la tranche d'âge depuis l'année de naissance. L'adaptateur Input
  // émet une chaîne vide au vidage d'un champ numérique : on la ramène à `null`
  // pour rester compatible avec la validation optionnelle (number | null).
  const deriveTrancheAge = ({ value }: { value?: number | string | null }) => {
    if (value === '') {
      form.setFieldValue('anneeNaissance', null)
      return
    }
    const trancheAgeFromAnnee = effectiveTrancheAge(value)
    if (
      trancheAgeFromAnnee &&
      form.getFieldValue('trancheAge') !== trancheAgeFromAnnee
    )
      form.setFieldValue('trancheAge', trancheAgeFromAnnee)
  }

  // Aligne la tranche d'âge sur l'année déjà renseignée au montage (édition),
  // pour que le champ tranche désactivé affiche la bonne valeur.
  useEffect(() => {
    const trancheAgeFromAnnee = effectiveTrancheAge(
      form.getFieldValue('anneeNaissance'),
    )
    if (
      trancheAgeFromAnnee &&
      form.getFieldValue('trancheAge') !== trancheAgeFromAnnee
    )
      form.setFieldValue('trancheAge', trancheAgeFromAnnee)
  }, [form])

  return (
    <form.AppForm>
      <form onSubmit={handleSubmit(form)}>
        <FormSection
          title="Identité du bénéficiaire"
          description={<RequiredFieldsDisclaimer />}
        >
          <div className="fr-grid-row fr-grid-row--gutters">
            <div className="fr-col-12 fr-col-md-6">
              <form.AppField name="prenom">
                {(field) => (
                  <field.Input
                    className="fr-flex-grow-1 fr-flex-basis-0"
                    isPending={isPending}
                    label="Prénom(s) *"
                  />
                )}
              </form.AppField>
            </div>
            <div className="fr-col-12 fr-col-md-6">
              <form.AppField name="nom">
                {(field) => (
                  <field.Input
                    className="fr-flex-grow-1 fr-flex-basis-0"
                    isPending={isPending}
                    label="Nom d’usage *"
                  />
                )}
              </form.AppField>
            </div>
          </div>
          <div className="fr-grid-row fr-grid-row--gutters">
            <div className="fr-col-12 fr-col-md-6">
              <form.AppField
                name="anneeNaissance"
                listeners={{ onChange: deriveTrancheAge }}
              >
                {(field) => (
                  <field.Input
                    isPending={isPending}
                    nativeInputProps={{
                      type: 'number',
                      min: anneeNaissanceMin,
                      max: anneeNaissanceMax,
                      step: 1,
                    }}
                    label={
                      <>
                        Année de naissance
                        <button
                          type="button"
                          className="fr-btn--tooltip fr-btn"
                          aria-describedby="annee-naissance-tooltip"
                        >
                          Information typologies
                        </button>
                        <span
                          className="fr-tooltip fr-placement"
                          id="annee-naissance-tooltip"
                          role="tooltip"
                          aria-hidden
                        >
                          L’année de naissance permet d’éviter les doublons de
                          bénéficiaires (en cas d’homonyme) et de compléter la
                          tranche d’âge automatiquement.
                        </span>
                      </>
                    }
                  />
                )}
              </form.AppField>
            </div>
          </div>
        </FormSection>

        <FormSection
          title="Coordonnées"
          description={
            <>
              Les coordonnées sont utiles notamment pour planifier un
              rendez-vous via RDV Service Public et envoyer un rappel par SMS à
              vos bénéficiaires.
            </>
          }
        >
          <div className="fr-grid-row fr-grid-row--gutters">
            <div className="fr-col-12 fr-col-md-6">
              <form.AppField name="telephone">
                {(field) => (
                  <field.Input
                    className="fr-flex-grow-1 fr-flex-basis-0 fr-mb-0"
                    isPending={isPending || pasDeTelephone}
                    label="Numéro de téléphone"
                  />
                )}
              </form.AppField>
              <form.AppField
                name="pasDeTelephone"
                listeners={{ onChange: eraseTelephoneIfNeeded }}
              >
                {(field) => (
                  <field.Checkbox
                    className="fr-flex-grow-1 fr-flex-basis-0 fr-mt-4v"
                    isPending={isPending}
                    isTiled={false}
                    options={[{ label: 'N’a pas de téléphone', value: true }]}
                  />
                )}
              </form.AppField>
            </div>
            <div className="fr-col-12 fr-col-md-6">
              <form.AppField name="email">
                {(field) => (
                  <field.Input
                    className="fr-flex-grow-1 fr-flex-basis-0"
                    isPending={isPending}
                    nativeInputProps={{ type: 'email' }}
                    label="E-mail"
                  />
                )}
              </form.AppField>
            </div>
          </div>
        </FormSection>
        <FormSection
          title="Informations socio-démographiques"
          description={
            <>
              Ces informations seront utiles dans un but statistique afin de
              comprendre les types de publics accompagnés sur un territoire. En
              les renseignant ici, elles seront automatiquement complétées dans
              vos compte-rendus d’activités. {enSavoirPlusLink}
            </>
          }
        >
          <form.AppField name="communeResidence">
            {(field) => (
              <field.ComboBox isPending={isPending} {...CommuneComboBox}>
                {({
                  getLabelProps,
                  getInputProps,
                  setInputValue,
                  getToggleButtonProps,
                  ...options
                }) => (
                  <div className="fr-mb-6v">
                    <field.Input
                      addonEnd={
                        <Button
                          title="Rechercher une commune"
                          className="fr-border-left-0 fr-py-7v fr-pl-4v"
                          style={{ width: 56, maxWidth: 56, minWidth: 56 }}
                          iconId="fr-icon-search-line"
                          {...getToggleButtonProps({ type: 'button' })}
                        />
                      }
                      addinEnd={
                        field.state.value != null && (
                          <Button
                            title="Déselectionner la commune"
                            type="button"
                            iconId="fr-icon-close-line"
                            priority="tertiary no outline"
                            className="fr-mt-2v fr-mr-2v"
                            onClick={() => {
                              field.setValue(null)
                              setInputValue('')
                            }}
                          />
                        )
                      }
                      isPending={isPending}
                      isConnected={false}
                      nativeLabelProps={getLabelProps()}
                      nativeInputProps={{
                        ...getInputProps(),
                        placeholder:
                          'Rechercher une commune par son nom ou son code postal',
                      }}
                      label={
                        <span className="fr-text--medium fr-mb-4v fr-display-block">
                          Commune de résidence du bénéficiaire
                        </span>
                      }
                    />
                    <Options {...options} {...CommuneOptions} />
                  </div>
                )}
              </field.ComboBox>
            )}
          </form.AppField>
          <form.AppField name="genre">
            {(field) => (
              <field.RadioButtons
                className="fr-mb-12v"
                classes={{
                  content: 'fr-display-grid fr-grid--3x1 fr-grid-gap-2v',
                }}
                isPending={isPending}
                options={genreOptions}
                orientation="horizontal"
                legend="Genre"
              />
            )}
          </form.AppField>
          <div className="fr-flex fr-flex-gap-6v fr-direction-column fr-direction-md-row">
            <div className="fr-flex-basis-0 fr-flex-grow-1">
              <form.AppField name="trancheAge">
                {(field) => (
                  <field.RadioButtons
                    classes={{
                      content: 'fr-flex fr-direction-column fr-flex-gap-3v',
                    }}
                    isPending={isPending || disableTrancheAge}
                    options={trancheAgeOptions}
                    legend="Tranche d’âge"
                  />
                )}
              </form.AppField>
            </div>
            <div className="fr-flex-basis-0 fr-flex-grow-1">
              <form.AppField name="statutSocial">
                {(field) => (
                  <field.RadioButtons
                    classes={{
                      content: 'fr-flex fr-direction-column fr-flex-gap-3v',
                    }}
                    isPending={isPending}
                    options={statutSocialOptions}
                    legend="Statut du bénéficiaire"
                  />
                )}
              </form.AppField>
            </div>
          </div>
        </FormSection>
        <FormSection>
          <form.AppField name="notes">
            {(field) => (
              <field.RichTextarea
                isPending={isPending}
                disabled={isPending}
                label={
                  <>
                    <h2 className="fr-h5 fr-mb-1v">Notes complémentaires</h2>
                    <p className="fr-text--xs fr-text-mention--grey fr-mb-4v">
                      Il est interdit de stocker des informations sensibles
                      (données de santé, mots de passe, etc).
                      <br />
                      Il est fortement recommandé de ne stocker que les
                      informations utiles au suivi du bénéficiaire.
                    </p>
                  </>
                }
              />
            )}
          </form.AppField>
        </FormSection>

        <div className="fr-btns-group fr-mt-12v fr-mb-30v">
          <form.Submit isPending={isPending}>
            {edit ? 'Modifier le bénéficiaire' : 'Enregistrer le bénéficiaire'}
          </form.Submit>
          <Button
            priority="secondary"
            linkProps={{
              href: backUrl,
            }}
          >
            Annuler
          </Button>
        </div>
      </form>
    </form.AppForm>
  )
}

export default BeneficiaireForm
