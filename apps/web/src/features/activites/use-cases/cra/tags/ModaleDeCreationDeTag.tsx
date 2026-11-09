'use client'

import RedAsterisk from '@app/ui/components/Form/RedAsterisk'
import { createDynamicModal } from '@app/ui/components/Modal/createDynamicModal'
import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import { handleSubmit } from '@app/web/libs/form/handle-submit'
import { useAppForm } from '@app/web/libs/form/use-app-form'
import { inject } from '@app/web/libs/injection/client'
import { useStore } from '@tanstack/react-form'
import { type ReactNode, useEffect } from 'react'
import { z } from 'zod'
import { CREER_UN_TAG_DU_CRA_KEY } from './creer-un-tag.key'
import {
  type Tag,
  tagDuFormulaire,
  type VisibiliteDuTagDuCra,
} from './tag-du-cra'

const NOM_LONGUEUR_MAX = 80
const DESCRIPTION_LONGUEUR_MAX = 280

const CreationDeTagValidation = z.object({
  nom: z
    .string()
    .trim()
    .min(3, 'Le nom du tag doit faire plus de 3 caractères')
    .max(
      NOM_LONGUEUR_MAX,
      `Le nom du tag doit faire moins de ${NOM_LONGUEUR_MAX} caractères`,
    ),
  description: z
    .string()
    .max(
      DESCRIPTION_LONGUEUR_MAX,
      `La description du tag doit faire moins de ${DESCRIPTION_LONGUEUR_MAX} caractères`,
    )
    .nullable(),
  visibilite: z.discriminatedUnion('_tag', [
    z.object({ _tag: z.literal('Personnel') }),
    z.object({ _tag: z.literal('Equipe'), coordinateurId: z.guid() }),
    z.object({ _tag: z.literal('Departemental') }),
  ]),
})

export const CreationDeTagDuCra = createDynamicModal<{
  nom: string
  quandCree: ((tag: Tag) => void) | null
}>({
  id: 'cra-save-tag-modal',
  isOpenedByDefault: false,
  initialState: { nom: '', quandCree: null },
})

const APPARENCE: Record<
  VisibiliteDuTagDuCra['_tag'],
  { libelle: string; aide: string; illustration: ReactNode }
> = {
  Personnel: {
    libelle: 'Tag personnel',
    aide: 'Visible uniquement par vous.',
    illustration: (
      <span
        className="ri-account-circle-line ri-xl fr-line-height-1 fr-text-mention--grey fr-background-contrast--grey fr-p-2w fr-my-2w fr-border-radius--8"
        aria-hidden="true"
      />
    ),
  },
  Equipe: {
    libelle: "Tag d'équipe",
    aide: 'Visible et éditable par les membres de cette équipe.',
    illustration: (
      <span
        className="ri-group-2-line ri-xl fr-line-height-1 fr-text-title--brown-caramel-sun-425 fr-background-alt--brown-caramel-950 fr-p-2w fr-my-2w fr-border-radius--8"
        aria-hidden="true"
      />
    ),
  },
  Departemental: {
    libelle: 'Tag départemental',
    aide: "Visible par l'ensemble des médiateurs numériques du département.",
    illustration: (
      <span
        className="ri-map-pin-range-line ri-xl fr-line-height-1 fr-text-default--info fr-background-contrast--info fr-p-2w fr-my-2w fr-border-radius--8"
        aria-hidden="true"
      />
    ),
  },
}

const cleDeLaVisibilite = (
  visibilite:
    | { readonly _tag: 'Personnel' | 'Departemental' }
    | { readonly _tag: 'Equipe'; readonly coordinateurId: string },
): string =>
  visibilite._tag === 'Equipe'
    ? `Equipe:${visibilite.coordinateurId}`
    : visibilite._tag

const libelleDeLaVisibilite = (visibilite: VisibiliteDuTagDuCra) =>
  visibilite._tag === 'Equipe' && visibilite.numero !== null ? (
    <>
      {APPARENCE.Equipe.libelle} {visibilite.numero}{' '}
      <span className="fr-text--sm fr-text-mention--grey">
        (Coordonnée par {visibilite.coordonneePar})
      </span>
    </>
  ) : (
    APPARENCE[visibilite._tag].libelle
  )

const visibiliteChoisie = (visibilite: VisibiliteDuTagDuCra) =>
  visibilite._tag === 'Equipe'
    ? { _tag: visibilite._tag, coordinateurId: visibilite.coordinateurId }
    : { _tag: visibilite._tag }

