'use client'

import InputFormField from '@app/ui/components/Form/InputFormField'
import RadioFormField from '@app/ui/components/Form/RadioFormField'
import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import { trpc } from '@app/web/trpc'
import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import {
  CreateTagValidation,
  TagScope,
  descriptionMaxLength,
  nomMaxLength,
} from './createTagValidation'
import { getTagModalVariant } from './getTagModalVariant'

const nomInfo = (nom?: string | null) =>
  `${nom?.length ?? 0}/${nomMaxLength} caractères`

const descriptionInfo = (description?: string | null) =>
  `${description?.length ?? 0}/${descriptionMaxLength} caractères`

const CreateTag = ({
  isMediateur,
  isCoordinateur,
}: {
  isMediateur: boolean
  isCoordinateur: boolean
}) => {
  const {
    Component: CreateTagModal,
    close: closeCreateTagModal,
    buttonProps: createTagModalativeButtonProps,
  } = createModal({
    id: 'create-tag',
    isOpenedByDefault: false,
  })

  const router = useRouter()

  const { title, description, selectVisibility } = getTagModalVariant(
    isMediateur,
    isCoordinateur,
  )

  const form = useForm({
    resolver: zodResolver(CreateTagValidation),
    defaultValues: {
      nom: '',
      scope: selectVisibility ? TagScope.Personnel : undefined,
    },
  })

  const mutation = trpc.tags.create.useMutation()

  const onSubmit = async (tag: {
    nom: string
    description?: string | null
  }) => {
    try {
      await mutation.mutateAsync(tag).then(() => {
        closeCreateTagModal()
        form.reset()

        createToast({
          priority: 'success',
          message: `Le tag ${tag.nom} a bien été créé`,
        })

        router.refresh()
      })
    } catch {
      createToast({
        priority: 'error',
        message: 'Une erreur est survenue lors de la création du tag.',
      })
    }
  }

  return (
    <>
      <Button
        type="submit"
        priority="secondary"
        iconId="fr-icon-add-line"
        disabled={mutation.isPending}
        {...createTagModalativeButtonProps}
      >
        Créer&nbsp;un&nbsp;tag
      </Button>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CreateTagModal
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
          <InputFormField
            control={form.control}
            path="nom"
            label="Nom du tag"
            asterisk
            disabled={mutation.isPending}
            info={nomInfo}
          />
          {selectVisibility && (
            <>
              <p className="fr-mb-2v">
                Sélectionnez la visibilité de ce tag&nbsp;:
              </p>
              <RadioFormField
                control={form.control}
                path="scope"
                disabled={mutation.isPending}
                options={[
                  {
                    label: 'Tag personnel',
                    value: TagScope.Personnel,
                    hint: 'Visible par l’ensemble des médiateurs numériques du département.',
                  },
                  {
                    label: 'Tag départemental',
                    value: TagScope.Departemental,
                    hint: 'Visible uniquement par vous.',
                  },
                ]}
              />
            </>
          )}
          <InputFormField
            control={form.control}
            path="description"
            label="Description courte de votre tag"
            hint="Ajoutez plus de contexte."
            disabled={mutation.isPending}
            info={descriptionInfo}
          />
        </CreateTagModal>
      </form>
    </>
  )
}

export default withTrpc(CreateTag)
