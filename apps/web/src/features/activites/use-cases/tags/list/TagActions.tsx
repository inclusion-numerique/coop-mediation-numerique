'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import classNames from 'classnames'
import { RefObject, useRef } from 'react'
import { useOnClickOutside } from 'usehooks-ts'
import { DeleteTagDynamicModal } from '../delete/DeleteTagModal'
import { MergeDestinationTag } from '../merge/MergeTagComboBox'
import { MergeTagDynamicModal } from '../merge/MergeTagModal'
import { SaveTagDynamicModal } from '../save/SaveTagModal'
import { TagScope } from '../tagScope'

const showActions = (
  tag: {
    id: string
    nom: string
    description?: string
    scope: TagScope
    accompagnementsCount: number
    equipeId?: string
    equipeNumber?: number
    equipeCoordinateurNom?: string
    defaultMergeDestinations?: MergeDestinationTag[]
  },
  isCoordinateur: boolean,
) =>
  tag.scope === TagScope.Personnel ||
  tag.scope === TagScope.Equipe ||
  (tag.scope === TagScope.Departemental && isCoordinateur)

export const TagActions = ({
  isCoordinateur,
  tag,
}: {
  isCoordinateur: boolean
  tag: {
    id: string
    nom: string
    description?: string
    scope: TagScope
    accompagnementsCount: number
    equipeId?: string
    equipeNumber?: number
    equipeCoordinateurNom?: string
    defaultMergeDestinations?: MergeDestinationTag[]
  }
}) => {
  const openMergeModal = MergeTagDynamicModal.useOpen()
  const openSaveModal = SaveTagDynamicModal.useOpen()
  const openDeleteModal = DeleteTagDynamicModal.useOpen()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const collapseRef = useRef<HTMLDivElement>(null)

  useOnClickOutside(collapseRef as RefObject<HTMLDivElement>, (event) => {
    if (
      event.target === buttonRef?.current ||
      buttonRef.current?.getAttribute('aria-expanded') !== 'true'
    )
      return
    buttonRef.current.click()
  })

  const closeMenu = () => {
    if (buttonRef.current?.getAttribute('aria-expanded') === 'true') {
      buttonRef.current.click()
    }
  }

  return (
    showActions(tag, isCoordinateur) && (
      <div className="fr-position-relative">
        <Button
          type="button"
          aria-expanded="false"
          aria-controls={`tag-actions-menu-${tag.id}`}
          priority="tertiary no outline"
          size="small"
          title="Actions"
          iconId="fr-icon-more-fill"
          ref={buttonRef}
        />
        <div
          role="menu"
          className={classNames('fr-collapse', 'fr-menu')}
          id={`tag-actions-menu-${tag.id}`}
          ref={collapseRef}
        >
          <ul className="fr-menu__list" style={{ width: '10rem' }}>
            <li>
              <button
                type="button"
                role="menuitem"
                className="fr-nav__link fr-display-block"
                onClick={() => {
                  closeMenu()
                  openMergeModal(tag)
                }}
              >
                <span
                  className="fr-icon-git-merge-fill fr-icon--sm fr-mr-1w fr-text-label--blue-france"
                  aria-hidden
                />
                Fusionner
              </button>
            </li>
            <li>
              <button
                type="button"
                role="menuitem"
                className="fr-nav__link fr-display-block"
                onClick={() => {
                  closeMenu()
                  openSaveModal(tag)
                }}
              >
                <span
                  className="fr-icon-edit-line fr-icon--sm fr-mr-1w fr-text-label--blue-france"
                  aria-hidden
                />
                Modifier
              </button>
            </li>
            <li>
              <button
                type="button"
                role="menuitem"
                className="fr-nav__link fr-display-block"
                onClick={() => {
                  closeMenu()
                  openDeleteModal(tag)
                }}
              >
                <span
                  className="fr-icon-delete-bin-line fr-icon--sm fr-mr-1w fr-text-label--blue-france"
                  aria-hidden
                />
                Supprimer
              </button>
            </li>
          </ul>
        </div>
      </div>
    )
  )
}
