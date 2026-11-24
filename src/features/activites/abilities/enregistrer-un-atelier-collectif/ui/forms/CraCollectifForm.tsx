'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import { useSelector } from '@tanstack/react-form'
import { useRouter } from 'next/navigation'
import { ENREGISTRER_UN_ATELIER_COLLECTIF_ACTION_KEY } from '@/features/activites/abilities/enregistrer-un-atelier-collectif/action/enregistrer-un-atelier-collectif.key'
import { BeneficiairesAtelierFields } from '@/features/activites/abilities/enregistrer-un-atelier-collectif/ui/forms/BeneficiairesAtelierFields'
import {
  type CraCollectifData,
  CraCollectifValidation,
} from '@/features/activites/abilities/enregistrer-un-atelier-collectif/ui/forms/cra-collectif.validation'
import { NiveauAtelierField } from '@/features/activites/abilities/enregistrer-un-atelier-collectif/ui/forms/NiveauAtelierField'
import { saisieDeLAtelierCollectif } from '@/features/activites/abilities/enregistrer-un-atelier-collectif/ui/presenters/saisie-du-formulaire.presenter'
import { MaterielField } from '@/features/activites/ui/forms/saisie/MaterielField'
import { RendezVousFields } from '@/features/activites/ui/forms/saisie/RendezVousFields'
import { TagsFields } from '@/features/activites/ui/forms/saisie/TagsFields'
import { ThematiquesFields } from '@/features/activites/ui/forms/saisie/ThematiquesFields'
import { materielOptions } from '@/features/activites/ui/labels/libelles/materiel.labels'
import { niveauAtelierOptionsWithExtras } from '@/features/activites/ui/labels/libelles/niveau-atelier.labels'
import {
  thematiqueAdministrativesOptionsWithExtras,
  thematiqueNonAdministrativesOptionsWithExtras,
} from '@/features/activites/ui/labels/libelles/thematique.labels'
import type { BeneficiaireDuCra } from '@/features/activites/ui/presenters/saisie/beneficiaire-du-cra.presenter'
import { cheminDeLaSaisie } from '@/features/activites/ui/presenters/saisie/chemin-de-la-copie.presenter'
import type { LieuDuCra } from '@/features/activites/ui/presenters/saisie/lieu-du-cra.presenter'
import type { Tag } from '@/features/activites/ui/presenters/saisie/tag-du-cra.presenter'
import { cheminInterne } from '@/libraries/chemin-interne'
import { handleSubmit } from '@/libraries/formulaire/handle-submit'
import type { DefaultValues } from '@/libraries/formulaire/use-app-form'
import { useAppForm } from '@/libraries/formulaire/use-app-form'
import { replaceRouteWithoutRerender } from '@/libraries/navigateur/replace-route-without-rerender'
import { inject } from '@/libraries/nextjs/injection/client'
import { adresseAvec } from '@/libraries/nextjs/route/adresse-avec'
import type { SelectOption } from '@/libraries/ui/components/form/utils/options'
import { createToast } from '@/libraries/ui/toast/create-toast'

const CraCollectifForm = ({
  defaultValues,
  lieuxProposes,
  beneficiairesProposes,
  initialTagsOptions,
  dureeOptions,
  retour,
}: {
  defaultValues: DefaultValues<CraCollectifData>
  lieuxProposes: readonly LieuDuCra[]
  beneficiairesProposes: readonly BeneficiaireDuCra[]
  initialTagsOptions: Tag[]
  dureeOptions: SelectOption[]
  retour?: string | undefined
}) => {
  const router = useRouter()

  const form = useAppForm({
    validators: {
      onChange: CraCollectifValidation,
    },
    defaultValues,
    listeners: {
      onChange: ({ formApi }) => {
        replaceRouteWithoutRerender(
          cheminDeLaSaisie('collectif', formApi.state.values),
        )
      },
    },
    onSubmit: async ({ value }) => {
      const resultat = await inject(
        ENREGISTRER_UN_ATELIER_COLLECTIF_ACTION_KEY,
      )(saisieDeLAtelierCollectif(CraCollectifValidation.parse(value)))
      if (!resultat.success) {
        createToast({ priority: 'error', message: resultat.error })
        return
      }
      createToast({
        priority: 'success',
        message: 'L’atelier collectif a bien été enregistré.',
      })
      router.push(cheminInterne(retour, '/coop/mes-activites'))
      router.refresh()
    },
  })

  const isPending = useSelector(form.store, (state) => state.isSubmitting)

  return (
    <form.AppForm>
      <form noValidate onSubmit={handleSubmit(form)}>
        <form.AppField name="titreAtelier">
          {(field) => (
            <field.Input
              label="Titre de l’atelier"
              hintText="Renseignez le titre de votre atelier (sujet, thématique) afin de le retrouver plus facilement dans vos activités."
              isPending={isPending}
            />
          )}
        </form.AppField>
        <BeneficiairesAtelierFields
          form={form}
          isPending={isPending}
          creerBeneficiaireRetourUrl={adresseAvec(
            '/coop/mes-activites/cra/collectif',
            {
              retour,
            },
          )}
          beneficiairesProposes={beneficiairesProposes}
        />
        <hr className="fr-separator-12v" />
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
        <NiveauAtelierField
          form={form}
          isPending={isPending}
          niveauAtelierOptionsWithExtras={niveauAtelierOptionsWithExtras}
        />
        <form.AppField name="notes">
          {(field) => (
            <field.RichTextarea
              label="Notes sur l’atelier"
              hint={
                <>
                  Il est interdit de stocker des informations sensibles (données
                  de santé, mots de passe, etc).
                  <br />
                  Vous retrouverez ces notes dans votre historique d’activités
                  ainsi que dans l’historique des bénéficiaires qui ont
                  participé.
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

export default CraCollectifForm
