'use client'

import RedAsterisk from '@app/ui/components/Form/RedAsterisk'
import { createDynamicModal } from '@app/ui/components/Modal/createDynamicModal'
import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import { handleSubmit } from '@app/web/libs/form/handle-submit'
import { useAppForm } from '@app/web/libs/form/use-app-form'
import { trpc } from '@app/web/trpc'
import Notice from '@codegouvfr/react-dsfr/Notice'
import { useRouter } from 'next/navigation'
import React from 'react'
import { TagScope } from '../tagScope'
import { saveTagModalVariants } from './saveTagModalVariants'
import {
  descriptionMaxLength,
  nomMaxLength,
  SaveTagValidation,
} from './saveTagValidation'

type Tag = {
  id: string
  nom: string
  description?: string | null
}

type SaveTagDynamicModalInitialState = {
  id?: string | null
  nom?: string | null
  description?: string | null
  scope?: TagScope | null
  onTagSaved?: (tag: Tag) => void
}

export const SaveTagDynamicModal =
  createDynamicModal<SaveTagDynamicModalInitialState>({
    id: 'save-tag-modal',
    isOpenedByDefault: false,
    initialState: {
      id: null,
      nom: '',
      description: null,
      scope: null,
    },
  })

const nomInfo = (nom?: string | null) =>
  `${nom?.length ?? 0}/${nomMaxLength} caractères`

const descriptionInfo = (description?: string | null) =>
  `${description?.length ?? 0}/${descriptionMaxLength} caractères`

const SaveTagModal = ({
  isMediateur,
  isCoordinateur,
}: {
  isMediateur: boolean
  isCoordinateur: boolean
}) => {
  const { id, nom, description, scope, onTagSaved } =
    SaveTagDynamicModal.useState()

  const {
    title,
    content,
    selectVisibility,
    cancelButtonLabel,
    submitButtonLabel,
  } = saveTagModalVariants(isMediateur, isCoordinateur, id)
  const router = useRouter()
  const mutation = trpc.tags.save.useMutation()
  const isPending = mutation.isPending

  const form = useAppForm({
    validators: {
      onChange: SaveTagValidation,
    },
    defaultValues: {
      id: id ?? null,
      nom: nom ?? '',
      description: (description ?? null) as string | null,
      scope:
        scope ?? (isMediateur ? TagScope.Personnel : TagScope.Departemental),
    },
    onSubmit: async (data) => {
      if (isPending) return

      try {
        await mutation.mutateAsync(data.value).then((tagSaved) => {
          SaveTagDynamicModal.close()
          form.reset()

          if (tagSaved != null) {
            createToast({
              priority: 'success',
              message: `Le tag ${tagSaved.nom} a bien été ${id ? 'modifié' : 'créé'}.`,
            })
            onTagSaved?.(tagSaved)
          }

          router.refresh()
        })
      } catch {
        createToast({
          priority: 'error',
          message: `Une erreur est survenue lors de la ${id ? 'modification' : 'création'} du tag.`,
        })
      }
    },
  })

  return (
    <form.AppForm>
      <form onSubmit={handleSubmit(form)}>
        <SaveTagDynamicModal.Component
          title={title(nom)}
          buttons={[
            {
              children: cancelButtonLabel,
              priority: 'secondary',
              disabled: mutation.isPending,
              type: 'button',
              onClick: () => form.reset(),
            },
            {
              children: submitButtonLabel,
              type: 'submit',
              ...buttonLoadingClassname(mutation.isPending),
              doClosesModal: false,
            },
          ]}
        >
          {content && <p>{content}</p>}
          {scope === TagScope.Departemental && (
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
                info={nomInfo(field.state.value)}
                isPending={isPending}
              />
            )}
          </form.AppField>
          {selectVisibility?.(isMediateur, isCoordinateur) && (
            <>
              <p className="fr-mb-0">
                Sélectionnez la visibilité de ce tag&nbsp;:
              </p>
              <form.AppField name="scope">
                {(field) => (
                  <>
                    <field.RadioButtons
                      isPending={isPending}
                      options={[
                        {
                          label: 'Tag départemental',
                          value: TagScope.Departemental,
                          extra: {
                            hintText:
                              'Visible par l’ensemble des médiateurs numériques du département.',
                            illustration: (
                              <span
                                className="ri-map-pin-range-line ri-xl fr-line-height-1 fr-text-default--info fr-background-contrast--info fr-p-2w fr-my-2w fr-border-radius--8"
                                aria-hidden="true"
                              ></span>
                            ),
                          },
                        },
                        {
                          label: 'Tag personnel',
                          value: TagScope.Personnel,
                          extra: {
                            hintText: 'Visible uniquement par vous.',
                            illustration: (
                              <span
                                className="ri-account-circle-line ri-xl fr-line-height-1 fr-text-mention--grey fr-background-contrast--grey fr-p-2w fr-my-2w fr-border-radius--8"
                                aria-hidden="true"
                              ></span>
                            ),
                          },
                        },
                      ]}
                      orientation="vertical"
                    />
                    {id &&
                      scope === TagScope.Departemental &&
                      field.state.value === TagScope.Personnel && (
                        <Notice
                          className="fr-notice--warning fr-notice--flex fr-align-items-center fr-mb-8v"
                          title={
                            <span className="fr-text--regular fr-text-default--grey">
                              En passant la visibilité de ce tag de
                              départemental à personnel, Il ne sera plus visible
                              par l’ensemble des médiateurs numériques du
                              département.
                            </span>
                          }
                        />
                      )}
                  </>
                )}
              </form.AppField>
            </>
          )}
          <form.AppField name="description">
            {(field) => (
              <field.Input
                label="Description courte de votre tag"
                hintText="Ajoutez plus de contexte."
                info={descriptionInfo(field.state.value)}
                isPending={isPending}
                textArea
                nativeTextAreaProps={{ rows: 5 }}
              />
            )}
          </form.AppField>
        </SaveTagDynamicModal.Component>
      </form>
    </form.AppForm>
  )
}

export default withTrpc(SaveTagModal)
