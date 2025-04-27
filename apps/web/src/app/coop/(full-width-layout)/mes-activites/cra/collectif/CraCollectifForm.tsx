'use client'

import CheckboxGroupFormField from '@app/ui/components/Form/CheckboxGroupFormField'
import CustomSelectFormField from '@app/ui/components/Form/CustomSelectFormField'
import InputFormField from '@app/ui/components/Form/InputFormField'
import RadioFormField from '@app/ui/components/Form/RadioFormField'
import RedAsterisk from '@app/ui/components/Form/RedAsterisk'
import RichTextFormField from '@app/ui/components/Form/RichText/RichTextFormField'
import type { SelectOption } from '@app/ui/components/Form/utils/options'
import { useScrollToError } from '@app/ui/hooks/useScrollToError'
import { useWatchSubscription } from '@app/ui/hooks/useWatchSubscription'
import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import CraFormLabel from '@app/web/app/coop/(full-width-layout)/mes-activites/cra/CraFormLabel'
import CraBeneficiairesMultiplesForm from '@app/web/app/coop/(full-width-layout)/mes-activites/cra/collectif/CraBeneficiairesMultiplesForm'
import { craFormFieldsetClassname } from '@app/web/app/coop/(full-width-layout)/mes-activites/cra/craFormFieldsetClassname'
import type { BeneficiaireOption } from '@app/web/beneficiaire/BeneficiaireOption'
import {
  lieuActiviteFilterOption,
  toLieuActiviteRichOptions,
} from '@app/web/components/activite/lieuActiviteOptions'
import AdresseBanFormField, {
  AdressBanFormFieldOption,
} from '@app/web/components/form/AdresseBanFormField'
import CraDureeSubForm from '@app/web/components/form/CraDureeSubForm'
import RichCardLabel, {
  richCardFieldsetElementClassName,
  richCardRadioGroupClassName,
} from '@app/web/components/form/RichCardLabel'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import {
  type CraCollectifData,
  CraCollectifValidation,
} from '@app/web/cra/CraCollectifValidation'
import {
  materielOptions,
  niveauAtelierOptionsWithExtras,
  thematiqueOptionsWithExtras,
  typeLieuOptionsWithExtras,
} from '@app/web/cra/cra'
import { banDefaultValueToAdresseBanData } from '@app/web/external-apis/ban/banDefaultValueToAdresseBanData'
import { banMunicipalityLabel } from '@app/web/external-apis/ban/banMunicipalityLabel'
import type { LieuActiviteOption } from '@app/web/features/lieux-activite/getMediateursLieuxActiviteOptions'
import { trpc } from '@app/web/trpc'
import { applyZodValidationMutationErrorsToForm } from '@app/web/utils/applyZodValidationMutationErrorsToForm'
import { encodeSerializableState } from '@app/web/utils/encodeSerializableState'
import { replaceRouteWithoutRerender } from '@app/web/utils/replaceRouteWithoutRerender'
import Button from '@codegouvfr/react-dsfr/Button'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import React, { useCallback, useMemo } from 'react'
import { DefaultValues, useForm } from 'react-hook-form'
import styles from '../CraForm.module.css'

const CraCollectifForm = ({
  defaultValues,
  lieuActiviteOptions,
  initialBeneficiairesOptions,
  initialCommunesOptions,
  dureeOptions,
  retour,
}: {
  defaultValues: DefaultValues<CraCollectifData> & { mediateurId: string }
  lieuActiviteOptions: LieuActiviteOption[]
  initialCommunesOptions: AdressBanFormFieldOption[]
  initialBeneficiairesOptions: BeneficiaireOption[]
  dureeOptions: SelectOption[]
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

  const typeLieu = form.watch('typeLieu')
  const showLieuCommuneData = typeLieu === 'Autre' || typeLieu === 'Domicile'
  const showStructure = typeLieu === 'LieuActivite'

  const lieuActiviteRichOptions = useMemo(
    () => toLieuActiviteRichOptions(lieuActiviteOptions),
    [lieuActiviteOptions],
  )

  const {
    control,
    setError,
    handleSubmit,
    getValues,
    setValue,
    watch,
    formState: { isSubmitting, isSubmitSuccessful, errors },
  } = form

  const isLoading = isSubmitting || isSubmitSuccessful

  const onSubmit = async (data: CraCollectifData) => {
    if (isLoading) {
      return
    }
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

  useScrollToError({ errors })

  const lieuCommuneDataDefaultValue = defaultValues.lieuCommuneData
    ? {
        label: banMunicipalityLabel(defaultValues.lieuCommuneData),
        value: banDefaultValueToAdresseBanData(defaultValues.lieuCommuneData),
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
          className="fr-flex-basis-0 fr-flex-grow-1"
          classes={{
            label: 'fr-text--medium fr-mb-3v',
            input: 'fr-input--white fr-input--14v',
          }}
        />
        <div className="fr-flex-basis-0 fr-flex-grow-1">
          <CraDureeSubForm form={form} dureeOptions={dureeOptions} />
        </div>
      </div>
      <CraFormLabel required as="p" className="fr-mb-3v fr-mt-8v">
        Lieu de l’atelier
      </CraFormLabel>
      <RadioFormField
        control={control}
        path="typeLieu"
        disabled={isLoading}
        options={typeLieuOptionsWithExtras}
        components={{
          label: RichCardLabel,
          labelProps: {
            paddingRight: 16,
          },
        }}
        classes={{
          fieldsetElement: richCardFieldsetElementClassName,
          fieldset: craFormFieldsetClassname(styles.lieuFieldset),
          radioGroup: richCardRadioGroupClassName,
        }}
      />
      {showLieuCommuneData && (
        <AdresseBanFormField<CraCollectifData>
          label=" "
          control={control}
          path="lieuCommuneData"
          disabled={isLoading}
          placeholder="Rechercher une commune par son nom ou son code postal"
          searchOptions={{ type: 'municipality' }}
          defaultOptions={initialCommunesOptions}
          defaultValue={lieuCommuneDataDefaultValue}
        />
      )}
      {showStructure && (
        <CustomSelectFormField
          label=" "
          control={control}
          path="structureId"
          placeholder="Rechercher un lieu d’activité"
          defaultValue={lieuActiviteRichOptions.at(0)}
          options={lieuActiviteRichOptions}
          filterOption={lieuActiviteFilterOption}
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
        Thématique(s) d’accompagnement de médiation numérique <RedAsterisk />
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
