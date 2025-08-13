'use client'

import CheckboxFormField from '@app/ui/components/Form/CheckboxFormField'
import InputFormField from '@app/ui/components/Form/InputFormField'
import RadioFormField from '@app/ui/components/Form/RadioFormField'
import RequiredFieldsDisclaimer from '@app/ui/components/Form/RequiredFieldsDisclaimer'
import RichTextFormField from '@app/ui/components/Form/RichText/RichTextFormField'
import { useScrollToError } from '@app/ui/hooks/useScrollToError'
import { useWatchSubscription } from '@app/ui/hooks/useWatchSubscription'
import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import FormSection from '@app/web/app/coop/(full-width-layout)/mes-beneficiaires/FormSection'
import {
  genreOptions,
  statutSocialOptions,
  trancheAgeOptions,
} from '@app/web/beneficiaire/beneficiaire'
import { beneficiaireCommuneResidenceToPreviewBanData } from '@app/web/beneficiaire/prismaBeneficiaireToBeneficiaireData'
import { trancheAgeFromAnneeNaissance } from '@app/web/beneficiaire/trancheAgeFromAnneeNaissance'
import AdresseBanFormField, {
  type AdressBanFormFieldOption,
} from '@app/web/components/form/AdresseBanFormField'
import RichCardLabel, {
  richCardFieldsetElementClassName,
  richCardRadioGroupClassName,
} from '@app/web/components/form/RichCardLabel'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import { CraCollectifData } from '@app/web/features/activites/use-cases/cra/collectif/validation/CraCollectifValidation'
import CraFormLabel from '@app/web/features/activites/use-cases/cra/components/CraFormLabel'
import { craFormFieldsetClassname } from '@app/web/features/activites/use-cases/cra/components/craFormFieldsetClassname'
import { CraIndividuelData } from '@app/web/features/activites/use-cases/cra/individuel/validation/CraIndividuelValidation'
import {
  BeneficiaireData,
  BeneficiaireValidation,
  anneeNaissanceMax,
  anneeNaissanceMin,
} from '@app/web/features/beneficiaires/validation/BeneficiaireValidation'
import { trpc } from '@app/web/trpc'
import { applyZodValidationMutationErrorsToForm } from '@app/web/utils/applyZodValidationMutationErrorsToForm'
import { encodeSerializableState } from '@app/web/utils/encodeSerializableState'
import Button from '@codegouvfr/react-dsfr/Button'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useCallback } from 'react'
import { DefaultValues, useForm } from 'react-hook-form'
import styles from './BeneficiaireForm.module.css'

