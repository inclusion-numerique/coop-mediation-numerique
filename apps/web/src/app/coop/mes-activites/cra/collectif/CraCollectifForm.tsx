'use client'

import { DefaultValues, useForm } from 'react-hook-form'
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
import React, { useCallback } from 'react'
import type { SelectOption } from '@app/ui/components/Form/utils/options'
import { useScrollToError } from '@app/ui/hooks/useScrollToError'
import { useWatchSubscription } from '@app/ui/hooks/useWatchSubscription'
import CraFormLabel from '@app/web/app/coop/mes-activites/cra/CraFormLabel'
import AdresseBanFormField, {
  AdressBanFormFieldOption,
} from '@app/web/components/form/AdresseBanFormField'
import { applyZodValidationMutationErrorsToForm } from '@app/web/utils/applyZodValidationMutationErrorsToForm'
import { trpc } from '@app/web/trpc'
import RichCardLabel, {
  richCardFieldsetElementClassName,
  richCardRadioGroupClassName,
} from '@app/web/components/form/RichCardLabel'
import {
  dureeAccompagnementOptions,
  lieuAtelierOptionsWithExtras,
  materielOptions,
  niveauAtelierOptionsWithExtras,
  thematiqueOptionsWithExtras,
} from '@app/web/cra/cra'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import { craFormFieldsetClassname } from '@app/web/app/coop/mes-activites/cra/craFormFieldsetClassname'
import { encodeSerializableState } from '@app/web/utils/encodeSerializableState'
import type { BeneficiaireData } from '@app/web/beneficiaire/BeneficiaireValidation'
import { banMunicipalityLabel } from '@app/web/external-apis/ban/banMunicipalityLabel'
import { banDefaultValueToAdresseBanData } from '@app/web/external-apis/ban/banDefaultValueToAdresseBanData'
import {
  type CraCollectifData,
  CraCollectifValidation,
} from '@app/web/cra/CraCollectifValidation'
import CraBeneficiairesMultiplesForm from '@app/web/app/coop/mes-activites/cra/collectif/CraBeneficiairesMultiplesForm'
import { replaceRouteWithoutRerender } from '@app/web/utils/replaceRouteWithoutRerender'
import styles from '../CraForm.module.css'

