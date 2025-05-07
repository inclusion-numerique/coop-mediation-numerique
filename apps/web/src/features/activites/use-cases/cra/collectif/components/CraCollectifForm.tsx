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
import AdresseBanFormField, {
  type AdressBanFormFieldOption,
} from '@app/web/components/form/AdresseBanFormField'
import RichCardLabel, {
  richCardFieldsetElementClassName,
  richCardRadioGroupClassName,
} from '@app/web/components/form/RichCardLabel'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import { banDefaultValueToAdresseBanData } from '@app/web/external-apis/ban/banDefaultValueToAdresseBanData'
import { banMunicipalityLabel } from '@app/web/external-apis/ban/banMunicipalityLabel'
import { BeneficiaireOption } from '@app/web/features/beneficiaires/BeneficiaireOption'
import type { LieuActiviteOption } from '@app/web/features/lieux-activite/getMediateursLieuxActiviteOptions'
import { trpc } from '@app/web/trpc'
import { applyZodValidationMutationErrorsToForm } from '@app/web/utils/applyZodValidationMutationErrorsToForm'
import { encodeSerializableState } from '@app/web/utils/encodeSerializableState'
import { replaceRouteWithoutRerender } from '@app/web/utils/replaceRouteWithoutRerender'
import Button from '@codegouvfr/react-dsfr/Button'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import React, { useCallback, useMemo } from 'react'
import { type DefaultValues, useForm } from 'react-hook-form'
import CraDureeSubForm from '../../components/CraDureeSubForm'
import styles from '../../components/CraForm.module.css'
import CraFormLabel from '../../components/CraFormLabel'
import { clearAdministrativeData } from '../../components/clearAdministrativeData'
import { craFormFieldsetClassname } from '../../components/craFormFieldsetClassname'
import {
  lieuActiviteFilterOption,
  toLieuActiviteRichOptions,
} from '../../components/lieuActiviteOptions'
import { materielOptions } from '../../fields/materiel'
import {
  thematiqueAdministrativesOptionsWithExtras,
  thematiqueNonAdministrativesOptionsWithExtras,
} from '../../fields/thematique'
import { typeLieuOptionsWithExtras } from '../../fields/type-lieu'
import { niveauAtelierOptionsWithExtras } from '../fields/niveau-atelier'
import {
  type CraCollectifData,
  CraCollectifValidation,
} from '../validation/CraCollectifValidation'
import CraBeneficiairesMultiplesForm from './CraBeneficiairesMultiplesForm'

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

  const thematiques = form.watch('thematiques')
  const showThematiquesAdministratives = thematiques?.includes(
    'AideAuxDemarchesAdministratives',
  )

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
      await mutation.mutateAsync(clearAdministrativeData(data))
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
          `/coop/mes-activites/cra/collectif?v=${encodeSerializableState(
            data,
          )}`,
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
        options={thematiqueNonAdministrativesOptionsWithExtras}
        disabled={isLoading}
        components={{
          label: RichCardLabel,
        }}
        classes={{
          fieldsetElement: richCardFieldsetElementClassName,
          fieldset: craFormFieldsetClassname(styles.thematiquesFieldset),
        }}
      />
      {showThematiquesAdministratives && (
        <>
          <p className="fr-text--medium fr-mb-4v fr-mt-12v">
            Thématique(s) de la démarche administrative
          </p>
          <CheckboxGroupFormField
            control={control}
            path="thematiques"
            options={thematiqueAdministrativesOptionsWithExtras}
            disabled={isLoading}
            offset={thematiqueNonAdministrativesOptionsWithExtras.length}
            components={{
              label: RichCardLabel,
            }}
            classes={{
              fieldsetElement: richCardFieldsetElementClassName,
              fieldset: craFormFieldsetClassname(
                styles.thematiquesAdministrativesFieldset,
              ),
            }}
          />
          <InputFormField
            control={control}
            disabled={isLoading}
            path="precisionsDemarche"
            label="Préciser le nom de la démarche administrative réalisée"
            className="fr-flex-grow-1 fr-mt-12v"
            classes={{ label: 'fr-text--medium fr-mb-3v' }}
          />
        </>
      )}
      <hr className="fr-separator-12v" />
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
          fieldset: craFormFieldsetClassname(styles.autonomieFieldset),
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