const BeneficiaireForm = ({
  defaultValues,
  cra,
  retour,
  communeResidenceDefaultOptions,
  edit = false,
}: {
  defaultValues: DefaultValues<BeneficiaireData> & { mediateurId: string }
  // If present, used to merge with state on retour redirection
  cra?: DefaultValues<CraIndividuelData> | DefaultValues<CraCollectifData>
  retour?: string
  communeResidenceDefaultOptions?: AdressBanFormFieldOption[]
  edit?: boolean
}) => {
  const form = useForm<BeneficiaireData>({
    resolver: zodResolver(BeneficiaireValidation),
    defaultValues: {
      ...defaultValues,
    },
  })

  const mutation = trpc.beneficiaires.createOrUpdate.useMutation()

  const router = useRouter()

  const enSavoirPlusLink = (
    <Link
      href="https://docs.numerique.gouv.fr/docs/3d5bad76-8e02-4abc-b83a-c2f2965ae5d9/"
      target="_blank"
      className="fr-link fr-link--xs"
    >
      En savoir plus
    </Link>
  )

  const {
    control,
    setError,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting, isSubmitSuccessful, errors },
  } = form

  const backUrl =
    retour ||
    (defaultValues.id
      ? `/coop/mes-beneficiaires/${defaultValues.id}`
      : '/coop/mes-beneficiaires')

  const onSubmit = async (data: BeneficiaireData) => {
    try {
      const beneficiaire = await mutation.mutateAsync(data)
      createToast({
        priority: 'success',
        message: data.id
          ? 'Le bénéficiaire a bien été mis à jour.'
          : 'Le bénéficiaire a bien été créé.',
      })

      let queryParams = ''

      if (cra) {
        // We merge existing cra state with created / updated beneficiaire id

        const beneficiaireFormData = {
          id: beneficiaire.id,
          prenom: beneficiaire.prenom,
          nom: beneficiaire.nom,
          communeResidence:
            beneficiaireCommuneResidenceToPreviewBanData(beneficiaire),
        }

        const newCra =
          'participants' in cra
            ? {
                // Append beneficiaire to cra collectif
                ...cra,
                participants: [
                  ...(cra.participants ?? []),
                  beneficiaireFormData,
                ],
              }
            : {
                // Replace beneficiaire in cra individuel
                ...cra,
                beneficiaire: beneficiaireFormData,
              }
        queryParams = `?v=${encodeSerializableState(newCra)}`
      }

      router.push(
        `${
          retour ?? `/coop/mes-beneficiaires/${beneficiaire.id}`
        }${queryParams}`,
      )
      router.refresh()
    } catch (mutationError) {
      if (applyZodValidationMutationErrorsToForm(mutationError, setError)) {
        return
      }
      createToast({
        priority: 'error',
        message:
          'Une erreur est survenue lors de l’enregistrement, veuillez réessayer ultérieurement.',
      })
    }
  }
  const isLoading = isSubmitting || isSubmitSuccessful

  useScrollToError({ errors })

  const disableTelephone = watch('pasDeTelephone') === true
  const anneeNaissance = watch('anneeNaissance')
  const anneeNaissanceInt = anneeNaissance
    ? typeof anneeNaissance === 'number'
      ? anneeNaissance
      : Number.parseInt(anneeNaissance, 10)
    : null

  const disableTrancheAge =
    !!anneeNaissanceInt &&
    anneeNaissanceInt >= anneeNaissanceMin &&
    anneeNaissanceInt <= anneeNaissanceMax

  useWatchSubscription(
    watch,
    useCallback(
      (data, { name }) => {
        // Erase telephone if pasDeTelephone is checked
        if (
          name === 'pasDeTelephone' &&
          data.pasDeTelephone &&
          !!data.telephone
        ) {
          setValue('telephone', null)
        }

        // Set tranche d’age depending on birth year
        if (name === 'anneeNaissance') {
          const trancheAgeFromAnnee = trancheAgeFromAnneeNaissance(
            data.anneeNaissance,
          )
          if (trancheAgeFromAnnee && data.trancheAge !== trancheAgeFromAnnee) {
            setValue('trancheAge', trancheAgeFromAnnee)
          }
        }
      },
      [setValue],
    ),
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormSection
        title="Identité du bénéficiaire"
        description={<RequiredFieldsDisclaimer />}
      >
        <div className="fr-grid-row fr-grid-row--gutters">
          <div className="fr-col-12 fr-col-md-6">
            <InputFormField
              className="fr-flex-grow-1 fr-flex-basis-0"
              control={control}
              path="prenom"
              label="Prénom(s)"
              asterisk
              disabled={isLoading}
            />
          </div>
          <div className="fr-col-12 fr-col-md-6">
            <InputFormField
              className="fr-flex-grow-1 fr-flex-basis-0"
              control={control}
              path="nom"
              label="Nom d’usage"
              asterisk
              disabled={isLoading}
            />
          </div>
        </div>
        <div className="fr-grid-row fr-grid-row--gutters">
          <div className="fr-col-12 fr-col-md-6">
            <InputFormField
              control={control}
              path="anneeNaissance"
              type="number"
              min={anneeNaissanceMin}
              max={anneeNaissanceMax}
              step={1}
              disabled={isLoading}
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
                    bénéficiaires (en cas d’homonyme) et de compléter la tranche
                    d’âge automatiquement.
                  </span>
                </>
              }
            />
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Coordonnées"
        description={
          <>
            Les coordonnées sont utiles notamment pour planifier un rendez-vous
            via RDV Service Public et envoyer un rappel par SMS à vos
            bénéficiaires.
            {enSavoirPlusLink}
          </>
        }
      >
        <div className="fr-grid-row fr-grid-row--gutters">
          <div className="fr-col-12 fr-col-md-6">
            <InputFormField
              className="fr-flex-grow-1 fr-flex-basis-0 fr-mb-0"
              control={control}
              disabled={isLoading || disableTelephone}
              path="telephone"
              label="Numéro de téléphone"
            />
            <CheckboxFormField
              className="fr-flex-grow-1 fr-flex-basis-0 fr-mt-4v"
              control={control}
              path="pasDeTelephone"
              label="N’a pas de téléphone"
              disabled={isLoading}
            />
          </div>
          <div className="fr-col-12 fr-col-md-6">
            <InputFormField
              className="fr-flex-grow-1 fr-flex-basis-0"
              control={control}
              disabled={isLoading}
              type="email"
              path="email"
              label="E-mail"
            />
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
        <AdresseBanFormField<BeneficiaireData>
          control={control}
          path="communeResidence"
          disabled={isLoading}
          label={
            <span className="fr-text--medium fr-mb-4v fr-display-block">
              Commune de résidence du bénéficiaire
            </span>
          }
          placeholder="Rechercher une commune par son nom ou son code postal"
          searchOptions={{ type: 'municipality' }}
          defaultOptions={communeResidenceDefaultOptions}
          defaultValue={
            communeResidenceDefaultOptions &&
            communeResidenceDefaultOptions.length > 0
              ? communeResidenceDefaultOptions[0]
              : undefined
          }
        />
        <CraFormLabel as="p" className="fr-mb-4v fr-mt-6v">
          Genre
        </CraFormLabel>
        <RadioFormField
          control={control}
          path="genre"
          options={genreOptions}
          disabled={isLoading}
          components={{
            label: RichCardLabel,
          }}
          classes={{
            fieldsetElement: richCardFieldsetElementClassName,
            fieldset: craFormFieldsetClassname(styles.genreFieldset),
            radioGroup: richCardRadioGroupClassName,
          }}
        />
        <div className="fr-flex fr-flex-gap-6v fr-direction-column fr-direction-md-row">
          <div className="fr-flex-basis-0 fr-flex-grow-1">
            <CraFormLabel as="p" className="fr-my-4v">
              Tranche d’âge
            </CraFormLabel>
            <RadioFormField
              control={control}
              path="trancheAge"
              options={trancheAgeOptions}
              disabled={isLoading || disableTrancheAge}
              components={{
                label: RichCardLabel,
              }}
              classes={{
                fieldset: craFormFieldsetClassname(styles.columnFieldset),
                fieldsetElement: richCardFieldsetElementClassName,
                radioGroup: richCardRadioGroupClassName,
              }}
            />
          </div>
          <div className="fr-flex-basis-0 fr-flex-grow-1">
            <CraFormLabel as="p" className="fr-my-4v">
              Statut du bénéficiaire
            </CraFormLabel>
            <RadioFormField
              control={control}
              path="statutSocial"
              options={statutSocialOptions}
              disabled={isLoading}
              components={{
                label: RichCardLabel,
              }}
              classes={{
                fieldset: craFormFieldsetClassname(styles.columnFieldset),
                fieldsetElement: richCardFieldsetElementClassName,
                radioGroup: richCardRadioGroupClassName,
              }}
            />
          </div>
        </div>
      </FormSection>
      <FormSection>
        <RichTextFormField
          form={form}
          disabled={isLoading}
          path="notes"
          label={
            <>
              <h2 className="fr-h5 fr-mb-1v">Notes complémentaires</h2>
              <p className="fr-text--xs fr-text-mention--grey fr-mb-4v">
                Il est interdit de stocker des informations sensibles (données
                de santé, mots de passe, etc).
                <br />
                Il est fortement recommandé de ne stocker que les informations
                utiles au suivi du bénéficiaire.
              </p>
            </>
          }
        />
      </FormSection>

      <div className="fr-btns-group fr-mt-12v fr-mb-30v">
        <Button type="submit" {...buttonLoadingClassname(isLoading)}>
          {edit ? 'Modifier le bénéficiaire' : 'Enregistrer le bénéficiaire'}
        </Button>
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
  )
}

export default withTrpc(BeneficiaireForm)
