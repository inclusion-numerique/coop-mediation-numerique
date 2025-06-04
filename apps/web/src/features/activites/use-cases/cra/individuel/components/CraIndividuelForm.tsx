'use client'

import type { SelectOption } from '@app/ui/components/Form/utils/options'
import { createToast } from '@app/ui/toast/createToast'
import {
  genreOptions,
  statutSocialOptions,
  trancheAgeOptions,
} from '@app/web/beneficiaire/beneficiaire'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import { Commune } from '@app/web/features/adresse/combo-box/CommuneComboBox'
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
import { MaterielField } from '../../components/fields/MaterielField'
import { RendezVousFields } from '../../components/fields/RendezVousFields'
import { ThematiquesFields } from '../../components/fields/ThematiquesFields'
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
import { AutonomieBeneficiaireField } from './fields/AutonomieBeneficiaireField'
import { BeneficiaireAnonymeFields } from './fields/BeneficiaireAnonymeFields'
import { BeneficiaireFields, isAnonyme } from './fields/BeneficiaireFields'
import { OrientationFields } from './fields/OrientationFields'

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
  const router = useRouter()

  const mutation = trpc.cra.individuel.useMutation()
  const isPending = mutation.isPending

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
        await mutation.mutateAsync(
          clearAdministrativeData(data.value as CraIndividuelData),
        )
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

  const syncWithCommuneResidenceBeneficiaire = (item: Commune) => {
    const communeResidence = form.getFieldValue('beneficiaire.communeResidence')
    const typeLieu = form.getFieldValue('typeLieu')
    if (communeResidence?.id != null || typeLieu !== 'Domicile') return
    form.setFieldValue('beneficiaire.communeResidence', item)
  }

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
          form={form as any}
          isPending={isPending}
          dureeOptions={dureeOptions}
          lieuActiviteOptions={lieuActiviteOptions}
          onSelectLieuCommuneData={syncWithCommuneResidenceBeneficiaire}
        />
        <hr className="fr-separator-12v" />
        <MaterielField
          form={form as any}
          isPending={isPending}
          materielOptions={materielOptions}
        />
        <ThematiquesFields
          form={form as any}
          isPending={isPending}
          thematiqueAdministrativesOptionsWithExtras={
            thematiqueAdministrativesOptionsWithExtras
          }
          thematiqueNonAdministrativesOptionsWithExtras={
            thematiqueNonAdministrativesOptionsWithExtras
          }
        />
        <hr className="fr-separator-12v" />
        <AutonomieBeneficiaireField
          form={form}
          isPending={isPending}
          autonomieOptionsWithExtras={autonomieOptionsWithExtras}
        />
        <OrientationFields
          form={form}
          isPending={isPending}
          yesNoBooleanOptions={yesNoBooleanOptions}
          structuresRedirectionOptions={structuresRedirectionOptions}
        />
        <form.AppField name="beneficiaire">
          {(field) =>
            isAnonyme(field) && (
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
