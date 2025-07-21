'use client'

import RedAsterisk from '@app/ui/components/Form/RedAsterisk'
import { createDynamicModal } from '@app/ui/components/Modal/createDynamicModal'
import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import { handleSubmit } from '@app/web/libs/form/handle-submit'
import { useAppForm } from '@app/web/libs/form/use-app-form'
import { trpc } from '@app/web/trpc'
import { useRouter } from 'next/navigation'
import {
  CreateTagValidation,
  TagScope,
  descriptionMaxLength,
  nomMaxLength,
} from './createTagValidation'
import { getTagModalVariant } from './getTagModalVariant'
type Tag = {
  id: string
  nom: string
  description?: string | null
}

export const CreateTagDynamicModal = createDynamicModal({
  id: 'create-tag-modal',
  isOpenedByDefault: false,
  initialState: {
    nom: '',
    onTagCreated: (_tag: Tag) => undefined,
  },
})

const nomInfo = (nom?: string | null) =>
  `${nom?.length ?? 0}/${nomMaxLength} caractères`

const descriptionInfo = (description?: string | null) =>
  `${description?.length ?? 0}/${descriptionMaxLength} caractères`

const CreateTagModal = ({
  isMediateur,
  isCoordinateur,
}: {
  isMediateur: boolean
  isCoordinateur: boolean
}) => {
  const { nom, onTagCreated } = CreateTagDynamicModal.useState()

  const { title, description, selectVisibility } = getTagModalVariant(
    isMediateur,
    isCoordinateur,
  )

  const router = useRouter()
  const mutation = trpc.tags.create.useMutation()
  const isPending = mutation.isPending

  const form = useAppForm({
    validators: {
      onChange: CreateTagValidation,
    },
    defaultValues: {
      nom: nom ?? '',
      description: null as string | null,
      scope: (selectVisibility ? TagScope.Personnel : null) as TagScope | null,
    },
    onSubmit: async (data) => {
      if (isPending) return

      try {
        await mutation.mutateAsync(data.value).then((tagCreated) => {
          CreateTagDynamicModal.close()
          form.reset()

          if (tagCreated != null) {
            createToast({
              priority: 'success',
              message: `Le tag ${tagCreated.nom} a bien été créé`,
            })
            onTagCreated(tagCreated)
          }

          router.refresh()
        })
      } catch {
        createToast({
          priority: 'error',
          message: 'Une erreur est survenue lors de la création du tag.',
        })
      }
    },
  })

  return (
    <form.AppForm>
      <form onSubmit={handleSubmit(form)}>
        <CreateTagDynamicModal.Component
          title={title}
          buttons={[
            {
              children: 'Annuler',
              priority: 'secondary',
              disabled: mutation.isPending,
              type: 'button',
              onClick: () => form.reset(),
            },
            {
              children: 'Créer',
              type: 'submit',
              ...buttonLoadingClassname(mutation.isPending),
              doClosesModal: false,
            },
          ]}
        >
          <p>{description}</p>
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
          {selectVisibility && (
            <>
              <p className="fr-mb-2v">
                Sélectionnez la visibilité de ce tag&nbsp;:
              </p>
              <form.AppField name="scope">
                {(field) => (
                  <field.RadioButtons
                    isPending={isPending}
                    options={[
                      {
                        label: 'Tag départemental',
                        value: TagScope.Departemental,
                        extra: {
                          hintText: 'Visible uniquement par vous.',
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
                          hintText:
                            'Visible par l’ensemble des médiateurs numériques du département.',
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
        </CreateTagDynamicModal.Component>
      </form>
    </form.AppForm>
  )
}

export default withTrpc(CreateTagModal)
