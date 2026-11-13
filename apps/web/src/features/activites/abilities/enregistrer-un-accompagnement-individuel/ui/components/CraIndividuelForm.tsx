'use client'

import type { SelectOption } from '@app/ui/components/Form/utils/options'
import { createToast } from '@app/ui/toast/createToast'
import { ENREGISTRER_UN_ACCOMPAGNEMENT_INDIVIDUEL_ACTION_KEY } from '@app/web/features/activites/abilities/enregistrer-un-accompagnement-individuel/action/enregistrer-un-accompagnement-individuel.key'
import { AutonomieBeneficiaireField } from '@app/web/features/activites/abilities/enregistrer-un-accompagnement-individuel/ui/components/fields/AutonomieBeneficiaireField'
import { BeneficiaireAnonymeFields } from '@app/web/features/activites/abilities/enregistrer-un-accompagnement-individuel/ui/components/fields/BeneficiaireAnonymeFields'
import {
  BeneficiaireFields,
  isAnonyme,
} from '@app/web/features/activites/abilities/enregistrer-un-accompagnement-individuel/ui/components/fields/BeneficiaireFields'
import { OrientationFields } from '@app/web/features/activites/abilities/enregistrer-un-accompagnement-individuel/ui/components/fields/OrientationFields'
import { saisieDeLAccompagnementIndividuel } from '@app/web/features/activites/abilities/enregistrer-un-accompagnement-individuel/ui/saisie-du-formulaire.presenter'
import {
  CraIndividuelData,
  CraIndividuelValidation,
} from '@app/web/features/activites/abilities/enregistrer-un-accompagnement-individuel/ui/validation/CraIndividuelValidation'
import { autonomieOptionsWithExtras } from '@app/web/features/activites/ui/libelles/autonomie'
import { materielOptions } from '@app/web/features/activites/ui/libelles/materiel'
import {
  genreOptions,
  statutSocialOptions,
  trancheAgeOptions,
} from '@app/web/features/activites/ui/libelles/profil'
import { structuresRedirectionOptions } from '@app/web/features/activites/ui/libelles/structures-redirection'
import {
  thematiqueAdministrativesOptionsWithExtras,
  thematiqueNonAdministrativesOptionsWithExtras,
} from '@app/web/features/activites/ui/libelles/thematique'
import type { BeneficiaireDuCra } from '@app/web/features/activites/ui/saisie/beneficiaire/beneficiaire-du-cra'
import type { CommuneDuCra } from '@app/web/features/activites/ui/saisie/commune/commune-du-cra'
import { MaterielField } from '@app/web/features/activites/ui/saisie/fields/MaterielField'
import { RendezVousFields } from '@app/web/features/activites/ui/saisie/fields/RendezVousFields'
import { TagsFields } from '@app/web/features/activites/ui/saisie/fields/TagsFields'
import { ThematiquesFields } from '@app/web/features/activites/ui/saisie/fields/ThematiquesFields'
import type { LieuDuCra } from '@app/web/features/activites/ui/saisie/lieu/lieu-du-cra'
import type { Tag } from '@app/web/features/activites/ui/saisie/tags/tag-du-cra'
import { adresseAvec } from '@app/web/libraries/parametres-d-url'
import { handleSubmit } from '@app/web/libs/form/handle-submit'
import type { DefaultValues } from '@app/web/libs/form/use-app-form'
import { useAppForm } from '@app/web/libs/form/use-app-form'
import { inject } from '@app/web/libs/injection/client'
import { encodeSerializableState } from '@app/web/utils/encodeSerializableState'
import { replaceRouteWithoutRerender } from '@app/web/utils/replaceRouteWithoutRerender'
import { yesNoBooleanOptions } from '@app/web/utils/yesNoBooleanOptions'
import Button from '@codegouvfr/react-dsfr/Button'
import { useSelector } from '@tanstack/react-form'
import { useRouter } from 'next/navigation'

