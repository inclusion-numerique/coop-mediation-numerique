'use client'

import type { SelectOption } from '@app/ui/components/Form/utils/options'
import { createToast } from '@app/ui/toast/createToast'
import { ENREGISTRER_UN_ATELIER_COLLECTIF_ACTION_KEY } from '@app/web/features/activites/abilities/enregistrer-un-atelier-collectif/action/enregistrer-un-atelier-collectif.key'
import { BeneficiairesAtelierFields } from '@app/web/features/activites/abilities/enregistrer-un-atelier-collectif/ui/components/fields/BeneficiairesAtelierFields'
import { NiveauAtelierField } from '@app/web/features/activites/abilities/enregistrer-un-atelier-collectif/ui/components/fields/NiveauAtelierField'
import { saisieDeLAtelierCollectif } from '@app/web/features/activites/abilities/enregistrer-un-atelier-collectif/ui/saisie-du-formulaire.presenter'
import {
  type CraCollectifData,
  CraCollectifValidation,
} from '@app/web/features/activites/abilities/enregistrer-un-atelier-collectif/ui/validation/CraCollectifValidation'
import { materielOptions } from '@app/web/features/activites/ui/libelles/materiel'
import { niveauAtelierOptionsWithExtras } from '@app/web/features/activites/ui/libelles/niveau-atelier'
import {
  thematiqueAdministrativesOptionsWithExtras,
  thematiqueNonAdministrativesOptionsWithExtras,
} from '@app/web/features/activites/ui/libelles/thematique'
import { MaterielField } from '@app/web/features/activites/ui/saisie/fields/MaterielField'
import { RendezVousFields } from '@app/web/features/activites/ui/saisie/fields/RendezVousFields'
import { TagsFields } from '@app/web/features/activites/ui/saisie/fields/TagsFields'
import { ThematiquesFields } from '@app/web/features/activites/ui/saisie/fields/ThematiquesFields'
import type { Tag } from '@app/web/features/activites/ui/saisie/tags/tag-du-cra'
import type { BeneficiaireOption } from '@app/web/features/beneficiaire/abilities/rechercher-beneficiaires/ui/beneficiaire-option'
import type { LieuActiviteOption } from '@app/web/features/lieux-activite'
import { handleSubmit } from '@app/web/libs/form/handle-submit'
import { useAppForm } from '@app/web/libs/form/use-app-form'
import { inject } from '@app/web/libs/injection/client'
import { encodeSerializableState } from '@app/web/utils/encodeSerializableState'
import { replaceRouteWithoutRerender } from '@app/web/utils/replaceRouteWithoutRerender'
import Button from '@codegouvfr/react-dsfr/Button'
import { useSelector } from '@tanstack/react-form'
import { useRouter } from 'next/navigation'
import { type DefaultValues } from 'react-hook-form'

const CraCollectifForm = ({
  defaultValues,
  lieuActiviteOptions,
  initialBeneficiairesOptions,
  initialTagsOptions,
  dureeOptions,
  retour,
}: {
  defaultValues: DefaultValues<CraCollectifData>
  lieuActiviteOptions: LieuActiviteOption[]
  initialBeneficiairesOptions: BeneficiaireOption[]
  initialTagsOptions: Tag[]
  dureeOptions: SelectOption[]
  retour?: string
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
          `/coop/mes-activites/cra/collectif?v=${encodeSerializableState(
            formApi.state.values,
          )}`,
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
      router.push(retour ?? '/coop/mes-activites')
      router.refresh()
    },
  })

  const isPending = useSelector(form.store, (state) => state.isSubmitting)

  return (
    <form.AppForm>
      <form onSubmit={handleSubmit(form)}>
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
          creerBeneficiaireRetourUrl="/coop/mes-activites/cra/collectif"
          initialBeneficiairesOptions={initialBeneficiairesOptions}
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
          lieuActiviteOptions={lieuActiviteOptions}
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
