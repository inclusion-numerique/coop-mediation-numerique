'use client'

import type { SelectOption } from '@app/ui/components/Form/utils/options'
import { createToast } from '@app/ui/toast/createToast'
import {
  genreOptions,
  statutSocialOptions,
  trancheAgeOptions,
} from '@app/web/beneficiaire/beneficiaire'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import { BeneficiaireAnonymeFields } from '@app/web/features/activites/use-cases/cra/individuel/components/fields/BeneficiaireAnonymeFields'
import { BeneficiaireOption } from '@app/web/features/beneficiaires/BeneficiaireOption'
import type { LieuActiviteOption } from '@app/web/features/lieux-activite/getMediateursLieuxActiviteOptions'
import { handleSubmit } from '@app/web/libs/form/handle-submit'
import { useAppForm } from '@app/web/libs/form/use-app-form'
import { trpc } from '@app/web/trpc'
import { encodeSerializableState } from '@app/web/utils/encodeSerializableState'
import { replaceRouteWithoutRerender } from '@app/web/utils/replaceRouteWithoutRerender'
import { yesNoBooleanOptions } from '@app/web/utils/yesNoBooleanOptions'
import Button from '@codegouvfr/react-dsfr/Button'
import { useRouter } from 'next/navigation'
import React from 'react'
import { DefaultValues } from 'react-hook-form'
import { clearAdministrativeData } from '../../components/clearAdministrativeData'
import { materielOptions } from '../../fields/materiel'
import {
  thematiqueAdministrativesOptionsWithExtras,
  thematiqueNonAdministrativesOptionsWithExtras,
} from '../../fields/thematique'
import { autonomieOptionsWithExtras } from '../fields/autonomie'
import { structuresRedirectionOptions } from '../fields/structures-redirection'
import {
  CraIndividuelData,
  CraIndividuelValidation,
} from '../validation/CraIndividuelValidation'
import { AccompagnementFields } from './fields/AccompagnementFields'
import { BeneficiaireFields } from './fields/BeneficiaireFields'
import { RendezVousFields } from './fields/RendezVousFields'

/**
 * Initial options can come from the field data itself or be pre-populated by beneficiaire data
 */
// const lieuResidenceOptionsFromFormData = (
//   defaultValues: DefaultValues<CraIndividuelData>,
// ): AdressBanFormFieldOption[] => {
//   const result: AdressBanFormFieldOption[] = []
//   if (defaultValues.lieuCommuneData?.codeInsee) {
//     result.push({
//       label: banMunicipalityLabel(defaultValues.lieuCommuneData),
//       value: banDefaultValueToAdresseBanData(defaultValues.lieuCommuneData),
//     })
//   }
//
//   // Do not duplicate option
//   if (
//     !defaultValues.beneficiaire?.communeResidence?.codeInsee ||
//     defaultValues.beneficiaire?.communeResidence?.codeInsee ===
//       defaultValues.lieuCommuneData?.codeInsee
//   ) {
//     return result
//   }
//
//   result.push({
//     label: banMunicipalityLabel(defaultValues.beneficiaire.communeResidence),
//     value: banDefaultValueToAdresseBanData(
//       defaultValues.beneficiaire.communeResidence,
//     ),
//   })
//
//   return result
// }