export const ModaleDeCreationDeTag = ({
  visibilites,
}: {
  visibilites: readonly VisibiliteDuTagDuCra[]
}) => {
  const { nom, quandCree } = CreationDeTagDuCra.useState()

  const valeursInitiales: z.input<typeof CreationDeTagValidation> = {
    nom,
    description: null,
    visibilite: { _tag: 'Personnel' },
  }

  const form = useAppForm({
    validators: { onSubmit: CreationDeTagValidation },
    defaultValues: valeursInitiales,
    onSubmit: async ({ value }) => {
      const resultat = await inject(CREER_UN_TAG_DU_CRA_KEY)(value)

      if (!resultat.success) {
        createToast({
          priority: 'error',
          message: 'Une erreur est survenue lors de la création du tag.',
        })
        return
      }

      CreationDeTagDuCra.close()
      form.reset()
      createToast({
        priority: 'success',
        message: `Le tag ${resultat.data.nom} a bien été créé.`,
      })
      quandCree?.(tagDuFormulaire(resultat.data))
    },
  })

  const enCours = useStore(form.store, (state) => state.isSubmitting)
  const visibilite = useStore(form.store, (state) => state.values.visibilite)

  useEffect(() => {
    form.reset({ nom, description: null, visibilite: { _tag: 'Personnel' } })
  }, [form, nom])

  return (
    <form.AppForm>
      <form onSubmit={handleSubmit(form)}>
        <CreationDeTagDuCra.Component
          title="Créer un tag"
          buttons={[
            {
              children: 'Annuler',
              priority: 'secondary',
              disabled: enCours,
              type: 'button',
              onClick: () => form.reset(),
            },
            {
              children: 'Créer',
              type: 'submit',
              ...buttonLoadingClassname(enCours),
              doClosesModal: false,
            },
          ]}
        >
          <p>
            Créez un tag personnel ou partagé.{' '}
            <a
              className="fr-link"
              href="https://docs.numerique.gouv.fr/docs/dcade515-17b9-4298-a2e5-bdf3ed22bf96/"
              target="_blank"
              rel="noreferrer"
              title="En savoir à propos des tags (nouvelle fenêtre)"
            >
              En savoir plus
            </a>
          </p>
          <form.AppField name="nom">
            {(field) => (
              <field.Input
                label={
                  <>
                    Nom du tag <RedAsterisk />
                  </>
                }
                info={`${field.state.value.length}/${NOM_LONGUEUR_MAX} caractères`}
                isPending={enCours}
              />
            )}
          </form.AppField>
          <p className="fr-label fr-text--medium fr-mb-2v">
            Sélectionnez la visibilité de ce tag&nbsp;:
          </p>
          <fieldset className="fr-fieldset">
            <div className="fr-fieldset__content">
              {visibilites.map((option) => {
                const cle = cleDeLaVisibilite(option)
                return (
                  <div key={cle} className="fr-radio-group fr-radio-rich">
                    <input
                      type="radio"
                      id={`cra-visibilite-${cle}`}
                      name="visibilite"
                      value={cle}
                      checked={cleDeLaVisibilite(visibilite) === cle}
                      onChange={() =>
                        form.setFieldValue(
                          'visibilite',
                          visibiliteChoisie(option),
                        )
                      }
                      disabled={enCours}
                      className="fr-border-radius--16"
                    />
                    <label
                      className="fr-label"
                      htmlFor={`cra-visibilite-${cle}`}
                    >
                      <span className="fr-flex fr-align-items-center fr-flex-gap-4v">
                        <span className="fr-flex-grow-1">
                          {libelleDeLaVisibilite(option)}
                          <span className="fr-hint-text">
                            {APPARENCE[option._tag].aide}
                          </span>
                        </span>
                        {APPARENCE[option._tag].illustration}
                      </span>
                    </label>
                  </div>
                )
              })}
            </div>
          </fieldset>
          <form.AppField name="description">
            {(field) => (
              <field.Input
                label="Description courte de votre tag"
                hintText="Ajoutez plus de contexte."
                info={`${field.state.value?.length ?? 0}/${DESCRIPTION_LONGUEUR_MAX} caractères`}
                isPending={enCours}
                textArea
                nativeTextAreaProps={{ rows: 5 }}
              />
            )}
          </form.AppField>
        </CreationDeTagDuCra.Component>
      </form>
    </form.AppForm>
  )
}