const CraIndividuelForm = ({
  defaultValues,
  lieuxProposes,
  beneficiairesProposes,
  initialTagsOptions,
  retour,
  dureeOptions,
}: {
  defaultValues: DefaultValues<CraIndividuelData> & { mediateurId: string }
  lieuxProposes: readonly LieuDuCra[]
  beneficiairesProposes: readonly BeneficiaireDuCra[]
  initialTagsOptions: Tag[]
  retour?: string
  dureeOptions: SelectOption[]
}) => {
  const router = useRouter()

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
    onSubmit: async ({ value }) => {
      const resultat = await inject(
        ENREGISTRER_UN_ACCOMPAGNEMENT_INDIVIDUEL_ACTION_KEY,
      )(saisieDeLAccompagnementIndividuel(CraIndividuelValidation.parse(value)))
      if (!resultat.success) {
        createToast({ priority: 'error', message: resultat.error })
        return
      }
      createToast({
        priority: 'success',
        message: 'L’accompagnement individuel a bien été enregistré.',
      })
      router.push(retour ?? '/coop/mes-activites')
      router.refresh()
    },
  })

  const syncWithCommuneResidenceBeneficiaire = (item: CommuneDuCra) => {
    const communeResidence = form.getFieldValue('beneficiaire.communeResidence')
    const typeLieu = form.getFieldValue('typeLieu')
    if (communeResidence?.id != null || typeLieu !== 'Domicile') return
    form.setFieldValue('beneficiaire.communeResidence', item)
  }

  const syncLieuCommuneDataWithBeneficiaire = () => {
    const lieuCommuneData = form.getFieldValue('lieuCommuneData')
    if (lieuCommuneData?.id != null) return
    const communeResidence = form.getFieldValue('beneficiaire.communeResidence')
    if (communeResidence?.id == null) return
    form.setFieldValue('lieuCommuneData', communeResidence)
  }

  const onSelectBeneficiaire = (beneficiaire: BeneficiaireDuCra) => {
    const typeLieu = form.getFieldValue('typeLieu')
    if (typeLieu !== 'Domicile') return
    const lieuCommuneData = form.getFieldValue('lieuCommuneData')
    if (lieuCommuneData?.id != null) return
    if (beneficiaire.communeResidence == null) return
    form.setFieldValue('lieuCommuneData', beneficiaire.communeResidence)
  }

  const isPending = useSelector(form.store, (state) => state.isSubmitting)

  return (
    <form.AppForm>
      <form noValidate onSubmit={handleSubmit(form)}>
        <BeneficiaireFields
          form={form}
          isPending={isPending}
          creerBeneficiaireRetourUrl={adresseAvec(
            '/coop/mes-activites/cra/individuel',
            {
              retour,
            },
          )}
          beneficiairesProposes={beneficiairesProposes}
          onSelectBeneficiaire={onSelectBeneficiaire}
        />
        <RendezVousFields
          form={form}
          fields={{
            date: 'date',
            duree: 'duree',
            typeLieu: 'typeLieu',
            structure: 'structure',
            lieuCommuneData: 'lieuCommuneData',
          }}
          isPending={isPending}
          dureeOptions={dureeOptions}
          lieuxProposes={lieuxProposes}
          onSelectLieuCommuneData={syncWithCommuneResidenceBeneficiaire}
          onSelectTypeLieuDomicile={syncLieuCommuneDataWithBeneficiaire}
        />
        <hr className="fr-separator-12v" />
        <MaterielField
          form={form}
          fields={{ materiel: 'materiel' }}
          isPending={isPending}
          materielOptions={materielOptions}
        />
        <ThematiquesFields
          form={form}
          fields={{
            thematiques: 'thematiques',
            precisionsDemarche: 'precisionsDemarche',
          }}
          isPending={isPending}
          thematiqueAdministrativesOptionsWithExtras={
            thematiqueAdministrativesOptionsWithExtras
          }
          thematiqueNonAdministrativesOptionsWithExtras={
            thematiqueNonAdministrativesOptionsWithExtras
          }
        />
        <TagsFields
          form={form}
          fields={{ tags: 'tags' }}
          isPending={isPending}
          initialTagsOptions={initialTagsOptions}
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

export default CraIndividuelForm
