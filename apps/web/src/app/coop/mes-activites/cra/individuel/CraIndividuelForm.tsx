'use client'

import {
  Control,
  DefaultValues,
  useForm,
  UseFormGetValues,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import CheckboxGroupFormField from '@app/ui/components/Form/CheckboxGroupFormField'
import RedAsterisk from '@app/ui/components/Form/RedAsterisk'
import RadioFormField from '@app/ui/components/Form/RadioFormField'
import InputFormField from '@app/ui/components/Form/InputFormField'
import RichTextFormField from '@app/ui/components/Form/RichText/RichTextFormField'
import Button from '@codegouvfr/react-dsfr/Button'
import { createToast } from '@app/ui/toast/createToast'
import { useRouter } from 'next/navigation'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import CustomSelectFormField from '@app/ui/components/Form/CustomSelectFormField'
import React, { useCallback, useState } from 'react'
import type { SelectOption } from '@app/ui/components/Form/utils/options'
import { useScrollToError } from '@app/ui/hooks/useScrollToError'
import { useWatchSubscription } from '@app/ui/hooks/useWatchSubscription'
import CraFormLabel from '@app/web/app/coop/mes-activites/cra/CraFormLabel'
import AdresseBanFormField, {
  type AdressBanFormFieldOption,
} from '@app/web/components/form/AdresseBanFormField'
import {
  genreOptions,
  statutSocialOptions,
  trancheAgeOptions,
} from '@app/web/beneficiaire/beneficiaire'
import { applyZodValidationMutationErrorsToForm } from '@app/web/utils/applyZodValidationMutationErrorsToForm'
import { trpc } from '@app/web/trpc'
import RichCardLabel, {
  richCardFieldsetElementClassName,
  richCardRadioGroupClassName,
} from '@app/web/components/form/RichCardLabel'
import {
  autonomieOptionsWithExtras,
  dureeAccompagnementOptions,
  lieuAccompagnementOptionsWithExtras,
  materielOptions,
  structuresRedirectionOptions,
  thematiqueAccompagnementOptionsWithExtras,
} from '@app/web/cra/cra'
import {
  CraIndividuelData,
  CraIndividuelValidation,
} from '@app/web/cra/CraIndividuelValidation'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import { yesNoBooleanOptions } from '@app/web/utils/yesNoBooleanOptions'
import { craFormFieldsetClassname } from '@app/web/app/coop/mes-activites/cra/craFormFieldsetClassname'
import CraBeneficiaryForm, {
  CraDataWithBeneficiaire,
} from '@app/web/app/coop/mes-activites/cra/CraBeneficiaryForm'
import { encodeSerializableState } from '@app/web/utils/encodeSerializableState'
import type { BeneficiaireData } from '@app/web/beneficiaire/BeneficiaireValidation'
import { banMunicipalityLabel } from '@app/web/external-apis/ban/banMunicipalityLabel'
import { banDefaultValueToAdresseBanData } from '@app/web/external-apis/ban/banDefaultValueToAdresseBanData'
import { replaceRouteWithoutRerender } from '@app/web/utils/replaceRouteWithoutRerender'
import styles from '../CraForm.module.css'

/**
 * Initial options can come from the field data it self or be pre-populated by beneficiaire data
 */
const lieuResidenceOptionsFromFormData = (
  data: DefaultValues<CraIndividuelData>,
): AdressBanFormFieldOption[] => {
  const result: AdressBanFormFieldOption[] = []
  if (data.lieuAccompagnementDomicileCommune?.codeInsee) {
    result.push({
      label: banMunicipalityLabel(data.lieuAccompagnementDomicileCommune),
      value: banDefaultValueToAdresseBanData(
        data.lieuAccompagnementDomicileCommune,
      ),
    })
  }

  // Do not duplicate option
  if (
    !data.beneficiaire?.communeResidence?.codeInsee ||
    data.beneficiaire?.communeResidence?.codeInsee ===
      data.lieuAccompagnementDomicileCommune?.codeInsee
  ) {
    return result
  }

  result.push({
    label: banMunicipalityLabel(data.beneficiaire.communeResidence),
    value: banDefaultValueToAdresseBanData(data.beneficiaire.communeResidence),
  })

  return result
}

const CraIndividuelForm = ({
  defaultValues,
  lieuActiviteOptions,
  initialBeneficiariesOptions,
}: {
  defaultValues: DefaultValues<CraIndividuelData> & { mediateurId: string }
  lieuActiviteOptions: SelectOption[]
  initialBeneficiariesOptions: SelectOption<BeneficiaireData | null>[]
}) => {
  const form = useForm<CraIndividuelData>({
    resolver: zodResolver(CraIndividuelValidation),
    defaultValues: {
      ...defaultValues,
    },
  })
  const mutation = trpc.cra.individuel.useMutation()

  const router = useRouter()

  const beneficiaireId = form.watch('beneficiaire.id')
  const showAnonymousForm = !beneficiaireId

  const lieuAccompagnement = form.watch('lieuAccompagnement')
  const showLieuAccompagnementDomicileCommune =
    lieuAccompagnement === 'Domicile'
  const showLieuAccompagnementLieuActivite =
    lieuAccompagnement === 'LieuActivite'

  const orienteVersStructure = form.watch('orienteVersStructure')
  const showStructureOrientation = orienteVersStructure === 'yes'

  const {
    control,
    setError,
    handleSubmit,
    getValues,
    setValue,
    watch,
    formState: { isSubmitting, isSubmitSuccessful, errors },
  } = form

  const onSubmit = async (data: CraIndividuelData) => {
    try {
      await mutation.mutateAsync(data)
      createToast({
        priority: 'success',
        message: 'L’accompagnement individuel a bien été enregistrée.',
      })
      router.push('/coop') // TODO SUCCESS LINK
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
      // Throw again to fail the sumbit
      throw mutationError
    }
  }
  const isLoading = isSubmitting || isSubmitSuccessful

  useScrollToError({ errors })

  const [initialLieuResidenceOptions, setInitialLieuResidenceOptions] =
    useState<AdressBanFormFieldOption[]>(
      lieuResidenceOptionsFromFormData(defaultValues),
    )

  const [
    lieuAccompagnementDomicileCommuneDefaultValue,
    setLieuAccompagnementDomicileCommuneDefaultValue,
  ] = useState<AdressBanFormFieldOption | undefined>(
    defaultValues.lieuAccompagnementDomicileCommune
      ? {
          label: banMunicipalityLabel(
            defaultValues.lieuAccompagnementDomicileCommune,
          ),
          value: banDefaultValueToAdresseBanData(
            defaultValues.lieuAccompagnementDomicileCommune,
          ),
        }
      : undefined,
  )

  useWatchSubscription(
    watch,
    useCallback(
      (data, { name }) => {
        replaceRouteWithoutRerender(
          `/coop/mes-activites/cra/individuel?v=${encodeSerializableState(data)}`,
        )

        // Set the initial options for the lieu de residence
        if (
          name === 'beneficiaire' &&
          data.beneficiaire?.communeResidence?.codeInsee
        ) {
          setInitialLieuResidenceOptions(lieuResidenceOptionsFromFormData(data))
          const newDomicileValue = banDefaultValueToAdresseBanData(
            data.beneficiaire.communeResidence,
          )
          setLieuAccompagnementDomicileCommuneDefaultValue({
            label: banMunicipalityLabel(data.beneficiaire.communeResidence),
            value: newDomicileValue,
          })
          setValue('lieuAccompagnementDomicileCommune', newDomicileValue)
        }
      },
      [setValue],
    ),
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <CraBeneficiaryForm
        // TODO These types are fragile. But hard to type a sub component that works for 2 form data types
        getValues={
          getValues as unknown as UseFormGetValues<CraDataWithBeneficiaire>
        }
        control={control as unknown as Control<CraDataWithBeneficiaire>}
        mediateurId={defaultValues.mediateurId}
        setValue={
          setValue as unknown as UseFormSetValue<CraDataWithBeneficiaire>
        }
        watch={watch as unknown as UseFormWatch<CraDataWithBeneficiaire>}
        creerBeneficiaireRetourUrl="/coop/mes-activites/cra/individuel"
        initialBeneficiariesOptions={initialBeneficiariesOptions}
      />
      <div className="fr-flex fr-flex-gap-12v">
        <InputFormField
          control={control}
          disabled={isLoading}
          path="date"
          type="date"
          asterisk
          label="Date de l’accompagnement"
          className="fr-flex-grow-1"
          classes={{
            label: 'fr-text--medium fr-mb-3v',
            input: 'fr-input--white fr-input--14v',
          }}
        />
        <div className="fr-flex-grow-2">
          <CraFormLabel required as="p" className="fr-mb-3v">
            Durée de l’accompagnement
          </CraFormLabel>
          <RadioFormField
            control={control}
            disabled={isLoading}
            path="duree"
            options={dureeAccompagnementOptions}
            components={{
              label: RichCardLabel,
            }}
            classes={{
              fieldsetElement: richCardFieldsetElementClassName,
              fieldset: craFormFieldsetClassname(styles.durationFieldset),
              radioGroup: richCardRadioGroupClassName,
            }}
          />
        </div>
      </div>
      <CraFormLabel required as="p" className="fr-mb-3v fr-mt-8v">
        Lieu d’accompagnement
      </CraFormLabel>
      <RadioFormField
        control={control}
        path="lieuAccompagnement"
        disabled={isLoading}
        options={lieuAccompagnementOptionsWithExtras}
        components={{
          label: RichCardLabel,
        }}
        classes={{
          fieldsetElement: richCardFieldsetElementClassName,
          fieldset: craFormFieldsetClassname(styles.lieuFieldset),
          radioGroup: richCardRadioGroupClassName,
        }}
      />
      {showLieuAccompagnementDomicileCommune && (
        <AdresseBanFormField<CraIndividuelData>
          label=" "
          control={control}
          path="lieuAccompagnementDomicileCommune"
          disabled={isLoading}
          placeholder="Rechercher une commune par son nom ou son code postal"
          searchOptions={{ type: 'municipality' }}
          defaultOptions={initialLieuResidenceOptions}
          defaultValue={lieuAccompagnementDomicileCommuneDefaultValue}
        />
      )}
      {showLieuAccompagnementLieuActivite && (
        <CustomSelectFormField
          label=" "
          control={control}
          path="lieuActiviteId"
          placeholder="Rechercher un lieu d’activité"
          options={lieuActiviteOptions}
        />
      )}
      <hr className="fr-separator-12v" />
      <p className="fr-text--medium fr-mb-4v">Matériel numérique utilisé</p>
      <CheckboxGroupFormField
        control={control}
        path="materiel"
        options={materielOptions}
        disabled={isLoading}
        components={{
          label: RichCardLabel,
          labelProps: { paddingX: 16 },
        }}
        classes={{
          fieldsetElement: richCardFieldsetElementClassName,
          fieldset: craFormFieldsetClassname(styles.materielFieldset),
          label: 'fr-py-4v',
        }}
      />
      <p className="fr-text--medium fr-mb-4v fr-mt-12v">
        Thématique(s) d’accompagnement <RedAsterisk />
      </p>
      <CheckboxGroupFormField
        control={control}
        path="thematiques"
        options={thematiqueAccompagnementOptionsWithExtras}
        disabled={isLoading}
        components={{
          label: RichCardLabel,
        }}
        classes={{
          fieldsetElement: richCardFieldsetElementClassName,
          fieldset: craFormFieldsetClassname(styles.thematiquesFieldset),
        }}
      />
      <p className="fr-text--medium fr-mb-4v fr-mt-12v">
        Niveau d’autonomie du bénéficiaire
      </p>
      <RadioFormField
        control={control}
        path="autonomie"
        options={autonomieOptionsWithExtras}
        disabled={isLoading}
        components={{
          label: RichCardLabel,
        }}
        classes={{
          fieldsetElement: richCardFieldsetElementClassName,
          fieldset: craFormFieldsetClassname(styles.thematiquesFieldset),
        }}
      />
      <p className="fr-text--medium fr-mb-4v fr-mt-12v">
        Le bénéficiaire est-il orienté vers une autre structure&nbsp;?
      </p>
      <RadioFormField
        control={control}
        path="orienteVersStructure"
        options={yesNoBooleanOptions}
        disabled={isLoading}
        components={{
          label: RichCardLabel,
        }}
        classes={{
          fieldsetElement: richCardFieldsetElementClassName,
          fieldset: craFormFieldsetClassname(styles.yesNoFieldset),
          radioGroup: richCardRadioGroupClassName,
        }}
      />
      {!!showStructureOrientation && (
        <CustomSelectFormField
          label=" "
          control={control}
          path="structureDeRedirection"
          placeholder="Structure de redirection"
          options={structuresRedirectionOptions}
        />
      )}

      {showAnonymousForm && (
        <>
          <hr className="fr-separator-12v" />
          <h2 className="fr-h3 fr-mb-1v fr-text-title--blue-france">
            Informations optionnelles sur le bénéficiaire
          </h2>
          <p className="fr-text--xs fr-text-mention--grey fr-mb-0">
            Vous pouvez renseigner des informations anonymes sur le bénéficiaire
            pour compléter vos statistiques.
          </p>

          <p className="fr-text--medium fr-mb-4v fr-mt-12v">
            Le bénéficiaire va-t-il poursuivre son parcours
            d’accompagnement&nbsp;?
          </p>
          <RadioFormField
            control={control}
            path="beneficiaire.vaPoursuivreParcoursAccompagnement"
            options={yesNoBooleanOptions}
            disabled={isLoading}
            components={{
              label: RichCardLabel,
            }}
            className="fr-mb-12v"
            classes={{
              fieldsetElement: richCardFieldsetElementClassName,
              fieldset: craFormFieldsetClassname(styles.yesNoFieldset),
              radioGroup: richCardRadioGroupClassName,
            }}
          />
          <AdresseBanFormField<CraIndividuelData>
            control={control}
            path="beneficiaire.communeResidence"
            disabled={isLoading}
            defaultOptions={initialLieuResidenceOptions}
            label={
              <span className="fr-text--medium fr-mb-4v fr-display-block">
                Commune de résidence du bénéficiaire
              </span>
            }
            placeholder="Rechercher une commune par son nom ou son code postal"
            searchOptions={{ type: 'municipality' }}
          />
          <CraFormLabel as="p" className="fr-mb-4v fr-mt-12v">
            Genre
          </CraFormLabel>
          <RadioFormField
            control={control}
            path="beneficiaire.genre"
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
          <div className="fr-flex fr-flex-gap-12v">
            <div className="fr-flex-basis-0 fr-flex-grow-1">
              <CraFormLabel as="p" className="fr-mb-4v fr-mt-12v">
                Tranche d’âge
              </CraFormLabel>
              <RadioFormField
                control={control}
                path="beneficiaire.trancheAge"
                options={trancheAgeOptions}
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
            <div className="fr-flex-basis-0 fr-flex-grow-1">
              <CraFormLabel as="p" className="fr-mb-4v fr-mt-12v">
                Statut du bénéficiaire
              </CraFormLabel>
              <RadioFormField
                control={control}
                path="beneficiaire.statutSocial"
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
        </>
      )}
      <RichTextFormField
        className="fr-mt-12v"
        form={form}
        disabled={isLoading}
        path="notes"
        label={
          <span className="fr-text--medium">Notes sur l’accompagnement</span>
        }
        hint={
          <>
            Il est interdit de stocker des informations sensibles (données de
            santé, mots de passe, etc).
            <br />
            Vous retrouverez ces notes dans votre historique d’activités ainsi
            que dans l’historique du bénéficiaire.
          </>
        }
      />
      <div className="fr-btns-group fr-mt-12v fr-mb-30v">
        <Button type="submit" {...buttonLoadingClassname(isLoading)}>
          Enregistrer l’activité
        </Button>
        <Button
          priority="secondary"
          linkProps={{
            href: '/coop', // TODO BACK LINK PROP
          }}
        >
          Annuler
        </Button>
      </div>
    </form>
  )
}

export default withTrpc(CraIndividuelForm)
