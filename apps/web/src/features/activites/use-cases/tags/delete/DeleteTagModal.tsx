'use client'

import { createDynamicModal } from '@app/ui/components/Modal/createDynamicModal'
import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import { trpc } from '@app/web/trpc'
import Notice from '@codegouvfr/react-dsfr/Notice'
import { useRouter } from 'next/navigation'
import { TagScope } from '../tagScope'
import { deleteTagModalVariants } from './deleteTagModalVariants'

type DeleteTagDynamicModalInitialState = {
  id?: string | null
  nom: string
  scope?: TagScope | null
}
export const DeleteTagDynamicModal =
  createDynamicModal<DeleteTagDynamicModalInitialState>({
    id: 'delete-tag-modal',
    isOpenedByDefault: false,
    initialState: {
      id: null,
      nom: '',
      scope: null,
    },
  })

const DeleteTagModal = () => {
  const { id, nom, scope } = DeleteTagDynamicModal.useState()

  const router = useRouter()
  const mutation = trpc.tags.delete.useMutation()
  const isPending = mutation.isPending

  const onDelete = async (id: string) => {
    if (isPending) return

    try {
      await mutation.mutateAsync({ id }).then(() => {
        DeleteTagDynamicModal.close()

        createToast({
          priority: 'success',
          message: `Le tag ${nom} a bien été supprimé`,
        })

        router.refresh()
      })
    } catch {
      createToast({
        priority: 'error',
        message: 'Une erreur est survenue lors de la suppression du tag.',
      })
    }
  }

  if (id == null || scope == null) {
    return null
  }

  const { title, description } = deleteTagModalVariants(scope)

  return (
    <DeleteTagDynamicModal.Component
      title={title(nom)}
      buttons={[
        {
          children: 'Annuler',
          priority: 'secondary',
          disabled: mutation.isPending,
          type: 'button',
        },
        {
          children: 'Supprimer',
          ...buttonLoadingClassname(mutation.isPending),
          nativeButtonProps: { className: 'fr-btn--danger' },
          doClosesModal: false,
          onClick: () => onDelete(id),
        },
      ]}
    >
      <p>{description(nom)}</p>
      <Notice
        severity="warning"
        title={
          <span className="fr-text-default--grey fr-text--regular fr-ml-2v">
            La suppression du tag est définitive.
          </span>
        }
      />
    </DeleteTagDynamicModal.Component>
  )
}

export default withTrpc(DeleteTagModal)
