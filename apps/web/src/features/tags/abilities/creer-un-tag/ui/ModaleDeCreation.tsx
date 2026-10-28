'use client'

import RedAsterisk from '@app/ui/components/Form/RedAsterisk'
import { createDynamicModal } from '@app/ui/components/Modal/createDynamicModal'
import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import { handleSubmit } from '@app/web/libs/form/handle-submit'
import { useAppForm } from '@app/web/libs/form/use-app-form'
import { inject } from '@app/web/libs/injection/client'
import { useStore } from '@tanstack/react-form'
import { useRouter } from 'next/navigation'
import type { z } from 'zod'
import {
  DESCRIPTION_DU_TAG_LONGUEUR_MAX,
  NOM_DU_TAG_LONGUEUR_MAX,
} from '../../../domain'
import { APPARENCE_DE_VISIBILITE } from '../../../ui/ApparenceDeVisibilite'
import { CREER_UN_TAG_ACTION_KEY } from '../action/creer-un-tag.key'
import { CreerUnTagValidation } from '../action/creer-un-tag.validation'
import {
  cleDeLaVisibilite,
  type OptionDeVisibilite,
} from './visibilites.presenter'

export const CreationDUnTag = createDynamicModal<{ nom: string }>({
  id: 'save-tag-modal',
  isOpenedByDefault: false,
  initialState: { nom: '' },
})

const libelleDeLOption = (option: OptionDeVisibilite) =>
  option._tag === 'Equipe' && option.numero !== null ? (
    <>
      {APPARENCE_DE_VISIBILITE.Equipe.libelle} {option.numero}{' '}
      <span className="fr-text--sm fr-text-mention--grey">
        (Coordonnée par {option.coordonneePar})
      </span>
    </>
  ) : (
    APPARENCE_DE_VISIBILITE[option._tag].libelle
  )

const visibiliteDeLOption = (option: OptionDeVisibilite) =>
  option._tag === 'Equipe'
    ? { _tag: option._tag, coordinateurId: option.coordinateurId }
    : { _tag: option._tag }

export const ModaleDeCreation = ({
  visibilites,
}: {
  visibilites: readonly OptionDeVisibilite[]
}) => {
  const { nom } = CreationDUnTag.useState()
  const router = useRouter()

  const valeursInitiales: z.input<typeof CreerUnTagValidation> = {
    nom,
    description: null,
    visibilite: { _tag: 'Personnel' },
  }

  const form = useAppForm({
    validators: { onSubmit: CreerUnTagValidation },
    defaultValues: valeursInitiales,
    onSubmit: async ({ value }) => {
      const resultat = await inject(CREER_UN_TAG_ACTION_KEY)(value)

      if (!resultat.success) {
        createToast({
          priority: 'error',
          message: 'Une erreur est survenue lors de la création du tag.',
        })
        return
      }

      CreationDUnTag.close()
      form.reset()
      createToast({
        priority: 'success',
        message: `Le tag ${resultat.data.nom} a bien été créé.`,
      })
      router.refresh()
    },
  })

  const enCours = useStore(form.store, (state) => state.isSubmitting)
  const visibilite = useStore(form.store, (state) => state.values.visibilite)

  return (
    <form.AppForm>
      <form onSubmit={handleSubmit(form)}>
        <CreationDUnTag.Component
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
                info={`${field.state.value.length}/${NOM_DU_TAG_LONGUEUR_MAX} caractères`}
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
                      id={`visibilite-${cle}`}
                      name="visibilite"
                      value={cle}
                      checked={cleDeLaVisibilite(visibilite) === cle}
                      onChange={() =>
                        form.setFieldValue(
                          'visibilite',
                          visibiliteDeLOption(option),
                        )
                      }
                      disabled={enCours}
                      className="fr-border-radius--16"
                    />
                    <label className="fr-label" htmlFor={`visibilite-${cle}`}>
                      <span className="fr-flex fr-align-items-center fr-flex-gap-4v">
                        <span className="fr-flex-grow-1">
                          {libelleDeLOption(option)}
                          <span className="fr-hint-text">
                            {APPARENCE_DE_VISIBILITE[option._tag].aide}
                          </span>
                        </span>
                        {APPARENCE_DE_VISIBILITE[option._tag].illustration}
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
                info={`${field.state.value?.length ?? 0}/${DESCRIPTION_DU_TAG_LONGUEUR_MAX} caractères`}
                isPending={enCours}
                textArea
                nativeTextAreaProps={{ rows: 5 }}
              />
            )}
          </form.AppField>
        </CreationDUnTag.Component>
      </form>
    </form.AppForm>
  )
}