const CraIndividuelForm = ({
  defaultValues,
  lieuActiviteOptions,
  initialBeneficiairesOptions,
  retour,
  dureeOptions,
}: {
  defaultValues: DefaultValues<CraIndividuelData> & { mediateurId: string }
  lieuActiviteOptions: LieuActiviteOption[]
  initialBeneficiairesOptions: BeneficiaireOption[]
  retour?: string
  dureeOptions: SelectOption[]
}) => {
  const mutation = trpc.cra.individuel.useMutation()

  const router = useRouter()

  const isPending = mutation.isPending

  // useWatchSubscription(
  //   watch,
  //   useCallback((data, { name }) => {
  //     // When changing the beneficiaire
  //     // we populate the initial options for the lieu of the CRA
  //     // and set the value
  //     if (
  //       name === 'beneficiaire' &&
  //       data.beneficiaire?.communeResidence?.codeInsee
  //     ) {
  //     }
  //
  //     // When changing the lieu of the CRA for a Domicile CRA
  //     // we populate the initial options for the commune of the beneficiaire
  //     // and set the value
  //     if (
  //       (name === 'lieuCommuneData' || name === 'typeLieu') &&
  //       data.typeLieu === 'Domicile' &&
  //       data.lieuCommuneData
  //     ) {
  //     }
  //   }, []),
  // )

  const form = useAppForm({
    validators: {
      onChange: CraIndividuelValidation,
    },
    defaultValues,
    listeners: {
      onChange: ({ formApi }) => {
        replaceRouteWithoutRerender(
          `/coop/mes-activites/cra/individuel?v=${encodeSerializableState(
            formApi.state.values,
          )}`,
        )
      },
    },
    onSubmit: async (data) => {
      if (isPending) return

      try {
        await mutation.mutateAsync(clearAdministrativeData(data.value))
        createToast({
          priority: 'success',
          message: 'L’accompagnement individuel a bien été enregistré.',
        })
        router.push(retour ?? '/coop/mes-activites')
        router.refresh()
      } catch (mutationError) {
        // form.setErrorMap([]) // todo: set mutation errors to form
        // if (applyZodValidationMutationErrorsToForm(mutationError, setError)) {
        //   return
        // }
        createToast({
          priority: 'error',
          message:
            'Une erreur est survenue lors de l’enregistrement, veuillez réessayer ultérieurement.',
        })
        throw mutationError
      }
    },
  })

  return (
    <form.AppForm>
      <form onSubmit={handleSubmit(form)}>
        <BeneficiaireFields
          form={form}
          isPending={isPending}
          creerBeneficiaireRetourUrl="/coop/mes-activites/cra/individuel"
          initialBeneficiairesOptions={initialBeneficiairesOptions}
        />
        <RendezVousFields
          form={form}
          isPending={isPending}
          dureeOptions={dureeOptions}
          lieuActiviteOptions={lieuActiviteOptions}
        />
        <hr className="fr-separator-12v" />
        <AccompagnementFields
          form={form}
          isPending={isPending}
          materielOptions={materielOptions}
          thematiqueAdministrativesOptionsWithExtras={
            thematiqueAdministrativesOptionsWithExtras
          }
          thematiqueNonAdministrativesOptionsWithExtras={
            thematiqueNonAdministrativesOptionsWithExtras
          }
          autonomieOptionsWithExtras={autonomieOptionsWithExtras}
          yesNoBooleanOptions={yesNoBooleanOptions}
          structuresRedirectionOptions={structuresRedirectionOptions}
        />
        <form.AppField name="beneficiaire">
          {(field) =>
            field.state.value?.id == null && (
              <>
                <hr className="fr-separator-12v" />
                <BeneficiaireAnonymeFields
                  form={form}
                  isPending={isPending}
                  genreOptions={genreOptions}
                  trancheAgeOptions={trancheAgeOptions}
                  statutSocialOptions={statutSocialOptions}
                />
              </>
            )
          }
        </form.AppField>
        <form.AppField name="notes">
          {(field) => (
            <field.RichTextarea
              label="Notes sur l’accompagnement"
              hint={
                <>
                  Il est interdit de stocker des informations sensibles (données
                  de santé, mots de passe, etc).
                  <br />
                  Vous retrouverez ces notes dans votre historique d’activités
                  ainsi que dans l’historique du bénéficiaire.
                </>
              }
              isPending={isPending}
              className="fr-mt-12v"
            />
          )}
        </form.AppField>
        <div className="fr-btns-group fr-mt-12v fr-mb-30v">
          <form.Submit isPending={isPending}>
            Enregistrer l’activité
          </form.Submit>
          <Button priority="secondary" linkProps={{ href: retour ?? '/coop' }}>
            Annuler
          </Button>
        </div>
      </form>
    </form.AppForm>
  )
}

export default withTrpc(CraIndividuelForm)
