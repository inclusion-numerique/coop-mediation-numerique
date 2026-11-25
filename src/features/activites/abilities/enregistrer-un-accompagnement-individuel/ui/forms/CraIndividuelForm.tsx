'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import { useSelector } from '@tanstack/react-form'
import { useRouter } from 'next/navigation'
import { ENREGISTRER_UN_ACCOMPAGNEMENT_INDIVIDUEL_ACTION_KEY } from '@/features/activites/abilities/enregistrer-un-accompagnement-individuel/action/enregistrer-un-accompagnement-individuel.key'
import {
  CraIndividuelData,
  CraIndividuelValidation,
} from '@/features/activites/abilities/enregistrer-un-accompagnement-individuel/ui/forms/cra-individuel.validation'
import { AutonomieBeneficiaireField } from '@/features/activites/abilities/enregistrer-un-accompagnement-individuel/ui/forms/fields/AutonomieBeneficiaireField'
import { BeneficiaireAnonymeFields } from '@/features/activites/abilities/enregistrer-un-accompagnement-individuel/ui/forms/fields/BeneficiaireAnonymeFields'
import {
  BeneficiaireFields,
  estAnonyme,
} from '@/features/activites/abilities/enregistrer-un-accompagnement-individuel/ui/forms/fields/BeneficiaireFields'
import { OrientationFields } from '@/features/activites/abilities/enregistrer-un-accompagnement-individuel/ui/forms/fields/OrientationFields'
import { saisieDeLAccompagnementIndividuel } from '@/features/activites/abilities/enregistrer-un-accompagnement-individuel/ui/presenters/saisie-du-formulaire.presenter'
import type { CommuneDuCra } from '@/features/activites/ui/forms/commune-du-cra.validation'
import { MaterielField } from '@/features/activites/ui/forms/saisie/MaterielField'
import { RendezVousFields } from '@/features/activites/ui/forms/saisie/RendezVousFields'
import { TagsFields } from '@/features/activites/ui/forms/saisie/TagsFields'
import { ThematiquesFields } from '@/features/activites/ui/forms/saisie/ThematiquesFields'
import { autonomieOptionsWithExtras } from '@/features/activites/ui/labels/libelles/autonomie.labels'
import { materielOptions } from '@/features/activites/ui/labels/libelles/materiel.labels'
import {
  genreOptions,
  statutSocialOptions,
  trancheAgeOptions,
} from '@/features/activites/ui/labels/libelles/profil.labels'
import { structuresRedirectionOptions } from '@/features/activites/ui/labels/libelles/structures-redirection.labels'
import {
  thematiqueAdministrativesOptionsWithExtras,
  thematiqueNonAdministrativesOptionsWithExtras,
} from '@/features/activites/ui/labels/libelles/thematique.labels'
import type { BeneficiaireDuCra } from '@/features/activites/ui/presenters/saisie/beneficiaire-du-cra.presenter'
import { cheminDeLaSaisie } from '@/features/activites/ui/presenters/saisie/chemin-de-la-copie.presenter'
import type { LieuDuCra } from '@/features/activites/ui/presenters/saisie/lieu-du-cra.presenter'
import type { Tag } from '@/features/activites/ui/presenters/saisie/tag-du-cra.presenter'
import { cheminInterne } from '@/libraries/chemin-interne'
import { handleSubmit } from '@/libraries/formulaire'
import type { DefaultValues } from '@/libraries/formulaire/hooks'
import { useAppForm } from '@/libraries/formulaire/hooks'
import { replaceRouteWithoutRerender } from '@/libraries/navigateur'
import { adresseAvec } from '@/libraries/nextjs'
import { inject } from '@/libraries/nextjs/injection'
import type { SelectOption } from '@/libraries/ui'
import { yesNoBooleanOptions } from '@/libraries/ui'
import { createToast } from '@/libraries/ui/toast'

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
  retour?: string | undefined
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
          cheminDeLaSaisie('individuel', formApi.state.values),
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
      router.push(cheminInterne(retour, '/coop/mes-activites'))
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
            estAnonyme(field) && (
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