const CraCollectifForm = ({
  defaultValues,
  lieuActiviteOptions,
  initialBeneficiairesOptions,
  initialCommunesOptions,
  retour,
}: {
  defaultValues: DefaultValues<CraCollectifData> & { mediateurId: string }
  lieuActiviteOptions: SelectOption[]
  initialCommunesOptions: AdressBanFormFieldOption[]
  initialBeneficiairesOptions: SelectOption<BeneficiaireData | null>[]
  retour?: string
}) => {
  const form = useForm<CraCollectifData>({
    resolver: zodResolver(CraCollectifValidation),
    defaultValues: {
      ...defaultValues,
    },
  })
  const mutation = trpc.cra.collectif.useMutation()

  const router = useRouter()

  const lieuAccompagnement = form.watch('lieuAtelier')
  const showLieuAtelierAutreCommune = lieuAccompagnement === 'Autre'
  const showLieuAccompagnementLieuActivite =
    lieuAccompagnement === 'LieuActivite'

  const {
    control,
    setError,
    handleSubmit,
    getValues,
    setValue,
    watch,
    formState: { isSubmitting, isSubmitSuccessful, errors },
  } = form

  const onSubmit = async (data: CraCollectifData) => {
    try {
      await mutation.mutateAsync(data)
      createToast({
        priority: 'success',
        message: 'L’atelier collectif a bien été enregistré.',
      })
      router.push(retour ?? '/coop/mes-activites')
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
      // Throw again to fail the submit
      throw mutationError
    }
  }
  const isLoading = isSubmitting || isSubmitSuccessful

  useScrollToError({ errors })

  const lieuAtelierAutreCommuneDefaultValue =
    defaultValues.lieuAtelierAutreCommune
      ? {
          label: banMunicipalityLabel(defaultValues.lieuAtelierAutreCommune),
          value: banDefaultValueToAdresseBanData(
            defaultValues.lieuAtelierAutreCommune,
          ),
        }
      : undefined

  useWatchSubscription(
    watch,
    useCallback((data) => {
      // use idle callback to avoid blocking the main thread while typing
      requestIdleCallback(() => {
        replaceRouteWithoutRerender(
          `/coop/mes-activites/cra/collectif?v=${encodeSerializableState(data)}`,
        )
      })
    }, []),
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <InputFormField
        control={control}
        disabled={isLoading}
        path="titreAtelier"
        label="Titre de l’atelier"
        hint="Renseignez le titre de votre atelier (sujet, thématique) afin de le retrouver plus facilement dans vos activités."
        classes={{ label: 'fr-text--medium fr-mb-3v', input: 'fr-input--14v' }}
        className="fr-mb-12v"
      />
      <CraBeneficiairesMultiplesForm
        getValues={getValues}
        control={control}
        mediateurId={defaultValues.mediateurId}
        setValue={setValue}
        watch={watch}
        creerBeneficiaireRetourUrl="/coop/mes-activites/cra/collectif"
        initialBeneficiairesOptions={initialBeneficiairesOptions}
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
        Lieu de l’atelier
      </CraFormLabel>
      <RadioFormField
        control={control}
        path="lieuAtelier"
        disabled={isLoading}
        options={lieuAtelierOptionsWithExtras}
        components={{
          label: RichCardLabel,
        }}
        classes={{
          fieldsetElement: richCardFieldsetElementClassName,
          fieldset: craFormFieldsetClassname(styles.lieuAtelierFieldset),
          radioGroup: richCardRadioGroupClassName,
        }}
      />
      {showLieuAtelierAutreCommune && (
        <AdresseBanFormField<CraCollectifData>
          label=" "
          control={control}
          path="lieuAtelierAutreCommune"
          disabled={isLoading}
          placeholder="Rechercher une commune par son nom ou son code postal"
          searchOptions={{ type: 'municipality' }}
          defaultOptions={initialCommunesOptions}
          defaultValue={lieuAtelierAutreCommuneDefaultValue}
        />
      )}
      {showLieuAccompagnementLieuActivite && (
        <CustomSelectFormField
          label=" "
          control={control}
          path="structureId"
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
        options={thematiqueOptionsWithExtras}
        disabled={isLoading}
        components={{
          label: RichCardLabel,
        }}
        classes={{
          fieldsetElement: richCardFieldsetElementClassName,
          fieldset: craFormFieldsetClassname(styles.thematiquesFieldset),
        }}
      />
      <p className="fr-text--medium fr-mb-4v fr-mt-12v">Niveau de l’atelier</p>
      <RadioFormField
        control={control}
        path="niveau"
        options={niveauAtelierOptionsWithExtras}
        disabled={isLoading}
        components={{
          label: RichCardLabel,
        }}
        classes={{
          fieldsetElement: richCardFieldsetElementClassName,
          fieldset: craFormFieldsetClassname(styles.thematiquesFieldset),
          radioGroup: richCardRadioGroupClassName,
        }}
      />

      <RichTextFormField
        className="fr-mt-12v"
        form={form}
        disabled={isLoading}
        path="notes"
        label={<span className="fr-text--medium">Notes sur l’atelier</span>}
        hint={
          <>
            Il est interdit de stocker des informations sensibles (données de
            santé, mots de passe, etc).
            <br />
            Vous retrouverez ces notes dans votre historique d’activités ainsi
            que dans l’historique des bénéficiaires qui ont participé.
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
            href: retour ?? '/coop',
          }}
        >
          Annuler
        </Button>
      </div>
    </form>
  )
}

export default withTrpc(CraCollectifForm)
