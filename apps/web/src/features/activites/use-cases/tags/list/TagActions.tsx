'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import { DeleteTagDynamicModal } from '../delete/DeleteTagModal'
import { SaveTagDynamicModal } from '../save/SaveTagModal'
import { TagScope } from '../tagScope'

export const TagActions = ({
  isCoordinateur,
  tag,
}: {
  isCoordinateur: boolean
  tag: { id: string; nom: string; description?: string; scope: TagScope }
}) => {
  const openSaveModal = SaveTagDynamicModal.useOpen()
  const openDeleteModal = DeleteTagDynamicModal.useOpen()

  return (
    (tag.scope === TagScope.Personnel ||
      (tag.scope === TagScope.Departemental && isCoordinateur)) && (
      <div className="fr-flex fr-flex-gap-2v">
        <Button
          priority="tertiary no outline"
          size="small"
          title="Modifier"
          iconId="fr-icon-edit-line"
          onClick={() => openSaveModal(tag)}
        />
        <Button
          priority="tertiary no outline"
          size="small"
          title="Supprimer"
          iconId="fr-icon-delete-bin-line"
          onClick={() => openDeleteModal(tag)}
        />
      </div>
    )
  )
}
