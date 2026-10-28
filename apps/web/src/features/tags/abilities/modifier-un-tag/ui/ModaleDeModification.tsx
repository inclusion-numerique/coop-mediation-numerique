'use client'

import RedAsterisk from '@app/ui/components/Form/RedAsterisk'
import { createDynamicModal } from '@app/ui/components/Modal/createDynamicModal'
import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import { handleSubmit } from '@app/web/libs/form/handle-submit'
import { useAppForm } from '@app/web/libs/form/use-app-form'
import { inject } from '@app/web/libs/injection/client'
import Notice from '@codegouvfr/react-dsfr/Notice'
import { useStore } from '@tanstack/react-form'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import type { z } from 'zod'
import {
  DESCRIPTION_DU_TAG_LONGUEUR_MAX,
  NOM_DU_TAG_LONGUEUR_MAX,
} from '../../../domain'
import { APPARENCE_DE_VISIBILITE, type TagAffiche } from '../../../ui'
import { MODIFIER_UN_TAG_ACTION_KEY } from '../action/modifier-un-tag.key'
import { ModifierUnTagValidation } from '../action/modifier-un-tag.validation'

export const ModificationDUnTag = createDynamicModal<TagAffiche | null>({
  id: 'edit-tag-modal',
  isOpenedByDefault: false,
  initialState: null,
})

const VisibiliteDuTag = ({ tag }: { tag: TagAffiche }) => {
  if (tag.portee === 'National') return null

  const apparence = APPARENCE_DE_VISIBILITE[tag.portee]

  return (
    <div className="fr-px-4v fr-my-8v fr-border-radius--8 fr-border">
      <span className="fr-flex fr-align-items-center fr-flex-gap-4v">
        <span className="fr-flex-grow-1">
          <span className="fr-text--bold">
            {tag.equipe === null
              ? apparence.libelle
              : `${apparence.libelle} (${tag.equipe.coordonneePar})`}
          </span>
          <span className="fr-hint-text">{apparence.aide}</span>
        </span>
        {apparence.illustration}
      </span>
    </div>
  )
}

const FormulaireDeModification = ({ tag }: { tag: TagAffiche }) => {
  const router = useRouter()

  const valeursInitiales: z.input<typeof ModifierUnTagValidation> = {
    tagId: tag.id,
    nom: tag.nom,
    description: tag.description,
  }

  const form = useAppForm({
    validators: { onSubmit: ModifierUnTagValidation },
    defaultValues: valeursInitiales,
    onSubmit: async ({ value }) => {
      const resultat = await inject(MODIFIER_UN_TAG_ACTION_KEY)(value)

      if (!resultat.success) {
        createToast({
          priority: 'error',
          message: 'Une erreur est survenue lors de la modification du tag.',
        })
        return
      }

      ModificationDUnTag.close()
      createToast({
        priority: 'success',
        message: `Le tag ${resultat.data.nom} a bien été modifié.`,
      })
      router.refresh()
    },
  })

  const enCours = useStore(form.store, (state) => state.isSubmitting)

  useEffect(() => {
    form.reset({ tagId: tag.id, nom: tag.nom, description: tag.description })
  }, [form, tag])

  return (
    <form.AppForm>
      <form onSubmit={handleSubmit(form)}>
        <ModificationDUnTag.Component
          title={`Modifier le tag ‘${tag.nom}’`}
          buttons={[
            {
              children: 'Annuler les modifications',
              priority: 'secondary',
              disabled: enCours,
              type: 'button',
              onClick: () => form.reset(),
            },
            {
              children: 'Enregistrer',
              type: 'submit',
              ...buttonLoadingClassname(enCours),
              doClosesModal: false,
            },
          ]}
        >
          {tag.portee === 'Departemental' && (
            <Notice
              className="fr-notice--flex fr-align-items-center fr-my-8v"
              title={
                <span className="fr-text-default--grey fr-text--regular">
                  Les modifications seront visibles par l’ensemble des
                  médiateurs numériques du département
                </span>
              }
            />
          )}
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
          <VisibiliteDuTag tag={tag} />
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
        </ModificationDUnTag.Component>
      </form>
    </form.AppForm>
  )
}

export const ModaleDeModification = () => {
  const tag = ModificationDUnTag.useState()

  return tag === null ? null : <FormulaireDeModification tag={tag} />
}
